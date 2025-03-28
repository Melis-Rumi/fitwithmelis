from django.contrib.auth import get_user_model
from django.utils.deprecation import MiddlewareMixin

User = get_user_model()

class ImpersonateUserMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Ensure request.user exists and the user is authenticated
        if hasattr(request, 'user'):
            # Check for the __user_id parameter in the request
            if '__user_id' in request.GET:
                try:
                    user_id = int(request.GET['__user_id'])
                    impersonated_user = User.objects.get(id=user_id)
                    print(f"Impersonating user: {impersonated_user}")
                    # Store the impersonated user ID in the session
                    request.session['impersonated_user_id'] = user_id
                    # Override request.user
                    request.user = impersonated_user
                except (ValueError, User.DoesNotExist):
                    # If the user_id is invalid or the user doesn't exist, clear the impersonation
                    if 'impersonated_user_id' in request.session:
                        del request.session['impersonated_user_id']
            # If no __user_id parameter, check for an existing impersonation in the session
            elif 'impersonated_user_id' in request.session:
                try:
                    user_id = request.session['impersonated_user_id']
                    impersonated_user = User.objects.get(id=user_id)
                    print(f"Using impersonated user from session: {impersonated_user}")
                    # Override request.user
                    request.user = impersonated_user
                except (ValueError, User.DoesNotExist):
                    # If the session user_id is invalid, clear the impersonation
                    del request.session['impersonated_user_id']
        return None