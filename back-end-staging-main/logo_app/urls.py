# urls.py
from django.urls import path
from .views import get_annotated_images, get_logo_data, save_label, train_logo, updatelogotrainingprogress, upload_image, upload_labels,get_label

urlpatterns = [
    path('api/upload/', upload_image, name='upload-image'),
    path('api/annotate/', upload_labels, name='upload-labels'),
    path('api/annotated-images/', get_annotated_images, name='annotated-images'),
    path('api/save_label/', save_label, name='save_label'),
    path('api/get_label/', get_label, name='get_label'),
    path("api/train_logo/", train_logo, name="train_logo"),
    path("api/get_chunks/", get_logo_data, name="get_logo_data"),
    path('update-training-progresss/' , updatelogotrainingprogress , name='update_training_progress')

]
