
from django.urls import path
from .views import (ProcessMediaView,DeleteProcessedImage,
   KnownLabelListView,UpdateProcessedImageView,GetProcessedImagesView,
   ZipAndCreateTFTrainingProgressAPI,GetTFTrainingProgressAPI,
   UpdateTFTrainingProgressAPI
)

urlpatterns = [
    path("process/", ProcessMediaView.as_view(), name="process_image_view"),
    path("delete-processed-image/<int:image_id>/", DeleteProcessedImage.as_view(), name="delete-processed-image"),
    path("label-list/",KnownLabelListView.as_view(), name = "label-list"),
    path("update-processed-image/", UpdateProcessedImageView.as_view(), name = "update-processed-image"),
    path("get-all-processed-images/", GetProcessedImagesView.as_view(), name="get-all-processed-images"),
    path("train/", ZipAndCreateTFTrainingProgressAPI.as_view(),name="train"),
    path("get-training-progress/", GetTFTrainingProgressAPI.as_view(), name="get-fr-training-progress"),
    path('update-training-progress/',UpdateTFTrainingProgressAPI.as_view(), name='update-training-progress-api'),
]