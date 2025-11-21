import time
import psycopg2
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    """Команда для ожидания готовности PostgreSQL"""
    help = 'Wait for PostgreSQL to become available'

    def handle(self, *args, **options):
        self.stdout.write('Waiting for PostgreSQL...')
        max_retries = 30
        retry_delay = 2
        
        for i in range(max_retries):
            try:
                conn = psycopg2.connect(
                    dbname=settings.DATABASES['default']['NAME'],
                    user=settings.DATABASES['default']['USER'],
                    password=settings.DATABASES['default']['PASSWORD'],
                    host=settings.DATABASES['default']['HOST'],
                    port=settings.DATABASES['default']['PORT']
                )
                conn.close()
                self.stdout.write(self.style.SUCCESS('PostgreSQL is available!'))
                return
            except Exception as e:
                self.stdout.write(f'Attempt {i+1}/{max_retries}: {e}')
                time.sleep(retry_delay)
        
        self.stdout.write(self.style.ERROR('PostgreSQL is not available'))
        exit(1)
