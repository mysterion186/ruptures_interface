import pandas as pd
import os
import re
# fonction pour "arranger" les fichiers csv 
# par ex à l'heure actuelle faut que la première colonne (l'axe y) s'appelle 'Valeur'
def csv_func(filename):
    data= pd.read_csv(filename,float_precision="round_trip")
    print(data.head())
    return data


# csv_func('1.csv')
# data = csv_func('2.csv')
# print()
# print()
# print((data.columns[0]))
# # temp = pd.DataFrame(data.columns[0],)
# new_df = pd.DataFrame([data.columns[0]], columns=["Valeur"])
# data.columns=["Valeur",]    
# print(new_df)
# print()
# print()
# data = pd.concat([new_df,data],ignore_index = True)
# print(data)
# print(type(data.iloc[1][0]))

def standardize_csv(filename):
    # lecture csv
    data = pd.read_csv(filename,float_precision="round_trip",sep='\s+')
    # récup les noms de colonnes
    columns_name = data.columns
    print(list(columns_name))
    columns_name = columns_name
    float_match = "[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)" # regex match pour les float
    for column in columns_name : 
        x = re.search(float_match,column)
        if x : # cas où le nom de la colonne est un float 
            template = [ "Valeur"+str(k) for k in range(len(columns_name))]
            # template = ['Valeur0', 'Valeur1']
            print("template = ",template)
            temp_df = pd.DataFrame([columns_name],columns=template)
            print("temp df = ",temp_df)
            data.columns = template
            data = pd.concat([temp_df,data],ignore_index=True)
            break
    return data

data = standardize_csv("1.csv")
print(data.head())