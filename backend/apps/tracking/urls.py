from django.urls import path

from .views import add_meal, today_meals, daily_summary

urlpatterns = [
    path("add/", add_meal, name="add_meal"),
    path("today/", today_meals, name="today_meals"),
    path("summary/", daily_summary, name="daily_summary"),
]
