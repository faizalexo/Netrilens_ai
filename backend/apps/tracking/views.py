from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime


from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.tracking.models import Meal

from .services import (
    create_meal_entry,
    list_meal_entries,
    build_daily_summary,
)

User = get_user_model()



# ===============================
# 🔥 ADD MEAL
# ===============================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_meal(request):

    print(request.data)

    try:

        user = request.user

        print(
            "ADD MEAL USER:",
            user.id
        )

        food_id = request.data.get(
            "food_id"
        )

        grams = request.data.get(
            "grams"
        )

        meal_type = request.data.get(
            "meal_type"
        )

        consumed_at = request.data.get(
            "consumed_at"
        )

        if (
            not food_id
            or not grams
            or not meal_type
        ):

            return Response(
                {
                    "error":
                    "food_id, grams and meal_type are required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        meal = create_meal_entry(
            user_id=user.id,

            food_id=food_id,

            grams=grams,

            meal_type=meal_type,

            eaten_at=consumed_at,
        )

        return Response(
            {
                "success": True,

                "message":
                    "Meal added successfully",

                "meal_id":
                    meal.id,
            },

            status=status.HTTP_201_CREATED,
        )

    except ValueError as e:

        return Response(
            {
                "success": False,
                "message": str(e),
            },
            status=400,
        )

    except ObjectDoesNotExist:

        return Response(
            {
                "success": False,
                "message":
                    "Object not found",
            },
            status=400,
        )

    except Exception as e:

        print(
            "🔥 ADD MEAL ERROR:",
            e
        )

        return Response(
            {
                "success": False,

                "message":
                    "Internal server error",
            },
            status=500,
        )

# ===============================
# 🔥 TODAY MEALS
# ===============================
from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.response import Response

from rest_framework import status

import logging

logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def today_meals(request):

    try:

        user = request.user

        date_value = request.GET.get(
            "date"
        )

        logger.info(
            f"[TODAY_MEALS] "
            f"user={user.id} "
            f"date={date_value}"
        )
        print(
         "CURRENT USER ID:",
          user.id
        )
        for e in Meal.objects.all():
            print(
              "DB MEAL:",
               e.id,
               e.user_id,
               e.consumed_at
            )
        entries = list_meal_entries(
            user_id=user.id,
            date_value=date_value,
        )

        meals = [
            {
                "id": entry.id,

                "food": {
                    "id":
                        entry.food.id
                        if entry.food
                        else None,

                    "name":
                        entry.food.name
                        if entry.food
                        else "Food",
                },

                "food_name":
                    entry.food.name
                    if entry.food
                    else "Food",

                "meal_type":
                    entry.meal_type,

                "grams":
                    float(entry.grams or 0),

                "nutrition": {
                    "calories":
                        float(
                            entry.calories or 0
                        ),

                    "protein":
                        float(
                            entry.protein or 0
                        ),

                    "carbs":
                        float(
                            entry.carbs or 0
                        ),

                    "fat":
                        float(
                            entry.fat or 0
                        ),
                },

                # compatibility
                "calories":
                    float(entry.calories or 0),

                "protein":
                    float(entry.protein or 0),

                "carbs":
                    float(entry.carbs or 0),

                "fat":
                    float(entry.fat or 0),

                "consumed_at":
                    entry.consumed_at,
            }
            for entry in entries
        ]

        return Response(
            {
                "success": True,

                "data": {
                    "count": len(meals),

                    "meals": meals,
                },
            },
            status=status.HTTP_200_OK,
        )

    except ValueError as e:

        logger.warning(
            f"[TODAY_MEALS_ERROR] "
            f"{str(e)}"
        )

        return Response(
            {
                "success": False,
                "message": str(e),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:

        logger.exception(
            "[TODAY_MEALS_FATAL]"
        )

        return Response(
            {
                "success": False,
                "message":
                    "Internal server error",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

# ===============================
# 🔥 DAILY SUMMARY
# ===============================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def daily_summary(request):
    try:
        user = request.user
        print("USER:", request.user)
        entries = list_meal_entries(
            user_id=user.id,
            date_value=request.GET.get("date"),
        )
        print("ENTRIES COUNT:", entries.count())
        for meal in entries:
         print(
            "MEAL:",
            meal.food.name,
            meal.calories
         )

        summary = build_daily_summary(entries)
        print("DATE:", request.GET.get("date"))
        # SAFETY FALLBACK
        if not summary:
            summary = {
                "totals": {
                    "calories": 0,
                    "protein": 0,
                    "carbs": 0,
                    "fat": 0,
                    "water": 0,
                },
                "meals": [],
            }

        return Response(
            {
                "user_name": request.user.username,
                "totals": summary.get("totals", {}),
                "meals": summary.get("meals", []),
            },
            status=200,
        )

    except ValueError as e:
        return Response({"error": str(e)}, status=400)

    except Exception as e:
        print("🔥 SUMMARY ERROR:", e)
        print("ENTRIES:", entries.count())
        return Response({"error": "Internal server error"}, status=500)
