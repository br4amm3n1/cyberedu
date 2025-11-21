import json
import pika
from django.core.management.base import BaseCommand
from django.conf import settings
from accounts.tasks.email_tasks import send_email_sync

class Command(BaseCommand):
    help = 'Starts a RabbitMQ consumer for email tasks'

    def handle(self, *args, **options):
        def callback(ch, method, properties, body):
            """
            Функция, которая вызывается при получении сообщения из очереди.
            """
            self.stdout.write(self.style.SUCCESS(f" [x] Received {body}"))
            try:
                task_data = json.loads(body)
                # Вызываем функцию отправки письма
                send_email_sync(
                    user_id=task_data.get('user_id'),
                    course_id=task_data.get('course_id'),
                    action=task_data.get('action')
                )
                self.stdout.write(self.style.SUCCESS(f" [x] Email task for user {task_data.get('user_id')} processed"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error processing task: {e}"))
                # В случае ошибки сообщение НЕ подтверждается (ack) и может быть обработано снова
                # Или можно настроить Dead Letter Exchange (DLX) для повторов
                return
            # Подтверждаем успешную обработку сообщения
            ch.basic_ack(delivery_tag=method.delivery_tag)

        # Настраиваем подключение и начинаем слушать очередь
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=settings.RABBITMQ_HOST,
                port=settings.RABBITMQ_PORT,
                credentials=pika.PlainCredentials(settings.RABBITMQ_USERNAME, settings.RABBITMQ_PASSWORD)
            )
        )
        channel = connection.channel()
        channel.queue_declare(queue=settings.RABBITMQ_QUEUE, durable=True)

        # Настраиваем QoS (качество обслуживания), чтобы не грузить воркер
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=settings.RABBITMQ_QUEUE, on_message_callback=callback)

        self.stdout.write(self.style.SUCCESS(' [*] Email worker waiting for messages. To exit press CTRL+C'))
        try:
            channel.start_consuming()
        except KeyboardInterrupt:
            channel.stop_consuming()
        connection.close()