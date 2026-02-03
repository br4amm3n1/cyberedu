from django.http import FileResponse, HttpResponse
from django.conf import settings
import os
import requests
from django.views.decorators.csrf import csrf_exempt
from threading import Thread

def serve_icon(request, icon_name):
    icon_path = os.path.join(settings.STATIC_ROOT, icon_name)
    if os.path.exists(icon_path):
        return FileResponse(open(icon_path, 'rb'), content_type='image/x-icon')
    return HttpResponse(status=404)


@csrf_exempt
def phishing_proxy(request):
    """Асинхронный прокси для GoPhish"""
    rid = request.GET.get('rid', '')
    
    if rid:
        # Запускаем в отдельном потоке, чтобы не ждать ответа
        def send_to_gophish():
            try:
                requests.get(
                    f"http://192.168.1.66:8081/track?rid={rid}",
                    timeout=1,
                    verify=False
                )
            except:
                pass  # Игнорируем все ошибки
        
        Thread(target=send_to_gophish).start()
    
    return HttpResponse(status=200)