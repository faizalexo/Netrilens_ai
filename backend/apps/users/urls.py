from django.urls import path
from .views import check_username, forgot_password, get_profile, google_login, reset_password, signup, login, create_profile, get_goals, update_profile, upload_profile_image, verify_reset_otp 
from .models import UserProfile
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('signup/', signup),
    path('login/', login),
    path('create_profile/', create_profile),
    path('get_goals/', get_goals),
    path("check-username/",check_username),
    path("auth/google/",google_login, name="google_login"),
    path("forgot-password/",forgot_password, name="forgot_password"),
    path("verify-reset-otp/",verify_reset_otp, name="verify_reset_otp"),
    path("reset-password/",reset_password, name="reset_password"),
    path("profile/",get_profile, name="get_profile"),
    path("profile/update/",update_profile, name="update_profile"),
    path("profile/image/",upload_profile_image, name="upload_profile_image"),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)