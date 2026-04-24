from numbers import Real
from typing import Protocol, TypedDict


# 🔥 Flexible interface (works with Django model, dataclass, etc.)
class FoodNutrition(Protocol):
    calories_per_100g: Real
    protein_per_100g: Real
    carbs_per_100g: Real
    fat_per_100g: Real


# 🔥 API-safe response structure
class NutritionBreakdown(TypedDict):
    calories: float
    protein: float
    carbs: float
    fat: float


def _validate_number(value: object, field_name: str) -> float:
    if isinstance(value, bool) or not isinstance(value, Real):
        raise TypeError(f"{field_name} must be a real number")
    return float(value)


def _validate_non_negative(value: float, field_name: str) -> float:
    if value < 0:
        raise ValueError(f"{field_name} cannot be negative")
    return value


def calculate_nutrition(food: FoodNutrition, grams: Real) -> NutritionBreakdown:
    """
    🔥 Production-grade nutrition calculation
    """

    # 🔥 Validate input
    if not food:
        raise ValueError("Food object is required")

    grams = _validate_number(grams, "grams")
    grams = _validate_non_negative(grams, "grams")

    # 👉 If zero → fast return (performance optimization)
    if grams == 0:
        return {
            "calories": 0.0,
            "protein": 0.0,
            "carbs": 0.0,
            "fat": 0.0,
        }

    factor = grams / 100.0

    # 🔥 Required fields mapping
    fields = {
        "calories": "calories_per_100g",
        "protein": "protein_per_100g",
        "carbs": "carbs_per_100g",
        "fat": "fat_per_100g",
    }

    result: dict[str, float] = {}

    for key, attr in fields.items():
        if not hasattr(food, attr):
            raise AttributeError(f"Food must define '{attr}'")

        value = _validate_number(getattr(food, attr), attr)
        value = _validate_non_negative(value, attr)

        result[key] = round(value * factor, 2)

    return result

def calculate_meal(items: list[tuple[FoodNutrition, Real]]) -> NutritionBreakdown:
    total = {
        "calories": 0.0,
        "protein": 0.0,
        "carbs": 0.0,
        "fat": 0.0,
    }

    for food, grams in items:
        data = calculate_nutrition(food, grams)

        for key in total:
            total[key] += data[key]

    return {k: round(v, 2) for k, v in total.items()}    