from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.http import HttpResponse
from .views import serve_icon
        
urlpatterns = [
    path('logo32x32.png', serve_icon, {'icon_name': 'logo32x32.png'}),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/documents/', include('documents.urls')),

    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
    # path('api-auth/', include('rest_framework.urls')),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
