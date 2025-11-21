from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='users')
router.register(r'profiles', views.ProfileViewSet, basename='profiles')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('confirm-email/<str:token>/', views.confirm_email, name='confirm-email'),
    path('resend_confirmation/', views.ResendConfirmationView.as_view(), name='resend-confirmation'),
] + router.urls