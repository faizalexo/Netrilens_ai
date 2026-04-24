from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime


from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist

from .services import (
    create_meal_entry,
    list_meal_entries,
    build_daily_summary,
)

User = get_user_model()


# 🔥 SAFE USER GET
def get_current_user():
    user = User.objects.first()
    if not user:
        raise ValueError("No user found in database")
    return user


# ===============================
# 🔥 ADD MEAL
# ===============================
@api_view(["POST"])
def add_meal(request):
    print(request.data)
    try:
        user = get_current_user()

        food_id = request.data.get("food_id")
        grams = request.data.get("grams")
        meal_type = request.data.get("meal_type")
        consumed_at = request.data.get("consumed_at")

        if not food_id or not grams or not meal_type:
            return Response(
                {"error": "food_id, grams and meal_type are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        meal = create_meal_entry(
            user_id=user.id,
            food_id=food_id,
            grams=grams,
            meal_type=meal_type,
            eaten_at=consumed_at,  # service handles conversion
        )

        return Response(
            {
                "message": "Meal added successfully",
                "meal_id": meal.id,
            },
            status=status.HTTP_201_CREATED,
        )

    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    except ObjectDoesNotExist as e:
        return Response({"error": "Object not found"}, status=400)

    except Exception as e:
        print("🔥 ADD MEAL ERROR:", e)
        return Response({"error": "Internal server error"}, status=500)


# ===============================
# 🔥 TODAY MEALS
# ===============================
@api_view(["GET"])
def today_meals(request):
    try:
        user = get_current_user()

        entries = list_meal_entries(
            user_id=user.id,
            date_value=request.GET.get("date"),
        )

        meals = [
            {
                "id": e.id,
                "food_name": e.food_name,
                "meal_type": e.meal_type,
                "grams": float(e.grams),
                "calories": float(e.calories),
                "consumed_at": e.consumed_at,
            }
            for e in entries
        ]

        return Response(
            {
                "count": len(meals),
                "meals": meals,
            }
        )

    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    except Exception as e:
        print("🔥 TODAY ERROR:", e)
        return Response({"error": "Internal server error"}, status=500)


# ===============================
# 🔥 DAILY SUMMARY
# ===============================
@api_view(["GET"])
def daily_summary(request):
    try:
        user = get_current_user()

        entries = list_meal_entries(
            user_id=user.id,
            date_value=request.GET.get("date"),
        )

        summary = build_daily_summary(entries)

        return Response(summary)

    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    except Exception as e:
        print("🔥 SUMMARY ERROR:", e)
        return Response({"error": "Internal server error"}, status=500)