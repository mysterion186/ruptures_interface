from django.urls import path
from . import views
from ruptures_interface import settings
from django.conf import settings
from django.conf.urls.static import static

app_name = "interface"

urlpatterns = [
    path("",views.index, name="index"),
    path("label", views.label, name="label"),   
]+static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)