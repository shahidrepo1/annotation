from django.urls import path
from .views import (GetTrainingProgressByIdAPI, UploadFileView,
                    ProcessAudioChunksView,
                    AudioChunksListView, 
                    AudioChunksBySpeakerView,
                    KnownLabelList,
                    UpdateSpeakerFolderView,
                    AddLabelView,
                    GetAudioChunksView,
                    AudioChunksView,
                    UpdateTrainingProgressAPI,
                    GetTrainingProgressAPI,
                    DoAudioChunkAnnotationView,
                    DeleteChunksView,
                    ZipAndCreateTrainingProgressAPI,
                    TrainingProgressByVersion,
                    AudioChunksViewTest
                    )

urlpatterns = [
    path('api/audio/upload/', UploadFileView.as_view(), name='upload-audio'),
    path('api/audio/process/', ProcessAudioChunksView.as_view(), name='process-audio-chunks'),
    path('api/audio-chunks/', AudioChunksListView.as_view(), name='audio_chunks_list'),
    path('api/audio_chunks/<str:speaker_name>/', AudioChunksBySpeakerView.as_view(), name='audio-chunks-by-speaker'),
    path('api/labels/', KnownLabelList.as_view(), name='get_all_labels'),
    path('api/speaker/update/', UpdateSpeakerFolderView.as_view(), name='update-speaker-folder'),
    path('api/labels/add/', AddLabelView.as_view(), name='add-label'),
    path('api/get-audio-chunks/', GetAudioChunksView.as_view(), name='get_audio_chunks'),
    path('api/get_all_audio-chunks/', AudioChunksView.as_view(), name='audio_chunks_view'),
    path('api/do-annotate/', DoAudioChunkAnnotationView.as_view(), name='audio_chunks_annotation_view'),
    path('api/delete-chunk/', DeleteChunksView.as_view(), name='delete_audio_chunks_view'),
    

    path('api/update-training-progress/', UpdateTrainingProgressAPI.as_view(), name='update_training_progress_api'),
    path('api/get-training-progress/', GetTrainingProgressAPI.as_view(), name='get_training_progress_api'),

    path('api/training-progress/<int:id>/', GetTrainingProgressByIdAPI.as_view(), name='get_training_progress_by_id'),
    path('api/train-model/', ZipAndCreateTrainingProgressAPI.as_view(), name='training_model'),
    path('api/get_train-model/', TrainingProgressByVersion.as_view(), name='versions')

]
