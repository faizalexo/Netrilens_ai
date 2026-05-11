from datetime import datetime
from numbers import Real
from typing import Any, Dict
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import QuerySet, Sum, DecimalField
from django.db.models.functions import Coalesce
from django.utils import timezone
from django.utils.dateparse import parse_datetime, parse_date
from django.core.exceptions import ObjectDoesNotExist
from apps.food.models import FoodItem
from .models import Meal
from django.utils.timezone import localdate
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP


# ===============================
# 🔥 VALIDATION HELPERS
# ===============================

def _to_float(value: Any, field_name: str) -> float:
    if isinstance(value, bool) or not isinstance(value, Real):
        raise ValueError(f"{field_name} must be a number")
    parsed = float(value)
    if parsed <= 0:
        raise ValueError(f"{field_name} must be greater than 0")
    return parsed


def _parse_eaten_at(value: Any) -> datetime:
    if value in (None, ""):
        return timezone.now()

    if not isinstance(value, str):
        raise ValueError("eaten_at must be ISO datetime string")

    parsed = parse_datetime(value)
    if not parsed:
        raise ValueError("Invalid datetime format")

    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed)

    return parsed


def _parse_target_date(date_value):

    # DEFAULT TODAY
    if not date_value:
        return localdate()

    try:
        return datetime.strptime(
            date_value,
            "%Y-%m-%d"
        ).date()

    except ValueError:
        raise ValueError(
            "Invalid date format. Use YYYY-MM-DD"
        )


# ===============================
# 🔥 CREATE MEAL
# ===============================
def safe_decimal(value):

    return Decimal(
        str(value or 0)
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )
from decimal import (
    Decimal,
    ROUND_HALF_UP,
)

from typing import Any

from django.contrib.auth import (
    get_user_model,
)

from django.core.exceptions import (
    ObjectDoesNotExist,
)

from apps.food.models import (
    FoodItem,
)

from apps.tracking.models import (
    Meal,
)


def safe_decimal(value: Any) -> Decimal:

    """
    Convert any numeric value
    into a DB-safe Decimal(0.01)
    """

    return Decimal(
        str(value or 0)
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def create_meal_entry(
    *,
    user_id: Any,
    food_id: Any,
    grams: Any,
    meal_type: Any,
    eaten_at: Any,
) -> Meal:

    User = get_user_model()

    # ✅ REQUIRED VALIDATION
    if not user_id:
        raise ValueError(
            "user_id is required"
        )

    if not food_id:
        raise ValueError(
            "food_id is required"
        )

    if not meal_type:
        raise ValueError(
            "meal_type is required"
        )

    # ✅ SAFE INPUTS
    grams = safe_decimal(
        _to_float(
            grams,
            "grams",
        )
    )

    eaten_at = _parse_eaten_at(
        eaten_at
    )

    meal_type = str(
        meal_type
    ).strip().lower()

    # ✅ VALID MEAL TYPES
    valid_meal_types = {
        choice[0]
        for choice in Meal.MealType.choices
    }

    if meal_type not in valid_meal_types:

        raise ValueError(
            "meal_type must be one of: "
            f"{', '.join(valid_meal_types)}"
        )

    # ✅ USER LOOKUP
    try:
        user = User.objects.get(
            id=user_id
        )

    except ObjectDoesNotExist:

        raise ValueError(
            "User not found"
        )

    # ✅ FOOD LOOKUP
    try:
        food = FoodItem.objects.get(
            id=food_id
        )

    except ObjectDoesNotExist:

        raise ValueError(
            "Food not found"
        )

    # ✅ NUTRITION CALCULATIONS
    multiplier = grams / Decimal("100")

    calories = safe_decimal(
        Decimal(
           str(food.calories_per_100g or 0)
        ) * multiplier
    )

    protein = safe_decimal(
        Decimal(
            str(food.protein_per_100g or 0)
        ) * multiplier
    )

    carbs = safe_decimal(
        Decimal(
            str(food.carbs_per_100g or 0)
        ) * multiplier
    )

    fat = safe_decimal(
        Decimal(
            str(food.fat_per_100g or 0)
        ) * multiplier
    )

    # ✅ CREATE MEAL
    meal = Meal.objects.create(
        user=user,

        food=food,

        grams=grams,

        meal_type=meal_type,

        consumed_at=eaten_at,

        calories=calories,

        protein=protein,

        carbs=carbs,

        fat=fat,
    )

    return meal

# ===============================
# 🔥 LIST MEALS
# ===============================

from django.utils.timezone import (
    localdate,
    make_aware,
)

from datetime import (
    datetime,
    time,
)

def list_meal_entries(
    *,
    user_id,
    date_value=None
):

    if not user_id:
        raise ValueError(
            "user_id is required"
        )

    target_date = (
        _parse_target_date(date_value)
        if date_value
        else localdate()
    )

    print(
        "TARGET DATE:",
        target_date
    )

    # ✅ START OF DAY
    start_of_day = make_aware(
        datetime.combine(
            target_date,
            time.min
        )
    )

    # ✅ END OF DAY
    end_of_day = make_aware(
        datetime.combine(
            target_date,
            time.max
        )
    )

    queryset = (
        Meal.objects
        .select_related("food")
        .filter(
            user_id=user_id,

            consumed_at__range=(
                start_of_day,
                end_of_day,
            ),
        )
        .order_by(
            "-consumed_at",
            "-id"
        )
    )

    print(
        "MATCHING MEALS:",
        queryset.count()
    )

    return queryset
# ===============================
# 🔥 DAILY SUMMARY (OPTIMIZED)
# ===============================

def build_daily_summary(entries: QuerySet[Meal]) -> Dict:
    zero = 0

    totals = entries.aggregate(
        calories=Coalesce(Sum("calories"), zero, output_field=DecimalField()),
        protein=Coalesce(Sum("protein"), zero, output_field=DecimalField()),
        carbs=Coalesce(Sum("carbs"), zero, output_field=DecimalField()),
        fat=Coalesce(Sum("fat"), zero, output_field=DecimalField()),
    )

    meals = [
    {
        "id": entry.id,

        # 🔥 ADD THIS (important fix)
        "food_name": entry.food.name if entry.food else "Food",

        "food": {
            "id": entry.food.id if entry.food else None,
            "name": entry.food.name if entry.food else "Food",
        },

        "meal_type": entry.meal_type,
        "grams": float(entry.grams),
        "consumed_at": entry.consumed_at,

        # 🔥 KEEP BOTH (compatibility)
        "calories": float(entry.calories or 0),
        "protein": float(entry.protein or 0),
        "carbs": float(entry.carbs or 0),
        "fat": float(entry.fat or 0),

        "nutrition": {
            "calories": float(entry.calories or 0),
            "protein": float(entry.protein or 0),
            "carbs": float(entry.carbs or 0),
            "fat": float(entry.fat or 0),
        },
    }
    for entry in entries
]
    return {
        "totals": {
            "calories":
                float(totals["calories"] or 0),

            "protein":
                float(totals["protein"] or 0),

            "carbs":
                float(totals["carbs"] or 0),

            "fat":
                float(totals["fat"] or 0),
        },

        "meals": meals,
    }