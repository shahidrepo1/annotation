# ===== Standard Library Imports =====
import base64
from collections import defaultdict
import json
import os
import shutil
import threading
import uuid
import mimetypes
import requests
from venv import logger

# ===== Third-Party Imports =====
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_list_or_404

# ===== Local Application Imports =====
from annotation_project import settings
from fr_app.authentication import FRAPIKeyAuthentication
from fr_app.utils import create_fr_training_progress, create_fr_version, group_by_label, reset_is_edited
from .models import FRTrainingProgress, FRTrainingVersions, KnownLabel, ProcessedImage , MediaFile
from fr_app.process_image import get_fr_image_response, get_fr_video_response,  save_media_file
from .serializers import FRTrainingVersionSerializer, ProcessedImageSerializer , KnownLabelSerializer , FRTrainingProgressSerializer



class ProcessImageView(APIView):

    def post(self, request):
        """
        This view handles getting image/video and saving it in data base
        and saving it locally and saving it in the database, sedding data to AI API
        and receving response from AI API
        """
        try:
            media_file = request.FILES.get('file')
            module_name = request.POST.get('module_name')

            if not media_file or not module_name:
                return Response({"error": "File and module name are required."}, status=400)
            
            mimetype , _ = mimetypes.guess_type(media_file.name)

            if mimetype and mimetype.startswith('image'):
                media_type = 'image'

            elif mimetype and mimetype.startswith('video'):
                media_type = 'video'

            else:
                return Response({"error": "File is not supported."}, status=400)
        
            saved_media_file, image_id, module_name = save_media_file(module_name, media_file.name, media_file , media_type)
            if not saved_media_file:
                return Response({"error": "Failed to save media file."}, status=500)
            image_path = saved_media_file.media_file.path
            # If Image is uploaded FR impage API is called
            if media_type == 'image':
                try:
                    fr_response = get_fr_image_response(image_path)
                    print("AI api responser", fr_response['status_code'])
                    if fr_response['status_code'] != 200:
                        print("FR API call failed with status code:", fr_response.get('status_code'))
                        
                        return Response({
                            "message": "FR AI API call failed",
                            "error": fr_response["response"]
                        }, status=500)
   
                except Exception as e:
                    return Response({"error": fr_response["response"]}, status=500)
                
                # If video is uploaded Fr video api is going to be called 
            elif media_type == 'video':
                try:
                    fr_response = get_fr_video_response(image_path)
                    if fr_response.get('status_code') == 500:

                        

                        return Response({
                            "data": fr_response['response']
                        }, status=500)                
                except Exception as e:
                   
                    return Response({"error": str(e) ,}, status=500)
             
            if not fr_response or 'response' not in fr_response:
                return Response({"error": "Invalid response from FR AI API."}, status=500)
            print("FR API response:", fr_response)
            
            people = fr_response['response'].get('people', [])
            if not isinstance(people, list):
                return Response({"error": "Invalid people data from FR AI API."}, status=500)
            
            saved_faces = []
            skipped_faces = []
            for idx, person in enumerate(people):
                name = person.get('name', 'unknown')
                thumbnail_b64 = person.get('thumbnail')
                if not thumbnail_b64:
                    skipped_faces.append(name)
                    continue
                # Decode base64 and save as image
                img_data = base64.b64decode(thumbnail_b64)
                unique_suffix = uuid.uuid4().hex[:8]
                file_name = f"{name}_{idx + 1}_{unique_suffix}.jpg"
                rel_path = os.path.join("processed_images", file_name)
                abs_path = os.path.join(settings.MEDIA_ROOT, rel_path)
                os.makedirs(os.path.dirname(abs_path), exist_ok=True)  # Ensure the directory exists
                with open(abs_path, "wb") as f:
                    f.write(img_data)
                # Save to DB
                processed = ProcessedImage.objects.create(
                    media_file=saved_media_file,
                    processed_image=rel_path,
                    label=name,
                    module_name=module_name
                )
                
                saved_faces.append(processed)
                
            serializer = ProcessedImageSerializer(saved_faces , many=True)

            return Response({
                "message": f"{len(saved_faces)} face(s) extracted and saved successfully.",
                "faces": serializer.data,
                "skipped": skipped_faces
            }, status=201)
                       

        except Exception as e:
            return Response({"error": str(e)}, status=500)

