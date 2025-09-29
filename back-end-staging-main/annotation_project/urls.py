from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('account/', include('account.urls')),  
    path("sr/", include('sr_app.urls')),
    path("stt/", include('stt_app.urls')),
    path("logo/", include('logo_app.urls')),
    path("fr/", include('fr_app.urls')),
    path("ad/", include('ad_app.urls')),
    path("tf/", include('tf_app.urls')),
    path("od/", include('od_app.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
