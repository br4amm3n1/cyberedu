from rest_framework import viewsets, permissions, generics, status
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import authenticate, login, logout
from django.db import connection 
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Profile
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, permission_classes
from .serializers import (
    UserSerializer, ProfileSerializer, 
    UserRegisterSerializer, LoginSerializer,
    generate_confirmation_token
)
# from .services.email_service import send_email
from accounts.rabbitmq import publish_email_task


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def confirm_email(request, token):
    profile = get_object_or_404(Profile, email_confirmation_token=token)
    profile.email_confirmed = True
    profile.email_confirmation_token = None
    profile.save()
    return Response({'info': 'Электронный почтовый адрес успешно подтвержден.'})

class ResendConfirmationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            if user.profile.email_confirmed:
                return Response(
                    {'error': 'Email already confirmed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.profile.email_confirmation_token = generate_confirmation_token()
            user.profile.save()
            
            task_data = {
                'user_id': user.id,
                'action': 'confirmation'
            }

            publish_email_task(task_data)
            # send_email(user, action='confirmation')
            
            return Response(
                {'status': 'Confirmation email resent'},
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User with this email not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'user': serializer.data,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user is None:
                return Response(
                    {'error': 'auth_failed', 'message': 'Неверный логин или пароль'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            if not user.profile.email_confirmed:
                return Response(
                    {
                        'error': 'email_not_confirmed',
                        'message': 'Пожалуйста, подтвердите ваш email. Проверьте вашу почту.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            login(request, user)
            return Response({
                'user_id': user.id,
                'username': user.username
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    
class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        connection.close()

        if self.request.user.is_superuser:
            return User.objects.all().select_related('profile').order_by('id')
        return User.objects.filter(id=self.request.user.id).select_related('profile')
    
    def list(self, request, *args, **kwargs):
        connection.close()

        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        # Для отдельных запросов тоже обновляем соединение
        connection.close()
        return super().retrieve(request, *args, **kwargs)
    
    def perform_update(self, serializer):
        if self.request.user.is_superuser or serializer.instance == self.request.user:
            serializer.save()
        else:
            raise PermissionDenied("Вы можете редактировать только собственные данные.")
        
    @action(detail=False, methods=['GET'])
    def me(self, request):
        connection.close()

        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        connection.close()

        if self.request.user.is_superuser:
            return Profile.objects.all().select_related('user')
        return Profile.objects.filter(user=self.request.user).select_related('user')
    
    def perform_update(self, serializer):
        if self.request.user.is_superuser or serializer.instance.user == self.request.user:
            serializer.save()
        else:
            raise PermissionDenied("Вы можете редактировать только собственный профиль.")
        
    @action(detail=False, methods=['GET'])
    def me(self, request):
        connection.close()
        
        profile = request.user.profile
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    