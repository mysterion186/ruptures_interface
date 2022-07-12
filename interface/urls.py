from django.urls import path
from . import views
from ruptures_interface import settings
from django.conf import settings
from django.conf.urls.static import static

app_name = "interface"

urlpatterns = [
    path("", views.index, name="index"),  # home page url
    path("label", views.label, name="label"),  # label page url
    path(
        "add", views.get_label, name="get_label"
    ),  # page to save labels 
    path(
        "train", views.train, name="train"
    ),  # url to return the pen values from alpin_learn
    path(
        "delete", views.delete_folder, name="delete"
    ),  # url to delete (not used yet)
    path("aide", views.help, name="aide"),  # help page url
    path(
        "prediction", views.prediction, name="prediction"
    ),  # prediction page url
    path(
        "prediction/signal", views.get_signals, name="upload_signal"
    ),  # url to upload signal where we want to detect breaks point
    path(
        "prediction/predict", views.predict, name="predict"
    ),  # url pour faire appel à alpin_predict
    path(
        "prediction/coord/<str:folder_val>/<str:folder_name>/<str:filename>",
        views.coord,
        name="coord",
    ),  # url to get the labels that user uploaded to compare with the breaks detected by ruptures 
    path(
        "download", views.download, name="download"
    ),  # url to donwload the archive
] + static(
    settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
)  # url to get to the medias


