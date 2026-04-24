from django.urls import path
from .views import search_food

urlpatterns = [
    path('search/', search_food),
]