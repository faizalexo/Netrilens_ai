from django.urls import path

from .views import add_meal, delete_meal,  today_meals, daily_summary, update_meal, progress_data, add_water, today_water

urlpatterns = [
    path("add/", add_meal, name="add_meal"),
    path("today/", today_meals, name="today_meals"),
    path("summary/", daily_summary, name="daily_summary"),
    path("meal/<int:meal_id>/delete/", delete_meal),
    path("meal/<int:meal_id>/update/", update_meal),
    path("progress/", progress_data, name="progress_data"),
    path("water/add/", add_water),
    path("water/today/", today_water),
]
