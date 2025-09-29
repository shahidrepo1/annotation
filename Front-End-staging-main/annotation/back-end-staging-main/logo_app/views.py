# views.py
import os
from collections import defaultdict
from time import localtime
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from logo_app.utils import create_version, generate_pascal_voc_xml, process_video_to_images, send_zip_to_logo_training_api
from logo_app.utils import create_logo_training_progress
from .models import ImageDetail, Label, LogoKnownLabel, LogoTrainingProgress, LogoTrainingVersions
from .serializers import ImageDetailSerializer, LogoKnownLabelSerializer
from rest_framework.permissions import IsAuthenticated 
from rest_framework.decorators import permission_classes , authentication_classes
from rest_framework import status
from rest_framework.response import Response
from .serializers import ImageDetailWithLabelsSerializer
from django.db.models.functions import TruncDate
from .authentication import LogoAPIKeyAuthentication



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_image(request):
    uploaded_file = request.FILES.get('image')
    module_name = request.data.get('moduleName')
    print('module_name', module_name)
    if not uploaded_file:
        return Response({"error": "No file provided"}, status=400)

    file_ext = os.path.splitext(uploaded_file.name)[-1].lower()

    # Handle video upload
    if file_ext in ['.mp4', '.avi', '.mov', '.mkv']:
        print('Processing as video...')
        snapshots = process_video_to_images(uploaded_file, request.user, module_name)
        return Response(snapshots, status=201)
    
    # Handle image upload
    elif file_ext in ['.jpg', '.jpeg', '.png', '.bmp', '.gif']:
        print('Processing as image...',request.data)

        serializer = ImageDetailSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            print('Image serializer is valid',serializer.validated_data)
            serializer.save()
            return Response([serializer.data], status=201)
        return Response(serializer.errors, status=400)

    else:
        return Response({"error": "Unsupported file format"}, status=400)

