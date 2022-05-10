from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
from os import listdir
from os.path import isfile, join
from ruptures_interface.settings import MEDIA_ROOT
from . import tools


# home page
def index(request):
    if request.method == 'POST' and request.FILES['myfile']:
        myfile = request.FILES['myfile']
        fs = FileSystemStorage()
        filename = fs.save(myfile.name, myfile)
        tools.standardize_csv(MEDIA_ROOT,myfile.name)
        return render(request, 'interface/index.html')
    return render(request,"interface/index.html")


# signal display page
def label(request):
    media_path = MEDIA_ROOT
    files = [f for f in listdir(media_path) if isfile(join(media_path, f))]
    print(MEDIA_ROOT)
    return render(request,"interface/label.html",{"files":files,"MEDIA_URL":MEDIA_ROOT})