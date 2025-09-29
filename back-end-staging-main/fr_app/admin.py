from django.contrib import admin
from .models import  ProcessedImage , KnownLabel , MediaFile , FRTrainingVersions, FRTrainingProgress
# Register your models here.

# @admin.register(ImageFile)
# class ImageFileAdmin(admin.ModelAdmin):
#     list_display = ('id', 'name', 'image_file', 'module_name', 'uploaded_at')
    

@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name' , 'media_type' , 'media_file' , 'module_name', 'uploaded_at' , 'is_annotated' )
    


@admin.register(ProcessedImage)
class ProcessedImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'media_file', 'processed_image', 'label', 'module_name', 'created_at', 'is_edited', 'is_deleted')
    search_fields = ('label',)
    ordering = ('-created_at',)


@admin.register(KnownLabel)
class KnownLabelAdmin(admin.ModelAdmin):
    list_display = ('id' , 'label_name' , 'user_email')
    search_fields = ('label_name',)

@admin.register(FRTrainingVersions)
class FRTrainingVersionsAdmin(admin.ModelAdmin):
    list_display = ('id', 'version_name', 'version_module', 'created_at')
    search_fields = ('version_name', 'version_module')
    ordering = ('-created_at',)

@admin.register(FRTrainingProgress)
class FRTrainingProgressAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'module_name', 'model_name','status' , 'release_version', 'epoch', 'total_epochs', 'f1_score','created_at')
    search_fields = ('user__email', 'module_name', 'model_name')
    ordering = ('-created_at',)
    list_filter = ('module_name', 'release_version')