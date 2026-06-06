from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    age = models.IntegerField()
    gender = models.CharField(max_length=10)

    height = models.FloatField()
    weight = models.FloatField()

    activity_level = models.CharField(max_length=20)
    goal = models.CharField(max_length=20)

    profile_image = models.ImageField(
    upload_to="profile_images/",
    null=True,
    blank=True
    )

    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    

class PasswordResetOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    verified = models.BooleanField(
        default=False
    )

    def is_expired(self):
        from datetime import timedelta

        return timezone.now() > (
            self.created_at +
            timedelta(minutes=10)
        )    