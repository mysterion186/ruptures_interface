import json
from pathlib import Path
import pandas as pd
import re
import numpy as np
import ruptures as rpt
from scipy.optimize import minimize

# fonction pour "arranger" les fichiers csv 
# par ex à l'heure actuelle faut que la première colonne (l'axe y) s'appelle 'Valeur'
def standardize_csv(file_path,filename):
    clean_path = str(file_path)+"/"+str(filename)
    # lecture csv
    data = pd.read_csv(clean_path,float_precision="round_trip",sep='\s+')
    # récup les noms de colonnes
    columns_name = data.columns
    columns_name = columns_name
    float_match = "[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)" # regex match pour les float
    for column in columns_name : 
        x = re.search(float_match,column)
        if x : # cas où le nom de la colonne est un float 
            template = [ "Valeur"+str(k) for k in range(len(columns_name))]
            # template = ['Valeur0', 'Valeur1']
            temp_df = pd.DataFrame([columns_name],columns=template)
            data.columns = template
            data = pd.concat([temp_df,data],ignore_index=True)
            break
    print(data.head())
    data.to_csv(clean_path,index=False,sep=' ')



def load_json(filename: Path):
    with open(filename, "r") as fp:
        res = json.load(fp=fp)
    return res


def write_json(obj, filename: Path) -> None:
    with open(filename, "w") as fp:
        json.dump(obj=obj, fp=fp)


def load_train_data(folder_train: Path):
    err_msg = f"Train folder not found: {folder_train}"
    assert folder_train.exists() and folder_train.is_dir(), err_msg

    X_train = list()
    y_train = list()
    for filename in folder_train.iterdir():
        if filename.suffix == ".json":
            label = load_json(filename=filename)
            signal = np.loadtxt(fname=filename.with_suffix(".csv"))
            X_train.append(signal)
            y_train.append(label)
    return X_train, y_train


def alpin_learn(
    folder_train: Path, output_filename: Path = Path("pen_opt.json")
) -> None:
    """Learn optimal penalty and write the result on disk."""

    # Load data
    X_train, y_train = load_train_data(folder_train=folder_train)
    # The loss to minimize
    def alpin_loss(pen):
        n_train = len(X_train)
        loss_val = 0
        grad_val = 0
        for s, b in zip(X_train, y_train):
            log_T = np.log(s.shape[0])
            # change the following line if you need another cost function
            algo = rpt.KernelCPD(kernel="linear").fit(s)
            bkps_predited = algo.predict(pen=pen * log_T)
            loss_val += algo.cost.sum_of_costs(b) - algo.cost.sum_of_costs(
                bkps_predited
            )
            grad_val += len(b) - len(bkps_predited)
        return loss_val / n_train, grad_val / n_train

    # Minimize loss
    opt = minimize(fun=alpin_loss, x0=np.array([1]), method="BFGS", jac=True)
    pen_opt = float(opt.x)  # the optimal penalty
    print(f"Optimal penalty: {pen_opt}")
    # Write result
    write_json(obj={"pen_opt": pen_opt}, filename=output_filename)


def alpin_predict(
    folder_test,
    pen_opt_filename: Path = Path("pen_opt.json"),
    output_folder: Path = None,
) -> None:
    err_msg = f"Test folder not found: {folder_test}"
    assert folder_test.exists() and folder_test.is_dir(), err_msg

    if output_folder is None:
        output_folder = folder_test

    # Load the optimal penalty
    pen_opt_dict = load_json(filename=pen_opt_filename)
    pen_opt = pen_opt_dict["pen_opt"]
    for filename in folder_test.iterdir():
        if filename.suffix==".csv":
            signal = np.loadtxt(fname=filename)
            log_T = np.log(signal.shape[0])
            bkps_predited = rpt.KernelCPD(kernel="linear").fit_predict(
                signal=signal, pen=pen_opt * log_T
            )
            # convert to np.int32 to int for Json serialization
            bkps_predited = np.array(bkps_predited).tolist()
            write_json(
                obj=bkps_predited,
                filename=(output_folder / filename.stem).with_suffix(".pred.json"),
            )  