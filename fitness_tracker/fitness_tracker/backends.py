from django.contrib.auth.backends import ModelBackend

class ImpersonationAuthBackend(ModelBackend):
    def authenticate(self, request, impersonator=None, user_to_impersonate=None):
        if impersonator and user_to_impersonate:
            if impersonator.is_staff:  # Only allow staff/admin to impersonate
                return user_to_impersonate
        return None
    

