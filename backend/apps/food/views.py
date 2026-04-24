from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import FoodItem


@api_view(['GET'])
def search_food(request):
    query = request.GET.get('q', '')

    foods = FoodItem.objects.filter(name__icontains=query)[:10]

    data = [
        {
            "id": f.id,
            "name": f.name,
            "calories": f.calories_per_100g,
            "protein": f.protein_per_100g,
            "carbs": f.carbs_per_100g,
            "fat": f.fat_per_100g,
        }
        for f in foods
    ]

    return Response(data)