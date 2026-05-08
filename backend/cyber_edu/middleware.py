from django.utils.deprecation import MiddlewareMixin

class SessionStatusMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path == '/api/accounts/session-status/':
            request._disable_session_save = True
    
    def process_response(self, request, response):
        if hasattr(request, '_disable_session_save'):
            response._disable_session_save = True
        return response