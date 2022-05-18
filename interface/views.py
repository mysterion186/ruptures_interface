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
    folder_val = request.session["folder_val"]
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

# fonction qui va utiliser le code alpin pour chopper les meilleurs valeurs pour la partie prédictions 
def train(request):
    
    pass 