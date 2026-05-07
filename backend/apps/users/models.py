from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    age = models.IntegerField()
    gender = models.CharField(max_length=10)

    height = models.FloatField()
    weight = models.FloatField()

    activity_level = models.CharField(max_length=20)
    goal = models.CharField(max_length=20)