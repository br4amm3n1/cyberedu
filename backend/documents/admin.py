from django.contrib import admin
from django.db import models
from .models import (
    Document
)

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'file', 'created_at')
    list_filter = ('document_type',)