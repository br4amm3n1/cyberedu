from django.contrib import admin
from django.db import models
from .models import (
    Course, LearningMaterial, Test, 
    Question, AnswerOption, 
    CourseProgress, UserAnswer,
    SelectedAnswer, QuestionImage
)
from django.utils.safestring import mark_safe


class LearningMaterialInline(admin.TabularInline):
    model = LearningMaterial
    extra = 1

class TestInline(admin.TabularInline):
    model = Test
    extra = 1

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'difficulty', 'category', 'is_active')
    list_filter = ('difficulty', 'category', 'is_active')
    search_fields = ('title', 'description', 'author__username')
    inlines = [LearningMaterialInline, TestInline]
    # raw_id_fields = ('author',)

@admin.register(LearningMaterial)
class LearningMaterialAdmin(admin.ModelAdmin):
    list_display = ('course', 'material_type', 'created_at')
    list_filter = ('material_type',)
    search_fields = ('course__title', 'content_url')

class AnswerOptionInline(admin.TabularInline):
    model = AnswerOption
    extra = 1  # Количество пустых форм по умолчанию
    min_num = 1  # Минимальное количество вариантов ответа
    max_num = 10  # Максимальное количество вариантов
    ordering = ('id',)  # Сортировка вариантов
    
    # Настройка полей для отображения
    fields = ('text', 'is_correct', 'preview')
    readonly_fields = ('preview',)
    
    # Улучшенное отображение полей
    formfield_overrides = {
        models.CharField: {
            'widget': admin.widgets.AdminTextInputWidget(attrs={'size': '60'})
        },
    }

    def preview(self, obj):
        if obj.id:  # Если объект уже сохранен
            correct = '✅ Верный' if obj.is_correct else '❌ Неверный'
            return f"{obj.text[:50]}... ({correct})"
        return "Сохранится после создания"
    preview.short_description = "Предпросмотр"


@admin.register(QuestionImage)
class QuestionImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'image_preview')
    list_display_links = ('id', 'title')
    search_fields = ('title',)
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" style="max-height: 100px; max-width: 100px;" />')
        return "Нет изображения"
    
    image_preview.short_description = 'Превью'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('image', 'text_truncated', 'test', 'question_type', 'points', 'options_count')
    inlines = [AnswerOptionInline]
    
    # Оптимизация запросов
    list_select_related = ('test',)
    
    # Добавляем фильтры и поиск
    list_filter = ('question_type', 'test')
    search_fields = ('text', 'test__title')
    
    # Группировка полей в форме редактирования
    fieldsets = (
        (None, {
            'fields': ('test', 'image', 'text', 'question_type', 'points')
        }),
    )
    
    def text_truncated(self, obj):
        return obj.text[:100] + '...' if len(obj.text) > 100 else obj.text
    text_truncated.short_description = 'Текст вопроса'
    
    def options_count(self, obj):
        return obj.options.count()
    options_count.short_description = 'Вариантов'

@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'max_score', 'passing_score')
    search_fields = ('title', 'course__title')
    readonly_fields = ['max_score']

@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'status', 'progress_percent', 'score')
    list_filter = ('status', 'course')
    search_fields = ('user__username', 'course__title')

@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ('user', 'question', 'points_earned', 'answered_at')
    list_filter = ('question__test',)
    search_fields = ('user__username', 'question__text')

@admin.register(SelectedAnswer)
class SelectedAnswerAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'get_user',
        'get_question',
        'get_answer_text',
        'is_correct_option',
        'is_selected',
        'get_test',
        'get_course'
    )
    list_filter = (
        'is_selected',
        'answer_option__is_correct',
        'user_answer__question__test',
    )
    search_fields = (
        'user_answer__user__username',
        'answer_option__text',
        'user_answer__question__text'
    )
    raw_id_fields = ('user_answer', 'answer_option')
    list_select_related = (
        'user_answer',
        'user_answer__question',
        'user_answer__user',
        'answer_option'
    )

    def get_user(self, obj):
        return obj.user_answer.user.username
    get_user.short_description = 'User'
    get_user.admin_order_field = 'user_answer__user__username'

    def get_question(self, obj):
        return obj.user_answer.question.text[:50] + '...' if len(obj.user_answer.question.text) > 50 else obj.user_answer.question.text
    get_question.short_description = 'Question'
    get_question.admin_order_field = 'user_answer__question__text'

    def get_answer_text(self, obj):
        return obj.answer_option.text[:50] + '...' if len(obj.answer_option.text) > 50 else obj.answer_option.text
    get_answer_text.short_description = 'Answer Option'

    def is_correct_option(self, obj):
        return obj.answer_option.is_correct
    is_correct_option.boolean = True
    is_correct_option.short_description = 'Is Correct'
    is_correct_option.admin_order_field = 'answer_option__is_correct'

    def get_test(self, obj):
        return obj.user_answer.question.test.title
    get_test.short_description = 'Test'
    get_test.admin_order_field = 'user_answer__question__test__title'

    def get_course(self, obj):
        return obj.user_answer.question.test.course.title
    get_course.short_description = 'Course'
    get_course.admin_order_field = 'user_answer__question__test__course__title'