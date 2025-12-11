from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.conf import settings
# from accounts.services.email_service import send_email
from accounts.rabbitmq import publish_email_task
from django.utils import timezone

class Course(models.Model):
    CATEGORY_CHOICES = [
        ('phishing', 'Фишинговые ссылки и письма'),
        ('data_protetion', 'Защита данных'),
        ('password_sec', 'Безопасность паролей'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=20)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    author = models.CharField(max_length=50, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_category_display()})"

class LearningMaterial(models.Model):
    MATERIAL_TYPE_CHOICES = [
        ('video', 'Видео'),
        ('pdf', 'PDF-файл'),
        ('article', 'Статья'),
        ('link', 'Ссылка на ресурс'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='materials')
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPE_CHOICES)
    content_url = models.URLField(blank=True, null=True)
    content_file = models.FileField(upload_to='media/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_material_type_display()} для курса '{self.course.title}'"

class Test(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='tests')
    title = models.CharField(max_length=200)
    max_score = models.PositiveIntegerField(default=0, editable=False)
    passing_score = models.PositiveIntegerField()
    time_limit = models.PositiveIntegerField(help_text="Осталось времени в минутах")

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        self.max_score = sum(question.points for question in self.questions.all())
        Test.objects.filter(pk=self.pk).update(max_score=self.max_score)

    def is_passed_by_user(self, user):
        last_attempt = UserAnswer.objects.filter(
            user=user,
            question__test=self
        ).order_by('-attempt_number').first()
        
        if not last_attempt:
            return False
            
        total_score = sum(
            answer.points_earned 
            for answer in UserAnswer.objects.filter(
                user=user,
                question__test=self,
                attempt_number=last_attempt.attempt_number
            )
        )
        
        return total_score >= self.passing_score
    
    def __str__(self):
        return f"Тест: {self.title} (Курс: {self.course.title})"


class QuestionImage(models.Model):
    title = models.TextField()
    image = models.ImageField(upload_to='questions/', null=True, blank=True)

    def __str__(self):
        return f"{self.title}"


class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('single', 'Одиночный выбор'),
        ('multiple', 'Множественный выбор'),
        ('text', 'Текстовый ввод'),
    ]
    
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
    image = models.ForeignKey(QuestionImage, on_delete=models.CASCADE, related_name='questions', null=True, blank=True)
    text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES)
    points = models.PositiveIntegerField()
    
    def __str__(self):
        return f"Вопрос: {self.text[:50]}... (Тип: {self.get_question_type_display()})"


@receiver(post_save, sender=Question)
@receiver(post_delete, sender=Question)
def update_test_max_score(sender, instance, **kwargs):
    """Обновляет max_score теста при изменении связанных вопросов"""
    test = instance.test
    test.save()


class AnswerOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"Вариант: {self.text[:50]}... ({'✓' if self.is_correct else '✗'})"

class CourseProgress(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Не начат'),
        ('in_progress', 'В процессе'),
        ('completed', 'Пройден'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='progresses')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_progresses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress_percent = models.PositiveIntegerField(default=0)
    score = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('course', 'user')

    def save(self, *args, **kwargs):
        self.score = sum(test.passing_score for test in self.course.tests.all())
        super().save(*args, **kwargs)

    def check_tests_completion(self):
        from .models import Test  # избегаем циклического импорта
        
        tests = Test.objects.filter(course=self.course)
        if not tests.exists():
            return False
            
        return all(
            test.is_passed_by_user(self.user)
            for test in tests
        )
    
    def check_and_update_status(self):
        """
        Проверяет выполнение тестов и обновляет статус прогресса
        """
        was_completed = self.status == 'completed'
        tests_completed = self.check_tests_completion()
        
        if tests_completed:
            self.status = 'completed'
            self.progress_percent = 100
            if not self.completed_at:
                self.completed_at = timezone.now()
        else:
            if was_completed:
                self.status = 'in_progress'
                self.completed_at = None
            
            # Пересчитываем процент выполнения
            if self.score > 0:
                # Получаем текущие баллы пользователя
                user_answers = UserAnswer.objects.filter(
                    user=self.user,
                    question__test__course=self.course
                )
                total_score_earned = sum(answer.points_earned for answer in user_answers)
                self.progress_percent = min(100, int((total_score_earned / self.score) * 100))
        
        self.save()

    def __str__(self):
        return f"Прогресс: {self.user.username} → {self.course.title} ({self.get_status_display()}, {self.progress_percent}%)"

@receiver(post_save, sender=Test)
def update_course_progress_on_test_change(sender, instance, created, **kwargs):
    """
    Пересчитывает прогресс курса при изменении теста
    """
    if not created:  # Если это обновление существующего теста
        course = instance.course
        update_course_progress_for_all_users(course)

@receiver(post_save, sender=Question)
@receiver(post_delete, sender=Question)
def update_test_max_score_and_progress(sender, instance, **kwargs):
    """Обновляет max_score теста и пересчитывает прогресс"""
    test = instance.test
    test.save()  # Это вызовет save() теста, который триггерит сигнал выше
    
    # Или можно явно вызвать пересчет
    update_course_progress_for_all_users(test.course)

def update_course_progress_for_all_users(course):
    """
    Пересчитывает прогресс курса для всех пользователей
    """
    progresses = CourseProgress.objects.filter(course=course)
    
    for progress in progresses:
        progress.save()  # Это вызовет пересчет score
        progress.check_and_update_status()
        
@receiver(post_save, sender=Test)
@receiver(post_delete, sender=Test)
def update_course_progress_score(sender, instance, **kwargs):
    course = instance.course
    total_passing_score = sum(test.passing_score for test in course.tests.all())

    progresses = CourseProgress.objects.filter(course=course)

    for progress in progresses:
        progress.score = total_passing_score

    CourseProgress.objects.bulk_update(progresses, ['score'])

@receiver(post_save, sender=CourseProgress)
def send_notification_about_subscription(sender, instance, created, **kwargs):
    if created and instance.status == 'not_started':
        user = instance.user
        course = instance.course

        task_data = {
                'user_id': user.id,
                'course_id': course.id,
                'action': 'course_subscription'
            }

        publish_email_task(task_data)
        
        # send_email(user, course=course, action='course_subscription')


class UserAnswer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='user_answers')
    answer_data = models.TextField(blank=True, null=True)
    answered_at = models.DateTimeField(auto_now_add=True)
    points_earned = models.PositiveIntegerField(default=0)
    attempt_number = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('user', 'question', 'attempt_number')

    def __str__(self):
        return f"Ответ: {self.user.username} → {self.question.text[:30]}... (Попытка {self.attempt_number}, {self.points_earned}/{self.question.points} баллов)"
    
class SelectedAnswer(models.Model):
    user_answer = models.ForeignKey(UserAnswer, on_delete=models.CASCADE, related_name='selected_answers')
    answer_option = models.ForeignKey(AnswerOption, on_delete=models.CASCADE)
    is_selected = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('user_answer', 'answer_option')

    def __str__(self):
        return f"Выбор: {self.user_answer.user.username} → {self.answer_option.text[:30]}... ({'✓' if self.is_selected else '✗'})"