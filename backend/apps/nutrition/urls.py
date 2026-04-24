from django.urls import path

from .views import calculate_food

app_name = "nutrition"  # 🔥 important for namespacing

urlpatterns = [
    path("calculate/", calculate_food, name="calculate_food"),
]