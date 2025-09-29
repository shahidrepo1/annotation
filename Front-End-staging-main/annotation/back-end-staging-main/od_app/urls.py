
from django.urls import path
from .views import (ProcessMediaView,DeleteProcessedImage,
   KnownLabelListView,UpdateProcessedImageView,GetProcessedImagesView, 
   ZipAndCreateODTrainingProgressAPI,GetODTrainingProgressAPI,
   UpdateODTrainingProgressAPI
    )

urlpatterns = [
    path("process/", ProcessMediaView.as_view(), name="process_image_view"),
    path("delete-processed-image/<int:image_id>/", DeleteProcessedImage.as_view(), name="delete-processed-image"),
    path("label-list/",KnownLabelListView.as_view(), name = "label-list"),
    path("update-processed-image/", UpdateProcessedImageView.as_view(), name = "update-processed-image"),
    path("get-all-processed-images/", GetProcessedImagesView.as_view(), name="get-all-processed-images"),
    path("train/", ZipAndCreateODTrainingProgressAPI.as_view(),name="train"),
    path("get-training-progress/", GetODTrainingProgressAPI.as_view(), name="get-fr-training-progress"),
    path('update-training-progress/',UpdateODTrainingProgressAPI.as_view(), name='update-training-progress-api'),
]