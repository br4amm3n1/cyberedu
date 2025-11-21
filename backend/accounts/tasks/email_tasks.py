# tasks/email_tasks.py (Новый файл)
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.crypto import get_random_string
from django.contrib.auth import get_user_model
from courses.models import Course

User = get_user_model()

def generate_confirmation_token():
    return get_random_string(length=32)

def send_email_sync(user_id, course_id=None, action=None):
    """
    Синхронная функция отправки письма.
    Вызывается воркером. Работает с БД по переданным ID.
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        print(f"User with id {user_id} not found.")
        return

    course = None
    if course_id:
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            print(f"Course with id {course_id} not found.")
            # Решаем, продолжать ли отправку письма без курса
            return

    match action:
        case "confirmation":
            if not user.email:
                return False
            if not user.profile.email_confirmation_token:
                user.profile.email_confirmation_token = generate_confirmation_token()
                user.profile.save()
            confirmation_token = user.profile.email_confirmation_token
            confirmation_link = f"{settings.FRONTEND_URL}/confirm-email/{confirmation_token}/"
            subject = 'Подтвердите ваш email'
            html_message = render_to_string('email/confirmation_email.html', {
                'user': user,
                'confirmation_link': confirmation_link,
            })

        case "course_subscription":
            subject = f'Вам добавлен новый курс: {course.title}'
            html_message = render_to_string('email/course_subscription_email.html', {
                'user': user,
                'course': course,
            })

    plain_message = strip_tags(html_message)
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )
    return True