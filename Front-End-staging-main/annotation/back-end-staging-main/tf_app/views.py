#======== Standard Library Imports =========
import base64
import mimetypes
import os
import shutil
import threading
import uuid
import zipfile
import requests
#======== Third Party Imports =========
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from rest_framework import status
from venv import logger
from PIL import Image
#======== Local Imports =========
from annotation_project import settings
from tf_app.authentication import APIKeyAuthentication
from tf_app.process_image import extract_video_frame_at_timestamp, get_tf_response, save_media_file
from tf_app.serializers import KnownLabelSerializer, ProcessedImageSerializer
from tf_app.utils import create_tf_training_progress, create_tf_version, generate_pascal_voc_xml, group_by_label
from .models import KnownLabel, ProcessedImage, TFTrainingProgress


class ProcessMediaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            media_file = request.FILES.get('file')
            module_name = request.POST.get('module_name')
            user = request.user

            if not media_file or not module_name:
                return Response({"error": "File and module name are required."}, status=400)

            mimetype, _ = mimetypes.guess_type(media_file.name)
            if mimetype and mimetype.startswith('image'):
                media_type = 'image'
            elif mimetype and mimetype.startswith('video'):
                media_type = 'video'
            else:
                return Response({"error": "File is not supported."}, status=400)

            result = save_media_file(module_name, media_file.name, media_file, media_type)
            print('-------this is result of save media file', result)
            if not result:
                return Response({"error": "Failed to save media file."}, status=500)

            saved_media_file, image_id, module_name = result

            file_path = saved_media_file.media_file.path

            tf_response = get_tf_response(file_path)
            print('-------this is tf response', tf_response)
            if tf_response.get('status_code') != 200:
                return Response({"error": "TF API error", "details": tf_response}, status=500)
            
        
            
            predictions = tf_response.get('response', [])
            print('-------this tf AI response', predictions)
            if not isinstance(predictions, list):
                return Response({"error": "Invalid TF predictions format."}, status=500)

            saved_items = []
            for idx, pred in enumerate(predictions):
                label = pred.get('label', 'Unknown')
                start_time = pred.get('start', 0)
                coordinates = pred.get('coordinates', {})
                
                try:
                    label_obj = KnownLabel.objects.get(label_name=label)
                except KnownLabel.DoesNotExist:
                    label_obj,_ = KnownLabel.objects.get_or_create(label_name="Unknown",id=0)  # Skip this prediction
                
                # Set is_edited True if label is Unknown, else False
                is_edited = label_obj.label_name == "Unknown"
                # Extract frame from video based on start_time if applicable
                if media_type == 'video':
                    frame_name = extract_video_frame_at_timestamp(file_path, float(start_time))

                else:
                    # For image, just use the uploaded file name
                    frame_name = os.path.basename(file_path)
                    

                

                item = ProcessedImage.objects.create(
                    media_file=saved_media_file,
                    processed_image=frame_name,
                    label=label_obj,
                    x=coordinates.get('x', 0),
                    y=coordinates.get('y', 0),
                    width=coordinates.get('width', 0),
                    height=coordinates.get('height', 0),
                    is_edited=is_edited,
                )
                saved_items.append(item)

            serializer = ProcessedImageSerializer(saved_items, many=True)
            return Response({
                "message": f"{len(saved_items)} items processed.",
                "data": serializer.data
            }, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class KnownLabelListView(APIView):
    """
    This view returns all the known labels in the database
    """
    def get(self, request):
        try:
            known_labels = KnownLabel.objects.all()
            serializer = KnownLabelSerializer(known_labels, many=True)
            return Response(serializer.data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        

class UpdateProcessedImageView(APIView):
    """
    Flexible update view for TF processed images.
    Allows updating label and/or coordinates.
    Expects:
    {
      "updates": [
        {"image_id": 1, "label": "Top Ticker", "x": 12, "y": 34, "width": 100, "height": 50},
        {"image_id": 2, "label": "Bottom Ticker"},
        {"image_id": 3, "x": 0, "y": 0, "width": 50, "height": 20}
      ]
    }
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        updates = request.data.get('updates', [])
        user = request.user

        if not updates:
            return Response({"error": "No updates provided."}, status=400)

        updated = []
        for update in updates:
            image_id = update.get('image_id')
            if not image_id:
                continue

            try:
                image = ProcessedImage.objects.get(id=image_id)

                # Update label if provided
                label_name = update.get('label')
                if label_name:
                    try:
                        label_obj = KnownLabel.objects.get(label_name=label_name)
                        image.label = label_obj
                    except KnownLabel.DoesNotExist:
                        return Response({"error": f"Label '{label_name}' does not exist. Please select a valid label."}, status=400)
                # Update coordinates if provided
                for field in ['x', 'y', 'width', 'height']:
                    if field in update:
                        setattr(image, field, update[field])

                image.is_edited = True
                image.save()
                updated.append(ProcessedImageSerializer(image).data)

            except ProcessedImage.DoesNotExist:
                continue

        return Response({
            "message": f"Updated {len(updated)} image(s).",
            "updated_images": updated
        }, status=200)


# This endpoint will get all ProcessedImage data by separations of trained and untrained data
class GetProcessedImagesView(APIView):
    """View to handle both trained and untrained ProcessedImages with filters"""
    
    def get(self, request):
        try:
            # Get query parameters
            trained = request.query_params.get('active', None)  # 'trainedData' or 'UntrainedData'
            label_filter = request.query_params.get('label', None)
            start_date = request.query_params.get('startDate', None)
            end_date = request.query_params.get('endDate', None)

            print(f"\n🔹 Received Parameters: active={trained}, label={label_filter}, startDate={start_date}, endDate={end_date}")

            # Base query with select_related for better performance
            base_query = ProcessedImage.objects.select_related('media_file').filter(is_deleted=False)

            # Apply date filtering if provided
            if start_date and end_date:
                base_query = base_query.filter(created_at__date__range=[start_date, end_date])
            elif start_date:
                base_query = base_query.filter(created_at__date__gte=start_date)
            elif end_date:
                base_query = base_query.filter(created_at__date__lte=end_date)

            # Apply label filtering if provided
            if label_filter:
                base_query = base_query.filter(label__label_name__icontains=label_filter)

            if trained == 'trainedData':
                # Get non-edited (trained) images
                trained_images = base_query.filter(is_edited=False)
                trained_serializer = ProcessedImageSerializer(trained_images, many=True)
                response_data = {
                    "trainedData": group_by_label(trained_serializer.data)
                }
                return Response(response_data, status=200)

            elif trained == 'UntrainedData':
                # Get edited (untrained) images
                untrained_images = base_query.filter(is_edited=True)
                untrained_serializer = ProcessedImageSerializer(untrained_images, many=True)
                response_data = {
                    "untrainedData": group_by_label(untrained_serializer.data)
                }
                return Response(response_data, status=200)

            else:
                # Get both trained and untrained images
                trained_images = base_query.filter(is_edited=False)
                untrained_images = base_query.filter(is_edited=True)

                trained_serializer = ProcessedImageSerializer(trained_images, many=True)
                untrained_serializer = ProcessedImageSerializer(untrained_images, many=True)

                response_data = {
                    "trainedData": group_by_label(trained_serializer.data),
                    "untrainedData": group_by_label(untrained_serializer.data)
                }
                return Response(response_data, status=200)

        except Exception as e:
            print(f'Error in ProcessedImagesView: {str(e)}')
            return Response({"error": str(e)}, status=500)


# To Soft Delete Processed Image   
class DeleteProcessedImage(APIView):
    def delete(self, request, image_id):
        try:
            image_to_delete = ProcessedImage.objects.get(id=image_id)
            if image_to_delete.is_deleted ==True:
                return Response({"message":"File already Deleted"},status=200)
            image_to_delete.is_deleted = True
            image_to_delete.save()
            return Response({"message":"Successfully deleted"}, status=200)
        except ProcessedImage.DoesNotExist:
            return Response({"error": "ProcessedImage not found"}, status=404)
        except Exception as e:
            return Response({"error":str(e)},status=500)
        
class ZipAndCreateTFTrainingProgressAPI(APIView):
    """
    Creates a TF training version, zips ProcessedImages with Pascal VOC format, and sends the zip to AI API.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            module_name = request.data.get("moduleName")
            for_train = request.data.get("forTrain", [])
            for_untrain = request.data.get("forUntrain", [])
            user = request.user
            
            ids_for_version_creation = for_train

            other_all_trained_data_to_include = ProcessedImage.objects.filter(
                is_edited=False, is_deleted=False
            ).values_list("id", flat=True)

            for_train = for_train + list(other_all_trained_data_to_include)       
            
            print(f'these are the all ids for training: {for_train}')
            if not module_name:
                return Response({"error": "moduleName is required"}, status=400)

            zip_output_dir = os.path.join(settings.MEDIA_ROOT, "training_zips")
            os.makedirs(zip_output_dir, exist_ok=True)
            zip_path = os.path.join(zip_output_dir, f"{module_name}_tf_train_data.zip")

            for_train_set = set(for_train)
            for_untrain_set = set(for_untrain)

            if for_untrain_set:
                images_to_include = ProcessedImage.objects.filter(
                    Q(id__in=for_train_set) |
                    (Q(is_edited=False) & ~Q(id__in=for_untrain_set)) & ~Q(is_deleted=True)
                )
                version_trained_id = list(images_to_include.values_list("id", flat=True))
            else:
                images_to_include = ProcessedImage.objects.filter(id__in=for_train_set)
                version_trained_id = list(images_to_include.values_list("id", flat=True))

            unknown_label = KnownLabel.objects.filter(label_name="Unknown").first()
            if unknown_label and images_to_include.filter(label=unknown_label).exists():
                return Response(
                        {"error": "Training cannot proceed: Some images are labeled as 'Unknown'. Please annotate all images before training."},
                            status=400
                                )
                
            if for_untrain:
                for_train = for_train + version_trained_id
            label_ids = list(
                images_to_include.filter(label__isnull=False)
                .values_list("label_id", flat=True)
                .distinct()
            )
            version = create_tf_version(module_name, label_ids,ids_for_version_creation)
            training_id = create_tf_training_progress(user=user, module_name=module_name, version=version)

            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for image_obj in images_to_include:
                    try:
                        # Try both possible locations
                        possible_paths = [
                            os.path.join(settings.MEDIA_ROOT, image_obj.processed_image),
                            os.path.join(settings.MEDIA_ROOT, 'tf_media', image_obj.processed_image),
                            os.path.join(settings.MEDIA_ROOT, 'tf_media', 'images', image_obj.processed_image)
                        ]
                        image_path = next((p for p in possible_paths if os.path.exists(p)), None)
                        if not image_path:
                            print(f"[User {user.id}] Image file not found for image ID {image_obj.id}: {image_obj.processed_image}")
                            continue

                        image_name = os.path.splitext(os.path.basename(image_path))[0] + os.path.splitext(image_path)[1].lower()
                        with Image.open(image_path) as img:
                            width, height = img.size

                        dataset_image_path = f"dataset1/{image_name}"
                        zipf.write(image_path, arcname=dataset_image_path)
                        print(f"Checking image: {image_obj.id}, label: {image_obj.label}")

                        if image_obj.label:
                            xml_str = generate_pascal_voc_xml(
                                image_name,
                                width,
                                height,
                                [{
                                    "id": image_obj.label.id,
                                    "label": image_obj.label.label_name,
                                    "x": image_obj.x,
                                    "y": image_obj.y,
                                    "width": image_obj.width,
                                    "height": image_obj.height
                                }]
                            )
                            print('-----------this is xml string', xml_str)
                            xml_filename = os.path.splitext(image_name)[0] + ".xml"
                            xml_file_path = os.path.join(zip_output_dir, xml_filename)
                            with open(xml_file_path, 'w', encoding='utf-8') as f:
                                f.write(xml_str)

                            zipf.write(xml_file_path, arcname=f"dataset1/{xml_filename}")
                            os.remove(xml_file_path)

                    except Exception as e:
                        print(f"[User {user.id}] Error with image ID {image_obj.id}: {e}")
                        continue
            threading.Thread(
                            target=send_zip_to_tf_training_api,
                            args=(zip_path, training_id, zip_output_dir),
                            daemon=True
                                ).start()
            ProcessedImage.objects.filter(id__in=for_untrain_set).update(is_deleted=True)
            ProcessedImage.objects.filter(id__in=for_train).update(is_edited=False)


            return Response({
                    "message": "Training ZIP created and sent to AI API in background.",
                    "zip_path": f"{settings.MEDIA_URL}training_zips/{os.path.basename(zip_path)}",
                    "training_id": training_id
                    }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    

def send_zip_to_tf_training_api(training_data_zip_path, training_id, training_data_folder):
    """Sends the zip file to the AI API and cleans up afterward. Returns success or failure gracefully."""
    try:
        with open(training_data_zip_path, 'rb') as f:
            files = {
                'zip_file': (os.path.basename(training_data_zip_path), f, 'application/zip')
            }

            ai_api_url = f"{settings.TF_TRAIN_API_URL}/train-tickers/?training_id={training_id}"
            try:
                response = requests.post(ai_api_url, files=files, timeout=10)
                logger.info(f"Response from AI API: {response.status_code} - {response.text}")
                print(f"Response from AI API: {response.status_code} - {response.text}")
                if response.status_code == 200:
                    return {
                        "status": True,
                        "message": "AI training API call successful.",
                        "response_text": response.text
                    }
                else:
                    return {
                        "status": True,
                        "message": f"AI training API returned status {response.status_code}.",
                        "response_text": response.text
                    }

            except requests.exceptions.RequestException as e:
                logger.error(f"Connection to AI API failed: {e}")
                return {
                    "status": True,
                    "message": f"Could not connect to AI training API: {str(e)}"
                }

    except Exception as e:
        logger.error(f"Error while preparing zip for AI API: {e}", exc_info=True)
        return {
            "status": True,
            "message": f"Unexpected error: {str(e)}"
        }

    finally:
        # Always cleanup
        if os.path.exists(training_data_zip_path):
            os.remove(training_data_zip_path)
            logger.info(f"Deleted zip file: {training_data_zip_path}")

        if os.path.exists(training_data_folder):
            shutil.rmtree(training_data_folder)
            logger.info(f"Deleted training data folder: {training_data_folder}")


class GetTFTrainingProgressAPI(APIView):
    """
    API to fetch TF training progress records of the logged-in user,
    sorted in descending order by created_at timestamp.
    """
    permission_classes = [IsAuthenticated]

    def get_processed_images(self, version):
        """
        Fetch and group ProcessedImages by label for a given TFTrainingVersion.
        Only images listed in  are considered 'trained'.
        """
        if version and version.version_images_id:
            images = ProcessedImage.objects.filter(id__in=version.version_images_id, is_deleted=False)
            label_groups = {}
            for img in images:
                label = img.label.label_name if img.label else "Unknown"
                if label not in label_groups:
                    label_groups[label] = []
                label_groups[label].append({
                    "id": img.id,
                    "processedImage": img.processed_image,
                    "x": img.x,
                    "y": img.y,
                    "width": img.width,
                    "height": img.height,
                    "created_at": img.created_at,
                })
            return [
                {
                    "label": label,
                    "images": images
                }
                for label, images in label_groups.items()
            ]
        return []

    def get(self, request):
        try:
            module_name = request.query_params.get('module_name')
            if not module_name:
                return Response({"message": "Module name is required."}, status=400)

            all_progress = TFTrainingProgress.objects.filter(
                user=request.user,
                module_name=module_name
            ).order_by('-created_at')

            if not all_progress.exists():
                return Response({"message": "No training progress records found."}, status=404)

            result_data = []
            for progress in all_progress:
                result_data.append({
                    "id": progress.id,
                    "user": progress.user.id,
                    "version": progress.release_version.version_name if progress.release_version else None,
                    "created_at": progress.created_at,
                    "model_name": progress.model_name,
                    "module_name": progress.module_name,
                    "epoch": progress.epoch,
                    "total_epochs": progress.total_epochs,
                    "status": progress.status,
                    "trainedData": self.get_processed_images(progress.release_version)
                })

            return Response(result_data, status=200)

        except Exception as e:
            print(f"Error in GetTFTrainingProgressAPI: {e}")
            return Response({"error": str(e)}, status=500)
        

class UpdateTFTrainingProgressAPI(APIView):
    """
    API endpoint to update TFTrainingProgress instance based on training result
    and mark related ProcessedImages as edited using provided file names.
    """
    authentication_classes = [APIKeyAuthentication]  # Make sure you’re using your actual API key class

    def post(self, request):
        training_progress_id = request.data.get("id")
        file_names = request.data.get('file_ids', [])

        if not training_progress_id:
            return Response({"error": "Training Progress ID is required."}, status=400)

        try:
            training_progress = TFTrainingProgress.objects.get(id=training_progress_id)

            # Optional updates
            training_progress.epoch = request.data.get("epoch", training_progress.epoch)
            training_progress.model_name = request.data.get("model_name", training_progress.model_name)
            training_progress.total_epochs = request.data.get("total_epochs", training_progress.total_epochs)
            training_progress.f1_score = request.data.get("f1_score", training_progress.f1_score)

            if 'status' in request.data:
                training_progress.status = request.data.get("status")

                # If training is marked complete, update ProcessedImages
                if request.data.get("status") == "completed" and file_names:
                    all_images = ProcessedImage.objects.all()

                    for fname in file_names:
                        match = next((img for img in all_images if fname in img.processed_image), None)
                        if match:
                            match.is_edited = True
                            match.save()

            training_progress.save()
            return Response({"message": "TF training progress updated successfully."}, status=200)

        except TFTrainingProgress.DoesNotExist:
            return Response({"error": "TF TrainingProgress not found."}, status=404)
        except Exception as e:
            return Response({"error": f"An error occurred: {str(e)}"}, status=500)
        