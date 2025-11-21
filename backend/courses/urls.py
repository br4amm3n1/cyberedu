from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='courses')
router.register(r'materials', views.LearningMaterialViewSet, basename='materials')
router.register(r'tests', views.TestViewSet, basename='tests')
router.register(r'questions', views.QuestionViewSet, basename='questions')
router.register(r'options', views.AnswerOptionViewSet, basename='options')
router.register(r'progress', views.CourseProgressViewSet, basename='progress')
router.register(r'answers', views.UserAnswerViewSet, basename='answers')
router.register(r'selected-answers', views.SelectedAnswerViewSet, basename='selected-answers')

urlpatterns = [
    path('progress/admin_progress/', views.CourseProgressViewSet.as_view({'get': 'admin_progress'}), 
         name='admin-progress'),
] + router.urls

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)