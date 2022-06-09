from distutils.command.clean import clean
from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from django.urls import reverse, reverse_lazy
from django.http import HttpResponse, HttpResponseRedirect
from os import listdir
import os, shutil
from os.path import isfile, join
from ruptures_interface.settings import MEDIA_ROOT
from . import tools
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from random import randint
from pathlib import Path


# home page
@csrf_exempt
def index(request):
    folder_val = request.session.get("folder_val",str(randint(0, 1000))) # create a random value for the session if no value is found
    request.session["folder_val"] = str(folder_val) # save the folder value again in the session (just to be sure)
    # only for post request (because it's file upload)
    if request.method == 'POST':
        request = tools.handle_upload(request,folder_val,"train")
        return render(request, 'interface/index.html') # go back to the index page
    return render(request,"interface/index.html")



# page to label the signals
def label(request):
    if "folder_val" not in request.session:
        return HttpResponseRedirect(reverse("interface:index"))
    folder_val = request.session["folder_val"]
    media_path = str(MEDIA_ROOT) + "/" + str(folder_val) + "/train/"
    # if the train folder doesn't exist we redirect the user to the home page to upload his signals 
    if not os.path.isdir(media_path):
        return HttpResponseRedirect(reverse("interface:index"))

    # list of all files that are in the train folder
    files = [
        f
        for f in listdir(media_path)
        if isfile(join(media_path, f)) and f.split(".")[-1] == "csv"
    ]
    # standardize_json before we plot signals (and their labels)
    for file_name in files:
        json_name = ".".join(file_name.split(".")[:-1]) + ".json"
        if os.path.exists(media_path + json_name):
            labels = tools.load_json(Path(media_path + json_name))
            tools.standardize_json(media_path + file_name, labels)
    # display label page + folder name so the js can make a get request and plot them
    return render(
        request,
        "interface/label.html",
        {"files": files, "MEDIA_URL": media_path, "folder_val": folder_val},
    )


# function to get signals labels
@csrf_exempt
def get_label(request):
    if request.method == "POST":
        data = json.loads(request.body)
        filename = data["filename"]
        labels = data["labels"]
        labels = [int(x) for x in labels]  # convert str to int
        tools.standardize_json(filename, labels)
        return JsonResponse({"status": "Success"})


# prediction pag
def prediction(request):
    if "folder_val" not in request.session:
        return HttpResponseRedirect(reverse("interface:index"))

    folder_val = request.session["folder_val"]
    # on s'assure que tous les fichiers csv ont un fichier json qui contient les labels , si oui on va vers la page prédiction si non on retourne vers la page label
    # make sure that all csv files have a json files
    media_path = str(MEDIA_ROOT) + "/" + str(folder_val) + "/train/"
    # if the train folder doesn't exist we redirect the user to the home page
    if not os.path.isdir(media_path):
        return HttpResponseRedirect(reverse("interface:index"))
    files = [
        f
        for f in listdir(media_path)
        if isfile(join(media_path, f)) and f.split(".")[-1] == "csv"
    ]  # list of all csv files that are in the train folder
    if len(files) == 0:  # case where there is no csv file => redirect to home page
        return HttpResponseRedirect(reverse("interface:index"))
    for filename in files:
        raw_name = filename.split(".")[:-1]
        clean_name = ".".join(raw_name)
        if not os.path.isfile(
            media_path + clean_name + ".json"
        ):  # case where the json folder doesn't exist => redirect to label page
            return HttpResponseRedirect(reverse("interface:label"))
    if request.method == "POST":
        ruptures_type = request.POST["ruptures_type"]
        rupture_dict = {"model": ruptures_type}
        tools.write_json(rupture_dict,Path(str(MEDIA_ROOT) + "/" + str(folder_val)+"/pen_opt.json"))
        return render(request, "interface/prediction.html", {"folder_val": folder_val}) # if all conditions are satisfied we go to the prediction page
    
    return render(request, "interface/prediction.html", {"folder_val": folder_val}) # if all conditions are satisfied we go to the prediction page



