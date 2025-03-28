from rest_framework import serializers
from .models import Client, Progress, TrainingProgram, TrainingDay, MealPlan


# serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Client
        fields = [
            'user', 'full_name', 'age', 'contact_number', 'preferred_contact_method',
            'current_weight', 'goal', 'training_experience', 'specific_goals',
            'obstacles', 'physique_rating'
        ]


from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
'''
class UserCredentialsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCredentials
        fields = ['email','username', 'password']
'''

class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Progress
        fields = '__all__'

class TrainingProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingProgram
        fields = '__all__'

class MealPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealPlan
        fields = '__all__'



class ExerciseSerializer(serializers.Serializer):
    exercise_id = serializers.IntegerField()
    name = serializers.CharField()
    sets = serializers.IntegerField()
    reps = serializers.IntegerField()




# serializers.py
from rest_framework import serializers
from .models import TrainingProgram, TrainingWeek

from rest_framework import serializers
from .models import TrainingWeek, TrainingDay

class TrainingDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingDay
        fields = ['id', 'day_of_week', 'description']

class TrainingWeekSerializer(serializers.ModelSerializer):
    days = serializers.SerializerMethodField()

    class Meta:
        model = TrainingWeek
        fields = ['id', 'week_number', 'days']

    def get_days(self, obj):
        days = obj.days.all()  # Fetch all days for this week
        return {day.day_of_week: TrainingDaySerializer(day).data for day in days}

class TrainingProgramSerializer(serializers.ModelSerializer):
    weeks = TrainingWeekSerializer(many=True, read_only=True)

    class Meta:
        model = TrainingProgram
        fields = ['program_id', 'client', 'created_at', 'weeks']
        read_only_fields = ['program_id', 'created_at', 'weeks']


        # serializers.py
from rest_framework import serializers
from .models import Nutrients

class NutrientsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Nutrients
        fields = ['id', 'name', 'calories', 'total_fat', 'protein', 'carbohydrate', 'fiber', 'sugars']



