"""
URL configuration for fitness_tracker project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from clients.views import (
    ClientViewSet, 
    ProgressViewSet, 
    TrainingProgramViewSet, 
    MealPlanViewSet, 
    LatestTrainingProgramView, CreateTrainingProgramView, AddWeekToProgramView,
    get_csrf_token, 
    
    diet_view,
    cardio_view,
    training_view,
    metrics_view,
    muscle_groups,
    training_records,
    cardio_records,
    delete_cardio_record,
    all_cardio_records,
    all_training_records,
    diet_records,
    delete_diet_record,
    metrics_records,
    delete_metrics_record,
    diet_progress,
    cardio_progress,
    training_progress,
    metrics_progress,
    login, logout,
    CreateUserAndClientView,
    create_training_program,
    get_training_program,
    add_week,
    update_training_day,
    training_day_exercises,
    delete_exercise,
    ClientProfileView,
    NutrientsSearchView,
    some_protected_view,
    ImpersonationStatusView
    )
    

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'progress', ProgressViewSet)
router.register(r'training-programs', TrainingProgramViewSet)
router.register(r'meal-plans', MealPlanViewSet)

urlpatterns = [
    path('', include(router.urls)),

    path('api/progress/diet/', diet_progress, name='diet_progress'),
    path('api/progress/cardio/', cardio_progress, name='cardio_progress'),
    path('api/progress/training/', training_progress, name='training_progress'),
    path('api/progress/metrics/', metrics_progress, name='metrics_progress'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/', admin.site.urls),
    path('csrf-token/', get_csrf_token, name='csrf_token'),
    path('create-user-and-client/', CreateUserAndClientView.as_view(), name='create_user_and_client'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('some-protected-view/', some_protected_view, name='some_protected_view'),
    path('api/impersonation-status/', ImpersonationStatusView.as_view(), name='impersonation-status'),
    path('api/nutrients/search/', NutrientsSearchView.as_view(), name='nutrients-search'),
     # Training Program URLs
    path('api/training-program/', create_training_program, name='create_training_program'),
    path('api/training-program/<int:program_id>/', get_training_program, name='get_training_program'),
    path('api/training-program/<int:program_id>/add-week/', add_week, name='add_week'),
    
    # Training Day URLs
    path('api/training-day/<int:day_id>/update/', update_training_day, name='update_training_day'),
    path('api/training-day/<int:day_id>/', training_day_exercises, name='training_day_exercises'),

    path('api/training-program/latest/', LatestTrainingProgramView.as_view(), name='latest-training-program'),
    #path('api/training-program/', CreateTrainingProgramView.as_view(), name='create-training-program'),
    #path('api/training-program/<int:program_id>/add-week/', AddWeekToProgramView.as_view(), name='add-week-to-program'),

    # Exercise URLs
    path('api/exercise/<int:exercise_id>/', delete_exercise, name='delete_exercise'),
    path('api/client-profile/', ClientProfileView.as_view(), name='client-profile'),
    path('api/diet/', diet_view, name='diet_view'),
    path('api/cardio/', cardio_view, name='cardio_view'),
    path('api/training/', training_view, name='training_view'),
    path('api/metrics/', metrics_view, name='metrics_view'),
    path('api/muscle-groups/', muscle_groups, name='muscle_groups'),
    path('api/training/<str:date>/', training_records, name='training_records'),
    path('api/cardio/<str:date>/', cardio_records, name='cardio_records'),
    path('api/cardio/<int:record_id>/', delete_cardio_record, name='delete_cardio_record'),
    path('api/cardio_all/', all_cardio_records, name='all_cardio_records'),
    path('api/training_all/', all_training_records, name='all_training_records'),
    path('api/diet/<str:date>/', diet_records, name='diet_records'),
    path('api/diet/<int:record_id>/', delete_diet_record, name='delete_diet_record'),
    path('api/metrics/<str:date>/', metrics_records, name='metrics_records'),
    path('api/metrics/<int:record_id>/', delete_metrics_record, name='delete_metrics_record'),

    #path('api/', include('clients.urls')),
]

