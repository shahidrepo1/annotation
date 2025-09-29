import time
import os
import json
import requests
import shutil
import threading
import logging
from django.conf import settings  
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.views import View
from django.core.files.storage import default_storage
from rest_framework.views import APIView
from rest_framework.response import Response
from dateutil import parser  
from django.db.models import Q, Prefetch
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from pydub import AudioSegment
from collections import defaultdict
from .authentication import APIKeyAuthentication
from .models import TrainingVersions, AudioChunks, AudioFile, KnownLabel, TrainingProgress
from .process_audio import process_audio_chunks, get_sr_response, save_audio_file
from .utils import (create_version,
                     group_audio_by_speaker,
                     create_training_progress,
                     reset_is_edited,

                    )

from .serializers import (AudioFileSerializer, AudioChunksSerializer,
                          KnownLabelSerializer, AudioFileRequestSerializer,
                          TrainingProgressSerializer, TrainingProgressSerializerAPIId)

# Setup logger for better error tracking
logger = logging.getLogger(__name__)

class UploadFileView(APIView):
    """
    Handle file uploads and save them in the media folder with module information.
    """
    def post(self, request):
        try:
            # Extract module_name and file from the request data
            module_name = request.data.get("module_name", "SR")

            if not module_name:
                return Response({"error": "Module name is required."}, status=status.HTTP_400_BAD_REQUEST)

            serializer = AudioFileSerializer(data=request.data)
            if serializer.is_valid():
                # Save the audio file and module_name to the database
                audio_file = serializer.save(module_name=module_name)

                return Response({
                    "message": "File uploaded successfully.",
                    "file_id": audio_file.id,
                    "file_name": audio_file.file.name,
                    "uploaded_at": audio_file.uploaded_at,
                    "module_name": audio_file.module_name,
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "An error occurred", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProcessAudioChunksView(View):
    @method_decorator(csrf_exempt)
    def post(self, request, *args, **kwargs):
        try:
            # Step 1: Get the uploaded audio file
            audio_file = request.FILES.get("file")
            module_name = request.POST.get('moduleName')

            if not audio_file:
                logger.error("No audio file provided.")
                return JsonResponse({"message": "No audio file provided."}, status=400)

            # Save the audio file
            saved_file, file_id, audio_file = save_audio_file(module_name=module_name, name=audio_file.name, file=audio_file)
            if not saved_file:
                logger.error("Could not save the file in the database!")
                return JsonResponse({"message": "Could not save the file in the database!"}, status=500)

            audio_path = saved_file.file.path
            print('---------this is the path',audio_path, os.path.exists(audio_path))
                        # Wait for file to fully save
            while not os.path.exists(audio_path):
                time.sleep(0.1)

            time.sleep(0.5)  # extra wait for larger files
            

            # Step 2: Get timestamps (this should be AI model's response)
            try:
                print('SR AI processing...')
                sr_response = get_sr_response(audio_path)

                print('--------====SR AI response:', sr_response)
            except Exception as e:
                logger.error(f"Error when getting response from SR API: {str(e)}")
                return JsonResponse({"message": "Error while processing audio with SR API."}, status=500)

            if not sr_response or 'response' not in sr_response:
                logger.error("SR API response missing 'response' field.")
                return JsonResponse({"message": "Invalid response format from SR API."}, status=400)

            timestamps = sr_response['response']
            print('---------timestamps',timestamps)
            if not isinstance(timestamps, list):
                logger.error("Invalid response format from SR API: 'response' is not a list.")
                return JsonResponse({"message": "Invalid response format from SR API."}, status=400)

            # Step 3: Process the audio chunks
            status_chunk_processing = process_audio_chunks(audio_path, timestamps)

            if 'error' in status_chunk_processing:
                logger.error(f"Error while processing audio chunks: {status_chunk_processing['error']}")
                return JsonResponse(status_chunk_processing, status=500)

            # Iterate over the audio chunks data
            processed_data = {}  # Dictionary to store processed data with IDs and names

            for person, chunks in status_chunk_processing["data"].items():
                # Check if an AudioChunks instance for the speaker already exists
                audio_chunks_instance, created = AudioChunks.objects.get_or_create(
                    speaker=person,
                    audio_file=saved_file,
                )
                
                if created:
                    # If it's a new instance, set the audio_chunks_name field
                    audio_chunks_instance.audio_chunks_name = chunks  # Set the initial audio_chunks_name for the new instance
                else:
                    # If it's an existing instance, append the chunk to the 'audio_chunks_name' list
                    audio_chunks_instance.audio_chunks_name.extend(chunks)  # Add new chunks to the existing audio_chunks_name
                
                # Save the instance (both new and updated)
                audio_chunks_instance.save()
                
                # Prepare the response data to include chunk IDs and names
                if person not in processed_data:
                    processed_data[person] = []
                
                for chunk_name in chunks:
                    processed_data[person].append({
                        "id": audio_chunks_instance.id,
                        "name": chunk_name
                    })

            # Return the paths of the audio chunks in the response
            return JsonResponse({
                "id": file_id,
                "audio_file": audio_file,
                "message": "Audio chunks processed and saved successfully.",
                "data": processed_data
            }, status=200)

        except Exception as e:
            logger.exception("An error occurred while processing audio chunks.")
            return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

## Get All The Data
class AudioChunksListView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            # Fetch all audio chunks and their associated audio files
            audio_chunks = AudioChunks.objects.select_related('audio_file').all()
            serializer = AudioChunksSerializer(audio_chunks, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

## get data according to the speaker
class AudioChunksBySpeakerView(APIView):
    def get(self, request, speaker_name, format=None):
        # Filter AudioChunks by speaker
        audio_chunks = AudioChunks.objects.filter(speaker=speaker_name)
        
        # Serialize the filtered data
        serializer = AudioChunksSerializer(audio_chunks, many=True)
        
        # Return the data in the response
        return Response(serializer.data, status=status.HTTP_200_OK)



from collections import defaultdict

@method_decorator(csrf_exempt, name='dispatch')
class UpdateSpeakerFolderView(View):
    """
    A class-based view to update multiple speaker folders and their audio files.
    """

    def post(self, request):
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body)
            speakers_data = data.get("speakers")  # List of speakers
            job_id = data.get('jobId')
            print('This is the id I get', job_id)

            if not speakers_data or not isinstance(speakers_data, list):
                return JsonResponse({"error": "Invalid or missing speakers data."}, status=400)

            base_path = os.path.join(settings.MEDIA_ROOT, "Speakers")

            for speaker in speakers_data:
                old_folder_name = speaker.get("oldSpeaker")
                new_folder_name = speaker.get("newSpeaker")
                audio_files = speaker.get("files", [])

                if not old_folder_name or not new_folder_name or not audio_files:
                    return JsonResponse({"error": f"Missing fields for speaker '{old_folder_name}'."}, status=400)

                old_folder_path = os.path.join(base_path, old_folder_name)
                new_folder_path = os.path.join(base_path, new_folder_name)

                if not os.path.exists(old_folder_path):
                    return JsonResponse({"error": f"Old folder '{old_folder_name}' does not exist."}, status=404)

                os.makedirs(new_folder_path, exist_ok=True)

                moved_files = []
                for audio_file in audio_files:
                    old_audio_path = os.path.join(old_folder_path, audio_file)
                    new_audio_path = os.path.join(new_folder_path, audio_file)

                    if not os.path.exists(old_audio_path):
                        return JsonResponse({"error": f"File '{audio_file}' not found in '{old_folder_name}'."}, status=404)

                    os.rename(old_audio_path, new_audio_path)
                    moved_files.append(audio_file)

                if not os.listdir(old_folder_path):
                    os.rmdir(old_folder_path)

                for audio_file in audio_files:
                    audio_chunks = AudioChunks.objects.filter(speaker=old_folder_name)

                    for chunk in audio_chunks:
                        if audio_file in chunk.audio_chunks_name:
                            chunk.speaker = new_folder_name
                            chunk.is_edited = True
                            updated_audio_chunks_name = [new_audio_path.split(os.sep)[-1] for new_audio_path in moved_files]
                            chunk.audio_chunks_name = updated_audio_chunks_name
                            chunk.save()

            # Fetch all related audio chunks for the given job_id
            audio_files = AudioChunks.objects.select_related('audio_file').filter(audio_file_id=job_id)

            # Group audio chunks by speaker
            grouped_audio_files = defaultdict(list)
            for chunk in audio_files:
                grouped_audio_files[chunk.speaker].append({
                    "id": chunk.id,
                    "name": chunk.audio_chunks_name[0] if chunk.audio_chunks_name else None
                })

            return JsonResponse({
                "id": job_id,
                "audio_file": None,  # Replace with actual file URL if needed
                "message": "Audio chunks processed and saved successfully.",
                "data": grouped_audio_files
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload."}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


class KnownLabelList(APIView):
    """
    View to list all known labels as a simple list of label names.
    """
    def get(self, request, format=None):
        labels = KnownLabel.objects.all()
        label_names = [label.label_name for label in labels]  # Get a list of label names
        return Response(label_names, status=status.HTTP_200_OK)
    
class AddLabelView(APIView):
    permission_classes = [IsAuthenticated]  # Require authentication for this endpoint

    def post(self, request, *args, **kwargs):
        # Retrieve the labelName from the request
        label_name = request.data.get("labelName")
        user = request.user
        if not label_name:
            return Response(
                {"message": {"labelName": ["This field is required."]}}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Format the label name (e.g., "ALi YAr" -> "Ali Yar")
        formatted_label_name = label_name.strip().title()

        # Check if the label already exists
        if KnownLabel.objects.filter(label_name=formatted_label_name).exists():
            return Response(
                {"message": f"The label '{formatted_label_name}' already exists."}, 
                status=status.HTTP_409_CONFLICT
            )

        # Create a new label with the user's email
        serializer = KnownLabelSerializer(data={"labelName": formatted_label_name, "userEmail": user.email})
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Label added successfully.", "data": serializer.data}, 
                status=status.HTTP_201_CREATED
            )

        return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class GetAudioChunksView(APIView):
    """
    API View to fetch and format audio chunks for a given file_id using POST method.
    """

    def post(self, request, *args, **kwargs):
        # Validate input
        print(request.data)
        serializer = AudioFileRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        file_id = serializer.validated_data["fileId"]

        try:
            # Fetch the AudioFile
            audio_file = AudioFile.objects.get(id=file_id)
        except AudioFile.DoesNotExist:
            return Response({"error": f"AudioFile with id {file_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Fetch related AudioChunks
        audio_chunks = AudioChunks.objects.filter(audio_file=audio_file)
        formatted_data = {}

        for chunk in audio_chunks:
            speaker = chunk.speaker
            id = chunk.id
            
            print(f"{speaker} and ID{id}")
            if speaker not in formatted_data:
                formatted_data[speaker] = []

            # Assuming chunk.audio_chunks_name is a list, we will access the first element.
            if isinstance(chunk.audio_chunks_name, list):
                chunk_name = chunk.audio_chunks_name[0]  # Extract the name as a string
            else:
                chunk_name = chunk.audio_chunks_name  # If it's already a string, use it directly

            # Append the id and name as a dictionary
            formatted_data[speaker].append({
                "id": id,
                "name": chunk_name
            })

        response_data = {
            "id": audio_file.id,
            "message": "Audio chunks processed and saved successfully.",
            "data": formatted_data,
        }
        print(response_data)
        return Response(response_data, status=status.HTTP_200_OK)

        # # Use serializer to format the response
        # response_serializer = AudioFileResponseSerializer(data=response_data)
        # if response_serializer.is_valid():
        #     return Response(response_serializer.data, status=status.HTTP_200_OK)
        # else:
        #     return Response({"error": response_serializer.errors}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# class AudioChunksView(APIView):

    def get(self, request):
        try:
            trained = request.query_params.get('active', None)  # 'trainedData' or 'UntrainedData'
            speaker_filter = request.query_params.get('speaker', None)  # Partial speaker search
            start_date_str = request.query_params.get('startDate', None)  # Start of date range
            end_date_str = request.query_params.get('endDate', None)  # End of date range

            print(f"\n🔹 Received Parameters: active={trained}, speaker={speaker_filter}, startDate={start_date_str}, endDate={end_date_str}")

            start_date = parser.parse(start_date_str).date() if start_date_str else None
            end_date = parser.parse(end_date_str).date() if end_date_str else None

            # Fetch only annotated audio files using `only()`
            annotated_files = AudioFile.objects.filter(is_annotated=True).only('id')

            # Base query for chunks
            base_query = AudioChunks.objects.filter(is_deleted=False, audio_file__in=annotated_files)

            if trained == 'UntrainedData':
                base_query = base_query.filter(is_edited=True)
            elif trained == 'trainedData':
                base_query = base_query.filter(is_edited=False)

            # Apply date filtering in one query
            if start_date or end_date:
                date_filter = Q()
                if start_date:
                    date_filter &= Q(created_at__date__gte=start_date)
                if end_date:
                    date_filter &= Q(created_at__date__lte=end_date)
                base_query = base_query.filter(date_filter)

            # Apply speaker filtering in one step
            if speaker_filter:
                base_query = base_query.filter(speaker__icontains=speaker_filter)

            # Optimize related model loading using `select_related`
            optimized_chunks = base_query.select_related("audio_file").only("id", "speaker", "chunk_name", "created_at")

            # Serialize the filtered data
            serializer = AudioChunksSerializer(optimized_chunks, many=True)

            # Group data by speaker
            response_data = { 
                "data": group_audio_by_speaker(serializer.data),
                "message": "Optimized Response"
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class AudioChunksView(APIView):

    def get(self, request):
        try:
            trained = request.query_params.get('active', None)  # 'trainedData' or 'UntrainedData'
            speaker_filter = request.query_params.get('speaker', None)  # Partial speaker search
            start_date_str = request.query_params.get('startDate', None)  # Start of date range
            end_date_str = request.query_params.get('endDate', None)  # End of date range

            print(f"\n🔹 Received Parameters: active={trained}, speaker={speaker_filter}, startDate={start_date_str}, endDate={end_date_str}")

            start_date = parser.parse(start_date_str).date() if start_date_str else None
            end_date = parser.parse(end_date_str).date() if end_date_str else None

            # Fetch only annotated audio files
            annotated_files = AudioFile.objects.filter(is_annotated=True)

            edited_chunks = AudioChunks.objects.filter(is_edited=True, is_deleted=False, audio_file__in=annotated_files)
            non_edited_chunks = AudioChunks.objects.filter(is_edited=False, is_deleted=False, audio_file__in=annotated_files)

            if trained == 'UntrainedData' and (start_date or end_date):
                if start_date and end_date:
                    edited_chunks = edited_chunks.filter(created_at__date__range=[start_date, end_date])
                elif start_date:
                    edited_chunks = edited_chunks.filter(created_at__date__gte=start_date)
                elif end_date:
                    edited_chunks = edited_chunks.filter(created_at__date__lte=end_date)

            if speaker_filter:
                edited_chunks = edited_chunks.filter(speaker__icontains=speaker_filter)
                non_edited_chunks = non_edited_chunks.filter(speaker__icontains=speaker_filter)

            if trained == 'UntrainedData':
                edited_serializer = AudioChunksSerializer(edited_chunks, many=True)
                response_data = {"noneTrainedData": group_audio_by_speaker(edited_serializer.data)}
                return Response(response_data, status=status.HTTP_200_OK)

            elif trained == 'trainedData':
                non_edited_serializer = AudioChunksSerializer(non_edited_chunks, many=True)
                response_data = {"TrainedData": group_audio_by_speaker(non_edited_serializer.data)}
                return Response(response_data, status=status.HTTP_200_OK)

            edited_serializer = AudioChunksSerializer(edited_chunks, many=True)
            non_edited_serializer = AudioChunksSerializer(non_edited_chunks, many=True)

            response_data = {
                "noneTrainedData": group_audio_by_speaker(edited_serializer.data),
                "trainedData": group_audio_by_speaker(non_edited_serializer.data)
            }
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AudioChunksView(APIView):

    def get(self, request):
        try:
            trained = request.query_params.get('active', None)  # 'true' or 'false'
            print('trained before', trained)
            print("Traned after", trained)

            speaker_filter = request.query_params.get('speaker', None)  # Partial speaker search
            start_date = request.query_params.get('startDate', None)  # Start of date range
            end_date = request.query_params.get('endDate', None)  # End of date range

            print('start date', start_date)
            print('end date', end_date)

            # Fetch annotated audio files
            base_query = AudioChunks.objects.filter(is_deleted=False)

            if start_date and end_date:
                base_query = base_query.filter(created_at__date__range=[start_date, end_date])
            elif start_date:
                base_query = base_query.filter(created_at__date__gte=start_date)
            elif end_date:
                base_query = base_query.filter(created_at__date__lte=end_date)

            # Apply label filtering if provided
            if speaker_filter:
                base_query = base_query.filter(label__icontains=speaker_filter)

                
            if trained == 'trainedData':
                # Get non-edited (trained) images
                trained_images = base_query.filter(is_edited=False)
                trained_serializer = AudioChunksSerializer(trained_images, many=True)
                response_data = {
                    "trainedData": group_audio_by_speaker(trained_serializer.data)
                }
                return Response(response_data, status=200)

            elif trained == 'noneTrainedData':
                # Get edited (untrained) images
                untrained_images = base_query.filter(is_edited=True)
                untrained_serializer = AudioChunksSerializer(untrained_images, many=True)
                response_data = {
                    "noneTrainedData": group_audio_by_speaker(untrained_serializer.data)
                }
                return Response(response_data, status=200)

            else:
                # Get both trained and untrained images
                trained_images = base_query.filter(is_edited=False)
                untrained_images = base_query.filter(is_edited=True)

                trained_serializer = AudioChunksSerializer(trained_images, many=True)
                untrained_serializer = AudioChunksSerializer(untrained_images, many=True)

                response_data = {
                    "trainedData": group_audio_by_speaker(trained_serializer.data),
                    "noneTrainedData": group_audio_by_speaker(untrained_serializer.data)
                }
                return Response(response_data, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

## this code works without keyword filters
# class AudioChunksView(APIView):

#     def get(self, request):
#         try:
#             # Fetch annotated audio files
#             annotated_files = AudioFile.objects.filter(is_annotated=True)

#             # Apply filter: is_deleted=False
#             edited_chunks = AudioChunks.objects.filter(
#                 is_edited=True,
#                 is_deleted=False,  # Exclude deleted chunks
#                 audio_file__in=annotated_files
#             )
#             non_edited_chunks = AudioChunks.objects.filter(
#                 is_edited=False,
#                 is_deleted=False,  # Exclude deleted chunks
#                 audio_file__in=annotated_files
#             )

#             # Serialize data
#             edited_serializer = AudioChunksSerializer(edited_chunks, many=True)
#             non_edited_serializer = AudioChunksSerializer(non_edited_chunks, many=True)

#             # Prepare response
#             response_data = {
#                 "noneTrainedData": group_audio_by_speaker(edited_serializer.data),
#                 "trainedData": group_audio_by_speaker(non_edited_serializer.data)
#             }

#             return Response(response_data, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def delete(self, request):
#         try:
#             speaker = request.data.get('speaker')
#             chunk_id = request.data.get('chunk_id')
#             file_name = request.data.get('file_name')
#             if not speaker or not chunk_id:
#                 return Response({"error": "Speaker and chunk_id are required"}, status=status.HTTP_400_BAD_REQUEST)

#             # Find the chunk based on speaker and chunk_id
#             chunk_to_delete = AudioChunks.objects.filter(id=chunk_id, speaker=speaker).first()

#             if chunk_to_delete:
#                 chunk_to_delete.delete()
#                 folder_to_delete = os.path.join(settings.MEDIA_ROOT, 'Speakers', speaker, file_name)
#                 if os.path.exists(folder_to_delete):
#                     os.remove(folder_to_delete)
#                 return Response({"message": "Chunk deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
#             else:
#                 return Response({"error": "Chunk not found"}, status=status.HTTP_404_NOT_FOUND)

#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# This code will combine the trained or none trained audios togather
# class AudioChunksView(APIView):

#     def get(self, request):
#         try:
#             # Fetch annotated audio files
#             annotated_files = AudioFile.objects.filter(is_annotated=True)

#             # Fetch edited chunks linked to annotated files (untrained category)
#             edited_chunks = AudioChunks.objects.filter(
#                 is_edited=True,
#                 audio_file__in=annotated_files
#             )
#             edited_serializer = AudioChunksSerializer(edited_chunks, many=True)

#             # Fetch non-edited chunks linked to annotated files (trained category)
#             non_edited_chunks = AudioChunks.objects.filter(
#                 is_edited=False,
#                 audio_file__in=annotated_files
#             )
#             non_edited_serializer = AudioChunksSerializer(non_edited_chunks, many=True)

#             # Group audio chunks by speaker
#             none_trained_data = group_audio_by_speaker(edited_serializer.data)
#             trained_data = group_audio_by_speaker(non_edited_serializer.data)

#             # Get speakers present in both categories
#             none_trained_speakers = {data['speaker'] for data in none_trained_data}
#             trained_speakers = {data['speaker'] for data in trained_data}
#             overlapping_speakers = none_trained_speakers & trained_speakers

#             # Filter out overlapping speakers from trainedData
#             filtered_trained_data = [
#                 data for data in trained_data
#                 if data['speaker'] not in overlapping_speakers
#             ]

#             # Prepare response
#             response_data = {
#                 "noneTrainedData": none_trained_data,
#                 "trainedData": filtered_trained_data
#             }

#             return Response(response_data, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class   UpdateTrainingProgressAPI(APIView):
    
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
            training_progress = TrainingProgress.objects.get(id=training_progress_id)

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
                if request.data.get("status") == "completed":
                    for file_name in file_names:
                        print('File name ', file_name)

                        # Get all AudioChunks instances (filter manually in Python)
                        audio_chunk_instances = AudioChunks.objects.all()

                        # Filter manually to check if the chunk name exists in audio_chunks_name
                        objct = next((chunk for chunk in audio_chunk_instances if file_name in chunk.audio_chunks_name), None)

                        if objct:
                            print("Found AudioChunk instance:", objct)
                            objct.is_edited = True
                            # objct.is_deleted = False
                            objct.save()
                        else:
                            print(f"File name {file_name} not found in AudioChunks.")
                    
                    print("File names are updated")
            training_progress.save()

            return Response({"message": "Training progress updated successfully."}, status=status.HTTP_200_OK)

        except TrainingProgress.DoesNotExist:
            return Response({"error": "Training progress not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"message": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetTrainingProgressAPI(APIView):
    """
    API to fetch AI training progress records of the logged-in user, grouped by version,
    and sorted in descending order by created_at timestamp.
    """
    permission_classes = [IsAuthenticated]  

    def get_audio_chunks(self, version):
        """Fetch and merge audio chunk details for a given TrainingVersion"""
        if version and version.audios_id:
            audio_chunks = AudioChunks.objects.filter(id__in=version.audios_id)

            merged_chunks = defaultdict(list)

            for chunk in audio_chunks:
                merged_chunks[chunk.speaker].append({
                    "id": chunk.id,  
                    "audioChunk": chunk.audio_chunks_name[0]
                })  
            
            # Convert to required format
            return [
                {
                    "speaker": speaker, 
                    "chunks": audios  # List of audio chunks with id & name
                } 
                for speaker, audios in merged_chunks.items()
            ]

        return []
    
    
    def get(self, request):
        try:
            module_name = request.query_params.get('moduleName')
            if not module_name:
                return Response(
                    {"message": "Module name is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            all_progress = TrainingProgress.objects.filter(
                user=request.user, 
                module_name=module_name
            ).order_by('-created_at')

            if not all_progress.exists():
                return Response(
                    {"message": "No training progress records found for this user."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Flattened list instead of grouping by version
            result_data = []
            for progress in all_progress:
                progress_data = {
                    "id": progress.id,  # ID first
                    # "version": version_name,  # Version as a simple string
                    **TrainingProgressSerializer(progress).data,  # Serialize training progress
                    "trainedData": self.get_audio_chunks(progress.release_version)  # Add audio chunk details
                }
                
                result_data.append(progress_data)

            return Response(result_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class GetTrainingProgressByIdAPI(APIView):
    """
    API to fetch training progress details by ID.
    """
    permission_classes = [IsAuthenticated]  # Require authentication for this endpoint

    def get(self, request, id):
        try:
            # Retrieve the TrainingProgress object by ID
            training_progress = TrainingProgress.objects.get(id=id)
            # Serialize the object
            serializer = TrainingProgressSerializerAPIId(training_progress)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except TrainingProgress.DoesNotExist:
            # Handle the case where the object does not exist
            return Response({"message": "Training progress not found."}, status=status.HTTP_404_NOT_FOUND)
        

class DoAudioChunkAnnotationView(APIView):
    """
    API to mark an audio file as annotated.
    """
    # permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Retrieve the 'id' from query parameters
            audio_file_id = request.data.get('id')
            if not audio_file_id:
                return Response({"error": "Audio file ID is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the audio file by ID
            try:
                audio_file = AudioFile.objects.get(id=audio_file_id)
            except AudioFile.DoesNotExist:
                return Response({"error": "Audio file not found."}, status=status.HTTP_404_NOT_FOUND)

            # Update the is_annotated field
            audio_file.is_annotated = True
            audio_file.save()

            return Response({"message": "Audio file marked as annotated successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": "An error occurred.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeleteChunksView(APIView):
    def delete(self, request):
        try:
            # Extract the required data from the request
            chunk_id = request.data.get('id')
            speaker = request.data.get('speaker')
            chunk_name = request.data.get('audioChunkName')

            # Validate required fields
            if not (chunk_id and speaker and chunk_name):
                return Response(
                    {"error": "ID, speaker, and audio_chunk_name are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Fetch the AudioChunk object
            try:
                chunk = AudioChunks.objects.get(id=chunk_id, speaker=speaker)
            except AudioChunks.DoesNotExist:
                return Response(
                    {"error": "Chunk not found for the given ID and speaker"},
                    status=status.HTTP_404_NOT_FOUND, 
                )

            # Check if the chunk_name exists in the audio_chunks_name field
            if chunk_name not in chunk.audio_chunks_name:
                return Response(
                    {"error": f"Audio chunk '{chunk_name}' not found in the database"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Set `is_deleted` to True instead of deleting
            chunk.is_deleted = True
            chunk.save()
            # delete_embeddings()
            return Response({"message": "Chunk marked as deleted successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



import os
import json
import shutil
import threading
import requests
import logging
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView


import asyncio
import aiofiles
import aiohttp


logger = logging.getLogger(__name__)

class ZipAndCreateTrainingProgressAPI(APIView):
    def post(self, request):
        try:
            # Step 1: Extract module name and folder-audio mapping
            module_name = request.data.get("moduleName")
            folders = request.data.get("forTrain", {})  # Expected format: { "Speaker_1": [101, 102], ... }
            for_untrain = request.data.get('forUntrain', {})  # Ensure it's captured correctly
            for_retrain = request.data.get('reTrain', {})

            print("\n--- Incoming Module Training Request ---")
            print(f"Module Name: {module_name}")
            print("For Train:\n", json.dumps(folders, indent=4))
            print("For Untrain:\n", json.dumps(for_untrain, indent=4))
            print("For Retrain:\n", json.dumps(for_retrain, indent=4))
            print("----------------------------------------\n")

            
            if not module_name:
                return Response({"error": "moduleName is required"}, status=status.HTTP_400_BAD_REQUEST)

            user = request.user  # Logged-in user
            user_id = user.id

            # Step 2: Flatten all audio IDs from folders
            audio_ids = [audio_id for audio_list in folders.values() for audio_id in audio_list]
            retrain_speakers = list(for_retrain.keys())
            retrain_audio_ids = [audio_id for ids in for_retrain.values() for audio_id in ids]
            audio_ids += retrain_audio_ids

            reset_is_edited(audio_ids)  # Reset 'is_edited' for selected audio IDs

            # Step 3: Create a new version and training progress
            speaker_folders = list(folders.keys()) + retrain_speakers

            new_version = create_version(module_name, speaker_folders, audio_ids)
            training_id = create_training_progress(
                user=user,
                module_name=module_name,
                version_name=new_version,
            )

            # Step 4: Set up file paths
            speakers_path = os.path.join(settings.MEDIA_ROOT, "Speakers")
            training_data_folder = os.path.join(speakers_path, "training_data")
            data_folder = os.path.join(training_data_folder, "data")

            # Step 5: Create necessary directories
            os.makedirs(data_folder, exist_ok=True)

            # Step 6: Copy speaker folders into "data"
            for folder in speaker_folders:
                folder_path = os.path.join(speakers_path, folder)
                destination_path = os.path.join(data_folder, folder)

                if os.path.exists(folder_path):
                    if os.path.exists(destination_path):
                        shutil.rmtree(destination_path)  # Remove existing folder to avoid conflicts
                    shutil.copytree(folder_path, destination_path)  # Copy folder
                else:
                    logger.warning(f"Folder {folder} not found. Skipping.")

            # Step 7: Zip the "training_data" folder
            training_data_zip_path = os.path.join(speakers_path, "training_data.zip")
            shutil.make_archive(training_data_zip_path.replace(".zip", ""), 'zip', training_data_folder)

            # Step 8: Send zip file and forUntrain list to AI API asynchronously
            thread = threading.Thread(target=self.send_zip_to_ai_api, args=(training_data_zip_path, training_id, for_untrain, training_data_folder))
            thread.start()

            # Step 9: Return response immediately
            return Response(
                {"message": "Training process started. AI API will handle the training asynchronously."},
                status=status.HTTP_202_ACCEPTED
            )

        except Exception as e:
            logger.error(f"Error in ZipAndCreateTrainingProgressAPI: {str(e)}", exc_info=True)
            return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def send_zip_to_ai_api(self, training_data_zip_path, training_id, for_untrain, training_data_folder):
        """ Sends the zip file and forUntrain list to the AI API asynchronously and removes them afterward """
        try:
            with open(training_data_zip_path, 'rb') as f:
                files = {
                    'Zip_file': (os.path.basename(training_data_zip_path), f, 'application/zip')
                }
                data = {
                    'data': json.dumps({'for_untrain': for_untrain})  # ✅ Corrected JSON format
                }

                # ✅ Corrected URL with training_id as query param
                ai_api_url = f"http://192.168.18.164:8025/Speaker_Recognition/?training_id={training_id}"
                response = requests.post(ai_api_url, files=files, data=data)
                if response.status_code == 200:
                    for speaker, files in for_untrain.items():
                        for filename in files:
                            try:
                                # Fetch all AudioChunks instances
                                audio_chunk_instances = AudioChunks.objects.all()

                                # Manually filter to find the chunk containing the filename
                                chunk = next((instance for instance in audio_chunk_instances if filename in instance.audio_chunks_name), None)

                                if chunk:
                                    print(f"Found chunk: {chunk}")
                                    # chunk.is_deleted = True  # or chunk.is_edited = True, depending on what "uncheck" means
                                    # chunk.save()
                                else:
                                    print(f"No chunk found with filename: {filename}")

                            except Exception as e:
                                print(f"Error processing chunk for filename {filename}: {str(e)}")

                logger.info(f"Response from AI API: {response.status_code} - {response.text}")

        except Exception as e:
            logger.error(f"Failed to send zip to AI API: {str(e)}", exc_info=True)

        finally:
            # ✅ Always remove the zip file and training_data folder, regardless of success or failure
            if os.path.exists(training_data_zip_path):
                os.remove(training_data_zip_path)
                logger.info(f"Deleted zip file: {training_data_zip_path}")

            if os.path.exists(training_data_folder):
                shutil.rmtree(training_data_folder)
                logger.info(f"Deleted training data folder: {training_data_folder}")

##works but does not clear the zip folder and raining data folder          
# class ZipAndCreateTrainingProgressAPI(APIView):
#     def post(self, request):
#         try:
#             # Step 1: Extract module name and folder-audio mapping
#             module_name = request.data.get("moduleName")
#             folders = request.data.get("forTrain", {})  # Expected format: { "Speaker_1": [101, 102], ... }
#             for_untrain = request.data.get('forUntrain', {})  # Ensure it's captured correctly
#             for_retrain = request.data.get('reTrain', {})

#             if not module_name:
#                 return Response({"error": "moduleName is required"}, status=status.HTTP_400_BAD_REQUEST)

#             user = request.user  # Logged-in user
#             user_id = user.id
#             print('+++++++++++++++++++++++++++++++')
#             print(user_id)
#             print('+++++++++++++++++++++++++++++++')
#             # Step 2: Flatten all audio IDs from folders
#             audio_ids = [audio_id for audio_list in folders.values() for audio_id in audio_list]
#             retrain_speakers = list(for_retrain.keys())
#             retrain_audio_ids = [audio_id for ids in for_retrain.values() for audio_id in ids]
#             audio_ids += retrain_audio_ids

#             reset_is_edited(audio_ids)  # Reset 'is_edited' for selected audio IDs

#             # Step 3: Create a new version and training progress
#             speaker_folders = list(folders.keys()) + retrain_speakers

#             new_version = create_version(module_name, speaker_folders, audio_ids)
#             training_id = create_training_progress(
#                 user=user,
#                 module_name=module_name,
#                 version_name=new_version,
#             )

#             # Step 4: Set up file paths
#             speakers_path = os.path.join(settings.MEDIA_ROOT, "Speakers")
#             training_data_folder = os.path.join(speakers_path, "training_data")
#             data_folder = os.path.join(training_data_folder, "data")

#             # Step 5: Create necessary directories
#             os.makedirs(data_folder, exist_ok=True)

#             # Step 6: Copy speaker folders into "data"
#             for folder in speaker_folders:
#                 folder_path = os.path.join(speakers_path, folder)
#                 destination_path = os.path.join(data_folder, folder)

#                 if os.path.exists(folder_path):
#                     if os.path.exists(destination_path):
#                         shutil.rmtree(destination_path)  # Remove existing folder to avoid conflicts
#                     shutil.copytree(folder_path, destination_path)  # Copy folder
#                 else:
#                     logger.warning(f"Folder {folder} not found. Skipping.")

#             # Step 7: Zip the "training_data" folder
#             training_data_zip_path = os.path.join(speakers_path, "training_data.zip")
#             shutil.make_archive(training_data_zip_path.replace(".zip", ""), 'zip', training_data_folder)

#             # Step 8: Send zip file and forUntrain list to AI API asynchronously
#             thread = threading.Thread(target=self.send_zip_to_ai_api, args=(training_data_zip_path, training_id, for_untrain))
#             thread.start()

#             # Step 9: Return response immediately
#             return Response(
#                 {"message": "Training process started. AI API will handle the training asynchronously."},
#                 status=status.HTTP_202_ACCEPTED
#             )

#         except Exception as e:
#             logger.error(f"Error in ZipAndCreateTrainingProgressAPI: {str(e)}", exc_info=True)
#             return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def send_zip_to_ai_api(self, training_data_zip_path, training_id, for_untrain):
#         """ Sends the zip file and forUntrain list to the AI API asynchronously """
#         try:
#             with open(training_data_zip_path, 'rb') as f:
#                 files = {
#                     'Zip_file': (os.path.basename(training_data_zip_path), f, 'application/zip')
#                 }
#                 data = {
#                     'data': json.dumps({'for_untrain': for_untrain})  # ✅ Corrected JSON format
#                 }

#                 # ✅ Corrected URL with training_id as query param
#                 ai_api_url = f"http://192.168.18.164:8025/Speaker_Recognition/?training_id={training_id}"
#                 response = requests.post(ai_api_url, files=files, data=data)

#                 if response.status_code == 200:
#                     logger.info("Zip file and forUntrain list sent successfully.")
#                 else:
#                     logger.error(f"Failed to send data: {response.status_code} - {response.text}")

#         except Exception as e:
#             logger.error(f"Failed to send zip to AI API: {str(e)}", exc_info=True)

# ## 2-26-2.25
# class ZipAndCreateTrainingProgressAPI(APIView):

#     def post(self, request):
#         try:
#             # Step 1: Extract module name and folder-audio mapping
#             module_name = request.data.get("moduleName")
#             folders = request.data.get("forTrain", {})  # Expected format: { "Speaker_1": [101, 102], ... }
#             for_untrain = request.data.get('forUntrain', {})
#             print('For Untrain ', for_untrain)
#             for_retrain = request.data.get('reTrain', {})
#             if not folders or not module_name:
#                 return Response({"error": "folders and moduleName are required"}, status=status.HTTP_400_BAD_REQUEST)

#             user = request.user  # Logged-in user

#             # Step 2: Flatten all audio IDs from folders
#             audio_ids = [audio_id for audio_list in folders.values() for audio_id in audio_list]
#             retrain_speakers = list(for_retrain.keys())  # ['Speaker_4']
#             retrain_audio_ids = [audio_id for ids in for_retrain.values() for audio_id in ids]  # [107, 108]
#             audio_ids = audio_ids + retrain_audio_ids

#             print('The IDDDDDDDs', audio_ids)
#             print('The for_retrain', retrain_speakers , retrain_audio_ids)

#             reset_is_edited(audio_ids)  # Function to reset 'is_edited' for the given audio IDs

#             # Step 3: Create a new version and training progress
#             speaker_folders = list(folders.keys())  # Extract speaker folder names
#             speaker_folders = speaker_folders + retrain_speakers
#             print('The SPEAKERRRRR', speaker_folders)

#             new_version = create_version(module_name, speaker_folders, audio_ids)
#             training_id = create_training_progress(
#                 user=user,
#                 module_name=module_name,
#                 version_name=new_version,
#             )

#             # Step 4: Set up file paths
#             speakers_path = os.path.join(settings.MEDIA_ROOT, "Speakers")
#             training_data_folder = os.path.join(speakers_path, "training_data")
#             data_folder = os.path.join(training_data_folder, "data")

#             # Step 5: Create necessary directories
#             os.makedirs(data_folder, exist_ok=True)
#             # Step 6: Copy speaker folders into "data"
#             for folder in speaker_folders:
#                 folder_path = os.path.join(speakers_path, folder)
#                 destination_path = os.path.join(data_folder, folder)

#                 if os.path.exists(folder_path):
#                     if os.path.exists(destination_path):
#                         shutil.rmtree(destination_path)  # Remove existing folder to avoid conflicts
#                     shutil.copytree(folder_path, destination_path)  # Copy folder
#                 else:
#                     logger.warning(f"Folder {folder} not found. Skipping.")

#             # Step 7: Zip the "training_data" folder
#             training_data_zip_path = os.path.join(speakers_path, "training_data.zip")

#             shutil.make_archive(training_data_zip_path.replace(".zip", ""), 'zip', training_data_folder)

#             # Step 8: Send zip file to AI API asynchronously
#             thread = threading.Thread(target=self.send_zip_to_ai_api, args=(training_data_zip_path, training_id))
#             thread.start()

#             # Step 9: Return response immediately
#             return Response(
#                 {"message": "Training process started. AI API will handle the training asynchronously."},
#                 status=status.HTTP_202_ACCEPTED
#             )

#         except Exception as e:
#             logger.error(f"Error in ZipAndCreateTrainingProgressAPI: {str(e)}", exc_info=True)
#             return Response({"error": f"Internal server error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#     def send_zip_to_ai_api(self, training_data_zip_path, training_id, for_untrain=[]):
#         """ Sends the zip file to the AI API asynchronously """
#         try:
#             with open(training_data_zip_path, 'rb') as f:
#                 files = {
#                     'Zip_file': (os.path.basename(training_data_zip_path), f, 'application/zip')
#                 }
#                 data = {
#                     'for_untrain': for_untrain  # Sending list in JSON

#                 }
#                 ai_api_url = f"http://192.168.18.164:8025/Speaker_Recognition/?training_id={training_id}"
#                 response = requests.post(ai_api_url, files=files, data={'json_data': json.dumps(data)})
                
#                 logger.info("Zip file sent to AI API successfully.")

#         except Exception as e:
#             logger.error(f"Failed to send zip to AI API: {str(e)}", exc_info=True)



class TrainingProgressByVersion(APIView):
    def get(self, request):
        """Returns training progress grouped by version with efficient queries"""
        version_details = TrainingVersions.objects.all()
        response_data = {}

        for version in version_details:
            if version.audios_id:
                # Fetch all AudioChunks in a single query
                audio_chunks = AudioChunks.objects.filter(id__in=version.audios_id)
                for i in audio_chunks:
                    print("The chuks", i)
                chunk_data = [
                    {"speaker": chunk.speaker, "audio_chunks_name": chunk.audio_chunks_name}
                    for chunk in audio_chunks
                ]

                response_data[version.version_name] = chunk_data

        return Response(response_data, status=status.HTTP_200_OK)



class AudioChunksViewTest(APIView):

    def get_training_versions(self, request):
        """Fetch and serialize training versions for the logged-in user with full logic"""
        module_name = request.query_params.get('moduleName')
        if not module_name:
            return []

        training_versions = TrainingProgress.objects.filter(
            user=request.user, 
            module_name=module_name
        ).order_by('-created_at')

        if not training_versions.exists():
            return []  # Instead of returning 404, keep it empty to avoid breaking the response

        # Include audio chunks using the existing logic
        result_data = []
        for progress in training_versions:
            progress_data = {
                "id": progress.id,
                **TrainingProgressSerializer(progress).data,
                "audios": self.get_audio_chunks(progress.release_version)  # Add chunk details
            }
            result_data.append(progress_data)

        return result_data

    def get_audio_chunks(self, version):
        """Fetch and merge audio chunk details for a given TrainingVersion"""
        if version and version.audios_id:
            audio_chunks = AudioChunks.objects.filter(id__in=version.audios_id)

            merged_chunks = defaultdict(list)

            for chunk in audio_chunks:
                merged_chunks[chunk.speaker].append({
                    "id": chunk.id,  
                    "audio_chunks_name": chunk.audio_chunks_name
                })  
            
            return [{"speaker": speaker, "audios": audios} for speaker, audios in merged_chunks.items()]

        return []

    def get(self, request):
        try:
            trained = request.query_params.get('trained', None)
            speaker_filter = request.query_params.get('speaker', None)
            date_filter = request.query_params.get('date', None)
            
            annotated_files = AudioFile.objects.filter(is_annotated=True)

            if trained == 'true':
                non_edited_chunks = AudioChunks.objects.filter(
                    is_edited=False,
                    is_deleted=False,
                    audio_file__in=annotated_files
                )
                
                if speaker_filter:
                    non_edited_chunks = non_edited_chunks.filter(speaker=speaker_filter)

                non_edited_serializer = AudioChunksSerializer(non_edited_chunks, many=True)

                response_data = {
                    "trainedData": group_audio_by_speaker(non_edited_serializer.data),
                    "version": self.get_training_versions(request)  # Fully applied logic
                }
                return Response(response_data, status=status.HTTP_200_OK)

            elif trained == 'false':  
                edited_chunks = AudioChunks.objects.filter(
                    is_edited=True,
                    is_deleted=False,
                    audio_file__in=annotated_files
                )

                if date_filter:
                    edited_chunks = edited_chunks.filter(created_at__date=date_filter)

                edited_serializer = AudioChunksSerializer(edited_chunks, many=True)

                response_data = {
                    "noneTrainedData": group_audio_by_speaker(edited_serializer.data),
                    "version": self.get_training_versions(request)  # Fully applied logic
                }
                return Response(response_data, status=status.HTTP_200_OK)

            else:
                edited_chunks = AudioChunks.objects.filter(
                    is_edited=True,
                    is_deleted=False,
                    audio_file__in=annotated_files
                )
                non_edited_chunks = AudioChunks.objects.filter(
                    is_edited=False,
                    is_deleted=False,
                    audio_file__in=annotated_files
                )

                edited_serializer = AudioChunksSerializer(edited_chunks, many=True)
                non_edited_serializer = AudioChunksSerializer(non_edited_chunks, many=True)

                response_data = {
                    "noneTrainedData": group_audio_by_speaker(edited_serializer.data),
                    "trainedData": group_audio_by_speaker(non_edited_serializer.data),
                    "version": self.get_training_versions(request)  # Fully applied logic
                }
                return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
