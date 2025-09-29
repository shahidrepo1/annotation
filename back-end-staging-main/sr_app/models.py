from django.db import models
from django.contrib.auth.models import User  # Assuming you're using Django's default User model
from django.conf import settings
from django.db import models


class AudioFile(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    file = models.FileField(upload_to='uploaded_audio/', max_length=225)  # Store audio files in 'uploaded_audio/' directory
    module_name = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_annotated = models.BooleanField(default=False, blank=True, null=True)


class AudioChunks(models.Model):
    audio_file = models.ForeignKey(AudioFile, on_delete=models.CASCADE, related_name="audio_chunks")
    speaker = models.CharField(max_length=255)
    audio_chunks_name = models.JSONField(default=list,null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_edited = models.BooleanField(default=False)  # Field to track edits
    is_deleted = models.BooleanField(default=False, null=True, blank=True)  # Field to track edits

class TrainingVersions(models.Model):
    version_name = models.CharField(max_length=255, null=True, blank=True)
    version_module = models.CharField(max_length=255, null=True, blank=True)
    version_speakers = models.JSONField(null=True, blank=True)  
    audios_id = models.JSONField(null=True, blank=True)
    def __str__(self):
        return self.version_name


class TrainingProgress(models.Model):
    STATUS_CHOICES = [
    ('training', 'Training'),     
    ('completed', 'Completed'),
    ('failed', 'Failed'),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trainings'
    )
    module_name = models.CharField(max_length=255, null=True, blank=True)
    model_name = models.CharField(max_length=255)
    
    # Change release_version to CASCADE
    release_version = models.ForeignKey(
        TrainingVersions, 
        on_delete=models.CASCADE,  # If the version is deleted, delete related progress records
        null=True, 
        blank=True
    )
    
    epoch = models.IntegerField(null=True, blank=True)
    total_epochs = models.IntegerField(null=True, blank=True)
    f1_score = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='training')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.model_name} - {self.user} - {self.release_version}"


class KnownLabel(models.Model):
    user_email = models.EmailField(null=True, blank=True)  # Store the user's email
    label_name = models.CharField(max_length=255, unique=True, help_text="Name of the label")
    
    def __str__(self):
        return self.label_name
