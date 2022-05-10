import os

# fonction pour "arranger" les fichiers csv 
# par ex à l'heure actuelle faut que la première colonne (l'axe y) s'appelle 'Valeur'
def standardize_csv(file_path,filename):
    with open(str(file_path)+"/"+filename, 'r') as f :
        a = f.readlines()
    if a[0] != 'Valeur' : 
        with open(str(file_path)+"/"+filename, 'w') as fw : 
            fw.write('Valeur\n')
            for elt in a :
                fw.write(elt)
    
    