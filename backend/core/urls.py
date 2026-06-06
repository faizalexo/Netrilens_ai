from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/food/', include('apps.food.urls')),
    path('api/nutrition/', include('apps.nutrition.urls')),
    path('api/tracking/', include('apps.tracking.urls')),
    path('api/users/', include('apps.users.urls')),
    path("api/auth/", include("apps.users.urls")),
    path("auth/token/refresh/",
    TokenRefreshView.as_view(),
),
]
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )


    
