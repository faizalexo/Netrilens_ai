from urllib import request
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from .models import UserProfile
from .utils import calculate_goals
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from google.oauth2 import id_token
from google.auth.transport import requests
import random
from django.core.mail import send_mail
from .models import (UserProfile,PasswordResetOTP)
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes


# 🥇 SIGNUP
@api_view(["POST"])
def signup(request):

    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"error": "All fields required"},
            status=400
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists"},
            status=400
        )

    # TEMP USERNAME
    username = email

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )

    refresh = RefreshToken.for_user(user)
    html_content = render_to_string(
        "emails/welcome_email.html",
        {
            "name": user.username
        }
    )
    email_message = EmailMultiAlternatives(
        subject="Welcome to Netrilens AI!",
        body=f"Hi {user.username}, welcome to Netrilens AI!",
        from_email=settings.EMAIL_HOST_USER,
        to=[email],
    )
    email_message.attach_alternative(
        html_content,
        "text/html"
    )
    email_message.send()

    return Response(
        {
            "access": str(
                refresh.access_token
            ),

            "refresh": str(refresh),

            "user": {
                "id": user.id,
                "email": user.email,
            },
        },
        status=201,
    )
# 🥈 LOGIN
@api_view(["POST"])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"error": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    user = authenticate(username=user_obj.username, password=password)

    if user is None:
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        }
    )


# 🥉 CREATE PROFILE
@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_profile(request):

    try:

        print("🔥 HIT")
        print("DATA:", request.data)
        print("USER:", request.user)

        user = request.user

        # PROFILE EXISTS
        if UserProfile.objects.filter(
            user=user
        ).exclude(id=user.id).exists():

            return Response(
                {
                    "error":
                    "Profile already exists"
                },
                status=400
            )

        # 🔥 REAL USERNAME FROM ONBOARDING
        new_username = request.data.get(
            "name"
        )

        if new_username:

            # CHECK DUPLICATE
            if User.objects.filter(
                username=new_username
            ).exclude(
                id=user.id
            ).exists():

                return Response(
                    {
                        "error":
                        "Username already taken"
                    },
                    status=400
                )

            # UPDATE USERNAME
            user.username = new_username
            user.save()

        # CREATE PROFILE
        profile = UserProfile.objects.create(
            user=user,

            age=request.data.get(
                "age"
            ),

            gender=request.data.get(
                "gender"
            ),

            height=request.data.get(
                "height"
            ),

            weight=request.data.get(
                "weight"
            ),

            activity_level=request.data.get(
                "activity_level"
            ),

            goal=request.data.get(
                "goal"
            ),
        )

        return Response(
            {
                "message":
                "Profile created",

                "user": {
                    "id": user.id,
                    "username":
                    user.username,
                    "email":
                    user.email,
                },
            }
        )

    except Exception as e:

        return Response(
            {
                "error": str(e)
            },
            status=500
        )
    

# 🥉 Check USERNAME
@api_view(["POST"])
def check_username(request):

    username = request.data.get(
            "username"
        )

    exists = User.objects.filter(
        username=username
    ).exists()

    return Response({

        "available":
            not exists

    })    

# 🏅 GET GOALS (🔥 yaha use hoga calculate_goals)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_goals(request):
    try:
        print("GET GOALS VIEW HIT")
        profile = UserProfile.objects.get(user=request.user)

        # 🔥 YAHI IMPORTANT LINE
        data = calculate_goals(profile)

        return Response(data)

    except UserProfile.DoesNotExist:
        return Response({
        "onboarding_complete": False
        })
    

# 🏅 GOOGLE LOGIN

@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):

    print("🔥 GOOGLE LOGIN HIT")
    print("DATA:", request.data)
    token = request.data.get("id_token")

    try:
        user_info = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_WEB_CLIENT_ID
        )

        email = user_info["email"]
        name = user_info.get("name", "")

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "first_name": name,
            }
        )
        profile_exists = UserProfile.objects.filter(
            user=user
        ).exists()

        refresh = RefreshToken.for_user(user)

        return Response({
            "success": True,

            "is_new_user": created,

            "profile_exists": profile_exists,

            "access": str(refresh.access_token),

            "refresh": str(refresh),

            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.first_name,
            }
        })

    except Exception as e:
        return Response({
            "success": False,
            "error": str(e)
        }, status=400)
    
