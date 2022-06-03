import json
from pathlib import Path
import pandas as pd
import re
import numpy as np
import ruptures as rpt
from scipy.optimize import minimize
from django.core.files.storage import FileSystemStorage
from ruptures_interface.settings import MEDIA_ROOT
# fonction pour "arranger" les fichiers csv 

LIST_OF_MODELS = [
    "l1",
    "l2",
    "linear",
    "rbf",
    "normal",
    "mahalanobis",
    "rank",
    "cosine",
]


# function to give columns names for csv that doesn't have header
def standardize_csv(file_path, filename):
    clean_path = str(file_path) + "/" + str(filename)
    # read csv
    data = pd.read_csv(clean_path, float_precision="round_trip", sep="\s+")
    # get columns name
    columns_name = data.columns
    regex_match = "^[a-zA-Z]"
    for column in columns_name:
        x = re.search(regex_match, column)
        if not x:  # case where the 'columns' name is a float
            # add proper value name for header
            template = ["Valeur" + str(k) for k in range(len(columns_name))]
            temp_df = pd.DataFrame([columns_name], columns=template)
            data.columns = template
            data = pd.concat([temp_df, data], ignore_index=True)
            break
    data.to_csv(clean_path, index=False, sep=" ")


# function to standardize json, get ride of index that a superior to the signal lenght, add the signals length if the user forget it, sort the json
def standardize_json(filename_csv, labels, predict=""):
    with open(filename_csv, "r") as f:
        a = f.readlines()
    labels.sort()  # sort labels
    clean_label = [
        elt for elt in labels if elt <= len(a[1:])
    ]  # keep only element that are inferior to the signals length
    # case where the last value of the labes are neither signal length-1 or signal length
    if clean_label[-1] != len(a[1:]) and clean_label[-1] != len(a[1:]) - 1:
        clean_label.append(len(a[1:]))
    elif clean_label[-1] == len(a[1:]) - 1:
        clean_label[-1] = len(a[1:])
    # create json file that will store the labels, with the same name that the csv file
    clean_label.sort()  # sort the list
    raw_name = filename_csv.split(".")[:-1]
    clean_name = ".".join(raw_name)
    with open(clean_name + predict + ".json", "w") as f:
        f.write(json.dumps(clean_label))


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
            header = is_header(filename.with_suffix(".csv"))
            if header:
                signal = np.loadtxt(fname=filename.with_suffix(".csv"), skiprows=1)
            else:
                signal = np.loadtxt(fname=filename.with_suffix(".csv"))
            X_train.append(signal)
            y_train.append(label)
    return X_train, y_train


# function to check if there is a header in the csv
def is_header(filename: Path):
    regex_match = "^[a-zA-Z]"
    with open(filename, "r") as fp:
        a = fp.readline()
    cols = a.split(" ")
    for col in cols:
        x = re.search(regex_match, col)
        if not x:
            return False
    return True


def alpin_learn(
    folder_train: Path, output_filename: Path = Path("pen_opt.json"), model="l2"
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
            algo = get_algo(model=model)
            algo.fit(s)
            bkps_predited = algo.predict(pen=pen * log_T)
            loss_val += algo.cost.sum_of_costs(b) - algo.cost.sum_of_costs(
                bkps_predited
            )
            grad_val += len(b) - len(bkps_predited)
        return loss_val / n_train, grad_val / n_train

    # Minimize loss
    opt = minimize(fun=alpin_loss, x0=np.array([1]), method="BFGS", jac=True)
    pen_opt = float(opt.x)  # the optimal penalty
    # Write result
    write_json(obj={"pen_opt": pen_opt}, filename=output_filename)


def alpin_predict(
    folder_test,
    pen_opt_filename: Path = Path("pen_opt.json"),
    output_folder: Path = None,
    model="l2",
) -> None:
    err_msg = f"Test folder not found: {folder_test}"
    assert folder_test.exists() and folder_test.is_dir(), err_msg

    if output_folder is None:
        output_folder = folder_test

    # Load the optimal penalty
    pen_opt_dict = load_json(filename=pen_opt_filename)
    pen_opt = pen_opt_dict["pen_opt"]
    for filename in folder_test.iterdir():
        if filename.suffix == ".csv":
            header = is_header(filename.with_suffix(".csv"))
            if header:
                signal = np.loadtxt(fname=filename.with_suffix(".csv"), skiprows=1)
            else:
                signal = np.loadtxt(fname=filename.with_suffix(".csv"))
            log_T = np.log(signal.shape[0])
            algo = get_algo(model=model)
            bkps_predited = algo.fit_predict(signal=signal, pen=pen_opt * log_T)
            # convert to np.int32 to int for Json serialization
            bkps_predited = np.array(bkps_predited).tolist()
            write_json(
                obj=bkps_predited,
                filename=(output_folder / filename.stem).with_suffix(".pred.json"),
            )

def get_algo(model: str = "l2") -> rpt.base.BaseEstimator:
    """Return a change-point detection algorithm.

    Args:
        model (str, optional): the name of the cost function. Defaults to "l2".

    Returns:
        rpt.base.BaseEstimator: change detection algorithm
    """
    # Check if model is implemented
    model = model.strip("").lower()
    err_msg = f"Choose a model in {LIST_OF_MODELS}, not {model}."
    assert model in LIST_OF_MODELS, err_msg
    # choosing the cost function
    if model == "l2":
        return rpt.KernelCPD(kernel="linear")
    elif model == "rbf":
        return rpt.KernelCPD(kernel="rbf")
    elif model == "cosine":
        return rpt.KernelCPD(kernel="cosine")
    else:
        return rpt.Pelt(model=model)
            

# function to handle the file upload process 
def handle_upload(request,folder_val,sub_folder):
    if request.method == 'POST':
        for k in range(len(request.FILES.getlist("myfile"))):
            myfile = request.FILES.getlist("myfile")[k]
            fs = FileSystemStorage()
            if myfile.name.split(".")[-1] =="csv" or myfile.name.split(".")[-1]=="json":
                file = fs.save(str(folder_val)+"/"+sub_folder+"/"+myfile.name, myfile)
            if myfile.name.split(".")[-1]=="csv": # on standardise que les fichiers csv
                standardize_csv(str(MEDIA_ROOT)+"/"+str(folder_val)+"/"+sub_folder+"/",myfile.name) # on le standardise 
        return request

