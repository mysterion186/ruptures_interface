from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from os import listdir
from os.path import isfile, join
from ruptures_interface.settings import MEDIA_ROOT
from . import tools
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json 


# home page
def index(request):
    # si méthode == post => on a uploadé un fichier 
    if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile'] # lecture du fichier depuis la requête
        fs = FileSystemStorage()
        filename = fs.save(myfile.name, myfile) # on enregistre le fichier
        tools.standardize_csv(MEDIA_ROOT,myfile.name) # on le standardise 
        return render(request, 'interface/index.html') # on retourne la page d'accueil
    return render(request,"interface/index.html")


# page pour labelisé les signaux non labelisé
def label(request):
    media_path = MEDIA_ROOT
    # liste de tous les fichiers se trouvant dans le dossier média
    files = [f for f in listdir(media_path) if isfile(join(media_path, f))]
    # affichage de la page pour mettre les labesl + noms des fichiers pour avoir l'url
    return render(request,"interface/label.html",{"files":files,"MEDIA_URL":MEDIA_ROOT})

# fonction qui va récupérer les labels des signaux
@csrf_exempt
def get_label(request):
    if request.method == "POST": 
        data = json.loads(request.body)
        filename = data["filename"]
        labels = data["labels"]
        print(filename, labels)
        return JsonResponse({"status": 'Success'})

# fonction qui va utiliser le code alpin pour chopper les meilleurs valeurs pour la partie prédictions 
def train(request):
    
    pass 