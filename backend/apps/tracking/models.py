from decimal import Decimal
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import DecimalField, Sum
from django.db.models.functions import Coalesce
from django.utils import timezone
from apps.food.models import FoodItem





#query section 

class MealQuerySet(models.QuerySet):    
    def for_user(self, user):
        return self.filter(user=user)

    def for_day(self, day):
        return self.filter(consumed_at__date=day)

    def totals(self):
        zero = Decimal("0.00")
        return self.aggregate(
            total_calories=Coalesce(
                Sum("calories"),
                zero,
                output_field=DecimalField(max_digits=10, decimal_places=2),
            ),
            total_protein=Coalesce(
                Sum("protein"),
                zero,
                output_field=DecimalField(max_digits=10, decimal_places=2),
            ),
            total_carbs=Coalesce(
                Sum("carbs"),
                zero,
                output_field=DecimalField(max_digits=10, decimal_places=2),
            ),
            total_fat=Coalesce(
                Sum("fat"),
                zero,
                output_field=DecimalField(max_digits=10, decimal_places=2),
            ),
            total_grams=Coalesce(
                Sum("grams"),
                zero,
                output_field=DecimalField(max_digits=10, decimal_places=2),
            ),
        )


#  Meal Model
class Meal(models.Model):
    class MealType(models.TextChoices):
        BREAKFAST = "breakfast", "Breakfast"
        LUNCH = "lunch", "Lunch"
        DINNER = "dinner", "Dinner"
        SNACK = "snack", "Snack"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="meals",
    )

    food = models.ForeignKey(
        FoodItem,
        on_delete=models.SET_NULL,
        related_name="meal_logs",
        null=True,
        blank=True,
    )

    meal_type = models.CharField(
        max_length=20,
        choices=MealType.choices,
        db_index=True,
    )

    grams = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
            MaxValueValidator(Decimal("5000.00")),
        ],
        help_text="Consumed quantity in grams.",
    )

    consumed_at = models.DateTimeField(default=timezone.now, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

#  Snapshot fields (important)
    food_name = models.CharField(max_length=255, editable=False)
    calories = models.DecimalField(max_digits=8, decimal_places=2, editable=False)
    protein = models.DecimalField(max_digits=8, decimal_places=2, editable=False)
    carbs = models.DecimalField(max_digits=8, decimal_places=2, editable=False)
    fat = models.DecimalField(max_digits=8, decimal_places=2, editable=False)

    objects = MealQuerySet.as_manager()

    class Meta:
        ordering = ["-consumed_at", "-created_at"]
        indexes = [
            models.Index(fields=["user", "consumed_at"]),
            models.Index(fields=["user", "meal_type", "consumed_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(grams__gt=0),
                name="tracking_meal_grams_gt_zero",
            ),
        ]

    def __str__(self):
        return f"{self.user_id} | {self.meal_type} | {self.food_name} | {self.grams}g"

    
    def clean(self):
        super().clean()

        if not self.food:
            raise ValidationError({"food": "Food is required for meal tracking."})

    
    def save(self, *args, **kwargs):
        is_new = self.pk is None

        self.full_clean()

        if is_new:
            self._sync_nutrition_snapshot()

        super().save(*args, **kwargs)

    
    def _sync_nutrition_snapshot(self):
        if not self.food:
            raise ValueError("Food required")

        grams = Decimal(self.grams)  # 🔥 ensure Decimal
        multiplier = grams / Decimal("100.00")

        self.food_name = self.food.name

        self.calories = self._round_macro(
            Decimal(self.food.calories_per_100g) * multiplier
        )
        self.protein = self._round_macro(
            Decimal(self.food.protein_per_100g) * multiplier
        )
        self.carbs = self._round_macro(
            Decimal(self.food.carbs_per_100g) * multiplier
        )
        self.fat = self._round_macro(
            Decimal(self.food.fat_per_100g) * multiplier
        )

    @staticmethod
    def _round_macro(value):
        return Decimal(value).quantize(Decimal("0.01"))
    
    
    
# water model
class WaterIntake(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="water_logs"
    )

    amount = models.PositiveIntegerField()  # ml

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.amount}ml"