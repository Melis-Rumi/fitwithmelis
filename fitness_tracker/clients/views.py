from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from rest_framework import viewsets

from fitness_tracker.backends import ImpersonationAuthBackend
from .models import TrainingProgram, MealPlan
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import ClientSerializer, ProgressSerializer, TrainingProgramSerializer, MealPlanSerializer
from django.middleware.csrf import get_token
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import MuscleGroup, Exercise
from django.db import IntegrityError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import (
    DietRecord,
    CardioExercise,
    CardioRecord,
    MuscleGroup,
    Exercise,
    TrainingRecord,
    Progress,
    Client,
)
import json


from django.contrib.auth import login
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User




from django.contrib.auth import authenticate

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from .models import TrainingRecord, CardioRecord, DietRecord, Progress
from django.contrib.auth import get_user_model

User = get_user_model()

def get_impersonated_user(request):
    if 'impersonated_user_id' in request.session:
        user_id = request.session['impersonated_user_id']
        return User.objects.get(id=user_id)
    return request.user




def get_logged_in_client(request):
    if hasattr(request.user, 'client'):
            return request.user.client
    user = request.user
    print(f"Request user: {user}")  # Debugging statement
    if user.is_authenticated:
        try:
            client = user.client
            print(f"Client found: {client.full_name}")  # Debugging statement
            return client
        except AttributeError:
            print(f"User {user.username} does not have an associated client")  # Debugging statement
            return None
    print("User is not authenticated")  # Debugging statement
    return None



# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.contrib.auth.models import User

@api_view(['GET'])
@permission_classes([IsAdminUser])
def some_protected_view(request):
    # The `request.user` will already be replaced by the middleware
    print(f'You are viewing this as {request.user.username}')
    return Response({
        'message': f'You are viewing this as {request.user.username}.',
        'is_impersonating': getattr(request, 'is_impersonating', False),
        'real_user': getattr(request, 'real_user', None).username if hasattr(request, 'real_user') else None,
    })



# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class ImpersonationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if the user is impersonating someone
        is_impersonating = getattr(request, 'is_impersonating', False)
        impersonated_user_id = None
        if is_impersonating:
            impersonated_user_id = request.user.id  # The impersonated user's ID
        
        return Response({
            'is_impersonating': is_impersonating,
            'impersonated_user_id': impersonated_user_id,
        })



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import Client
from .serializers import UserSerializer, ClientSerializer

