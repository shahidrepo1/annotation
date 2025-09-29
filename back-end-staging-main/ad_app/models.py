from django.db import models

from annotation_project import settings

# Create your models here.

class MediaFile(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='ad_media/',max_length=225)  # Store media files in 'ad_media/' directory
    media_type = models.CharField(max_length=10, choices=[('audio', 'Audio'), ('video', 'Video')])
    module_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_annotated = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.media_type}) - {self.module_name}"

class AdChunk(models.Model):
    """Model to store advertisement segments with timestamps"""
    
    DATA_TYPE_CHOICES = [
        ("audio", "Audio"),
        ("video", "Video"),
        ("audiovideo", "Audio+Video")
    ]

    media_file = models.ForeignKey(MediaFile, on_delete=models.CASCADE, related_name="ad_segments")
    label = models.CharField(max_length=255)    
    start_time = models.FloatField()  # Start time in seconds
    end_time = models.FloatField()    # End time in seconds
    created_at = models.DateTimeField(auto_now_add=True)
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    module_name = models.CharField(max_length=255)
    frame = models.CharField(max_length=300, null=True, blank=True)

    # ✅ NEW FIELD to separate Audio/Video/Audio+Video
    data_type = models.CharField(
        max_length=20,
        choices=DATA_TYPE_CHOICES,
        default="audio"
    )

    class Meta:
        ordering = ['start_time']

    def __str__(self):
        return f"{self.label} ({self.start_time}-{self.end_time}s) in {self.media_file.name}"
    

class KnownAdLabel(models.Model):
    """Model to store known advertisement labels"""
    label_name = models.CharField(max_length=255, unique=True)
    user_email = models.EmailField(null=True, blank=True)

    def __str__(self):
        return self.label_name
    

class AdTrainingVersions(models.Model):
    version_name = models.CharField(max_length=255)
    version_module = models.CharField(max_length=255)
    version_segments = models.JSONField(null=True, blank=True)  # Store segment IDs
    version_labels = models.JSONField(null=True, blank=True)    # Store label IDs
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.version_name

class AdTrainingProgress(models.Model):
    STATUS_CHOICES = [
    ('training', 'Training'),     
    ('completed', 'Completed'),
    ('failed', 'Failed'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    module_name = models.CharField(max_length=255)
    model_name = models.CharField(max_length=255)
    release_version = models.ForeignKey(AdTrainingVersions, on_delete=models.CASCADE)
    epoch = models.IntegerField(null=True, blank=True)
    total_epochs = models.IntegerField(null=True, blank=True)
    f1_score = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='training')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.model_name} - {self.user} - {self.release_version}"
        
        
