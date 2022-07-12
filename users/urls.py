from django.urls import path
from . import views

app_name = "login"

urlpatterns =[
    path("login",views.user_login,name="login"),
    path("dashboard",views.dashboard,name="dashboard"),
]