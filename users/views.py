from django.shortcuts import render

from django.shortcuts import render
from django.contrib.auth import authenticate, login,logout

from django.urls import reverse_lazy, reverse
from django.http import HttpResponseRedirect, HttpResponse 

#home page
def home(request):
    return render(request,'users/home.html')

def user_login(request):
    if request.POST :
        email = request.POST.get("email") 
        password = request.POST.get("password")
        user = authenticate(email = email, password = password)
        #check if the user exists and if it's account is active
        if user is not None and user.is_active :
            login(request,user)
            return HttpResponseRedirect(reverse('login:dashboard')) # redirect user to dashboard
        return render(request,'users/dashboard.html')
    return render(request,'users/login.html')


def dashboard(request):
    return render(request,'users/dashboard.html')

def user_logout(request):
    logout(request) 
    return HttpResponseRedirect(reverse('login:home'))