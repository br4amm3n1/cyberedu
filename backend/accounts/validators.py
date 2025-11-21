# accounts/validators.py
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class CustomPasswordValidator:
    def validate(self, password, user=None):
        # Проверка на наличие цифр
        if not any(char.isdigit() for char in password):
            raise ValidationError(
                _("Пароль должен содержать хотя бы одну цифру."),
                code='password_no_digit',
            )
        
        # Проверка на наличие заглавных букв
        if not any(char.isupper() for char in password):
            raise ValidationError(
                _("Пароль должен содержать хотя бы одну заглавную букву."),
                code='password_no_upper',
            )
        
        # Проверка на наличие специальных символов
        special_characters = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`"
        if not any(char in special_characters for char in password):
            raise ValidationError(
                _("Пароль должен содержать хотя бы один специальный символ: !@#$%^&*()_+-=[]{}|;:,.<>?/~`"),
                code='password_no_special',
            )
    
    def get_help_text(self):
        return _(
            "Ваш пароль должен содержать:\n"
            "- Не менее 8 символов\n"
            "- Хотя бы одну цифру\n"
            "- Хотя бы одну заглавную букву\n"
            "- Хотя бы один специальный символ: !@#$%^&*()_+-=[]{}|;:,.<>?/~`"
        )