# To Soft Delete Processed Image   
class DeleteProcessedImage(APIView):
    def delete(self , request , image_id):
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

# Get Image by label
class GetProcessedImageByLabelView(APIView):
    """This View will fetch processed image by label """
    def get(self , request , label):
        try:
            images_by_label = ProcessedImage.objects.filter(label = label)
            serializer = ProcessedImageSerializer(images_by_label , many = True)
            return Response(serializer.data , status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# View to list all known labels as a simple list of label names.       
class KnownLabelListView(APIView):
    """
    View to list all known labels as a simple list of label names.
    """
    def get(self, request, format=None):
        try:
            labels = KnownLabel.objects.all()
            label_names = [label.label_name for label in labels]  # Get a list of label names
            return Response(label_names, status=200)
        except Exception as e:
            return Response({"error":str(e)}, status=500)

# Add A new Label
class AddKnownLabelView(APIView):
    """This view will add a new label"""
    permission_classes = [IsAuthenticated]
    def post(self , request):
        try :
            # Get user and label_name
            label = request.data.get("label_name")
            user = request.user

            if not label:
                return Response({"message":"label_name is required"}, status = 400)

            # Format the label name (e.g., "ALi YAr" -> "Ali Yar")
            formatted_label = label.strip().title()

            # Check if the label already exists
            if KnownLabel.objects.filter(label_name = formatted_label).exists():
                return Response({"message":f"{formatted_label}Lable already Exists"}, status = 400)

            # Create New label
            serializer = KnownLabelSerializer(data = {"label_name":formatted_label , "user_email":user.email})
            if serializer.is_valid():
                serializer.save()
                return Response({"message":"Label Created Successfully"}, status = 201)

            return Response({"error":serializer.errors} , status = 500)


        except Exception as e:
            return Response({"error":str(e)}, status=500)

# Update the Processed Image 
class UpdateProcessedImageView(APIView):
    """Update multiple processed images with their respective labels"""
    
    def patch(self, request):
        try:
            # Expected format: [{"image_id": 1, "label": "Person1"}, {"image_id": 2, "label": "Person2"}]
            updates = request.data.get('updates', [])

            if not updates:
                return Response({
                    "error": "Validation failed",
                    "details": "No updates provided"
                }, status=400)

            # Extract all image IDs
            image_ids = [update.get('image_id') for update in updates]
            
            # Get all images to update
            images_to_update = ProcessedImage.objects.filter(id__in=image_ids)
            
            if not images_to_update.exists():
                return Response({
                    "error": "Not found",
                    "details": "No images found with provided IDs"
                }, status=404)

            updated_images = []
            failed_updates = []

            # Create a mapping of id to label for quick lookup
            update_map = {str(update['image_id']): update['label'] for update in updates}

            # Update each image
            for image in images_to_update:
                try:
                    new_label = update_map.get(str(image.id))
                    if not new_label:
                        failed_updates.append({
                            "id": image.id,
                            "error": "No label provided"
                        })
                        continue

                    # Reset is_edited flag
                    reset_is_edited(image.id)
                    
                    # Update label and is_edited
                    image.label = new_label
                    image.is_edited = True
                    image.save()
                    
                    # Serialize the updated image
                    serializer = ProcessedImageSerializer(image)
                    updated_images.append(serializer.data)

                except Exception as e:
                    failed_updates.append({
                        "id": image.id,
                        "error": str(e)
                    })
                    print(f"Failed to update image {image.id}: {str(e)}")

            # Prepare response
            response_data = {
                "message": f"Successfully updated {len(updated_images)} out of {len(updates)} images",
                "updated_images": updated_images
            }

            if failed_updates:
                response_data["failed_updates"] = failed_updates

            return Response(response_data, status=200)

        except Exception as e:
            return Response({
                "error": "Server error",
                "details": str(e)
            }, status=500)
        
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
                base_query = base_query.filter(label__icontains=label_filter)

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

#This endpoint will create version and training progress and will send zip data to AI API
class ZipAndCreateFRTrainingProgressAPI(APIView):
    """Handles creating FR training versions and sending zipped image data to the AI API"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            module_name = request.data.get("moduleName")
            for_train = request.data.get("forTrain", {})     # {"Person1": [img_id1, img_id2]}
            for_untrain = request.data.get("forUntrain", {}) # {"Person2": ["img1.jpg", "img2.jpg"]}
            for_retrain = request.data.get("reTrain", {})
            print('-------for train--', for_retrain)
            print('-------for untrain--', for_untrain)
            print('-------for retrain--', for_train)
            if not module_name:
                return Response({"error": "moduleName is required"}, status=400)

            user = request.user
            person_ids = list(for_train.keys()) + list(for_retrain.keys())
            all_image_ids = [
                int(img_id) for ids in for_train.values() for img_id in ids
            ] + [
                int(img_id) for ids in for_retrain.values() for img_id in ids
            ]

            version = create_fr_version(module_name, person_ids, all_image_ids)
            training_id = create_fr_training_progress(user, module_name, version)
            
            print('----------this is the type of ids--', type(all_image_ids))
            # Mark edited
            print('-----------------these id have got ---', all_image_ids)
            ProcessedImage.objects.filter(id__in=all_image_ids).update(is_edited=False)

            # Step 1: Setup training directory
            fr_root = os.path.join(settings.MEDIA_ROOT, "FR_Training")
            training_data_folder = os.path.join(fr_root, "training_data")
            data_folder = os.path.join(training_data_folder, "data")
            if os.path.exists(training_data_folder):
                shutil.rmtree(training_data_folder)
            os.makedirs(data_folder, exist_ok=True)

            # Step 2: Create person folders and add images
            for person, img_ids in {**for_train, **for_retrain}.items():
                person_folder = os.path.join(data_folder, person)
                os.makedirs(person_folder, exist_ok=True)
                for img_id in img_ids:
                    try:
                        img = ProcessedImage.objects.get(id=img_id)
                        shutil.copy(img.processed_image.path, os.path.join(person_folder, os.path.basename(img.processed_image.name)))
                    except ProcessedImage.DoesNotExist:
                        logger.warning(f"Image {img_id} not found")

            # Step 3: Zip training_data
            zip_path = os.path.join(fr_root, "training_data.zip")
            shutil.make_archive(zip_path.replace(".zip", ""), 'zip', training_data_folder)
            
            # Step 4: Send zip + for_untrain to AI
            thread = threading.Thread(target=self.send_zip_to_ai_api, args=(zip_path, training_id, for_untrain, training_data_folder))
            thread.start()

            return Response({
                "message": "FR training process started",
                "training_id": training_id
            }, status=202)

        except Exception as e:
            logger.error(f"Error in ZipAndCreateFRTrainingProgressAPI: {str(e)}", exc_info=True)
            return Response({"error": "Internal server error"}, status=500)

    def send_zip_to_ai_api(self, zip_path, training_id, for_untrain, training_data_folder):
        try:
            with open(zip_path, 'rb') as f:
                files = {
                    'Zip_file': (os.path.basename(zip_path), f, 'application/zip')
                }
                data = {
                    'data': json.dumps({'for_untrain': for_untrain})
                }

                url = f"{settings.FR_TRAIN_API}/Fr_Train/?training_id={training_id}"
                response = requests.post(url, files=files, data=data)
                print('---------------this is fr train api response---', response.status_code)

                if response.status_code == 200:
                    
                    logger.info(f"FR Train API success: {response.status_code}")
                else:
                    logger.error(f"FR Train API failed: {response.status_code} - {response.text}")
               
        except Exception as e:
            logger.error(f"Failed to send to FR Train API: {str(e)}", exc_info=True)

        finally:
            # Clean up
            if os.path.exists(zip_path):
                os.remove(zip_path)
                logger.info(f"Deleted zip file: {zip_path}")

            if os.path.exists(training_data_folder):
                shutil.rmtree(training_data_folder)
                logger.info(f"Deleted training data folder: {training_data_folder}")

# API to fetch FR training progress records of the logged-in user,
# sorted in descending order by created_at timestamp, by version.
class GetFRTrainingProgressAPI(APIView):
    """
    API to fetch FR training progress records of the logged-in user,
    sorted in descending order by created_at timestamp.
    """
    permission_classes = [IsAuthenticated]

    def get_images_by_version(self, version):
        """Fetch and merge image details for a given FRTrainingVersion"""
        if version and version.version_images_id:
            images = ProcessedImage.objects.filter(id__in=version.version_images_id)
            
            merged_images = {}
            for image in images:
                label = image.label
                if label not in merged_images:
                    merged_images[label] = []
                
                merged_images[label].append({
                    "id": image.id,
                    "processedImage": image.processed_image.url if image.processed_image else None,
                    "label": image.label,
                    "created_at": image.created_at
                })
            
            # Convert to required format
            return [
                {
                    "label": label,
                    "images": images
                }
                for label, images in merged_images.items()
            ]
        return []

    def get(self, request):
        try:
            module_name = request.query_params.get('module_name')
            if not module_name:
                return Response(
                    {"error": "moduleName is required"},
                    status=400
                )

            # Get all progress records for the user and module
            progress_records = FRTrainingProgress.objects.filter(
                user=request.user,
                module_name=module_name
            ).order_by('-created_at')

            if not progress_records.exists():
                return Response({
                    "message": "No training progress records found"
                }, status=404)

            # Format response data
            result_data = []
            for progress in progress_records:
                progress_data = {
                    "id": progress.id,
                    "user":progress.user.id,  # or .email or .id
                    "version": progress.release_version.version_name,
                    "modulName": progress.module_name,
                    "modelName": progress.model_name,
                    "epoch": progress.epoch,
                    "totalEpochs": progress.total_epochs,
                    "status": progress.status ,
                    "createdAt": progress.created_at,
                    "trainedData": self.get_images_by_version(progress.release_version)
                }
                result_data.append(progress_data)

            return Response(result_data, status=200)

        except Exception as e:
            logger.error(f"Error in GetFRTrainingProgressAPI: {e}")
            return Response(
                {"error": str(e)},
                status=500
            )


class FRTrainingProgressByVersion(APIView):
    """View to get all trained images grouped by FR model versions"""
    
    def get(self, request):
        version_details = FRTrainingVersions.objects.all()
        response_data = {}

        for version in version_details:
            if version.version_images_id:
                images = ProcessedImage.objects.filter(
                    id__in=version.version_images_id
                )
                image_data = [
                    {
                        "label": image.label,
                        "processed_image": image.processed_image.url
                    }
                    for image in images
                ]
                response_data[version.version_name] = image_data

        return Response(response_data, status=200)

class GetFRTrainingProgressById(APIView):
    """
    View to get a specific FRTrainingProgress by its ID.
    """
    def get(self, request, id):
        try:
            progress = FRTrainingProgress.objects.get(id=id)
            response_data = {
                "user": progress.user.id,  # or .email or .id
                "module_name": progress.module_name,
                "model_name": progress.model_name,
                "release_version": progress.release_version.version_name if progress.release_version else None,
                "epoch": progress.epoch,
                "total_epochs": progress.total_epochs,
                "f1_score": progress.f1_score,
                "status": progress.status,
                "created_at": progress.created_at,
            }
            serializer = FRTrainingProgressSerializer(progress)
            return Response(response_data, status=200)
        except FRTrainingProgress.DoesNotExist:
            return Response({"error": "FRTrainingProgress not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class FRTrainingVersionsByVersionName(APIView):
    """
    Search FRTrainingVersions by version_module (module name).
    """
    def get(self, request):
        version_name = request.query_params.get("version_name")
        if not version_name:
            return Response({"error": "version_name query parameter is required"}, status=400)

        versions = FRTrainingVersions.objects.filter(version_name=version_name)
        serializer = FRTrainingVersionSerializer(versions, many=True)
        return Response(serializer.data, status=200)

#This API will update training progress when training is done by AI 
class   UpdateTrainingProgressAPI(APIView):
    
    authentication_classes = [FRAPIKeyAuthentication]  # Enforce API Key Authentication

    def post(self, request):
        
        # Extract the ID of the TrainingProgress object to update
        training_progress_id = request.data.get("id")
        file_names = request.data.get('file_ids', [])
        print('The id i got', file_names)
        # Validate required fields
        if not training_progress_id:
            return Response({"error": "Training Progress ID is required."}, status=400)

        try:
            # Look up the existing TrainingProgress object
            training_progress = FRTrainingProgress.objects.get(id=training_progress_id)

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
            
            training_progress.save()

            return Response({"message": "Training progress updated successfully."}, status=200)

        except FRTrainingProgress.DoesNotExist:
            return Response({"error": "Training progress not found."}, status=404)
        except Exception as e:
            return Response(
                {"message": f"An error occurred: {str(e)}"},
                status=500,
            )
