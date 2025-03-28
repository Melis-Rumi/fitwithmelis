from urllib import request
from django import forms
from django.contrib import admin
# Register your models here.

from django.contrib import admin
from django.shortcuts import render
from .models import MuscleGroup, Exercise

@admin.register(MuscleGroup)
class MuscleGroupAdmin(admin.ModelAdmin):
    list_display = ('name',)

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'muscle_group')
    list_filter = ('muscle_group',)
    


from django.contrib import admin
from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
from django import forms
import csv
from io import TextIOWrapper
from .models import Nutrients

class CsvImportForm(forms.Form):
    csv_file = forms.FileField()

class NutrientsAdmin(admin.ModelAdmin):
    list_display = ('name', 'calories', 'total_fat', 'protein', 'carbohydrate', 'fiber', 'sugars')
    search_fields = ('name',)
    change_list_template = 'admin/nutrients_changelist.html'
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('upload-csv/', self.upload_csv, name='upload_csv'),
        ]
        return custom_urls + urls

    def upload_csv(self, request):
        if request.method == 'POST':
            form = CsvImportForm(request.POST, request.FILES)
            if form.is_valid():
                csv_file = TextIOWrapper(request.FILES['csv_file'].file, encoding='utf-8')
                reader = csv.DictReader(csv_file)
                
                for row in reader:
                    try:
                        Nutrients.objects.create(
                            name=row['name'],
                            calories=float(row['calories']),
                            total_fat=float(row['total_fat']),
                            protein=float(row['protein']),
                            carbohydrate=float(row['carbohydrate']),
                            fiber=float(row['fiber']),
                            sugars=float(row['sugars'])
                        )
                    except Exception as e:
                        messages.error(request, f"Error in row {row}: {str(e)}")
                        return redirect("..")
                
                messages.success(request, "CSV file has been imported successfully")
                return redirect("..")
        
        form = CsvImportForm()
        context = {
            'form': form,
            'title': 'Import CSV',
            'site_title': 'Nutrients Admin',
            'site_header': 'Nutrients Admin'
        }
        return render(request, 'admin/csv_upload.html', context)

admin.site.register(Nutrients, NutrientsAdmin)


