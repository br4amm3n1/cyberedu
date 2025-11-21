# rabbitmq.py (или utils/rabbitmq.py)
import pika
import json
from django.conf import settings

def get_rabbitmq_connection():
    """Создает и возвращает соединение с RabbitMQ"""
    credentials = pika.PlainCredentials(settings.RABBITMQ_USERNAME, settings.RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(
        host=settings.RABBITMQ_HOST,
        port=settings.RABBITMQ_PORT,
        credentials=credentials,
        heartbeat=600,  # Важно для долгоживущих соединений
        blocked_connection_timeout=300
    )
    return pika.BlockingConnection(parameters)

def publish_email_task(task_data):
    """
    Публикует задание на отправку письма в очередь.
    task_data: словарь с данными для отправки (user_id, action, course_id и т.д.)
    """
    connection = None
    try:
        connection = get_rabbitmq_connection()
        channel = connection.channel()

        # Объявляем очередь (убедимся, что она существует)
        channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True) # durable=True сохранит задачи при перезагрузке RabbitMQ

        # Публикуем сообщение
        channel.basic_publish(
            exchange='',
            routing_key=settings.RABBITMQ_QUEUE,
            body=json.dumps(task_data), # Сериализуем данные в JSON
            properties=pika.BasicProperties(
                delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE # Сохранит сообщение на диске
            )
        )
        print(f" [x] Sent task: {task_data}")
    except Exception as e:
        print(f"Error publishing task to RabbitMQ: {e}")
        raise e
    finally:
        if connection and not connection.is_closed:
            connection.close()