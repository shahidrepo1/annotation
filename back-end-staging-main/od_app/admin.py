from django.contrib import admin
from .models import MediaFile, KnownLabel, ProcessedImage, ODTrainingVersions, ODTrainingProgress
# Register your models here.


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin): 
    list_display = ('id', 'name', 'media_type', 'module_name', 'uploaded_at', 'is_annotated')
    search_fields = ('name', 'module_name')
    list_filter = ('media_type', 'is_annotated')

@admin.register(KnownLabel)
class KnownLabelAdmin(admin.ModelAdmin):
    list_display = ('id', 'label_name', 'user_email')
    search_fields = ('label_name', 'user_email')
    list_filter = ('user_email',)

@admin.register(ProcessedImage)
class ProcessedImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'media_file', 'processed_image', 'label', 'x', 'y', 'width', 'height', 'is_edited', 'is_deleted', 'created_at')
    search_fields = ('media_file__name', 'label__label_name')
    list_filter = ('is_edited', 'is_deleted')

@admin.register(ODTrainingVersions)
class ODTrainingVersionsAdmin(admin.ModelAdmin):
    list_display = ('id', 'version_name', 'version_module', 'created_at')
    search_fields = ('version_name', 'version_module')
    list_filter = ('created_at',)

@admin.register(ODTrainingProgress)
class ODTrainingProgressAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'module_name', 'model_name', 'release_version', 'epoch', 'total_epochs', 'f1_score', 'status')
    search_fields = ('user__email', 'module_name', 'model_name')
    list_filter = ('status', 'created_at')
    raw_id_fields = ('release_version',)

