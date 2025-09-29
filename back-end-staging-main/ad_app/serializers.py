from rest_framework import serializers

from annotation_project import settings
from .models import AdChunk, AdTrainingProgress, MediaFile, KnownAdLabel

class MediaFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaFile
        fields = '__all__'

class AdChunkSerializer(serializers.ModelSerializer):
    media_file_url = serializers.SerializerMethodField()

    class Meta:
        model = AdChunk
        fields = ['id', 'media_file', 'media_file_url', 'label','data_type', 
                 'start_time', 'end_time', 'created_at', 'is_edited']

    def get_media_file_url(self, obj):
        if obj.media_file and obj.media_file.file:
            # Return path in FR style format
            return f"/media/{obj.media_file.file.name}"
        return None

            
class KnownAdLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnownAdLabel
        fields = ['id', 'label_name']

class AdTrainingProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdTrainingProgress
        fields = [
            'id', 'user', 'module_name', 'model_name',
            'epoch', 'total_epochs', 'status',
            'created_at', 'release_version'
        ]