from django.urls import path
from django.http import JsonResponse
from stt_app.views import process_audio_chunks_view
from .views import classify_chunks, train_stt
from .views import (edit_transcription, delete_chunk, 
                    get_chunks_by_date, annotate_audio_chunk, 
                    get_stt_training_progress, updatestttrainingprogress
                    )



urlpatterns = [
    path("process/", process_audio_chunks_view, name="process_audio_chunks_view"),
    path('chunks/edit/', edit_transcription, name='edit_transcription'),
    path('chunks/delete/', delete_chunk, name='delete_chunk'),
    path('classify_chunks/', classify_chunks, name='classify_chunks'),
    path('annotate-audio/', annotate_audio_chunk, name='annotate-audio'),
    path('get-chunks/', get_chunks_by_date, name='get-chunks'),
    path("train_stt/", train_stt, name="train_stt"),
    path('get_stt_training_progress/',get_stt_training_progress, name='get_stt_training_progress' ),
    path('update-stt-training-progress/', updatestttrainingprogress, name='update_stt_training_progress')

] 