# function that calls alpin_learn to get pen values
def train(request):
    folder_val = request.session["folder_val"]
    json_path = str(MEDIA_ROOT) + "/" + str(folder_val) + "/pen_opt.json"
    train_path = str(MEDIA_ROOT) + "/" + str(folder_val) + "/train/"
    full_dict = tools.load_json(Path(json_path))
    tools.alpin_learn(Path(train_path), Path(json_path),model = full_dict["model"])
    with open(json_path, "r") as f:
        data = json.load(f)

    return JsonResponse({"status": "success", "body": data})



# function to 
def get_signals(request):
    folder_val = request.session["folder_val"]
    # only for post request (because it's file upload)
    if request.method == 'POST':
        request = tools.handle_upload(request,folder_val,"test")
        return JsonResponse({"status": "success"}) # on retourne la page d'accueil 

# url to call alpin predict
def predict(request):
    folder_val = request.session["folder_val"]
    test_path = str(MEDIA_ROOT) + "/" + str(folder_val) + "/test/"
    media_path = str(MEDIA_ROOT) + "/" + str(folder_val) + "/test/"
    # list all files that are in test folder
    files = [
        f
        for f in listdir(test_path)
        if isfile(join(test_path, f)) and f.split(".")[-1] == "csv"
    ]
    for file_name in files:
        json_name = ".".join(file_name.split(".")[:-1]) + ".true.json"
        if os.path.exists(media_path + json_name):
            labels = tools.load_json(Path(media_path + json_name))
            tools.standardize_json(media_path + file_name, labels, predict=".true")
    json_path = str(MEDIA_ROOT) + "/" + str(folder_val) + "/pen_opt.json"
    full_dict = tools.load_json(Path(json_path))
    tools.alpin_predict(Path(test_path), Path(json_path),model = full_dict["model"])
    return JsonResponse({"status": "success"})


# url to get labels of detected breaks (and the labels of breaks annotated by the user if there is)
def coord(request, filename, folder_val, folder_name):
    filename_temp = filename.split(".")[:-1]
    clean_filename = ".".join(filename_temp)
    ext = ".pred.json" if folder_name == "test" else ".json"
    try:
        array = tools.load_json(
            Path(
                str(MEDIA_ROOT)
                + "/"
                + str(folder_val)
                + "/"
                + str(folder_name)
                + "/"
                + clean_filename
                + ext
            )
        )
        # if user uploaded breaks that he found, we send both labels
        if (
            os.path.exists(
                str(MEDIA_ROOT)
                + "/"
                + str(folder_val)
                + "/"
                + str(folder_name)
                + "/"
                + clean_filename
                + ".true.json"
            )
        ) and folder_name == "test":
            labels = tools.load_json(
                Path(
                    str(MEDIA_ROOT)
                    + "/"
                    + str(folder_val)
                    + "/"
                    + str(folder_name)
                    + "/"
                    + clean_filename
                    + ".true.json"
                )
            )
            return JsonResponse(
                {
                    "status": "success",
                    "filename": filename,
                    "folder_val": folder_val,
                    "array": array[:-1],
                    "labels": labels[:-1],
                }
            )
        # case there is not json file uploaded by the user
        return JsonResponse(
            {
                "status": "success",
                "filename": filename,
                "folder_val": folder_val,
                "array": array[:-1],
            }
        )
    except FileNotFoundError:
        return JsonResponse(
            {
                "status": "FileNotFoundError",
                "filename": filename,
                "folder_val": folder_val,
            }
        )


# url to delete a folder, not used yet
def delete_folder(request):
    folder_val = request.session["folder_val"]
    folder_path = str(MEDIA_ROOT) + "/" + str(folder_val)
    shutil.rmtree(folder_path)
    return JsonResponse({"status": "success"})

# help page
def help(request):
    return render(request, "interface/help.html")


# url to dowload the sessions archive (zip)
def download(request):
    # create a zip that contains all labels pen_opt and the detection results
    folder_val = request.session["folder_val"]
    folder_path = str(MEDIA_ROOT) + "/" + str(folder_val)
    output_path = folder_path
    # convert file to zip
    shutil.make_archive(
        output_path, "zip", folder_path
    )  # place where we save the zip before sending it
    with open(output_path + ".zip", "rb") as fh:
        response = HttpResponse(fh.read(), content_type="application/zip")
        response["Content-Disposition"] = "attachment; filename=" + folder_val + ".zip"
    os.remove(output_path + ".zip")
    return response
