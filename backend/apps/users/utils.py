def calculate_goals(profile):
    # 🛡️ Safe parsing
    weight = float(profile.weight or 0)
    height = float(profile.height or 0)
    age = int(profile.age or 18)

    gender = (profile.gender or "").lower()
    activity = (profile.activity_level or "").lower()
    goal = (profile.goal or "").lower()

    # 🔥 BMR (Mifflin-St Jeor)
    if gender in ["male", "m"]:
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161

    # 🔥 Activity multiplier
    activity_map = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725
    }

    calories = bmr * activity_map.get(activity, 1.2)

    # 🎯 Goal adjustment
    if goal == "fat_loss":
        calories -= 400
    elif goal == "muscle_gain":
        calories += 300

    calories = max(calories, 1200)  # 🛡️ minimum safety

    # 💪 Protein
    protein = weight * 2  # g

    # 🥑 Fat (25%)
    fats = (calories * 0.25) / 9

    # 🍚 Carbs (remaining)
    remaining_calories = calories - (protein * 4 + fats * 9)
    carbs = max(remaining_calories / 4, 0)  # 🛡️ no negative carbs

    # 🤖 SMART INSIGHTS
    insights = []

    if calories < 1500:
        insights.append("Your calorie intake is quite low")

    if protein < weight * 1.5:
        insights.append("You need more protein for better recovery")

    if goal == "fat_loss" and calories > bmr:
        insights.append("Calorie deficit is too small for fat loss")

    if goal == "muscle_gain" and protein < weight * 1.8:
        insights.append("Increase protein for muscle gain")

    # 🔥 FINAL OUTPUT
    return {
        "calories": round(calories),
        "protein": round(protein),
        "carbs": round(carbs),
        "fats": round(fats),
        "insights": insights
    }