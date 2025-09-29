from django.contrib import admin
from .models import MediaFile, KnownLabel, ProcessedImage, TFTrainingProgress, TFTrainingVersions
# Register your models here.


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ('name', 'media_type', 'module_name', 'uploaded_at', 'is_annotated')
    search_fields = ('name', 'module_name')
    list_filter = ('media_type', 'is_annotated')
    ordering = ('-uploaded_at',)

@admin.register(KnownLabel)
class KnownLabelAdmin(admin.ModelAdmin):    
    list_display = ('id','label_name', 'user_email')
    search_fields = ('label_name', 'user_email')
    ordering = ('id',)


@admin.register(ProcessedImage)
class ProcessedImageAdmin(admin.ModelAdmin):    
    list_display = ('id','media_file', 'label', 'x', 'y', 'width', 'height', 'is_edited', 'is_deleted', 'created_at')
    search_fields = ('media_file__name', 'label__label_name')
    list_filter = ('is_edited', 'is_deleted')
    ordering = ('-created_at',)

@admin.register(TFTrainingVersions)
class TFTrainingVersionsAdmin(admin.ModelAdmin):
    list_display = ('id','version_name', 'version_module', 'created_at')
    search_fields = ('version_name', 'version_module')
    ordering = ('-created_at',)

@admin.register(TFTrainingProgress)
class TFTrainingProgressAdmin(admin.ModelAdmin):
    list_display = ('id','user','status', 'created_at', 'model_name','module_name','release_version','epoch', 'status','total_epochs' , 'f1_score',)
    search_fields = ('status',)
    ordering = ('-created_at',)
    list_filter = ('status',)