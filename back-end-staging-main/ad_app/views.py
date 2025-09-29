# ===== System Imports =====
import json
import os
import shutil
import threading
import requests
import tempfile


# ===== Third-Party Imports =====
from venv import logger
from django.shortcuts import render
from rest_framework.views import APIView, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from moviepy.editor import VideoFileClip

# ===== Local Application Imports =====
from ad_app.authentication import APIKeyAuthentication
from ad_app.utils import create_ad_training_progress, create_ad_version
from annotation_project import settings
from .utils import group_by_label
from .models import  AdChunk, AdTrainingProgress, KnownAdLabel
from .process_video import extract_frame, process_video_chunks, save_media_file ,get_ad_video_response , get_ad_audio_response
from .serializers import  AdChunkSerializer, KnownAdLabelSerializer, MediaFileSerializer



#**Process Video api
 #=>get file and moduel name
 #=>Save it locally and in data base
 #=>Give it to AI 
class ProcessVideoView(APIView):
    """"This view is going to get video file and save it locally and in database
    using the save_video_file function from process_video.py and then send data to
    get_ad_video_response function to get response from AD API.
    """ 
    def post(self, request):
        try:
            video_file = request.FILES.get('file')
            module_name = request.data.get('module_name')

            if not video_file or not module_name:
                return Response({"error": "Video file and module name are required."}, 
                             status=status.HTTP_400_BAD_REQUEST)
            
            # Save the video file locally and in the database
            saved_video_file, video_id, module_name = save_media_file(
                module_name=module_name,
                name=video_file.name,
                file=video_file,
                media_type='video'
            )
            
            if not saved_video_file:
                return Response({"error": "Failed to save video file."},
                             status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            video_path = saved_video_file.file.path
            # Send Video file path to API to get response
            ad_response = get_ad_video_response(video_path)
           
            if ad_response['status_code'] != 200:
                return Response({
                    "message": "AD AI API call failed",
                    "error": ad_response['response']}, 
                             status=ad_response['status_code'])

            # Save detected segments
            segments = []
            for ad in ad_response['response']:
                middle_time = (ad['start_time'] + ad['end_time']) / 2
                thumbnail = extract_frame(video_path, middle_time)
                relative_path = os.path.relpath(
                    saved_video_file.file.path, 
                    settings.MEDIA_ROOT
                )

                segment = AdChunk.objects.create(
                    media_file=saved_video_file,
                    label=ad['label'],
                    data_type='video',
                    start_time=ad['start_time'],
                    end_time=ad['end_time'],
                    module_name=module_name,
                    frame=relative_path
                )
                segments.append(segment)

            serializer = AdChunkSerializer(segments, many=True)
            return Response({
                "message": "Video processed successfully",
                "video_id": video_id,
                "chunk": serializer.data,
            }, status=200)
            
        except Exception as e:
            return Response({"error": str(e)}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)        

#**Process Audio api
 #=>get file and moduel name
 #=>Save it locally and in data base
 #=>Give it to AI
class ProcessAudioView(APIView):
    """This view handles audio/video file upload and processing through AD API."""

    def post(self, request):
        try:
            uploaded_file = request.FILES.get('file')
            module_name = request.data.get('module_name')

            if not uploaded_file or not module_name:
                return Response({
                    "error": "File and module name are required."
                }, status=status.HTTP_400_BAD_REQUEST)

            original_filename = uploaded_file.name
            ext = os.path.splitext(original_filename)[1].lower()

            is_video = ext in ['.mp4', '.mkv', '.mov', '.avi']  # Add more video types as needed

            # Save the original file (audio or video)
            media_type = 'video' if is_video else 'audio'
            saved_file, file_id, module_name = save_media_file(
                module_name=module_name,
                name=original_filename,
                file=uploaded_file,
                media_type=media_type
            )

            if not saved_file:
                return Response({
                    "error": "Failed to save file."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # If video, convert to audio (WAV or MP3)
            if is_video:
                video_path = saved_file.file.path
                with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
                    audio_path = temp_audio.name
                try:
                    video = VideoFileClip(video_path)
                    video.audio.write_audiofile(audio_path, codec='pcm_s16le')  # WAV format
                except Exception as e:
                    return Response({
                        "error": f"Failed to extract audio from video: {str(e)}"
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                audio_path = saved_file.file.path

            # Send the audio to AD AI
            ad_response = get_ad_audio_response(audio_path)
            print('-----this is audio process ai response-----', ad_response)

            if ad_response['status_code'] != 200:
                return Response({
                    "message": "AD AI API call failed",
                    "error": ad_response['response']
                }, status=ad_response['status_code'])

            # Save detected segments
            segments = []
            for ad in ad_response['response']:
                relative_path = os.path.relpath(saved_file.file.path, settings.MEDIA_ROOT)
                label = ad.get('label', 'UNKNOWN')
                timestamp = ad.get('timestamp')

                if timestamp:
                # If it's a string, convert it to a dict
                    if isinstance(timestamp, str):
                        try:
                            timestamp = json.loads(timestamp)
                        except json.JSONDecodeError:
                            continue  # Skip if malformed

                    segment = AdChunk.objects.create(
                        media_file=saved_file,
                        label=label,
                        data_type='audio',
                        start_time=timestamp['start'],
                        end_time=timestamp['end'],
                        module_name=module_name,
                        frame=relative_path
                    )
            segments.append(segment)                      
            serializer = AdChunkSerializer(segments, many=True)
            return Response({
                "message": "Audio processed successfully",
                "audio_id": file_id,
                "total_segments": len(segments),
                "segments": serializer.data
            }, status=200)

        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProcessVideoAudioView(APIView):
    """
    Handles a single unmuted video file which includes both video and audio streams.
    Saves the file, sends it to both video and audio ad detection APIs, and stores results.
    """

    def post(self, request):
        try:
            video_file = request.FILES.get('file')
            module_name = request.data.get('module_name')

            if not video_file or not module_name:
                return Response({
                    "error": "Video file and module name are required."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Save the video file
            saved_file, media_id, _ = save_media_file(
                module_name=module_name,
                name=video_file.name,
                file=video_file,
                media_type='video'  # still treat it as video
            )

            if not saved_file:
                return Response({
                    "error": "Failed to save video file."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            video_path = saved_file.file.path
            relative_path = os.path.relpath(video_path, settings.MEDIA_ROOT)

            # ---- VIDEO AD DETECTION ----
            video_response = get_ad_video_response(video_path)
            if video_response['status_code'] != 200:
                return Response({
                    "message": "AD AI API call failed",
                    "error": f"Video AD Detection Error: {video_response['response']}"
                }, status=video_response['status_code'])

            video_segments = []
            for ad in video_response['response']:
                segment = AdChunk.objects.create(
                    media_file=saved_file,
                    label=ad['label'],
                    data_type = 'audiovideo',
                    start_time=ad['start_time'],
                    end_time=ad['end_time'],
                    module_name=module_name,
                    frame=relative_path
                )
                video_segments.append(segment)

          

            return Response({
                "message": "Video+Audio processed successfully",
                "media_id": media_id,
                "chunk": AdChunkSerializer(video_segments, many=True).data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            if KnownAdLabel.objects.filter(label_name = formatted_label).exists():
                return Response({"message":f"{formatted_label} Label already Exists"}, status = 400)

            # Create New label
            serializer = KnownAdLabelSerializer(data = {"label_name":formatted_label , "user_email":user.email})
            if serializer.is_valid():
                serializer.save()
                return Response({"message":"Label Created Successfully"}, status = 201)

            return Response({"error":serializer.errors} , status = 400)


        except Exception as e:
            return Response({"error":str(e)}, status=500)

# Get all labels
class GetKnownLabelsView(APIView):
    """this API will get all the knownlabels """
    def get(self , request):
        try:
            labels = KnownAdLabel.objects.all()
            label_name = [label.label_name for label in labels]
            return Response({"data": label_name}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


def get_ad_segments_by_type(data_type, request):
    trained = request.query_params.get('active', None)  # 'trainedData' or 'UntrainedData'
    label_filter = request.query_params.get('label', None)
    start_date = request.query_params.get('startDate', None)
    end_date = request.query_params.get('endDate', None)

    print(f"\n🔹 [{data_type}] Params: active={trained}, label={label_filter}, startDate={start_date}, endDate={end_date}")

    base_query = AdChunk.objects.select_related('media_file').filter(is_deleted=False, data_type=data_type)

    if start_date and end_date:
        base_query = base_query.filter(created_at__date__range=[start_date, end_date])
    elif start_date:
        base_query = base_query.filter(created_at__date__gte=start_date)
    elif end_date:
        base_query = base_query.filter(created_at__date__lte=end_date)

    if label_filter:
        base_query = base_query.filter(label__icontains=label_filter)

    if trained == 'trainedData':
        trained_qs = base_query.filter(is_edited=False)
        return {"trainedData": AdChunkSerializer(trained_qs, many=True).data}

    elif trained == 'UntrainedData':
        untrained_qs = base_query.filter(is_edited=True)
        return {"noneTrainedData": AdChunkSerializer(untrained_qs, many=True).data}

    else:
        trained_qs = base_query.filter(is_edited=False)
        untrained_qs = base_query.filter(is_edited=True)

        return {
            "trainedData": group_by_label(AdChunkSerializer(trained_qs, many=True).data),
            "untrainedData": group_by_label(AdChunkSerializer(untrained_qs, many=True).data)
        }

#Update ad chunk(procssed ad)
class UpdateAdChunkView(APIView):
    """Update multiple advertisement chunks(processed chunks) with their respective labels"""
    
    def patch(self, request):
        try:
            # Expected format: [{"chunk_id": 1, "label": "Coke"}, {"chunk_id": 2, "label": "Pepsi"}]
            updates = request.data.get('updates', [])

            if not updates:
                return Response({
                    "error": "Validation failed",
                    "details": "No updates provided"
                }, status=400)

            # Extract all chunk IDs
            chunk_ids = [update.get('chunk_id') for update in updates]
            
            # Get all chunks to update
            chunks_to_update = AdChunk.objects.filter(id__in=chunk_ids)
            
            if not chunks_to_update.exists():
                return Response({
                    "error": "Not found",
                    "details": "No chunks found with provided IDs"
                }, status=404)

            updated_chunks = []
            failed_updates = []

            # Create a mapping of id to label for quick lookup
            update_map = {str(update['chunk_id']): update['label'] for update in updates}

            # Update each chunk
            for chunk in chunks_to_update:
                try:
                    new_label = update_map.get(str(chunk.id))
                    if not new_label:
                        failed_updates.append({
                            "id": chunk.id,
                            "error": "No label provided"
                        })
                        continue
                    
                    # Update label and is_edited flag
                    chunk.label = new_label
                    chunk.is_edited = True
                    chunk.save()
                    
                    # Serialize the updated chunk
                    serializer = AdChunkSerializer(chunk)
                    updated_chunks.append(serializer.data)

                except Exception as e:
                    failed_updates.append({
                        "id": chunk.id,
                        "error": str(e)
                    })
                    print(f"Failed to update chunk {chunk.id}: {str(e)}")

            # Prepare response
            response_data = {
                "message": f"Successfully updated {len(updated_chunks)} out of {len(updates)} chunks",
                "updated_chunks": updated_chunks
            }

            if failed_updates:
                response_data["failed_updates"] = failed_updates

            return Response(response_data, status=200)

        except Exception as e:
            return Response({
                "error": "Server error",
                "details": str(e)
            }, status=500)
        
class GetAudioAdSegmentsAPI(APIView):
    def get(self, request):
        try:
            data = get_ad_segments_by_type("audio", request)
            return Response(data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class GetVideoAdSegmentsAPI(APIView):
    def get(self, request):
        try:
            data = get_ad_segments_by_type("video", request)
            return Response(data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class GetAudioVideoAdSegmentsAPI(APIView):
    def get(self, request):
        try:
            data = get_ad_segments_by_type("audiovideo", request)
            return Response(data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


#Soft delete a chunk
class DeleteAdChunkView(APIView):
    """Soft delete an advertisement chunk"""
    
    def delete(self, request, chunk_id):
        try:
            chunk_to_delete = AdChunk.objects.get(id=chunk_id)
            
            if chunk_to_delete.is_deleted:
                return Response({
                    "message": "Chunk already deleted"
                }, status=200)
                
            chunk_to_delete.is_deleted = True
            chunk_to_delete.save()
            
            return Response({
                "message": "Chunk successfully deleted"
            }, status=200)
            
        except AdChunk.DoesNotExist:
            return Response({
                "error": "Advertisement chunk not found"
            }, status=404)
            
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=500)

class GetAdTrainingProgressAPI(APIView):
    """
    API to fetch AD training progress records of the logged-in user,
    sorted in descending order by created_at timestamp.
    """
    permission_classes = [IsAuthenticated]

    def get_ad_segments(self, version):
        """
        Fetch and group ad segments by label for a given AdTrainingVersion.
        Only segments included in the version's version_segments are considered 'trained'.
        """
        if version and version.version_segments:
            ad_chunks = AdChunk.objects.filter(id__in=version.version_segments, is_deleted=False)
            # Group by label
            label_groups = {}
            for chunk in ad_chunks:
                label = chunk.label
                if label not in label_groups:
                    label_groups[label] = []
                label_groups[label].append({
                    "id": chunk.id,
                    "media_file": f"/media/{chunk.media_file.file.name}" if chunk.media_file and chunk.media_file.file else None,
                    "start_time": chunk.start_time,
                    "end_time": chunk.end_time,
                    "created_at": chunk.created_at,
                })
            # Convert to list format
            return [
                {
                    "label": label,
                    "segments": segments
                }
                for label, segments in label_groups.items()
            ]
        return []
    def get(self, request):
        try:
            module_name = request.query_params.get('module_name')
            if not module_name:
                return Response(
                    {"message": "Module name is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get all progress records for user and module
            all_progress = AdTrainingProgress.objects.filter(
                user=request.user,
                module_name=module_name
            ).order_by('-created_at')

            if not all_progress.exists():
                return Response(
                    {"message": "No training progress records found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Create flattened list of progress data
            result_data = []
            for progress in all_progress:
                progress_data = {
                    "id": progress.id,
                    "user": progress.user.id,
                    "version":    progress.release_version.version_name,   
                    "created_at": progress.created_at,
                    "model_name": progress.model_name,
                    "module_name": progress.module_name,
                    "epoch": progress.epoch,
                    "total_epochs": progress.total_epochs,
                    "status": progress.status,
                    "trainedData": self.get_ad_segments(progress.release_version)
                }
                result_data.append(progress_data)

            return Response(result_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f'Error in GetAdTrainingProgressAPI: {str(e)}')
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


#This appi will create version and progres and send data to AI
class ZipAndCreateVideoADTrainingProgressAPI(APIView):
    """Handles creating AD video training versions and sending data to the AI API"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            module_name = request.data.get("moduleName")
            for_train = request.data.get("forTrain", {})     # {"AdLabel": [video_id1, video_id2]}
            for_untrain = request.data.get("forUntrain", {})
            for_retrain = request.data.get("reTrain", {})

            if not module_name:
                return Response({"error": "moduleName is required"}, status=400)

            # Get all label IDs and video IDs
            label_ids = list(for_train.keys()) + list(for_retrain.keys())
            all_video_ids = [
                id for ids in for_train.values() for id in ids
            ] + [
                id for ids in for_retrain.values() for id in ids
            ]

            # Create version with video IDs
            version = create_ad_version(module_name, label_ids, all_video_ids)
            training_id = create_ad_training_progress(request.user, module_name, version)

            # Reset is_edited flag for videos being trained
            AdChunk.objects.filter(id__in=all_video_ids).update(is_edited=False)

            # Step 1: Setup training directory
            ad_root = os.path.join(settings.MEDIA_ROOT, "AD_Training_Video")
            training_data_folder = os.path.join(ad_root, "training_data")
            data_folder = os.path.join(training_data_folder, "data")
            if os.path.exists(training_data_folder):
                shutil.rmtree(training_data_folder)
            os.makedirs(data_folder, exist_ok=True)

            # Step 2: Create label folders and process video segments
            for label, video_ids in {**for_train, **for_retrain}.items():
                label_folder = os.path.join(data_folder, label)
                os.makedirs(label_folder, exist_ok=True)

                for video_id in video_ids:
                    try:
                        video = AdChunk.objects.get(id=video_id)
                        video_filename = os.path.basename(video.media_file.file.name)
                        video_path = os.path.join(label_folder, video_filename)

                        shutil.copy2(
                            video.media_file.file.path,
                            video_path
                        )
                        print(f"\nVideo IDs received for label {label}: {video_ids}")
 
                    except AdChunk.DoesNotExist:
                        logger.warning(f"Video {video_id} not found")
                    print("\n=== Directory Structure Before Zipping ===")
                    for root, dirs, files in os.walk(training_data_folder):
                        print(f"\nDirectory: {root}")
                        print(f"Subdirectories: {dirs}")
                        print(f"Files: {files}")

                     # Log directory structure before zipping

            # Step 3: Create zip file
            zip_path = os.path.join(ad_root, "training_data.zip")
            print(f"\n=== Zip File Creation ===")
            print(f"Training data folder: {training_data_folder}")
            print(f"Zip path: {zip_path}")
            shutil.make_archive(zip_path.replace(".zip", ""), 'zip', training_data_folder)
            
            print(f"\n=== Zip File Size ===")
            if os.path.exists(zip_path):
                print(f"Zip file size: {os.path.getsize(zip_path)} bytes")
            
            print("\n=== Final Structure ===")
            print(f"training_data/")
            print(f"└── label/")
            for label in label_ids:
                print(f"    └── {label}/")
                label_path = os.path.join(data_folder, label)
                if os.path.exists(label_path):
                    files = os.listdir(label_path)
                    for file in files:
                        print(f"        └── {file}")
            
            # Step 4: Send zip + for_untrain to AI
           
            thread = threading.Thread(
                target=self.send_zip_to_ai_api,
                args=(zip_path, training_id, for_untrain, training_data_folder)
            )
            thread.start()

            return Response({
                "message": "AD video training process started",
                "training_id": training_id,
                "version": version.version_name
            }, status=202)

        except Exception as e:
            logger.error(f"Error in ZipAndCreateVideoADTrainingProgressAPI: {str(e)}", exc_info=True)
            return Response({"error": "Internal server error"}, status=500)

    def send_zip_to_ai_api(self, zip_path, training_id, for_untrain, training_data_folder):
        try:
            with open(zip_path, 'rb') as f:
                files = {
                    'zip_file': (os.path.basename(zip_path), f, 'application/zip')
                }

                url = f"{settings.AD_VIDEO_TRAIN_API_URL}/upload_zip/?training_id={training_id}"
                response = requests.post(url, files=files)

                if response.status_code == 200:
                    logger.info(f"AD Video Train API success: {response.status_code}")
                else:
                    logger.error(f"AD Video Train API failed: {response.status_code} - {response.text}")

        except Exception as e:
            logger.error(f"Failed to send to AD Video Train API: {str(e)}", exc_info=True)

        finally:
            if os.path.exists(zip_path):
                os.remove(zip_path)
                logger.info(f"Deleted zip file: {zip_path}")

            if os.path.exists(training_data_folder):
                shutil.rmtree(training_data_folder)
                logger.info(f"Deleted training data folder: {training_data_folder}")


class ZipAndCreateAudioADTrainingProgressAPI(APIView):
    """Handles creating AD training versions and sending data to the AI API"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            module_name = request.data.get("moduleName")
            for_train = request.data.get("forTrain", {})     # {"AdLabel": [segment_id1, segment_id2]}
            for_untrain = request.data.get("forUntrain", {})
            for_retrain = request.data.get("reTrain", {})

            if not module_name:
                return Response({"error": "moduleName is required"}, status=400)

            # Get all label IDs and segment IDs
            label_ids = list(for_train.keys()) + list(for_retrain.keys())
            all_segment_ids = [
                id for ids in for_train.values() for id in ids
            ] + [
                id for ids in for_retrain.values() for id in ids
            ]

            # Create version with segment IDs
            version = create_ad_version(module_name, label_ids, all_segment_ids)
            training_id = create_ad_training_progress(request.user, module_name, version)

            # Reset is_edited flag for segments being trained
            AdChunk.objects.filter(id__in=all_segment_ids).update(is_edited=False)

            # Step 1: Setup training directory
            ad_root = os.path.join(settings.MEDIA_ROOT, "AD_Training")
            training_data_folder = os.path.join(ad_root, "training_data")
            data_folder = os.path.join(training_data_folder, "data")
            if os.path.exists(training_data_folder):
                shutil.rmtree(training_data_folder)
            os.makedirs(data_folder, exist_ok=True)

            # Step 2: Create label folders and process segments
            for label, segment_ids in {**for_train, **for_retrain}.items():
                label_folder = os.path.join(data_folder, label)
                os.makedirs(label_folder, exist_ok=True)
                
                for segment_id in segment_ids:
                    try:
                        segment = AdChunk.objects.get(id=segment_id)
                        # Create segment info file
                        audio_filename = os.path.basename(segment.media_file.file.name)
                        audio_path = os.path.join(label_folder, audio_filename)
                        
                       
                        
                        shutil.copy2(
                            segment.media_file.file.path,
                            audio_path
                        )
                            
                    except AdChunk.DoesNotExist:
                        logger.warning(f"Segment {segment_id} not found")

            # Step 3: Create zip file
            zip_path = os.path.join(ad_root, "training_data.zip")
            shutil.make_archive(zip_path.replace(".zip", ""), 'zip', training_data_folder)

            # Step 4: Send zip + for_untrain to AI
            thread = threading.Thread(
                target=self.send_zip_to_ai_api,
                args=(zip_path, training_id, for_untrain, training_data_folder)
            )
            thread.start()

            return Response({
                "message": "AD training process started",
                "training_id": training_id,
                "version": version.version_name
            }, status=202)

        except Exception as e:
            logger.error(f"Error in ZipAndCreateADTrainingProgressAPI: {str(e)}", exc_info=True)
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
                
                url = f"{settings.AD_AUDIO_TRAIN_API_URL}/Ad_Train/?training_id={training_id}"
                print('-------------this is files', files)
                response = requests.post(url, files=files)

                if response.status_code == 200:
                    logger.info(f"AD Train API success: {response.status_code}")
                    
                else:
                    logger.error(f"AD Train API failed: {response.status_code} - {response.text}")

        except Exception as e:
            logger.error(f"Failed to send to AD Train API: {str(e)}", exc_info=True)

        finally:
            # Clean up
            if os.path.exists(zip_path):
                os.remove(zip_path)
                logger.info(f"Deleted zip file: {zip_path}")

            if os.path.exists(training_data_folder):
                shutil.rmtree(training_data_folder)
                logger.info(f"Deleted training data folder: {training_data_folder}")
 

class ZipAndCreateAudioVideoADTrainingProgressAPI(APIView):
    """Handles creating AD training versions and sending data to the AI API"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            module_name = request.data.get("moduleName")
            for_train = request.data.get("forTrain", {})
            for_untrain = request.data.get("forUntrain", {})
            for_retrain = request.data.get("reTrain", {})

            if not module_name:
                return Response({"error": "moduleName is required"}, status=400)

            # Gather segment and label IDs
            label_ids = list(for_train.keys()) + list(for_retrain.keys())
            all_segment_ids = [
                sid for ids in for_train.values() for sid in ids
            ] + [
                sid for ids in for_retrain.values() for sid in ids
            ]

            # Create version & training progress
            version = create_ad_version(module_name, label_ids, all_segment_ids)
            training_id = create_ad_training_progress(request.user, module_name, version)

            # Mark segments as not edited
            AdChunk.objects.filter(id__in=all_segment_ids).update(is_edited=False)

            # Folder setup
            ad_root = os.path.join(settings.MEDIA_ROOT, "AD_Training")
            training_data_folder = os.path.join(ad_root, "training_data")
            data_folder = os.path.join(training_data_folder, "label")

            if os.path.exists(training_data_folder):
                shutil.rmtree(training_data_folder)
            os.makedirs(data_folder, exist_ok=True)

            # Place chunks in correct label folders
            for label, segment_ids in {**for_train, **for_retrain}.items():
                label_folder = os.path.join(data_folder, label)
                os.makedirs(label_folder, exist_ok=True)

                for segment_id in segment_ids:
                    try:
                        segment = AdChunk.objects.get(id=segment_id)
                        audio_filename = os.path.basename(segment.media_file.file.name)
                        shutil.copy2(segment.media_file.file.path, os.path.join(label_folder, audio_filename))
                    except AdChunk.DoesNotExist:
                        logger.warning(f"Segment {segment_id} not found")

            # Zip the folder
            zip_path = os.path.join(ad_root, "training_data.zip")
            shutil.make_archive(zip_path.replace(".zip", ""), 'zip', training_data_folder)

            # Send to AI via separate thread
            thread = threading.Thread(
                target=self.send_zip_to_ai_api,
                args=(zip_path, training_id, for_untrain, training_data_folder)
            )
            thread.start()

            return Response({
                "message": "AD training process started",
                "training_id": training_id,
                "version": version.version_name
            }, status=202)

        except Exception as e:
            logger.error(f"Error in ZipAndCreateADTrainingProgressAPI: {str(e)}", exc_info=True)
            return Response({"error": "Internal server error"}, status=500)

    def send_zip_to_ai_api(self, zip_path, training_id, for_untrain, training_data_folder):
        try:
            with open(zip_path, 'rb') as f:
                files = {
                    'Zipfile': (os.path.basename(zip_path), f, 'application/zip')
                }
                

                url = f"{settings.AD_AUDIO_VIDEO_TRAIN_API_URL}/Train_Ad/?training_id={training_id}"

                print(f"Sending request to: {url}")

                response = requests.post(url, files=files,)  # 💡 important: include both files and data

                if response.status_code == 200:
                    logger.info(f"AD Train API success: {response.status_code}")
                    print(f"AD Train API success: {response.status_code} - - {response.text}")
                else:
                    logger.error(f"AD Train API failed: {response.status_code} - {response.text}")
                    print(f"AD Train API failed: {response.status_code} - {response.text}")

        except Exception as e:
            logger.error(f"Failed to send to AD Train API: {str(e)}", exc_info=True)
        finally:
            if os.path.exists(zip_path):
                os.remove(zip_path)
                logger.info(f"Deleted zip file: {zip_path}")
            if os.path.exists(training_data_folder):
                shutil.rmtree(training_data_folder)
                logger.info(f"Deleted training data folder: {training_data_folder}")


class   UpdateADTrainingProgressAPI(APIView):
    
    authentication_classes = [APIKeyAuthentication]  # Enforce API Key Authentication

    def post(self, request):
        
        # Extract the ID of the TrainingProgress object to update
        training_progress_id = request.data.get("id")
        file_names = request.data.get('file_ids', [])
        print('The id i got', file_names)
        # Validate required fields
        if not training_progress_id:
            return Response({"error": "Training Progress ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Look up the existing TrainingProgress object
            training_progress = AdTrainingProgress.objects.get(id=training_progress_id)

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

                        # Get all AdChunk instances (filter manually in Python)
                        audio_chunk_instances = AdChunk.objects.all()

                        # Filter manually to check if the chunk name exists in audio_chunks_name
                        objct = next((chunk for chunk in audio_chunk_instances if file_name in chunk.audio_chunks_name), None)

                        if objct:
                            print("Found AdChunk instance:", objct)
                            objct.is_edited = True
                            # objct.is_deleted = False
                            objct.save()
                        else:
                            print(f"File name {file_name} not found in AdChunk.")

                    print("File names are updated")
            training_progress.save()

            return Response({"message": "Training progress updated successfully."}, status=status.HTTP_200_OK)

        except AdTrainingProgress.DoesNotExist:
            return Response({"error": "Training progress not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"message": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
