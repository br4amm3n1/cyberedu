from django.http import FileResponse, HttpResponse
from django.conf import settings
import os

def serve_icon(request, icon_name):
    icon_path = os.path.join(settings.STATIC_ROOT, icon_name)
    if os.path.exists(icon_path):
        return FileResponse(open(icon_path, 'rb'), content_type='image/x-icon')
    return HttpResponse(status=404)