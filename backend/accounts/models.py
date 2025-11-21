from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    ROLE_CHOICES = [
        ('employee', 'Работник'),
        ('admin', 'Администратор'),
    ]

    BRANCH_CHOICES = [
        ('cardio', 'НИИ Кардиологии'),
        ('oncology', 'НИИ Онкологии'),
        ('tumen', 'Тюменский кардиологический научный центр'),
        ('pz', 'НИИ Психического здоровья'),
        ('medgenetics', 'НИИ Медицинского генетики'),
        ('pharma', 'НИИ Фармакологии и регенеративной медицины'),
        ('head', 'Аппарат управления ТНИМЦ'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    patronymic = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    position = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    branch = models.CharField(max_length=50, choices=BRANCH_CHOICES, default=None, null=True, blank=True)
    registration_date = models.DateTimeField(auto_now_add=True)
    email_confirmed = models.BooleanField(default=False)
    email_confirmation_token = models.CharField(max_length=100, blank=True, null=True)

    def str(self):
        return f"Профиль {self.user.username}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
    
