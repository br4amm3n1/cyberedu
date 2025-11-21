from rest_framework import serializers
from django.conf import settings
from .models import (
    Course, LearningMaterial, Test, 
    Question, AnswerOption, CourseProgress,
    UserAnswer, SelectedAnswer
)
from accounts.serializers import UserSerializer

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class LearningMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningMaterial
        fields = '__all__'
        read_only_fields = ['created_at']

class AnswerOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerOption
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    options = AnswerOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = '__all__'
    

class TestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Test
        fields = '__all__'

class SelectedAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SelectedAnswer
        fields = '__all__'

class UserAnswerSerializer(serializers.ModelSerializer):
    selected_answers = SelectedAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = UserAnswer
        fields = '__all__'
        read_only_fields = ['answered_at', 'points_earned']


class CourseProgressSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = CourseProgress
        fields = '__all__'
        read_only_fields = ['user', 'started_at', 'completed_at']
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'firstname': obj.user.first_name,
            'lastname': obj.user.last_name,
            'email': obj.user.email
        }