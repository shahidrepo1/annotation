from django.db import models

from annotation_project import settings

# Create your models here.
class MediaFile(models.Model):
    MEDIA_TYPE_CHOICES = (
        ('image', 'Image'),
        ('video', 'Video'),
    )
    name = models.CharField(max_length=255)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    media_file = models.FileField(upload_to='tf_media/',max_length=225)  # Store media files in 'tf_media/' directory
    module_name = models.CharField(max_length=50, blank=True, null=True)  # Optional
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_annotated = models.BooleanField(default=False)  
    def __str__(self):
        return f"{self.name} ({self.media_type}) - {self.module_name or 'N/A'}"
    

class KnownLabel(models.Model):
    id = models.AutoField(primary_key=True)
    user_email = models.EmailField(null=True, blank=True)  # Store the user's email
    label_name = models.CharField(max_length=255, unique=True, help_text="Name of the label")
    
    def __str__(self):
        return self.label_name


class ProcessedImage(models.Model):
    media_file = models.ForeignKey(MediaFile, on_delete=models.CASCADE, related_name="processed_images")
    processed_image = models.CharField(max_length=300 , default= "image")
    label = models.ForeignKey(KnownLabel, on_delete=models.SET_NULL, null=True, blank=True)
    x = models.FloatField()
    y = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()
    is_edited = models.BooleanField(default=False)  # True if user updated anything
    is_deleted = models.BooleanField(default=False, null=True, blank=True)  # True if user deleted the image
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.label.label_name if self.label else 'Unknown'} - Edited: {self.is_edited}"


class TFTrainingVersions(models.Model):
    version_name = models.CharField(max_length=255, null=True, blank=True)
    version_module = models.CharField(max_length=255, null=True, blank=True)
    version_images_id = models.JSONField(null=True, blank=True)  # IDs of ProcessedImage
    version_labels = models.JSONField(null=True, blank=True)     # Label names like 'Top Ticker'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.version_name or f"Version {self.id}"


class TFTrainingProgress(models.Model):
    STATUS_CHOICES = [
        ('training', 'Training'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='tf_trainings')
    module_name = models.CharField(max_length=255, null=True, blank=True)
    model_name = models.CharField(max_length=255)
    release_version = models.ForeignKey(TFTrainingVersions,on_delete=models.CASCADE,null=True,blank=True)
    epoch = models.IntegerField(null=True, blank=True)
    total_epochs = models.IntegerField(null=True, blank=True)
    f1_score = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='training')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.model_name} - {self.user} - {self.release_version.version_name if self.release_version else 'N/A'}"
