from django.db import models

class Document(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('ord', 'Организационно-распорядительная документация'),
        ('instructions', 'Инструкция'),
    ]

    title = models.CharField(max_length=200)
    document_type = models.CharField(max_length=60, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='media/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title})"
