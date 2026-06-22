from typing import List
import random


def generate_ai_insights(
    calories: float,
    protein: float,
    carbs: float,
    fats: float,
    calorie_goal: float,
    protein_goal: float,
    carb_goal: float,
    fat_goal: float,
) -> List[str]:

    insights = []

    # 🔥 Calories Analysis
    if calorie_goal > 0:

        if calories < calorie_goal * 0.7:

            insights.append(
                f"⚡ You are {round(calorie_goal - calories)} kcal below your daily target."
            )

        elif calories > calorie_goal * 1.2:

            insights.append(
                f"🔥 You exceeded your calorie goal by {round(calories - calorie_goal)} kcal."
            )

    # 💪 Protein Analysis
    if protein_goal > 0:

        if protein < protein_goal * 0.8:

            insights.append(
                f"💪 You still need {round(protein_goal - protein)}g protein to reach your goal."
            )

        elif protein > protein_goal * 1.5:

            insights.append(
                f"🏋️ Protein intake is exceptionally high today ({round(protein)}g)."
            )

    # 🍚 Carbs Analysis
    if carb_goal > 0:

        if carbs < carb_goal * 0.5:

            insights.append(
                "🍚 Carbohydrate intake is very low. Energy levels may be affected."
            )

    # 🥑 Fat Analysis
    if fat_goal > 0:

        if fats > fat_goal * 1.3:

            insights.append(
                "🥑 Fat intake is above the recommended range."
            )

    # 🏆 Perfect Day
    if (
        calorie_goal > 0
        and protein_goal > 0
        and calories >= calorie_goal * 0.9
        and calories <= calorie_goal * 1.1
        and protein >= protein_goal
    ):
        insights.append(
            "🏆 Excellent nutrition balance today."
        )

    # 🎯 Progress Score
    if calorie_goal > 0 and protein_goal > 0:

        calorie_progress = min(
            calories / calorie_goal,
            1
        )

        protein_progress = min(
            protein / protein_goal,
            1
        )

        score = round(
            (
                calorie_progress +
                protein_progress
            ) / 2 * 100
        )

        if score >= 90:
            insights.append(
                "🚀 You're crushing your nutrition goals today."
            )

        elif score >= 70:
            insights.append(
                "📈 Great progress. Keep logging meals."
            )

        elif score >= 50:
            insights.append(
                "⚡ You're halfway to your daily targets."
            )

        else:
            insights.append(
                "🎯 Small improvements now create big results later."
            )

    # 🤖 Fallback
    if not insights:

        insights.append(
            "🤖 Keep logging meals to unlock smarter nutrition insights."
        )

    random.shuffle(insights)

    return insights[:5]