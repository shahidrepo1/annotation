from rest_framework import serializers
from .models import AudioFile, AudioChunks, KnownLabel, TrainingProgress


class AudioFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioFile
        fields = ['id', 'name', 'file', 'uploaded_at']


class AudioChunksSerializer(serializers.ModelSerializer):
    audio_file = AudioFileSerializer()  # Nest AudioFile data
    class Meta:
        model = AudioChunks
        fields = ['id', 'audio_file', 'speaker', 'audio_chunks_name']


class KnownLabelSerializer(serializers.ModelSerializer):
    labelName = serializers.CharField(source='label_name')
    userEmail = serializers.EmailField(source='user_email', allow_blank=True, required=False)  # Field to store user email

    class Meta:
        model = KnownLabel
        fields = ['id', 'labelName', 'userEmail']

    def validate_labelName(self, value):
        # Ensure proper formatting (e.g., "ALi YAr" -> "Ali Yar")
        return value.strip().title()


class AudioChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioChunks
        fields = ["speaker", "audio_chunks_name"]


class AudioFileRequestSerializer(serializers.Serializer):
    fileId = serializers.IntegerField(required=True)


class AudioFileResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    message = serializers.CharField()
    data = serializers.DictField(child=serializers.ListField(child=serializers.CharField()))


class TrainingProgressSerializer(serializers.ModelSerializer):
    version_name = serializers.CharField(source='release_version.version_name', default="Unknown Version")
    version_speakers = serializers.JSONField(source='release_version.version_speakers', default={})

    class Meta:
        model = TrainingProgress
        fields = ['id', 'version_name', 'user', 'module_name', 'model_name', 'epoch', 'total_epochs', 'f1_score', 
                  'status', 'created_at', 'version_speakers']
        

class TrainingProgressSerializerAPIId(serializers.ModelSerializer):
    class Meta:
        model = TrainingProgress
        fields = '__all__'