#forgot password
@api_view(["POST"])
def forgot_password(request):

    email = request.data.get("email")

    if not email:
        return Response(
            {"error": "Email required"},
            status=400
        )

    try:
        User.objects.get(email=email)

    except User.DoesNotExist:

        return Response(
            {"error": "User not found"},
            status=404
        )

    otp = str(
        random.randint(
            100000,
            999999
        )
    )

    PasswordResetOTP.objects.filter(
        email=email
    ).delete()

    PasswordResetOTP.objects.create(
        email=email,
        otp=otp
    )

    html_content = render_to_string(
        "emails/reset_password.html",
        {
          "otp": otp,
        }
   )

    email_message = EmailMultiAlternatives(
        subject="Reset Your Netrilens AI Password",
        body=f"Your OTP is {otp}",
        from_email=settings.EMAIL_HOST_USER,
        to=[email],
    )
    email_message.attach_alternative(
        html_content,
        "text/html"
    )
    email_message.send()

    
    return Response({
        "success": True,
        "message":
        "OTP sent successfully"
    })



# otp verify and reset password
@api_view(["POST"])
def verify_reset_otp(request):

    email = request.data.get("email")
    otp = request.data.get("otp")

    try:

        otp_obj = PasswordResetOTP.objects.get(
            email=email,
            otp=otp
        )

        if otp_obj.is_expired():

            otp_obj.delete()

            return Response(
                {
                    "error":
                    "OTP expired"
                },
                status=400
            )

        otp_obj.verified = True
        otp_obj.save()

        return Response({
            "success": True
        })

    except PasswordResetOTP.DoesNotExist:

        return Response(
            {
                "error":
                "Invalid OTP"
            },
            status=400
        )

# reset password
@api_view(["POST"])
def reset_password(request):

    email = request.data.get("email")

    otp = request.data.get("otp")

    password = request.data.get(
        "password"
    )

    try:

        otp_obj = PasswordResetOTP.objects.get(
            email=email,
            otp=otp,
            verified=True
        )

        if otp_obj.is_expired():

            otp_obj.delete()

            return Response(
                {
                    "error":
                    "OTP expired"
                },
                status=400
            )

        user = User.objects.get(
            email=email
        )

        user.set_password(password)

        user.save()

        otp_obj.delete()

        return Response({
            "success": True,
            "message":
            "Password updated"
        })

    except Exception:

        return Response(
            {
                "error":
                "Invalid request"
            },
            status=400
        )





# Permission classses 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    
    print("🔥 PROFILE HIT")
    print("USER:", request.user)
    



    try:

        profile = UserProfile.objects.get(
            user=request.user
        )

        return Response({

    "success": True,

    "user": {

        "username":
        request.user.username,

        "email":
        request.user.email,
    },

    "profile": {

        "age":
        profile.age,

        "gender":
        profile.gender,

        "height":
        profile.height,

        "weight":
        profile.weight,

        "activity_level":
        profile.activity_level,

        "goal":
        profile.goal,
    },

    "profile_image":
    request.build_absolute_uri(
        profile.profile_image.url
    ) if profile.profile_image else None,

    "streak": {

        "current":
        profile.current_streak,

        "longest":
        profile.longest_streak,
    }

})
    except UserProfile.DoesNotExist:

        return Response({

            "success": False,

            "error":
            "Profile not found"

        }, status=404)
    

# update profile
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_profile(request):

    try:

        profile = UserProfile.objects.get(
            user=request.user
        )

        username = request.data.get(
            "username"
        )

        if username:

            if User.objects.filter(
                username=username
            ).exclude(
                id=request.user.id
            ).exists():

                return Response({

                    "success": False,

                    "error":
                    "Username already exists"

                }, status=400)

            request.user.username = username
            request.user.save()

        profile.age = request.data.get(
            "age",
            profile.age
        )

        profile.gender = request.data.get(
            "gender",
            profile.gender
        )

        profile.height = request.data.get(
            "height",
            profile.height
        )

        profile.weight = request.data.get(
            "weight",
            profile.weight
        )

        profile.activity_level = request.data.get(
            "activity_level",
            profile.activity_level
        )

        profile.goal = request.data.get(
            "goal",
            profile.goal
        )

        profile.save()

        goals = calculate_goals(
            profile
        )

        return Response({

            "success": True,

            "message":
            "Profile updated",

            "goals":
            goals
        })

    except UserProfile.DoesNotExist:

        return Response({

            "success": False,

            "error":
            "Profile not found"

        }, status=404)
    

# update profile with image

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_profile_image(request):

    profile = UserProfile.objects.get(
        user=request.user
    )

    image = request.FILES.get(
        "image"
    )

    if not image:

        return Response(
            {
                "success": False
            },
            status=400
        )

    profile.profile_image = image
    profile.save()

    return Response({
        "success": True
    })