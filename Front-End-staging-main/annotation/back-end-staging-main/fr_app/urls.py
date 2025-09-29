from django.urls import path
from .views import ( FRTrainingProgressByVersion, FRTrainingVersionsByVersionName, GetFRTrainingProgressById, ProcessImageView , DeleteProcessedImage , 
                    GetProcessedImagesView,GetProcessedImageByLabelView,
                    AddKnownLabelView,KnownLabelListView,
                    UpdateProcessedImageView, ZipAndCreateFRTrainingProgressAPI,
                    GetFRTrainingProgressAPI,UpdateTrainingProgressAPI)




urlpatterns = [
    path("process-image/", ProcessImageView.as_view(), name="process_image_view"),
    path("delete-processed-image/<int:image_id>/", DeleteProcessedImage.as_view(), name="delete-processed-image"),
    path("get-processed-image-by-label/<str:label>/", GetProcessedImageByLabelView.as_view(), name="get-processed-image-by-label-view"),
    path("add-label/",AddKnownLabelView.as_view() , name = "add-label"),
    path("label-list/",KnownLabelListView.as_view(), name = "label-list"),
    path("update-processed-image/", UpdateProcessedImageView.as_view(), name = "update-processed-image"),
    path("get-all-prossessed-images/", GetProcessedImagesView.as_view(), name="get-all-processed-images"),
    path("train/", ZipAndCreateFRTrainingProgressAPI.as_view(),name="train"),
    path("get-training-progress/", GetFRTrainingProgressAPI.as_view(), name="get-fr-training-progress"),
    path('processed-images-by-versions/', FRTrainingProgressByVersion.as_view(),name='fr-versions'),
    path('training-progress-by-id/<int:id>/', GetFRTrainingProgressById.as_view(), name='get-fr-training-progress-by-id'),
    path('versions-by-name/',FRTrainingVersionsByVersionName.as_view(),name='training-progress-by-version-name'),
    path('update-training-progress/',UpdateTrainingProgressAPI.as_view(), name='update-training-progress-api'),
]