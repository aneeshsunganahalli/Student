from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('content_generation.urls')),
    path('api/', include('videos.urls')),
    path('api/', include('user_profiles.urls')),
    path('api/', include('chatbot.urls')),
]
