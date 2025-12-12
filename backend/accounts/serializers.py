from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from .models import Profile
# from .services.email_service import send_email
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from accounts.rabbitmq import publish_email_task
from django.core.validators import EmailValidator
import re


ALLOWED_DOMAINS = [
    'medgenetics.ru',
    'tnimc.ru', 
    'pharmso.ru',
    'cardio-tomsk.ru',
    'infarkta.ru',
    'oncology.tomsk.ru'
]
def validate_email_domain(value):
    if not value:
        return value
    
    domain_match = re.search(r'@([a-zA-Z0-9.-]+)$', value)
    if not domain_match:
        raise serializers.ValidationError("Некорректный email адрес")
    
    domain = domain_match.group(1)
    
    allowed = False
    for allowed_domain in ALLOWED_DOMAINS:
        # Проверяем, что домен заканчивается на разрешенный домен
        # Например: medgenetics.ru заканчивается на medgenetics
        if domain.endswith('.' + allowed_domain) or domain == allowed_domain:
            allowed = True
            break
    
    if not allowed:
        # Можно добавить .ru к доменам для лучшей читаемости
        domains_with_tld = [f"{domain}" for domain in ALLOWED_DOMAINS]
        raise serializers.ValidationError(
            f"Email должен быть в одном из доменов: {', '.join(domains_with_tld)}"
        )
    
    return value

def generate_confirmation_token():
    return get_random_string(length=32)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    department = serializers.CharField(write_only=True)
    position = serializers.CharField(write_only=True)
    branch = serializers.CharField(write_only=True)
    patronymic = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email = serializers.EmailField(
        required=True,
        validators=[validate_email_domain]
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'patronymic', 
                  'branch', 'department', 'position']
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def create(self, validated_data):
        department = validated_data.pop('department')
        position = validated_data.pop('position')
        branch = validated_data.pop('branch')
        patronymic = validated_data.pop('patronymic', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        profile = user.profile
        profile.department = department
        profile.position = position
        profile.branch = branch
        if patronymic:
            profile.patronymic = patronymic
        
        # Генерируем токен подтверждения
        confirmation_token = generate_confirmation_token()
        profile.email_confirmation_token = confirmation_token
        profile.save()
        
        # Отправляем email через сервисный слой
        task_data = {
                'user_id': user.id,
                'action': 'confirmation'
            }

        publish_email_task(task_data)

        # send_email(user, action="confirmation")
        
        return user
    
    def validate(self, data):
        """
        Дополнительная валидация данных
        """
        # Проверяем, что email уникален
        if User.objects.filter(email=data.get('email')).exists():
            raise serializers.ValidationError({
                'email': 'Пользователь с таким email уже существует'
            })
        
        return data
    
# В serializers.py обновляем UserSerializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ['registration_date', 'user']