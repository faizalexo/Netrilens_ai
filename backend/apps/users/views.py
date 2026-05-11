from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile
from .utils import calculate_goals
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


# 🥇 SIGNUP
@api_view(["POST"])
def signup(request):
    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not email or not password:
        return Response({"error": "All fields required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username exists"}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)

    return Response({"message": "User created"}, status=201)


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

        if UserProfile.objects.filter(user=user).exists():
            return Response({"error": "Profile already exists"}, status=400)

        profile = UserProfile.objects.create(
            user=user,
            age=request.data.get("age"),
            gender=request.data.get("gender"),
            height=request.data.get("height"),
            weight=request.data.get("weight"),
            activity_level=request.data.get("activity_level"),
            goal=request.data.get("goal"),
        )

        return Response({"message": "Profile created"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# 🏅 GET GOALS (🔥 yaha use hoga calculate_goals)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_goals(request):
    try:
        profile = UserProfile.objects.get(user=request.user)

        # 🔥 YAHI IMPORTANT LINE
        data = calculate_goals(profile)

        return Response(data)

    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
        )
