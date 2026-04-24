from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from apps.food.models import FoodItem
from .services import calculate_nutrition


@api_view(['POST'])
def calculate_food(request):
    """
    🔥 Production-grade API for nutrition calculation
    """

    # 🔥 Extract data
    food_id = request.data.get("food_id")
    grams = request.data.get("grams")

    # 🔥 Validation
    if not food_id:
        return Response(
            {"error": "food_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if grams is None:
        return Response(
            {"error": "grams is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 🔥 Convert grams safely
    try:
        grams = float(grams)
    except (ValueError, TypeError):
        return Response(
            {"error": "grams must be a number"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 🔥 Fetch food safely
    try:
        food = FoodItem.objects.get(id=food_id)
    except FoodItem.DoesNotExist:
        return Response(
            {"error": "Food not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # 🔥 Calculate
    try:
        result = calculate_nutrition(food, grams)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 🔥 Response (clean + useful)
    return Response({
        "food": {
            "id": food.id,
            "name": food.name,
        },
        "grams": grams,
        "nutrition": result
    }, status=status.HTTP_200_OK)