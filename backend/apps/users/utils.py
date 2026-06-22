from datetime import timedelta
from django.utils import timezone





def calculate_goals(profile):
    # ─────────────────────────────────────────────
    # Safe parsing
    # ─────────────────────────────────────────────
    weight = float(profile.weight or 0)
    height = float(profile.height or 0)
    age = int(profile.age or 18)

    gender = (profile.gender or "").lower().strip()
    activity = (profile.activity_level or "").lower().strip()
    goal = (profile.goal or "").lower().strip()

    if weight <= 0 or height <= 0:
        return {
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fats": 0,
            "maintenance_calories": 0,
            "insights": ["Invalid profile data"]
        }

    # ─────────────────────────────────────────────
    # BMR (Mifflin-St Jeor)
    # ─────────────────────────────────────────────
    if gender in ["male", "m"]:
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
        min_calories = 1500
    else:
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
        min_calories = 1200

    # ─────────────────────────────────────────────
    # Activity Multiplier
    # ─────────────────────────────────────────────
    activity_map = {
        "sedentary": 1.20,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "athlete": 1.90,
    }

    maintenance_calories = bmr * activity_map.get(activity, 1.20)

    # ─────────────────────────────────────────────
    # Goal Adjustment
    # ─────────────────────────────────────────────
    calories = maintenance_calories

    if goal == "aggressive_cut":
        calories -= 1000

    elif goal == "lose_fat":
        calories -= 500

    elif goal == "lean_bulk":
        calories += 700

    elif goal == "maintain":
        calories = maintenance_calories

    # Safety floor
    calories = max(calories, min_calories)

    # ─────────────────────────────────────────────
    # Macros
    # ─────────────────────────────────────────────

    # Protein
    if goal in ["lean_bulk"]:
        protein = weight * 2.2
    else:
        protein = weight * 2.0

    # Fat = 25% calories
    fats = (calories * 0.25) / 9

    # Remaining carbs
    carb_calories = calories - ((protein * 4) + (fats * 9))
    carbs = max(carb_calories / 4, 0)

    # ─────────────────────────────────────────────
    # Smart Insights
    # ─────────────────────────────────────────────
    insights = []

    if goal == "aggressive_cut":
        insights.append(
            "Aggressive calorie deficit selected. Prioritize protein intake and strength training."
        )

    if calories < 1500:
        insights.append(
            "Calories are quite low. Monitor energy levels and recovery."
        )

    if protein < weight * 1.8:
        insights.append(
            "Protein intake may be insufficient for optimal muscle retention."
        )

    if goal == "lean_bulk":
        insights.append(
            "Focus on progressive overload and adequate sleep for muscle growth."
        )

    if goal == "maintain":
        insights.append(
            "Your calories are set to maintain your current body weight."
        )

    # ─────────────────────────────────────────────
    # Final Output
    # ─────────────────────────────────────────────
    return {
        "maintenance_calories": round(maintenance_calories),
        "calories": round(calories),
        "protein": round(protein),
        "carbs": round(carbs),
        "fats": round(fats),
        "insights": insights,
    }





# streak logic
def update_streak(profile):

    today = timezone.now().date()

    # Already counted today
    if profile.last_active_date == today:
        return

    yesterday = today - timedelta(days=1)

    # Continue streak
    if profile.last_active_date == yesterday:

        profile.current_streak += 1

    else:

        profile.current_streak = 1

    # Update longest streak
    if (
        profile.current_streak >
        profile.longest_streak
    ):

        profile.longest_streak = (
            profile.current_streak
        )

    profile.last_active_date = today

    profile.save()