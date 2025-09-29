# serializers.py
import base64
from rest_framework import serializers
from .models import ImageDetail, Label, LogoKnownLabel

class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ['name', 'x', 'y', 'width', 'height']

class ImageDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageDetail
        fields = ['id','image','module_name','uploaded_at', 'is_annotated']  
    
    def create(self, validated_data):

        user = self.context['request'].user
        if not user.is_authenticated:
            raise serializers.ValidationError("Authentication required")
        return ImageDetail.objects.create(user=user, **validated_data)
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Always return just the path for 'image'
        if rep.get('image'):
            rep['image'] = instance.image.name and f"/media/{instance.image.name}" or ""
        return rep
    
class ImageDetailWithLabelsSerializer(serializers.ModelSerializer):
    labels = LabelSerializer(many=True, read_only=True)

    class Meta:
        model = ImageDetail
        fields = '__all__'  # This will include all fields from the model + 'labels'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if rep.get('image'):
            rep['image'] = instance.image.name and f"/media/{instance.image.name}" or ""
        return rep


class LogoKnownLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogoKnownLabel
        fields = ['label_name']

    def validate_label_name(self, value):
        value = value.strip().title()  # Capitalize each word
        if LogoKnownLabel.objects.filter(label_name__iexact=value).exists():
            raise serializers.ValidationError("This label already exists.")
        return value
    
