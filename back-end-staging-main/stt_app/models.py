from django.db import models
from sr_app.models import AudioFile
from django.conf import settings


class ProcessedChunk(models.Model):
    uploaded_file = models.ForeignKey(AudioFile, on_delete=models.CASCADE, related_name="processed_chunks")
    chunk_name = models.TextField(blank=True, null=True)
    transcription = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_edited = models.BooleanField(default=False)  # Field to track edits
    is_deleted = models.BooleanField(default=False)  # Field to track edits
    is_trained = models.BooleanField(default=False)

    def __str__(self):
        return f"Chunk {self.chunk_name}"


class STTTrainingVersions(models.Model):
    version_name = models.CharField(max_length=255, null=True, blank=True)
    version_module = models.CharField(max_length=255, null=True, blank=True)
    version_audio_id = models.JSONField(null=True, blank=True)  
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for versioning

    def __str__(self):
        return self.version_name
    

class STTTrainingProgress(models.Model):
    STATUS_CHOICES = [
    ('training', 'Training'),     
    ('completed', 'Completed'),
    ('failed', 'Failed'),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='stt_trainings'
    )
    module_name = models.CharField(max_length=255, null=True, blank=True)
    model_name = models.CharField(max_length=255)
    
    # Change release_version to CASCADE
    release_version = models.ForeignKey(
        STTTrainingVersions, 
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

