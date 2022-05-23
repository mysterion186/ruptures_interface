from django.urls import path
from . import views
from ruptures_interface import settings
from django.conf import settings
from django.conf.urls.static import static

app_name = "interface"

urlpatterns = [
    path("",views.index, name="index"), # url de la page d'accueil
    path("label", views.label, name="label"),  # url de la page pour mettre des labels 
    path("add",views.get_label,name = "get_label"), # url pour ajouter des labels aux signaux
    path("train",views.train, name="train"), # url de la page qui va retourner les paramètres obtenues pour la prédiction
    path("prediction", views.prediction, name="prediction"), # url qui va permettre d'uploader les fichiers pour déterminer les ruptures
    path("prediction/signal",views.get_signals,name="upload_signal"), # url qui va recevoir les fichiers uploadé 
    path("prediction/predict",views.predict, name="predict"), # url pour faire appel à alpin_predict
    path("prediction/coord/<int:folder_val>/<str:filename>",views.coord, name="coord"), # url pour chopper les indices des ruptures 
    path("delete",views.delete_folder,name="delete"), # url pour supprimer un dossier en cas d'erreur de la part de l'utilisateur (signaux labellisé)
]+static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT) # url pour accèder aux médias