class CreateUserAndClientView(APIView):
    permission_classes = []  # Allow unauthenticated access

    def post(self, request, *args, **kwargs):
        try:
            # Step 1: Create the User
            user_data = {
                'username': request.data.get('username'),
                'email': request.data.get('email'),
                'password': request.data.get('password'),
            }
            user_serializer = UserSerializer(data=user_data)
            if user_serializer.is_valid():
                user = user_serializer.save()

                # Step 2: Create the Client
                client_data = {
                    'user': user.id,
                    'full_name': request.data.get('full_name'),
                    'age': request.data.get('age'),
                    'contact_number': request.data.get('contact_number'),
                    'preferred_contact_method': request.data.get('preferred_contact_method'),
                    'current_weight': request.data.get('current_weight'),
                    'goal': request.data.get('goal'),
                    'training_experience': request.data.get('training_experience'),
                    'specific_goals': request.data.get('specific_goals'),
                    'obstacles': request.data.get('obstacles'),
                    'physique_rating': request.data.get('physique_rating'),
                }
                client_serializer = ClientSerializer(data=client_data)
                if client_serializer.is_valid():
                    client_serializer.save()
                    return Response(
                        {'message': 'User and client created successfully!'},
                        status=status.HTTP_201_CREATED
                    )
                else:
                    user.delete()  # Rollback user creation if client creation fails
                    return Response(client_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Client
from .serializers import ClientSerializer

User = get_user_model()

class ClientProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Check for an impersonated user in the session
            if 'impersonated_user_id' in request.session:
                user_id = request.session['impersonated_user_id']
                user = User.objects.get(id=user_id)
            else:
                user = request.user

            # Fetch the client profile for the user
            client = Client.objects.get(user=user)
            serializer = ClientSerializer(client)
            return Response(serializer.data, status=200)
        except (Client.DoesNotExist, User.DoesNotExist):
            return Response({'error': 'Client profile not found'}, status=404)

    def put(self, request):
        try:
            # Check for an impersonated user in the session
            if 'impersonated_user_id' in request.session:
                user_id = request.session['impersonated_user_id']
                user = User.objects.get(id=user_id)
            else:
                user = request.user

            # Fetch the client profile for the user
            client = Client.objects.get(user=user)
            serializer = ClientSerializer(client, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=200)
            return Response(serializer.errors, status=400)
        except (Client.DoesNotExist, User.DoesNotExist):
            return Response({'error': 'Client profile not found'}, status=404)



# Helper function to get or create a client (assuming the client is authenticated or identified by some mechanism)
def get_client(user_id):
    # Replace this with your actual logic to identify the client (e.g., based on user session or token)
    return Client.objects.get(id=user_id)

# Diet View
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import json
from django.db import IntegrityError
from .models import DietRecord

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def diet_view(request):
    client = get_logged_in_client(request)
    if not client:
        return Response({'error': 'User not authenticated'}, status=401)
    try:
        data = json.loads(request.body)
        date = data.get('date')
        total_calories = data.get('total_calories')
        protein_intake = data.get('protein_intake')
        carbs_intake = data.get('carbs_intake')
        fat_intake = data.get('fat_intake')
        DietRecord.objects.create(
            client=client,
            date=date,
            total_calories=total_calories,
            protein_intake=protein_intake,
            carbs_intake=carbs_intake,
            fat_intake=fat_intake,
        )
        return Response({'message': 'Diet record created successfully!'}, status=201)
    except (KeyError, ValueError, IntegrityError) as e:
        return Response({'error': str(e)}, status=400)
        



# Cardio View
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cardio_view(request):

    user = get_impersonated_user(request)
    client = user.client
    if not client:
        return Response({'error': 'User not authenticated'}, status=401)

    try:
        data = request.data  # DRF automatically parses JSON data
        date = data.get('date')
        exercise_name = data.get('exercise')
        sets = data.get('sets')
        duration_minutes = data.get('duration_minutes')

        if not all([date, exercise_name, sets, duration_minutes]):
            return Response({'error': 'Missing required fields'}, status=400)

        exercise, _ = CardioExercise.objects.get_or_create(name=exercise_name)
        CardioRecord.objects.create(
            client=client,
            date=date,
            exercise=exercise,
            sets=sets,
            duration_minutes=duration_minutes,
        )
        return Response({'message': 'Cardio record created successfully!'}, status=201)

    except (KeyError, ValueError, IntegrityError) as e:
        logger.error(f"Error in cardio_view: {str(e)}")
        return Response({'error': str(e)}, status=400)
        

# Training View
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def training_view(request):
    user = get_impersonated_user(request)
    client = user.client
    if not client:
        return Response({'error': 'User not authenticated'}, status=401)

    try:
        data = request.data
        date = data.get('date')
        muscle_group_name = data.get('muscle')
        exercise_name = data.get('exercise')
        sets = data.get('sets')
        reps = data.get('reps')
        weight = data.get('weight')

        if not all([date, exercise_name, sets, reps, weight]):
            return Response({'error': 'Missing required fields'}, status=400)

        # Dynamically determine muscle group based on exercise name
        #muscle_group_name = "Chest"  # Replace with dynamic logic (e.g., ML model or mapping)
        muscle_group, _ = MuscleGroup.objects.get_or_create(name=muscle_group_name)

        exercise, _ = Exercise.objects.get_or_create(name=exercise_name, muscle_group=muscle_group)
        TrainingRecord.objects.create(
            client=client,
            date=date,
            exercise=exercise,
            sets=sets,
            reps=reps,
            weight=weight,
        )
        return Response({'message': 'Training record created successfully!'}, status=201)

    except Exception as e:
        logger.error(f"Error in training_view: {str(e)}")
        return Response({'error': str(e)}, status=500)
        


# Metrics View
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def metrics_view(request):
    user = get_impersonated_user(request)
    client = user.client
    if not client:
        return Response({'error': 'User not authenticated'}, status=401)

    try:
        data = request.data
        date = data.get('date')
        weight = data.get('weight')
        bmi = data.get('bmi')
        chest = data.get('chest')
        waist = data.get('waist')
        glutes = data.get('glutes')
        left_thigh = data.get('left_thigh')
        right_thigh = data.get('right_thigh')

        if not all([date, weight, bmi, chest, waist, glutes, left_thigh, right_thigh]):
            return Response({'error': 'Missing required fields'}, status=400)

        Progress.objects.create(
            client=client,
            date=date,
            weight=weight,
            waist_size=waist,
            glute_size=glutes,
            chest_size=chest,
            arm_size_left=left_thigh,  # Assuming left thigh maps to arm size left
            arm_size_right=right_thigh,  # Assuming right thigh maps to arm size right
            quad_size_left=0,  # Placeholder value
            quad_size_right=0,  # Placeholder value
            body_fat_percentage=0,  # Placeholder value
            bmi=bmi,
        )
        return Response({'message': 'Metrics record created successfully!'}, status=201)

    except (KeyError, ValueError, IntegrityError) as e:
        logger.error(f"Error in metrics_view: {str(e)}")
        return Response({'error': str(e)}, status=400)




from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    # Extract username and password from the request
    username = request.data.get('username')
    password = request.data.get('password')

    # Authenticate the user
    user = authenticate(username=username, password=password)
    if user is not None:
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Return the tokens and user details in the response
        return Response({
            'refresh': str(refresh),
            'token': str(refresh.access_token),
            'user_id': user.id,
            'username': user.username,
        }, status=status.HTTP_200_OK)
    else:
        # Return an error response for invalid credentials
        return Response({
            'error': 'Invalid credentials',
            'details': 'The provided username or password is incorrect.'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])  # Allow unauthenticated access
def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})





