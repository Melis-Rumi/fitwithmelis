from django.db import models
from django.contrib.auth.models import User

class Client(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client')
    full_name = models.CharField(max_length=255)
    age = models.IntegerField()
    contact_number = models.CharField(max_length=15)
    preferred_contact_method = models.CharField(max_length=50)
    current_weight = models.FloatField()
    goal = models.CharField(max_length=50)
    training_experience = models.CharField(max_length=50)
    specific_goals = models.TextField()
    obstacles = models.TextField()
    physique_rating = models.IntegerField()

    def __str__(self):
        return self.full_name



class TrainingProgram(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    exercise = models.CharField(max_length=255)
    sets = models.IntegerField()
    reps = models.IntegerField()

class MealPlan(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date = models.DateField()
    meal_image = models.ImageField(upload_to='meal_images/')
    comments = models.TextField()



class Progress(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date = models.DateField()
    weight = models.FloatField(null=True, blank=True)
    waist_size = models.FloatField(null=True, blank=True)
    glute_size = models.FloatField(null=True, blank=True)
    chest_size = models.FloatField(null=True, blank=True)
    arm_size_left = models.FloatField(null=True, blank=True)
    arm_size_right = models.FloatField(null=True, blank=True)
    quad_size_left = models.FloatField(null=True, blank=True)
    quad_size_right = models.FloatField(null=True, blank=True)
    body_fat_percentage = models.FloatField(null=True, blank=True)
    bmi = models.FloatField(null=True, blank=True)

class DietRecord(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date = models.DateField()
    total_calories = models.FloatField()
    protein_intake = models.FloatField()
    carbs_intake = models.FloatField()
    fat_intake = models.FloatField()

class CardioExercise(models.Model):
    name = models.CharField(max_length=255)

class CardioRecord(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date = models.DateField()
    exercise = models.ForeignKey(CardioExercise, on_delete=models.CASCADE)
    sets = models.IntegerField()
    duration_minutes = models.FloatField()

class MuscleGroup(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Exercise(models.Model):
    muscle_group = models.ForeignKey(MuscleGroup, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.muscle_group.name})"

class TrainingRecord(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date = models.DateField()
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    sets = models.IntegerField()
    reps = models.IntegerField()
    weight = models.FloatField()



    from django.db import models




# models.py
from django.db import models
from django.contrib.auth.models import User

class TrainingProgram(models.Model):
    client = models.ForeignKey('Client', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    program_id = models.AutoField(primary_key=True)

    class Meta:
        ordering = ['-created_at']

class TrainingWeek(models.Model):
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='weeks')
    week_number = models.IntegerField()

    class Meta:
        unique_together = ['program', 'week_number']

class TrainingDay(models.Model):
    week = models.ForeignKey(TrainingWeek, on_delete=models.CASCADE, related_name='days')
    day_of_week = models.CharField(max_length=20)  # Monday, Tuesday, etc.
    description = models.CharField(max_length=255, blank=True)  # e.g., "Chest Day"

    class Meta:
        unique_together = ['week', 'day_of_week']

class ExerciseDay(models.Model):
    training_day = models.ForeignKey(TrainingDay, on_delete=models.CASCADE, related_name='exercises')
    exercise_name = models.CharField(max_length=255)
    sets = models.IntegerField()
    reps = models.CharField(max_length=50)  # Using CharField to allow formats like "8-12"
    description = models.CharField(max_length=100, blank=True)  # New description field
    order = models.IntegerField(default=0)



class Nutrients(models.Model):
    name = models.CharField(max_length=150)
    calories = models.FloatField()
    total_fat = models.FloatField()
    protein = models.FloatField()
    carbohydrate = models.FloatField()
    fiber = models.FloatField()
    sugars = models.FloatField()

    def __str__(self):
        return self.name
    



class TrainerClient(models.Model):
    trainer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trainer_clients')  # Unique related_name
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_clients')  # Unique related_name
    date_assigned = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('trainer', 'client')