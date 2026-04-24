from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .utils import calculate_goals


# 🥇 SIGNUP
@api_view(['POST'])
def signup(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    # ✅ validation
    if not username or not email or not password:
        return Response(
            {"error": "All fields are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ✅ duplicate check
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response(
        {"message": "User created successfully"},
        status=status.HTTP_201_CREATED
    )


# 🥈 LOGIN
@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"error": "Username and password required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })


# 🥉 CREATE PROFILE
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_profile(request):
    user = request.user

    # ✅ already exists check
    if UserProfile.objects.filter(user=user).exists():
        return Response(
            {"error": "Profile already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        profile = UserProfile.objects.create(
            user=user,
             age=request.data.get('age'),
             gender=request.data.get('gender'),
             height=request.data.get('height'),
             weight=request.data.get('weight'),
             activity_level=request.data.get('activity_level'),
             goal=request.data.get('goal')
        )

        return Response(
            {"message": "Profile created successfully"},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


# 🏅 GET GOALS (🔥 yaha use hoga calculate_goals)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_goals(request):
    try:
        profile = UserProfile.objects.get(user=request.user)

        # 🔥 YAHI IMPORTANT LINE
        data = calculate_goals(profile)

        return Response(data)

    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Profile not found"},
            status=status.HTTP_404_NOT_FOUND
        )