from rest_framework import serializers
from django.contrib.auth.models import User
from django.conf import settings
from django.utils.crypto import get_random_string
from .models import Profile
# from .services.email_service import send_email
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from accounts.rabbitmq import publish_email_task

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