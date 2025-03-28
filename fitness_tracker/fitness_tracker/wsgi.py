"""
WSGI config for fitness_tracker project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitness_tracker.settings')

application = get_wsgi_application()



import os
from django.contrib.auth import get_user_model

def create_superuser_from_env():
    User = get_user_model()
    username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'rumi')
    email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'me.lee.ssimo@gmail.com')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD', '225588fit')

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print("Superuser created successfully!")
    else:
        print("Superuser already exists.")

# Call the function
create_superuser_from_env()