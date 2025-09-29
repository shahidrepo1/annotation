from rest_framework import serializers
from .models import FRTrainingVersions, ProcessedImage , KnownLabel , FRTrainingProgress




class ProcessedImageSerializer(serializers.ModelSerializer):

    class Meta:
        model= ProcessedImage
        fields = ['id', 'media_file', 'processed_image', 'label', 'module_name', 'created_at', 'is_edited', 'is_deleted']

    
class FRTrainingProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = FRTrainingProgress
        fields = [ 'user', 'module_name', 'model_name', 'release_version', 'epoch', 'total_epochs', 'f1_score', 'status', 'created_at']
        read_only_fields = ['created_at']

class KnownLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnownLabel
        fields = ['id', 'user_email', 'label_name']


class FRTrainingVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FRTrainingVersions
        fields = '__all__'

