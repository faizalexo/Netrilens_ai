import os
import sys
import django
import csv

# =========================
# Django Setup
# =========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from apps.food.models import FoodItem, FoodCategory


# =========================
# Helpers
# =========================

def safe_float(value, default=0.0):
    try:
        if value is None or value == "":
            return default
        return float(value)
    except (ValueError, TypeError):
        return default


def normalize_bool(value):
    return str(value).strip().lower() in [
        "yes",
        "true",
        "1",
        "y"
    ]


# =========================
# Import Function
# =========================

def import_food_data(csv_file):

    file_path = os.path.join(BASE_DIR, csv_file)

    if not os.path.exists(file_path):
        print(f"\n❌ CSV file not found:\n{file_path}")
        return

    created_count = 0
    skipped_count = 0
    error_count = 0

    print(f"\n🚀 Importing: {csv_file}")

    with open(file_path, newline="", encoding="utf-8-sig") as file:

        reader = csv.DictReader(file)

        print("\n📋 CSV Headers Found:")
        print(reader.fieldnames)

        for row in reader:

            try:

                # -------------------------
                # Normalize Header Names
                # -------------------------
                row = {
                    str(k).strip().lower(): (
                        str(v).strip() if v is not None else ""
                    )
                    for k, v in row.items()
                }

                # -------------------------
                # Name
                # -------------------------
                name = row.get("name", "")

                if not name:
                    print("⚠️ Skipped -> Missing name")
                    skipped_count += 1
                    continue

                # -------------------------
                # Duplicate Check
                # -------------------------
                if FoodItem.objects.filter(
                    name__iexact=name
                ).exists():

                    print(f"⚠️ Duplicate skipped: {name}")
                    skipped_count += 1
                    continue

                # -------------------------
                # Category
                # -------------------------
                category_name = (
                    row.get("category", "other")
                    .strip()
                    .lower()
                )

                if not category_name:
                    category_name = "other"

                category, _ = FoodCategory.objects.get_or_create(
                    name=category_name
                )

                # -------------------------
                # Create Food Item
                # -------------------------
                FoodItem.objects.create(

                    name=name,

                    category=category,

                    calories_per_100g=safe_float(
                        row.get("calories (per 100g)")
                    ),

                    protein_per_100g=safe_float(
                        row.get("protein (g)")
                    ),

                    carbs_per_100g=safe_float(
                        row.get("carbs (g)")
                    ),

                    fat_per_100g=safe_float(
                        row.get("fat (g)")
                    ),

                    default_serving_size=safe_float(
                        row.get("serving size"),
                        100
                    ),

                    serving_name=row.get(
                        "serving unit",
                        "g"
                    ),

                    # Non-Veg Dataset
                    is_veg=False,

                    # Change if needed
                    is_indian=True
                )

                created_count += 1

                print(f"✅ Added: {name}")

            except Exception as e:

                error_count += 1

                print(
                    f"❌ Error importing '{row.get('name', 'Unknown')}'"
                )
                print(f"   {e}")

    print("\n" + "=" * 50)
    print("🔥 IMPORT COMPLETED")
    print("=" * 50)

    print(f"✅ Created : {created_count}")
    print(f"⚠️ Skipped : {skipped_count}")
    print(f"❌ Errors  : {error_count}")
    print("=" * 50)


# =========================
# Run Script
# =========================

if __name__ == "__main__":
    import_food_data("Non-veg_food.csv")