@method_decorator(csrf_exempt, name='dispatch')
class ClientViewSet(viewsets.ModelViewSet):
    permission_classes = []  # Allow unauthenticated access
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer

class TrainingProgramViewSet(viewsets.ModelViewSet):
    queryset = TrainingProgram.objects.all()
    serializer_class = TrainingProgramSerializer

class MealPlanViewSet(viewsets.ModelViewSet):
    queryset = MealPlan.objects.all()
    serializer_class = MealPlanSerializer






@csrf_exempt
def muscle_groups(request):
    if request.method == 'GET':
        groups = MuscleGroup.objects.all()
        data = [
            {
                'id': group.id,
                'name': group.name,
                'exercises': [
                    {'id': exercise.id, 'name': exercise.name}
                    for exercise in group.exercise_set.all()
                ],
            }
            for group in groups
        ]
        return JsonResponse(data, safe=False)
    





from .models import CardioRecord

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_cardio_records(request):

    user = get_impersonated_user(request)
    client = user.client
    if not client:
        return JsonResponse({'error': 'User not authenticated'}, status=401)

    try:
        records = CardioRecord.objects.filter(client=client)
        data = [
            {
                'id': record.id,
                'date': record.date.strftime('%Y-%m-%d'),
                'exercise': record.exercise.name,
                'sets': record.sets,
                'duration_minutes': record.duration_minutes,
            }
            for record in records
        ]
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

from .models import TrainingRecord

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_training_records(request):
    user = get_impersonated_user(request)
    client = user.client
    if not client:
        return JsonResponse({'error': 'User not authenticated'}, status=401)

    try:
        records = TrainingRecord.objects.filter(client=client).select_related('exercise__muscle_group')
        data = [
            {
                'id': record.id,
                'date': record.date.strftime('%Y-%m-%d'),
                'exercise': {
                    'name': record.exercise.name,
                    'muscle_group': {
                        'name': record.exercise.muscle_group.name,
                    },
                },
                'sets': record.sets,
                'reps': record.reps,
                'weight': record.weight,
            }
            for record in records
        ]
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    




