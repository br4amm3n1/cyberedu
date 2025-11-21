FROM python:3.11-slim

# Установка зависимостей
RUN apt-get update && apt-get install -y supervisor \
    && apt-get install -y --no-install-recommends \
    build-essential \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем зависимости
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Копируем Django-проект
COPY backend /app

# Копируем сборку React
COPY frontend/build /app/frontend_build

# Создаем правильную структуру для статики
RUN mkdir -p /app/staticfiles && \
    mkdir -p /app/frontend_build/static

# Собираем статику Django
RUN python manage.py collectstatic --noinput

EXPOSE 8000

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
