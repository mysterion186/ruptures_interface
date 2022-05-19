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
    path("prediction",views.predict, name="prediction"), # url de la page qui va retourner les paramètres obtenues pour la prédiction
]+static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT) # url pour accèder aux médias