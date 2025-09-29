from django.contrib import admin
from stt_app.models import (ProcessedChunk, 
                            STTTrainingVersions,
                            STTTrainingProgress
                        )


@admin.register(ProcessedChunk)
class ProcessedChunkAdmin(admin.ModelAdmin):
    list_display = ('id', 'uploaded_file','chunk_name', 'transcription', 'created_at', 'is_edited', 'is_deleted', 'is_trained')
   
from django.contrib import admin
from .models import STTTrainingVersions, STTTrainingProgress

@admin.register(STTTrainingVersions)
class STTTrainingVersionsAdmin(admin.ModelAdmin):
    list_display = ('version_name', 'version_module', 'created_at')

@admin.register(STTTrainingProgress)
class STTTrainingProgressAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'module_name', 'model_name', 'release_version', 'status', 'created_at')
