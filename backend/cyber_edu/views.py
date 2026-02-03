from django.http import FileResponse, HttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import os
import requests
import queue
import threading

def serve_icon(request, icon_name):
    icon_path = os.path.join(settings.STATIC_ROOT, icon_name)
    if os.path.exists(icon_path):
        return FileResponse(open(icon_path, 'rb'), content_type='image/x-icon')
    return HttpResponse(status=404)

task_queue = queue.Queue(maxsize=100)
stop_worker = threading.Event()

def worker():
    """Рабочий поток, обрабатывающий очередь"""
    while not stop_worker.is_set():
        try:
            rid = task_queue.get(timeout=1)
            if rid is None:  # Сигнал остановки
                break
            
            try:
                requests.get(
                    f"http://192.168.1.66:8081/track?rid={rid}",
                    timeout=1,
                    verify=False
                )
            except:
                pass 
            
            task_queue.task_done()
        except queue.Empty:
            continue

for i in range(3):  # 3 рабочих потока
    t = threading.Thread(target=worker, daemon=True)
    t.start()

@csrf_exempt
def phishing_proxy(request):
    """Прокси с использованием очереди"""
    rid = request.GET.get('rid', '')
    
    if rid:
        try:
            # Пытаемся добавить в очередь без блокировки
            task_queue.put_nowait(rid)
        except queue.Full:
            pass
    
    return HttpResponse(status=200)

# Функция для остановки воркеров при завершении приложения
def cleanup():
    stop_worker.set()
    for i in range(5):
        task_queue.put(None)  # Сигнал остановки для воркеров