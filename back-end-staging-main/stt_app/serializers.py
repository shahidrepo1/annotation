from rest_framework import serializers
from .models import ProcessedChunk, STTTrainingProgress
from rest_framework import serializers
from .models import ProcessedChunk

class ProcessedChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessedChunk
        fields = "__all__"


class STTTrainingProgressSerializer(serializers.ModelSerializer):
    version_name = serializers.CharField(source='release_version.version_name', read_only=True)
    trainedData = serializers.SerializerMethodField()

    class Meta:
        model = STTTrainingProgress
        fields = [
            'id',
            'version_name',
            'user',
            'module_name',
            'model_name',
            'epoch',
            'total_epochs',
            'f1_score',
            'status',
            'created_at',
            'trainedData',
        ]

    def get_trainedData(self, obj):
        version = obj.release_version
        if not version or not version.version_audio_id:
            return []

        audio_ids = version.version_audio_id
        valid_ids = [i for i in audio_ids if isinstance(i, int)]

        chunks = ProcessedChunk.objects.filter(id__in=valid_ids)
        return [
            {
                "id":chunk.id,
                "audio": chunk.chunk_name,
                "transcription": chunk.transcription or ""
            }
            for chunk in chunks
        ]