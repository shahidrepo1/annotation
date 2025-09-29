from django.db import models
from django.conf import settings
from annotation_project import settings


class MediaFile(models.Model):
    MEDIA_TYPE_CHOICES = (
        ('image', 'Image'),
        ('video', 'Video'),
    )
    
    name = models.CharField(max_length=255)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    media_file = models.FileField(upload_to='fr_media/', max_length=225)  # Store media files in 'fr_media/' directory
    module_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_annotated = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.media_type}) - {self.module_name}"

    

class ProcessedImage(models.Model):
    media_file = models.ForeignKey(MediaFile, on_delete=models.CASCADE, related_name="processed_images" , null=True , blank=True)
    processed_image = models.ImageField(upload_to='processed_images/', max_length=300, default="image")  # Store processed images
    label = models.CharField(max_length=255, null=True, blank=True)
    module_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_edited = models.BooleanField(default=False)  # Field to track edits
    is_deleted = models.BooleanField(default=False, null=True, blank=True)  # Field to track edits

    def __str__(self):
        return f"Processed {self.media_file.name} - {self.module_name}"
    
    
class KnownLabel(models.Model):
    user_email = models.EmailField(null=True, blank=True)  # Store the user's email
    label_name = models.CharField(max_length=255, unique=True, help_text="Name of the label")
    
    def __str__(self):
        return self.label_name


class FRTrainingVersions(models.Model):
    version_name = models.CharField(max_length=255, null=True, blank=True)
    version_module = models.CharField(max_length=255, null=True, blank=True)
    version_images_id = models.JSONField(null=True, blank=True)  # IDs of ImageFiles or ProcessedImages
    version_labels = models.JSONField(null=True, blank=True)     # Store person labels
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.version_name


class FRTrainingProgress(models.Model):
    STATUS_CHOICES = [
    ('training', 'Training'),     
    ('completed', 'Completed'),
    ('failed', 'Failed'),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='fr_trainings'
    )
    module_name = models.CharField(max_length=255, null=True, blank=True)
    model_name = models.CharField(max_length=255)

    release_version = models.ForeignKey(
        FRTrainingVersions,
        on_delete=models.CASCADE,
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