from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import TrainingRecord, CardioRecord, DietRecord, Progress, Client
import json

# Helper function to get the logged-in client
def get_logged_in_client(request):
    user = request.user
    if user.is_authenticated:
        try:
            return user.client  # Assuming a OneToOne relationship between User and Client
        except AttributeError:
            pass
    return None






@api_view(['GET'])
@permission_classes([IsAuthenticated])
def training_records(request, date):
    user = get_impersonated_user(request)
    try:
        client = user.client
        records = TrainingRecord.objects.filter(client=client, date=date)
        data = [
            {
                'id': record.id,
                'exercise': record.exercise.name,
                'sets': record.sets,
                'reps': record.reps,
                'weight': record.weight,
            }
            for record in records
        ]
        return Response(data, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cardio_records(request, date):
    user = get_impersonated_user(request)
    try:
        client = user.client
        records = CardioRecord.objects.filter(client=client, date=date)
        data = [
            {
                'id': record.id,
                'exercise': record.exercise.name,
                'sets': record.sets,
                'duration_minutes': record.duration_minutes,
            }
            for record in records
        ]
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_cardio_record(request, record_id):
    user = get_impersonated_user(request)
    try:
        client = user.client
        record = CardioRecord.objects.get(id=record_id, client=client)
        record.delete()
        return JsonResponse({'message': 'Cardio record deleted successfully!'}, status=200)
    except CardioRecord.DoesNotExist:
        return JsonResponse({'error': 'Record not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def diet_records(request, date):
    user = get_impersonated_user(request)
    try:
        client = user.client
        records = DietRecord.objects.filter(client=client, date=date)
        data = [
            {
                'id': record.id,
                'total_calories': record.total_calories,
                'protein_intake': record.protein_intake,
                'carbs_intake': record.carbs_intake,
                'fat_intake': record.fat_intake,
            }
            for record in records
        ]
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_diet_record(request, record_id):
    user = get_impersonated_user(request)
    try:
        client = user.client
        record = DietRecord.objects.get(id=record_id, client=client)
        record.delete()
        return JsonResponse({'message': 'Diet record deleted successfully!'}, status=200)
    except DietRecord.DoesNotExist:
        return JsonResponse({'error': 'Record not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def metrics_records(request, date):
    user = get_impersonated_user(request)
    try:
        client = user.client
        records = Progress.objects.filter(client=client, date=date)
        data = [
            {
                'id': record.id,
                'weight': record.weight,
                'bmi': record.bmi,
                'chest': record.chest_size,
                'waist': record.waist_size,
                'glutes': record.glute_size,
                'left_thigh': record.arm_size_left,
                'right_thigh': record.arm_size_right,
            }
            for record in records
        ]
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_metrics_record(request, record_id):
    user = get_impersonated_user(request)
    try:
        client = user.client
        record = Progress.objects.get(id=record_id, client=client)
        record.delete()
        return JsonResponse({'message': 'Metrics record deleted successfully!'}, status=200)
    except Progress.DoesNotExist:
        return JsonResponse({'error': 'Record not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)





from datetime import timedelta
from django.utils.timezone import now
from .models import DietRecord, CardioRecord, TrainingRecord, Progress

def get_time_range(range_param):
    if range_param == 'month':
        return now() - timedelta(days=30)
    elif range_param == '3months':
        return now() - timedelta(days=90)
    elif range_param == '6months':
        return now() - timedelta(days=180)
    elif range_param == 'year':
        return now() - timedelta(days=365)
    else:
        # Default to 1 month if range_param is invalid
        return now() - timedelta(days=30)




from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils.timezone import now
from datetime import timedelta
from .models import DietRecord
import logging
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def diet_progress(request):
    try:
        user = get_impersonated_user(request)
        client=user.client
        print(f"Authenticated user: {user.id}")

        range_param = request.GET.get('range', 'month')
        start_date = get_time_range(range_param)
        records = DietRecord.objects.filter(client=client, date__gte=start_date)
        data = [
            {
                'date': record.date.strftime('%Y-%m-%d'),
                'total_calories': record.total_calories,
                'protein_intake': record.protein_intake,
                'carbs_intake': record.carbs_intake,
                'fat_intake': record.fat_intake,
            }
            for record in records
        ]
        return Response(data, status=200)
    except (InvalidToken, TokenError) as e:
        logger.error(f"Invalid token: {str(e)}")
        return Response({'error': 'Invalid token'}, status=401)
    except Exception as e:
        logger.error(f"Error fetching diet records: {str(e)}")
        return Response({'error': 'An unexpected error occurred'}, status=500)




from django.db.models import Sum

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cardio_progress(request):
    user = get_impersonated_user(request)
    client = user.client
    if not client:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
    try:
        range_param = request.GET.get('range', 'month')
        start_date = get_time_range(range_param)
        records = (
            CardioRecord.objects
            .filter(client=client, date__gte=start_date)
            .values('date')  # Group by date
            .annotate(total_duration=Sum('duration_minutes'))  # Sum duration_minutes for each date
            .order_by('date')  # Ensure results are sorted by date
        )
        data = [
            {
                'date': record['date'].strftime('%Y-%m-%d'),
                'total_duration': record['total_duration'] or 0,  # Handle null values
            }
            for record in records
        ]
        return JsonResponse(data, safe=False)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in cardio_progress: {e}")
        return JsonResponse({'error': 'An error occurred while fetching data.'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def training_progress(request):
    user = get_impersonated_user(request)
    client = user.client
    if not client:
        return JsonResponse({'error': 'User not authenticated'}, status=401)

    range_param = request.GET.get('range', 'month')
    start_date = get_time_range(range_param)
    records = TrainingRecord.objects.filter(client=client, date__gte=start_date)
    data = [
        {
            'date': record.date.strftime('%Y-%m-%d'),
            'exercise': record.exercise.name,
            'weight': record.weight,
        }
        for record in records
    ]
    return JsonResponse(data, safe=False)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def metrics_progress(request):
    user = get_impersonated_user(request)
    client = user.client
    if not client:
        return JsonResponse({'error': 'User not authenticated'}, status=401)

    range_param = request.GET.get('range', 'month')
    start_date = get_time_range(range_param)
    records = Progress.objects.filter(client=client, date__gte=start_date)
    data = [
        {
            'date': record.date.strftime('%Y-%m-%d'),
            'weight': record.weight,
            'bmi': record.bmi,
            'chest': record.chest_size,
            'waist': record.waist_size,
            'glutes': record.glute_size,
            'left_thigh': record.arm_size_left,
            'right_thigh': record.arm_size_right,
        }
        for record in records
    ]
    return JsonResponse(data, safe=False)



# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import TrainingProgram, TrainingWeek, TrainingDay, ExerciseDay

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_training_program(request):
    user = get_impersonated_user(request)
    client = user.client
    if not client:
        return Response({'error': 'User not authenticated'}, status=401)
    
    program = TrainingProgram.objects.create(client=client)
    week = TrainingWeek.objects.create(program=program, week_number=1)
    
    # Create empty days for the first week
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for day in days:
        TrainingDay.objects.create(week=week, day_of_week=day)
    
    return Response({'program_id': program.program_id}, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_week(request, program_id):
    user = get_impersonated_user(request)
    program = get_object_or_404(TrainingProgram, program_id=program_id)
    
    # Check if the user is authorized to access this program
    if program.client.user != user:
        return Response({'error': 'Not authorized'}, status=403)
    
    next_week_number = program.weeks.count() + 1
    week = TrainingWeek.objects.create(program=program, week_number=next_week_number)
    
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for day in days:
        TrainingDay.objects.create(week=week, day_of_week=day)
    
    return Response({'week_number': next_week_number}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_training_program(request, program_id):
    user = get_impersonated_user(request)
    program = get_object_or_404(TrainingProgram, program_id=program_id)
    
    # Check if the user is authorized to access this program
    if program.client.user != user:
        return Response({'error': 'Not authorized'}, status=403)
    
    weeks = []
    for week in program.weeks.all():
        days = {}
        for day in week.days.all():
            days[day.day_of_week] = {
                'description': day.description,
                'id': day.id
            }
        weeks.append({
            'week_number': week.week_number,
            'days': days
        })
    
    return Response({'weeks': weeks})



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_training_day(request, day_id):
    user = get_impersonated_user(request)
    day = get_object_or_404(TrainingDay, id=day_id)
    
    # Ensure the user is authorized to access this training day
    if day.week.program.client.user != user:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    # Update the description of the training day
    day.description = request.data.get('description', '')
    day.save()
    return Response({'message': 'Updated successfully'})


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def training_day_exercises(request, day_id):
    user = get_impersonated_user(request)
    day = get_object_or_404(TrainingDay, id=day_id)
    
    # Ensure the user is authorized to access this training day
    if day.week.program.client.user != user:
        return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        # Fetch exercises for the training day
        exercises = day.exercises.all().order_by('order')
        data = [{
            'id': ex.id,
            'exercise_name': ex.exercise_name,
            'sets': ex.sets,
            'reps': ex.reps,
            'description': ex.description,  # Include the description in the response
            'order': ex.order
        } for ex in exercises]
        return Response({
            'description': day.description,  # Include the day description in the response
            'exercises': data
        })
    
    elif request.method == 'POST':
        # Add a new exercise to the training day
        ExerciseDay.objects.create(
            training_day=day,
            exercise_name=request.data['exercise_name'],
            sets=request.data['sets'],
            reps=request.data['reps'],
            description=request.data.get('description', ''),  # Add description
            order=day.exercises.count()
        )
        return Response({'message': 'Exercise added successfully'}, status=status.HTTP_201_CREATED)
    
    elif request.method == 'PUT':
        # Update the description of the training day
        new_description = request.data.get('description', '').strip()
        if new_description:
            day.description = new_description
            day.save()
            return Response({'message': 'Description updated successfully'})
        return Response({'error': 'Description cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_exercise(request, exercise_id):
    user = get_impersonated_user(request)
    exercise = get_object_or_404(ExerciseDay, id=exercise_id)
    
    # Check if the user is authorized to delete this exercise
    if exercise.training_day.week.program.client.user != user:
        return Response({'error': 'Not authorized'}, status=403)
    
    exercise.delete()
    return Response(status=204)




# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import TrainingProgram, TrainingWeek
from .serializers import TrainingProgramSerializer
class LatestTrainingProgramView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = get_impersonated_user(request)
        # Get all training programs for the client, sorted by creation date
        programs = TrainingProgram.objects.filter(client=user.client).order_by('-created_at')
        
        if not programs.exists():
            return Response({"detail": "No training programs found."}, status=status.HTTP_404_NOT_FOUND)
        
        # Serialize all programs
        serializer = TrainingProgramSerializer(programs, many=True)
        return Response({
            "latest_program": TrainingProgramSerializer(programs.first()).data,  # Latest program
            "all_programs": serializer.data  # All programs
        }, status=status.HTTP_200_OK)

class CreateTrainingProgramView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Create a new training program for the authenticated client
        program = TrainingProgram.objects.create(client=request.user.client)
        serializer = TrainingProgramSerializer(program)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AddWeekToProgramView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, program_id):
        # Add a new week to the specified training program
        program = get_object_or_404(TrainingProgram, program_id=program_id, client=request.user.client)
        week_number = program.weeks.count() + 1  # Calculate the next week number
        week = TrainingWeek.objects.create(program=program, week_number=week_number)
        return Response({"detail": f"Week {week_number} added successfully."}, status=status.HTTP_201_CREATED)
    


# views.py
from rest_framework import generics
from rest_framework.response import Response
from django.db.models import Q
from .models import Nutrients
from .serializers import NutrientsSerializer

class NutrientsSearchView(generics.ListAPIView):
    serializer_class = NutrientsSerializer
    
    def get_queryset(self):
        query = self.request.query_params.get('search', '')
        if query:
            return Nutrients.objects.filter(name__icontains=query)[:10]
        return Nutrients.objects.none()











