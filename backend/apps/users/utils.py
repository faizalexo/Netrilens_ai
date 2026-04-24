def calculate_goals(profile):
    weight = profile.weight
    height = profile.height
    age = profile.age

    if profile.gender == "male":
        s = 5
    else:
        s = -161

    bmr = 10*weight + 6.25*height - 5*age + s

    activity_map = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725
    }

    calories = bmr * activity_map.get(profile.activity_level, 1.2)

    if profile.goal == "fat_loss":
        calories -= 500
    elif profile.goal == "muscle_gain":
        calories += 300

    protein = weight * 2

    return {
        "calories": int(calories),
        "protein": int(protein)
    }