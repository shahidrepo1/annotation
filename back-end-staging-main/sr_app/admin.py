from django.contrib import admin
from .models import (AudioFile,
                    AudioChunks,
                      KnownLabel,
                        TrainingProgress,
                          TrainingVersions)


admin.site.register(TrainingVersions)
@admin.register(AudioFile)
class AudioFileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'file', 'module_name', 'uploaded_at', 'is_annotated')
    search_fields = ('name',)
    ordering = ('-uploaded_at',)


@admin.register(AudioChunks)
class AudioChunksAdmin(admin.ModelAdmin):
    list_display = ('id', 'audio_file','created_at', 'audio_chunks_name', 'speaker', 'is_edited', 'is_deleted')
    search_fields = ('speaker', 'audio_file__name')
    list_filter = ('speaker',)


@admin.register(KnownLabel)
class KnownLabelAdmin(admin.ModelAdmin):
    list_display = ('label_name',)  
    search_fields = ('label_name',)  
    ordering = ('label_name',) 

@admin.register(TrainingProgress)
class TrainingProgressAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'module_name', 'release_version','model_name','epoch', 'total_epochs', 'f1_score', 'status', 'created_at')   