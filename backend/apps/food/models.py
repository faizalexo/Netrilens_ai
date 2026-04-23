from django.db import models


class FoodCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class FoodItem(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(FoodCategory, on_delete=models.SET_NULL, null=True, blank=True)

    # 🔥 CORE NUTRITION (STANDARD BASE)
    calories_per_100g = models.FloatField()
    protein_per_100g = models.FloatField()
    carbs_per_100g = models.FloatField()
    fat_per_100g = models.FloatField()

    # 🔥 SERVING SYSTEM (USER FRIENDLY)
    default_serving_size = models.FloatField(null=True, blank=True)  # e.g. 1 roti = 40g
    serving_name = models.CharField(max_length=50, null=True, blank=True)  # e.g. "1 roti", "1 cup"

    # 🔥 EXTRA INFO (FUTURE USE)
    fiber_per_100g = models.FloatField(null=True, blank=True)
    sugar_per_100g = models.FloatField(null=True, blank=True)

    # 🔥 FLAGS
    is_indian = models.BooleanField(default=True)
    is_veg = models.BooleanField(default=True)

    # 🔥 SEARCH OPTIMIZATION
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name