# 🔥 FINAL PRODUCTION-MVP SERIALIZERS

from decimal import Decimal
from rest_framework import serializers
from django.utils import timezone
from apps.food.models import FoodItem
from .models import Meal


# ===============================
# 🔥 FOOD SERIALIZER
# ===============================

class FoodItemDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = FoodItem
        fields = [
            "id",
            "name",
            "category_name",
            "calories_per_100g",
            "protein_per_100g",
            "carbs_per_100g",
            "fat_per_100g",
        ]


# ===============================
# 🔥 CREATE SERIALIZER
# ===============================

class MealCreateSerializer(serializers.ModelSerializer):
    food_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Meal
        fields = ["food_id", "grams", "meal_type", "consumed_at"]

    def validate_food_id(self, value):
        if not FoodItem.objects.filter(id=value).exists():
            raise serializers.ValidationError("Food not found")
        return value

    def validate_consumed_at(self, value):
        if value > timezone.now():
            raise serializers.ValidationError("Future time not allowed")
        return value

    def create(self, validated_data):
        food = FoodItem.objects.get(id=validated_data.pop("food_id"))
        return Meal.objects.create(food=food, **validated_data)


# ===============================
# 🔥 LIST SERIALIZER
# ===============================

class MealListSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(read_only=True)
    meal_type_display = serializers.CharField(source="get_meal_type_display", read_only=True)

    class Meta:
        model = Meal
        fields = [
            "id",
            "food_name",
            "grams",
            "meal_type",
            "meal_type_display",
            "calories",
            "consumed_at",
        ]


# ===============================
# 🔥 DETAIL SERIALIZER
# ===============================

class MealDetailSerializer(serializers.ModelSerializer):
    food = FoodItemDetailSerializer(read_only=True)
    meal_type_display = serializers.CharField(source="get_meal_type_display", read_only=True)

    protein_percent = serializers.SerializerMethodField()
    carbs_percent = serializers.SerializerMethodField()
    fat_percent = serializers.SerializerMethodField()

    class Meta:
        model = Meal
        fields = [
            "id",
            "food",
            "food_name",
            "grams",
            "meal_type",
            "meal_type_display",
            "calories",
            "protein",
            "carbs",
            "fat",
            "protein_percent",
            "carbs_percent",
            "fat_percent",
            "consumed_at",
        ]

    def get_protein_percent(self, obj):
        if obj.calories == 0:
            return 0
        return round(float((obj.protein * 4) / obj.calories * 100), 1)

    def get_carbs_percent(self, obj):
        if obj.calories == 0:
            return 0
        return round(float((obj.carbs * 4) / obj.calories * 100), 1)

    def get_fat_percent(self, obj):
        if obj.calories == 0:
            return 0
        return round(float((obj.fat * 9) / obj.calories * 100), 1)