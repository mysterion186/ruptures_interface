from distutils.command.clean import clean
from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from django.urls import reverse, reverse_lazy
from django.http import HttpResponse, HttpResponseRedirect
from os import listdir
import os,shutil
from os.path import isfile, join
from ruptures_interface.settings import MEDIA_ROOT
from . import tools
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json 
from random import randint
from pathlib import Path

# CURRENT_FOLD = "976"
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
        if myfile.name.split('.')[-1]=='csv' or myfile.name.split('.')[-1]=='json': # on accepte que les fichiers csv ou json     
            filename = fs.save(str(folder_val)+"/train/"+myfile.name, myfile) # on enregistre le fichier
            if myfile.name.split(".")[-1]=="csv": # on standardise que les fichiers csv
                tools.standardize_csv(str(MEDIA_ROOT)+"/"+str(folder_val)+"/train/",myfile.name) # on le standardise 
            return render(request, 'interface/index.html') # on retourne la page d'accueil
    return render(request,"interface/index.html")


# page pour labelisé les signaux non labelisé
def label(request):
    # folder_val = request.session.get("folder_val",CURRENT_FOLD)
    if 'folder_val' not in request.session : 
        return HttpResponseRedirect(reverse("interface:index"))
    folder_val = request.session["folder_val"]
    media_path = str(MEDIA_ROOT)+"/"+str(folder_val)+"/train/"
    # si le dossier train n'existe pas on redirige vers la page d'accueil pour uploader les fichiers
    if not os.path.isdir(media_path):
        return HttpResponseRedirect(reverse("interface:index"))
    
    # liste de tous les fichiers se trouvant dans le dossier média
    files = [f for f in listdir(media_path) if isfile(join(media_path, f)) and f.split(".")[-1]=="csv"]
    for file_name in files : 
        json_name = '.'.join(file_name.split(".")[:-1])+".json"
        if os.path.exists(media_path+json_name):
            labels = tools.load_json(Path(media_path+json_name))
            tools.standardize_json(media_path+file_name,labels)
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
        tools.standardize_json(filename,labels)
        return JsonResponse({"status": 'Success'})

# fonction qui va utiliser le code alpin_predict pour déterminer les ruptures
def prediction(request):
    # folder_val = request.session.get("folder_val",CURRENT_FOLD)
    if 'folder_val' not in request.session : 
        return HttpResponseRedirect(reverse("interface:index"))
    
    folder_val = request.session["folder_val"]
    # on s'assure que tous les fichiers csv ont un fichier json qui contient les labels , si oui on va vers la page prédiction si non on retourne vers la page label
    media_path = str(MEDIA_ROOT)+"/"+str(folder_val)+"/train/"
    # si le dossier train n'existe pas on redirige vers la page d'accueil pour uploader les fichiers
    if not os.path.isdir(media_path):
        return HttpResponseRedirect(reverse("interface:index"))
    files = [f for f in listdir(media_path) if isfile(join(media_path, f)) and f.split(".")[-1]=="csv"] # liste de tous les fichiers csv présent 
    if len(files) == 0 : # cas où il n'y a pas de fichier csv 
        return HttpResponseRedirect(reverse("interface:index")) 
    for filename in files : 
        raw_name = filename.split(".")[:-1]
        clean_name = '.'.join(raw_name) 
        if not os.path.isfile(media_path+clean_name+'.json') : # cas où me fichier json du fichier csv n'existe pas, on retourne vers la page label
            return HttpResponseRedirect(reverse("interface:label")) 
    return render(request,"interface/prediction.html",{"folder_val":folder_val})

# fonction qui va utiliser le code alpin_learn pour prédire la meilleure valeur de pénalité
def train(request):
    # folder_val = request.session.get("folder_val",CURRENT_FOLD)
    folder_val = request.session["folder_val"]
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
    # folder_val = request.session.get("folder_val",CURRENT_FOLD)
    folder_val = request.session["folder_val"]
    # si méthode == post => on a uploadé un fichier 
    if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile'] # lecture du fichier depuis la requête
        fs = FileSystemStorage()
        if myfile.name.split('.')[-1]=='csv' or myfile.name.split('.')[-1]=='json': # on accepte que les fichiers csv ou json     
            filename = fs.save(str(folder_val)+"/test/"+myfile.name, myfile) # on enregistre le fichier
            if myfile.name.split(".")[-1]=="csv": # on standardise que les fichiers csv
                tools.standardize_csv(str(MEDIA_ROOT)+"/"+str(folder_val)+"/test/",myfile.name) # on le standardise       
            # return render(request, 'interface/index.html') # on retourne la page d'accueil 
            return JsonResponse({"status": "success","filename":myfile.name}) # on retourne la page d'accueil 

# "vue" pour faire appel à alpin_predict 
def predict(request):
    # folder_val = request.session.get("folder_val",CURRENT_FOLD)
    folder_val = request.session["folder_val"]
    test_path = str(MEDIA_ROOT)+"/"+str(folder_val)+"/test/"
    media_path = str(MEDIA_ROOT)+"/"+str(folder_val)+"/test/"
    # liste de tous les fichiers se trouvant dans le dossier média
    files = [f for f in listdir(test_path) if isfile(join(test_path, f)) and f.split(".")[-1]=="csv"]
    for file_name in files : 
        json_name = '.'.join(file_name.split(".")[:-1])+".true.json"
        if os.path.exists(media_path+json_name):
            labels = tools.load_json(Path(media_path+json_name))
            tools.standardize_json(media_path+file_name,labels,predict='.true')
    json_path = str(MEDIA_ROOT)+"/"+str(folder_val)+"/pen_opt.json"
    tools.alpin_predict(Path(test_path),Path(json_path))
    return JsonResponse({"status": "success"})

# "vue" pour chopper les indices des fichiers 
def coord(request,filename,folder_val,folder_name):
    filename_temp = filename.split(".")[:-1]
    clean_filename = '.'.join(filename_temp)
    ext = ".pred.json" if folder_name =="test" else ".json"
    try : 
        array = tools.load_json(Path(str(MEDIA_ROOT)+"/"+str(folder_val)+"/"+str(folder_name)+"/"+clean_filename+ext))
        # si l'utilisateur veut prédire les ruptures mais met en même temps un fichier  json on envoie les valeurs en plus au front pour superposer les 2
        if (os.path.exists(str(MEDIA_ROOT)+"/"+str(folder_val)+"/"+str(folder_name)+"/"+clean_filename+".true.json")) and folder_name =="test" : 
            labels = tools.load_json(Path(str(MEDIA_ROOT)+"/"+str(folder_val)+"/"+str(folder_name)+"/"+clean_filename+".true.json")) 
            return JsonResponse({"status":"success","filename":filename,'folder_val':folder_val,'array':array[:-1],'labels':labels[:-1]})
        return JsonResponse({"status":"success","filename":filename,'folder_val':folder_val,'array':array[:-1]})
    except FileNotFoundError :
        return JsonResponse({"status":"FileNotFoundError","filename":filename,'folder_val':folder_val})


# "vue" pour supprimer un dossier dans le cas où l'utilisateur a fait une erreur
def delete_folder(request):
    # folder_val = request.session.get("folder_val",CURRENT_FOLD)
    folder_val = request.session["folder_val"]
    folder_path = str(MEDIA_ROOT)+"/"+str(folder_val)
    shutil.rmtree(folder_path)
    return JsonResponse({"status":"success"})

def aide(request):
    return render(request,'interface/aide.html')