@api_view(['POST'])
@parser_classes([JSONParser])
def upload_labels(request):
    data_list = request.data

    if not isinstance(data_list, list):
        return Response({'error': 'Expected a list of image label data'}, status=400)

    for item in data_list:
        image_id = item.get('id')
        if not image_id:
            return Response({'error': 'Each item must include an "id"'}, status=400)

        image = get_object_or_404(ImageDetail, id=image_id)

        labels_data = item.get('labels', [])
        if not isinstance(labels_data, list):
            return Response({'error': f'Labels for image ID {image_id} must be a list'}, status=400)

        for label in labels_data:
            Label.objects.create(
                image=image,
                name=label['name'],
                x=label['x'],
                y=label['y'],
                width=label['width'],
                height=label['height']
            )

        image.is_annotated = True
        image.save()

    return Response({'message': 'Labels saved successfully for all images.'}, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_label(request):
    serializer = LogoKnownLabelSerializer(data=request.data)

    if serializer.is_valid():
        LogoKnownLabel.objects.create(
            label_name=serializer.validated_data['label_name'],
            user_email=request.user.email
        )
        return Response({'message': 'Label saved successfully.'}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_label(request):
    labels = LogoKnownLabel.objects.values_list('label_name', flat=True)
    return Response(list(labels), status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_annotated_images(request):
    # Filter images by the logged-in user and group by date
    annotated_images = ImageDetail.objects.filter(
        user=request.user,
        # is_annotated=True
    ).annotate(
        date=TruncDate('uploaded_at')
    ).order_by('-uploaded_at')

    grouped = defaultdict(list)

    for image in annotated_images:
        data = ImageDetailWithLabelsSerializer(image, context={'request': request}).data
        grouped[str(image.date)].append(data)

    response_data = [
        {
            "date": date,
            "images": images
        } for date, images in grouped.items()
    ]

    return Response(response_data)

from django.conf import settings
from PIL import Image
import os, zipfile, requests
from django.db.models import Q
from django.db.models import Prefetch


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def train_logo(request):
    module_name = request.data.get("moduleName")
    for_train = request.data.get("forTrain", [])
    for_untrain = request.data.get('forUntrain', [])

    user = request.user
    print(f'Fortrain {for_train} and for untrain {for_untrain}')



    zip_output_dir = os.path.join(settings.MEDIA_ROOT, "training_zips")
    os.makedirs(zip_output_dir, exist_ok=True)
    zip_path = os.path.join(zip_output_dir, f"{module_name}_logo_train_data.zip")

    # Step 2: Filter images
    for_train_set = set(for_train)
    for_untrain_set = set(for_untrain)
    print(f'for_train_set {for_train_set} and for for_untrain_set {for_untrain_set}')

    if for_untrain_set:
        images_to_include = ImageDetail.objects.filter(
            Q(id__in=for_train_set) |
            (Q(is_trained=True) & ~Q(id__in=for_untrain_set) ) & ~Q(is_untrained=True )
        )
        version_trained_id = [img.id for img in images_to_include]

    else:
        images_to_include = ImageDetail.objects.filter(id__in=for_train_set)
        version_trained_id = [img.id for img in images_to_include]

    print(f"[DEBUG] Final queryset count: {images_to_include.count()}")
    print(f"[DEBUG] Image IDs: {version_trained_id}")
    
    # Step 1: Create version and training progress
    if for_untrain:
        for_train = for_train + version_trained_id
        print('If untrain is available', version_trained_id)
    new_version = create_version(module_name, version_trained_id)
    training_id = create_logo_training_progress(
        user=user,
        module_name=module_name,
        version_name=new_version,
    )

    # Step 3: Create zip with Pascal VOC structure
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for image_obj in images_to_include:
            try:
                image_path = image_obj.image.path
                image_name = os.path.basename(image_path)

                with Image.open(image_path) as img:
                    width, height = img.size

                dataset_image_path = f"dataset1/{image_name}"
                zipf.write(image_path, arcname=dataset_image_path)

                labels = image_obj.labels.all()
                xml_str = generate_pascal_voc_xml(image_name, width, height, labels)
                xml_filename = os.path.splitext(image_name)[0] + ".xml"
                xml_file_path = os.path.join(zip_output_dir, xml_filename)

                with open(xml_file_path, 'w', encoding='utf-8') as f:
                    f.write(xml_str)

                zipf.write(xml_file_path, arcname=f"dataset1/{xml_filename}")
                os.remove(xml_file_path)

            except Exception as e:
                print(f"[User {user.id}] Error with image ID {image_obj.id}: {e}")
                continue

    api_result = send_zip_to_logo_training_api(zip_path, training_id, zip_output_dir)
    if api_result["status"] == False:
        return Response({
                "message": "Training ZIP created, but failed to send to AI API.",
                "error": api_result["message"],
                "zip_path": f"{settings.MEDIA_URL}training_zips/{os.path.basename(zip_path)}",
                "training_id": training_id
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Step 4: Mark images in for_untrain as untrained
    ImageDetail.objects.filter(id__in=for_untrain_set).update(is_untrained=True)
    ImageDetail.objects.filter(id__in=for_train).update(is_trained=True)

    # Final response (no file returned)
    return Response({
        "message": "Training ZIP created and saved successfully.",
        "zip_path": f"{settings.MEDIA_URL}training_zips/{os.path.basename(zip_path)}",
        "training_id": training_id
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_logo_data(request):
    results = []

    versions = LogoTrainingVersions.objects.prefetch_related(
        Prefetch(
            'logotrainingprogress_set',
            queryset=LogoTrainingProgress.objects.select_related('user')
        )
    )

    for version in versions:
        for progress in version.logotrainingprogress_set.all():
            trained_images_data = []

            image_ids = version.version_image_id or []
            images = ImageDetail.objects.filter(id__in=image_ids).prefetch_related('labels')

            for image in images:
                image_data = {
                    "image_id": image.id,
                    "image_name": image.image.name.split('/')[-1] if image.image else None,
                    "image_url": request.build_absolute_uri(image.image.url) if image.image else None,
                    "is_trained": image.is_trained,
                    "is_deleted": image.is_deleted,
                    "is_untrained": image.is_untrained,
                    "uploaded_at": image.uploaded_at.isoformat() if image.uploaded_at else None,
                    "labels": [
                        {
                            "label_id": label.id,
                            "name": label.name,
                            "x": label.x,
                            "y": label.y,
                            "width": label.width,
                            "height": label.height
                        }
                        for label in image.labels.all()
                    ]
                }
                trained_images_data.append(image_data)

            progress_dict = {
                "id": progress.id,
                "user": progress.user.id,
                "version": progress.release_version.version_name if progress.release_version else None,
                "module_name": progress.module_name,
                "model_name": progress.model_name,
                "epoch": progress.epoch,
                "total_epochs": progress.total_epochs,
                "f1_score": progress.f1_score,
                "status": progress.status,
                "created_at": progress.created_at.isoformat(),
                "trainedData": trained_images_data
            }

            results.append(progress_dict)

    return Response(results)




@api_view(['POST'])
@authentication_classes([LogoAPIKeyAuthentication])  # Enforce API Key Authentication
def updatelogotrainingprogress(request):
    # Extract the ID of the TrainingProgress object to update
        training_progress_id = request.data.get("id")
        file_names = request.data.get('file_ids', [])
        print('The id i got', file_names)
        # Validate required fields
        if not training_progress_id:
            return Response({"error": "Training Progress ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Look up the existing TrainingProgress object
            training_progress = LogoTrainingProgress.objects.get(id=training_progress_id)

            # Update only the fields passed in the request
            if 'epoch' in request.data:
                training_progress.epoch = request.data.get("epoch")
            if 'model_name' in request.data:
                training_progress.model_name = request.data.get("model_name")
            if 'total_epochs' in request.data:
                training_progress.total_epochs = request.data.get("total_epochs")
            if 'f1_score' in request.data:
                training_progress.f1_score = request.data.get("f1_score")
            if 'status' in request.data:
                training_progress.status = request.data.get("status")
                if request.data.get("status") == True:
                    for file_name in file_names:
                        print('File name ', file_name)

                    print("File names are updated")
            training_progress.save()

            return Response({"message": "Training progress updated successfully."}, status=status.HTTP_200_OK)

        except LogoTrainingProgress.DoesNotExist:
            return Response({"error": "Training progress not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"message": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
