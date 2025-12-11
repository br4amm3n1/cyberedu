from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from django.db.models import Max, Sum
from .models import (
    Course, LearningMaterial, Test, 
    Question, AnswerOption, CourseProgress,
    UserAnswer, SelectedAnswer
)
from .serializers import (
    CourseSerializer, LearningMaterialSerializer,
    TestSerializer, QuestionSerializer,
    AnswerOptionSerializer, CourseProgressSerializer,
    UserAnswerSerializer, SelectedAnswerSerializer
)


User = get_user_model()


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['category', 'difficulty']
    
    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class LearningMaterialViewSet(viewsets.ModelViewSet):
    serializer_class = LearningMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = LearningMaterial.objects.all()
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TestViewSet(viewsets.ModelViewSet):
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Test.objects.all().prefetch_related('questions')
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        course_id = request.query_params.get('course_id')
        
        # Проверяем, принадлежит ли тест запрошенному курсу
        if course_id and instance.course_id != int(course_id):
            return Response(
                {'error': 'Тест не принадлежит указанному курсу'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        test = self.get_object()
        user = request.user
        answers = request.data.get('answers', [])
        course_id = request.data.get('course_id')

        if not course_id:
            return Response(
                {'error': 'course_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                last_attempt = UserAnswer.objects.filter(
                user=user,
                question__test=test
                ).order_by('-attempt_number').first()
            
                attempt_number = last_attempt.attempt_number + 1 if last_attempt else 1
                
                total_score_current_test = 0
                
                for answer_data in answers:
                    question_id = answer_data.get('question')
                    selected_options = answer_data.get('selected_options', [])
                    answer_text = answer_data.get('answer_data')
                    
                    try:
                        question = Question.objects.get(id=question_id, test=test)
                    except Question.DoesNotExist:
                        continue
                    
                    # Создаем ответ пользователя с номером попытки
                    user_answer = UserAnswer.objects.create(
                        user=user,
                        question=question,
                        answer_data=answer_text,
                        attempt_number=attempt_number
                    )
                    
                    # Обработка выбранных вариантов
                    points_earned = 0
                    
                    if question.question_type == 'text':
                        # Для текстовых ответов пока просто даем 0 баллов
                        # Можно добавить логику проверки текстовых ответов
                        points_earned = 0
                    else:
                        # Для выбора вариантов
                        correct_options = question.options.filter(is_correct=True)
                        selected_correct = 0
                        selected_wrong = 0
                        
                        for option_id in selected_options:
                            try:
                                option = AnswerOption.objects.get(id=option_id, question=question)
                                SelectedAnswer.objects.create(
                                    user_answer=user_answer,
                                    answer_option=option,
                                    is_selected=True
                                )
                                
                                if option.is_correct:
                                    selected_correct += 1
                                else:
                                    selected_wrong += 1
                            except AnswerOption.DoesNotExist:
                                continue
                        
                        # Рассчитываем баллы в зависимости от типа вопроса
                        if question.question_type == 'single':
                            points_earned = question.points if selected_correct == 1 and selected_wrong == 0 else 0
                        elif question.question_type == 'multiple':
                            total_correct = correct_options.count()
                            if selected_wrong > 0:
                                points_earned = 0
                            else:
                                points_earned = (selected_correct / total_correct) * question.points
                    
                    user_answer.points_earned = points_earned
                    user_answer.save()
                    total_score_current_test += points_earned
                
                user_answers = UserAnswer.objects.filter(
                    user=user,
                    question__test__course_id=course_id
                )

                total_score_for_success_tests = sum(answer.points_earned for answer in user_answers)
                
                # Обновляем прогресс курса
                progress, _ = CourseProgress.objects.get_or_create(
                    course_id=course_id,
                    user=user,
                    defaults={'status': 'in_progress'}
                )
                
                if progress.check_tests_completion() is True:
                    progress.status = 'completed'
                    progress.progress_percent = 100
                    progress.completed_at = timezone.now()
                else:
                # Обновляем счет
                    progress.status = 'in_progress'
                    progress.progress_percent = min(100, int((total_score_for_success_tests / progress.score) * 100))
            
                progress.save()
                
                return Response({
                    'status': 'success',
                    'total_score': total_score_current_test,
                    'is_passed': total_score_current_test >= test.passing_score,
                    'attempt_number': attempt_number
                })
                
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    @action(detail=False, methods=['get'])
    def user_results(self, request):
        course_id = request.query_params.get('course_id')
    
        if not course_id:
            return Response(
                {'error': 'course_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 1. Получаем все тесты курса одним запросом
            tests = Test.objects.filter(course_id=course_id).in_bulk()
            
            # 2. Находим последние попытки для всех тестов (1 запрос)
            last_attempts = (
                UserAnswer.objects
                .filter(
                    user=request.user,
                    question__test__course_id=course_id
                )
                .values('question__test')  # Группируем по тесту
                .annotate(
                    last_attempt=Max('attempt_number'),
                    last_attempt_date=Max('answered_at')
                )
            )

            # 3. Получаем суммарные баллы для последних попыток (1 запрос)
            test_scores = (
                UserAnswer.objects
                .filter(
                    user=request.user,
                    question__test__course_id=course_id,
                    attempt_number__in=[a['last_attempt'] for a in last_attempts]
                )
                .values('question__test', 'attempt_number')
                .annotate(total_score=Sum('points_earned'))
            )

            # 4. Формируем результаты
            test_results = []
            test_attempt_map = {a['question__test']: a for a in last_attempts}
            score_map = {(s['question__test'], s['attempt_number']): s['total_score'] 
                        for s in test_scores}

            for test_id, test in tests.items():
                attempt_data = test_attempt_map.get(test_id)
                if not attempt_data:
                    continue
                    
                attempt_number = attempt_data['last_attempt']
                total_score = score_map.get((test_id, attempt_number), 0)
                
                test_results.append({
                    'test': test_id,
                    'title': test.title,
                    'score': total_score,
                    'max_score': test.max_score,
                    'is_passed': total_score >= test.passing_score,
                    'passed_at': attempt_data['last_attempt_date'],
                    'attempt_number': attempt_number
                })

            return Response(test_results)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )  
    

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        test_id = self.request.query_params.get('test_id')
        if test_id:
            return self.queryset.filter(test_id=test_id)
        return self.queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

class AnswerOptionViewSet(viewsets.ModelViewSet):
    queryset = AnswerOption.objects.all()
    serializer_class = AnswerOptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        question_id = self.request.query_params.get('question_id')
        if question_id:
            return self.queryset.filter(question_id=question_id)
        return self.queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        question_id = request.query_params.get('question_id')
        if question_id:
            try:
                question = Question.objects.get(pk=question_id)
                serializer = self.get_serializer(queryset, many=True)
                response_data = {
                    'question': {
                        'id': question.id,
                        'text': question.text,
                        'type': question.question_type,
                        'points': question.points
                    },
                    'options': serializer.data
                }
                return Response(response_data)
            except Question.DoesNotExist:
                return Response(
                    {'error': 'Question not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class CourseProgressViewSet(viewsets.ModelViewSet):
    queryset = CourseProgress.objects.all()
    serializer_class = CourseProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Для администраторов
        if self.request.user.is_staff:
            return CourseProgress.objects.all()
        
        # Для обычных пользователей - строго только их записи
        return CourseProgress.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        course_id = request.query_params.get('course_id')
        
        if course_id:
            # Ищем именно прогресс текущего пользователя для этого курса
            progress = queryset.filter(course_id=course_id).first()
            if progress:
                serializer = self.get_serializer(progress)
                return Response(serializer.data)
            return Response({})  # Или Response(None, status=404)
        
        # Если course_id не указан, возвращаем все прогрессы пользователя
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def admin_progress(self, request):
        if not request.user.is_staff:
            return Response(
                {'error': 'Only admin can access this data'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        progress = self.get_queryset()
        serializer = self.get_serializer(progress, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        course_id = request.data.get('course_id')
        user_id = request.data.get('user_id')
        
        if not course_id or not user_id:
            return Response(
                {'error': 'course_id and user_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                progress, created = CourseProgress.objects.select_for_update().get_or_create(
                    course_id=course_id,
                    user_id=user_id,
                    defaults={'status': 'not_started'}
                )

                if not created:
                    return Response(
                        {'status': "already subscribed"},
                        status=status.HTTP_200_OK
                    )
                
                progress.started_at = timezone.now()
                progress.save()

                serializer = CourseProgressSerializer(progress)
                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )
        except Course.DoesNotExist:
            return Response({'error': 'course not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def unsubscribe(self, request, *args, **kwargs):
        progress = self.get_object()
        progress.delete()
        return Response({'status': 'unbsubscribed'}, status=status.HTTP_200_OK)
    
    def complete_course(self, request, pk=None):
        progress = self.get_object()
        if progress.status == 'in_progress':
            progress.status = 'completed'
            progress.completed_at = timezone.now()
            progress.save()
            return Response({'status': 'course completed'})
        return Response({'status': 'course not in progress'}, status=status.HTTP_400_BAD_REQUEST)

class UserAnswerViewSet(viewsets.ModelViewSet):
    queryset = UserAnswer.objects.all()
    serializer_class = UserAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        question_id = self.request.query_params.get('question_id')
        
        queryset = self.queryset.filter(user=user)
        if question_id:
            queryset = queryset.filter(question_id=question_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SelectedAnswerViewSet(viewsets.ModelViewSet):
    queryset = SelectedAnswer.objects.all()
    serializer_class = SelectedAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user_answer_id = self.request.query_params.get('user_answer_id')
        if user_answer_id:
            return self.queryset.filter(user_answer_id=user_answer_id)
        return self.queryset