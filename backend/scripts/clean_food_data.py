import csv

INPUT_FILE = "food_data2.csv"
OUTPUT_FILE = "clean_food_data.csv"


FIELDS = [
    "name",
    "category",
    "calories",
    "protein",
    "carbs",
    "fat",
    "is_veg",
    "serving_size",
    "serving_name",
    "aliases",
]


def normalize_name(name):
    return name.strip().lower()


def safe_float(value, default=0):
    try:
        return float(value)
    except:
        return default


def clean_data():
    seen = set()
    cleaned_rows = []

    with open(INPUT_FILE, newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)

        for row in reader:
            name = normalize_name(row.get("name", ""))

            if not name:
                continue

            if name in seen:
                continue

            seen.add(name)

            cleaned_rows.append({
                "name": name,
                "category": row.get("category", "other").strip().lower(),
                "calories": safe_float(row.get("calories")),
                "protein": safe_float(row.get("protein")),
                "carbs": safe_float(row.get("carbs")),
                "fat": safe_float(row.get("fat")),
                "is_veg": row.get("is_veg", "yes").strip().lower(),
                "serving_size": safe_float(row.get("serving_size", 100)),
                "serving_name": row.get("serving_name", ""),
                "aliases": row.get("aliases", "")
            })

    with open(OUTPUT_FILE, "w", newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(cleaned_rows)

    print(f"🔥 Clean dataset ready: {OUTPUT_FILE}")
    print(f"✅ Total unique foods: {len(cleaned_rows)}")


if __name__ == "__main__":
    clean_data()