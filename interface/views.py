from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from os import listdir
from os.path import isfile, join
from ruptures_interface.settings import MEDIA_ROOT
from . import tools
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json 
from random import randint
from pathlib import Path

CURRENT_FOLD = "976"
# home page
def index(request):
    # folder_val = randint(0, 1000) # dossier pour chaque utilisateur
    # request.session["folder_val"] = str(folder_val)
    folder_val = request.session.get("folder_val",str(randint(0, 1000))) # si la valeur n'est pas dans la session on donne une valeur random
    request.session["folder_val"] = str(folder_val) # "sécurité" on sauvegarde la valeur du dossier dans la session
    # si méthode == post => on a uploadé un fichier 
    if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile'] # lecture du fichier depuis la requête
        fs = FileSystemStorage()
        filename = fs.save(str(folder_val)+"/train/"+myfile.name, myfile) # on enregistre le fichier
        tools.standardize_csv(str(MEDIA_ROOT)+"/"+str(folder_val)+"/train/",myfile.name) # on le standardise 
        return render(request, 'interface/index.html') # on retourne la page d'accueil
    return render(request,"interface/index.html")


# page pour labelisé les signaux non labelisé
def label(request):
    # folder_val = request.session["folder_val"]
    folder_val = request.session.get("folder_val",CURRENT_FOLD)
    media_path = str(MEDIA_ROOT)+"/"+str(folder_val)+"/train/"
    # liste de tous les fichiers se trouvant dans le dossier média
    files = [f for f in listdir(media_path) if isfile(join(media_path, f))]
    # affichage de la page pour mettre les labesl + noms des fichiers pour avoir l'url
    return render(request,"interface/label.html",{"files":files,"MEDIA_URL":media_path,"folder_val":folder_val})

# fonction qui va récupérer les labels des signaux
@csrf_exempt
def get_label(request):
    if request.method == "POST": 
        data = json.loads(request.body)
        filename = data["filename"]
        labels = data["labels"]
        labels = [int(x) for x in labels] # conversion des str en int
        # création d'un fichier json qui contient les indices des labels, porte le même nom que le fichier csv
        with open(filename.split(".")[0]+".json","w") as f : 
            f.write(json.dumps(labels))
        return JsonResponse({"status": 'Success'})

# fonction qui va utiliser le code alpin_predict pour déterminer les ruptures
def prediction(request):
    folder_val = request.session.get("folder_val",CURRENT_FOLD)
    return render(request,"interface/prediction.html",{"folder_val":folder_val})

# fonction qui va utiliser le code alpin_learn pour prédire la meilleure valeur de pénalité
def train(request):
    # folder_val = request.session["folder_val"]
    folder_val = request.session.get("folder_val",CURRENT_FOLD)
    json_path = str(MEDIA_ROOT)+"/"+str(folder_val)+"/pen_opt.json"
    train_path = str(MEDIA_ROOT)+"/"+str(folder_val)+"/train/"
    tools.alpin_learn(Path(train_path),Path(json_path))
    with open(json_path, "r") as f:
        data = json.load(f)
    
    return JsonResponse({
        "status": "success",
        "body":data
    })

# vue pour télécharger les signaux sur lesquels on veut prédire les ruptures
def get_signals(request):
    folder_val = request.session.get("folder_val",CURRENT_FOLD)
    # si méthode == post => on a uploadé un fichier 
    if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile'] # lecture du fichier depuis la requête
        fs = FileSystemStorage()
        filename = fs.save(str(folder_val)+"/test/"+myfile.name, myfile) # on enregistre le fichier
        tools.standardize_csv(str(MEDIA_ROOT)+"/"+str(folder_val)+"/test/",myfile.name) # on le standardise 
        # return render(request, 'interface/index.html') # on retourne la page d'accueil 
        return JsonResponse({"status": "success"}) # on retourne la page d'accueil 

# "vue" pour faire appel à alpin_predict 
def predict(request):
    folder_val = request.session.get("folder_val",CURRENT_FOLD)
    test_path = str(MEDIA_ROOT)+"/"+str(folder_val)+"/test/"
    json_path = str(MEDIA_ROOT)+"/"+str(folder_val)+"/pen_opt.json"
    tools.alpin_predict(Path(test_path),Path(json_path))
    return JsonResponse({"status": "success"})

# "vue" pour chopper les indices des fichiers 
def coord(request,filename,folder_val):
    filename_temp = filename.split(".")[:-1]
    clean_filename = '.'.join(filename_temp)
    array = tools.load_json(Path(str(MEDIA_ROOT)+"/"+str(folder_val)+"/test/"+clean_filename+".pred.json"))
    return JsonResponse({"filename":filename,'folder_val':folder_val,'array':array[:-1]})