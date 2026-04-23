import os
import sys
import django
import csv

# 🔥 Setup Django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.food.models import FoodItem, FoodCategory


def safe_float(value, default=0.0):
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def normalize_bool(value):
    return str(value).strip().lower() in ["yes", "true", "1"]


def import_food_data(csv_file):
    file_path = os.path.join(BASE_DIR, csv_file)

    if not os.path.exists(file_path):
        print(f"❌ CSV file not found: {file_path}")
        return

    created_count = 0
    skipped_count = 0

    with open(file_path, newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)

        for row in reader:
            try:
                name = row.get('name')

                if not name:
                    print(f"⚠️ Skipped (no name): {row}")
                    skipped_count += 1
                    continue

                # 🔥 Avoid duplicates
                if FoodItem.objects.filter(name__iexact=name).exists():
                    print(f"⚠️ Duplicate skipped: {name}")
                    skipped_count += 1
                    continue

                category_name = row.get('category', 'other').strip().lower()

                category, _ = FoodCategory.objects.get_or_create(
                    name=category_name
                )

                FoodItem.objects.create(
                    name=name.strip(),

                    category=category,

                    calories_per_100g=safe_float(row.get('calories')),
                    protein_per_100g=safe_float(row.get('protein')),
                    carbs_per_100g=safe_float(row.get('carbs')),
                    fat_per_100g=safe_float(row.get('fat')),

                    default_serving_size=safe_float(row.get('serving_size'), 100),
                    serving_name=row.get('serving_name'),

                    is_veg=normalize_bool(row.get('is_veg', 'yes')),
                    is_indian=normalize_bool(row.get('is_indian', 'yes'))
                )

                created_count += 1
                print(f"✅ Added: {name}")

            except Exception as e:
                skipped_count += 1
                print(f"❌ Error: {row} → {e}")

    print("\n🔥 IMPORT SUMMARY")
    print(f"✅ Created: {created_count}")
    print(f"⚠️ Skipped: {skipped_count}")


if __name__ == "__main__":
    import_food_data("food_data2.csv")    #file ka path yahan daalna hai



