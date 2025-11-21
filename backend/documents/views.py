from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.http import FileResponse
from rest_framework.decorators import action
from .models import (
    Document
)
from .serializers import (
    DocumentSerializer
)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Document.objects.all()
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        document = self.get_object()
        if not document.file:
            return Response(
                {'error': 'Файл не найден'}, 
                status=404,
                content_type='application/json'
            )
        
        try:
            return FileResponse(
                document.file.open('rb'),
                filename=document.file.name.split('/')[-1],
                as_attachment=True
            )
        except FileNotFoundError:
            return Response(
                {'error': 'Файл отсутствует на сервере'},
                status=404,
                content_type='application/json'
            )