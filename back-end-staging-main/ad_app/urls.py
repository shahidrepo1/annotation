from django.urls import path
from .views import (AddKnownLabelView, DeleteAdChunkView, GetAudioAdSegmentsAPI,
                    GetAdTrainingProgressAPI, GetAudioVideoAdSegmentsAPI, GetKnownLabelsView, GetVideoAdSegmentsAPI, ProcessVideoAudioView,
                    ProcessVideoView, ProcessAudioView, UpdateADTrainingProgressAPI,
                    ZipAndCreateVideoADTrainingProgressAPI, UpdateAdChunkView,
                    ZipAndCreateAudioADTrainingProgressAPI,ZipAndCreateAudioVideoADTrainingProgressAPI)



urlpatterns = [
# Process Media URLs
    path('process-video/', ProcessVideoView.as_view(), name="process-video"),
    path('process-audio/', ProcessAudioView.as_view(), name="process-audio"),
    path('add-label/', AddKnownLabelView.as_view(), name="add-label"),
    path('labels/', GetKnownLabelsView.as_view(), name="get-labels"),
    path('train-video/', ZipAndCreateVideoADTrainingProgressAPI.as_view(), name='train-video'),
    path('train-audio/',ZipAndCreateAudioADTrainingProgressAPI.as_view() , name ='train-audio'),
    path('train-audio-video/',ZipAndCreateAudioVideoADTrainingProgressAPI.as_view() , name ='train-audio-video'), 
    path('update-chunks/', UpdateAdChunkView.as_view(), name='update-ad-chunks'),
    path('delete-chunk/<int:chunk_id>/', DeleteAdChunkView.as_view(), name='delete-ad-chunk'),
    # Get Processed Data URLs
    path('video/segments/', GetVideoAdSegmentsAPI.as_view(), name="get-ad-segments"),
    path('audio/segments/', GetAudioAdSegmentsAPI.as_view(), name="get-ad-segments"),
    path('audio-video/segments/', GetAudioVideoAdSegmentsAPI.as_view(), name="get-ad-segments"),
    path('get-training-progress/', GetAdTrainingProgressAPI.as_view(), name='get_ad_training_progress'),
    path('update-training-progress/', UpdateADTrainingProgressAPI.as_view(), name='update-ad-training-progress'),
    path('process-video-audio/', ProcessVideoAudioView.as_view(), name='process-video-audio')
]

