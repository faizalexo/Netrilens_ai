from django.urls import path
from .views import signup, login, create_profile, get_goals 
from .models import UserProfile

urlpatterns = [
    path('signup/', signup),
    path('login/', login),
    path('create_profile/', create_profile),
    path('get_goals/', get_goals),
    
]