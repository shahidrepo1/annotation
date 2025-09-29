# models.py
from django.db import models
# models.py
from django.conf import settings

class ImageDetail(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,  # Allow NULL in database
        blank=True  # Allow empty in forms
    )
    image = models.ImageField(upload_to='logo_images/', max_length=300, default="image")  # Store images in 'logo_images/' directory
    module_name = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    is_annotated = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    is_trained = models.BooleanField(default=False)
    is_untrained = models.BooleanField(default=False)
    def save(self, *args, **kwargs):
        if not self.user_id:  # Auto-set user if missing
            from django.contrib.auth import get_user
            self.user = get_user(self._state.db)
        super().save(*args, **kwargs)

class Label(models.Model):
    image = models.ForeignKey(ImageDetail, related_name='labels', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    x = models.FloatField()
    y = models.FloatField()
    width = models.FloatField()
    height = models.FloatField()
    
    def __str__(self):
        return f"{self.name} (Image ID: {self.image.id})"


class LogoKnownLabel(models.Model):
    user_email = models.EmailField(null=True, blank=True)  # Store the user's email
    label_name = models.CharField(max_length=255, unique=True, help_text="Name of the label")
    
    def __str__(self):
        return self.label_name

   
class LogoTrainingVersions(models.Model):
    version_name = models.CharField(max_length=255, null=True, blank=True)
    version_module = models.CharField(max_length=255, null=True, blank=True)
    version_image_id = models.JSONField(null=True, blank=True)  
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for versioning

    def __str__(self):
        return self.version_name
    

class LogoTrainingProgress(models.Model):
    STATUS_CHOICES = [
    ('training', 'Training'),     
    ('completed', 'Completed'),
    ('failed', 'Failed'),
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='logo_trainings'
    )
    module_name = models.CharField(max_length=255, null=True, blank=True)
    model_name = models.CharField(max_length=255)
    
    # Change release_version to CASCADE
    release_version = models.ForeignKey(
        LogoTrainingVersions, 
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

