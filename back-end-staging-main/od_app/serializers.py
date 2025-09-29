from .models import MediaFile, KnownLabel, ProcessedImage
from rest_framework import serializers


class MediaFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaFile
        fields = ['id', 'name', 'media_type', 'media_file', 'module_name', 'uploaded_at', 'is_annotated']
        read_only_fields = ['id', 'uploaded_at']

class KnownLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnownLabel
        fields = ['id', 'label_name', 'user_email']
        read_only_fields = ['id']  

class ProcessedImageSerializer(serializers.ModelSerializer):
    label = KnownLabelSerializer(read_only=True)
    class Meta:
        model = ProcessedImage
        fields = ['id', 'media_file', 'processed_image', 'label', 'x', 'y', 'width', 'height','coverage_time' ,'end_time','start_time','confidence','is_edited', 'is_deleted', 'created_at']
        read_only_fields = ['id', 'created_at']