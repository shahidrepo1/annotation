from collections import defaultdict
import logging
import os
import zipfile
import tempfile
import requests
import json

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import localtime
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from sr_app.models import AudioFile
from sr_app.process_audio import save_audio_file
from stt_app.authentication import STTAPIKeyAuthentication
from stt_app.models import ProcessedChunk
from stt_app.serializers import ProcessedChunkSerializer, STTTrainingProgressSerializer
from stt_app.utils import create_stt_training_progress, create_version, get_stt_response, process_audio_chunks


logger = logging.getLogger(__name__)


@csrf_exempt
def process_audio_chunks_view(request):
    try:
        if request.method != "POST":
            return JsonResponse({"message": "Method not allowed."}, status=405)
        
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

        # Step 2: Get timestamps from STT API
        try:
            print('STT AI processing...')
            stt_response = get_stt_response(audio_path)
        except Exception as e:
            logger.error(f"Error when getting response from STT API: {str(e)}")
            return JsonResponse({"message": "Error while processing audio with STT API."}, status=500)

        # Validate STT API response
        if not stt_response or "status_code" not in stt_response:
            logger.error("Invalid response from STT API.")
            return JsonResponse({"message": "Invalid response format from STT API."}, status=400)

        if stt_response["status_code"] != 200:
            logger.error(f"STT API returned an error: {stt_response}")
            return JsonResponse({"message": "Failed to process audio with STT API.", "error": stt_response}, status=500)

        timestamps = stt_response.get("response", {}).get("Timestamp")
        if not timestamps or not isinstance(timestamps, list):
            logger.error("Invalid timestamp format in STT API response.")
            return JsonResponse({"message": "Invalid timestamp format from STT API."}, status=400)

        # Step 3: Process the audio chunks
        try:
            chunks_and_texts = process_audio_chunks(audio_path, timestamps)
        except Exception as e:
            logger.error(f"Error processing audio chunks: {str(e)}")
            return JsonResponse({"message": "Error while processing audio chunks."}, status=500)

        # Step 4: Save processed chunks in the database
        saved_chunks = []
        try:
            for chunk in chunks_and_texts:
                audio_chunk = chunk.get('audio_chunk')
                audio_text = chunk.get('text')

                if not audio_chunk or not audio_text:
                    logger.warning(f"Skipping invalid chunk data: {chunk}")
                    continue

                processed_chunk = ProcessedChunk.objects.create(
                    uploaded_file=saved_file,
                    chunk_name=audio_chunk,
                    transcription=audio_text
                )

                saved_chunks.append({
                    "id": processed_chunk.id,
                    "chunk_name": processed_chunk.chunk_name,
                    "transcription": processed_chunk.transcription,
                    "created_at": processed_chunk.created_at.isoformat(),
                    "is_edited": processed_chunk.is_edited,
                    "is_deleted": processed_chunk.is_deleted,
                    "uploaded_file": processed_chunk.uploaded_file.id
                })
        except Exception as e:
            logger.error(f"Error saving chunks in the database: {str(e)}")
            return JsonResponse({"message": "Error saving processed chunks."}, status=500)

        return JsonResponse({
            "message": "Audio chunks processed and saved successfully.",
            "chunks": saved_chunks
        }, status=200)

    except Exception as e:
        logger.exception("An unexpected error occurred while processing audio chunks.")
        return JsonResponse({"error": f"An unexpected error occurred: {str(e)}"}, status=500)
    


from rest_framework.decorators import api_view

@api_view(["POST"])
def edit_transcription(request):
    """Edit the transcription of a processed chunk using job_id."""
    job_id = request.data.get("job_id")
    chunk_id = request.data.get("chunk_id")
    new_transcription = request.data.get("transcription", "").strip()

    if not job_id or not chunk_id or not new_transcription:
        return Response({"error": "job_id, chunk_id, and transcription are required."}, status=status.HTTP_400_BAD_REQUEST)

    chunk = get_object_or_404(ProcessedChunk, id=chunk_id, uploaded_file__id=job_id)

    chunk.transcription = new_transcription
    chunk.is_edited = True
    chunk.save()

    # Retrieve all chunks related to the job_id (audio file)
    chunks = ProcessedChunk.objects.filter(uploaded_file__id=job_id, is_deleted=False)
    serializer = ProcessedChunkSerializer(chunks, many=True)

    return Response({
        "message": "Transcription updated successfully.",
        "chunks": serializer.data
    }, status=status.HTTP_200_OK)



@api_view(["POST"])
def delete_chunk(request):
    """Mark a processed chunk as deleted using job_id."""
    job_id = request.data.get("job_id")
    chunk_id = request.data.get("chunk_id")

    if not job_id or not chunk_id:
        return Response({"error": "job_id and chunk_id are required."}, status=status.HTTP_400_BAD_REQUEST)

    chunk = get_object_or_404(ProcessedChunk, id=chunk_id, uploaded_file__id=job_id)
    chunk.is_deleted = True
    chunk.save()

    # Retrieve all non-deleted chunks related to the job_id
    chunks = ProcessedChunk.objects.filter(uploaded_file__id=job_id, is_deleted=False)
    serializer = ProcessedChunkSerializer(chunks, many=True)

    return Response({
        "message": "Chunk marked as deleted.",
        "chunks": serializer.data
    }, status=status.HTTP_200_OK)


from django.http import JsonResponse
from .models import ProcessedChunk, STTTrainingProgress, STTTrainingVersions
import json

from datetime import datetime

def get_today_date():
    return datetime.today().strftime("%d-%m-%Y")


def classify_chunks(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)  # Parse JSON data
            chunk_ids = data.get("chunk_ids", [])  # Extract IDs safely

            if not chunk_ids:
                return JsonResponse({"error": "No chunk IDs provided"}, status=400)


            chunks = ProcessedChunk.objects.filter(id__in=chunk_ids)
            serializer = ProcessedChunkSerializer(chunks, many=True)  # Serialize the data

            response_data = {
                "folderName": get_today_date(),
                "data": serializer.data,
                "message": "Chunks classified successfully."
            }

            return JsonResponse(response_data, safe=False)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=400)


@api_view(['POST'])
def annotate_audio_chunk(request):
    """
    API to mark an audio file as annotated and return updated chunk data.
    """
    try:
        audio_file_id = request.data.get('id')
        if not audio_file_id:
            return Response({"error": "Audio file ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            audio_file = AudioFile.objects.get(id=audio_file_id)
            audio_file.is_annotated = True
            audio_file.save()
        except AudioFile.DoesNotExist:
            return Response({"error": "Audio file not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "Audio file marked as annotated successfully."}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"message": "An error occurred.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def get_chunks_by_date(request):
    start_date = request.query_params.get('startDate')
    end_date = request.query_params.get('endDate')

    chunks = ProcessedChunk.objects.all()

    # Optional: filter by date range
    if start_date and end_date:
        chunks = chunks.filter(created_at__date__range=[start_date, end_date])
    elif start_date:
        chunks = chunks.filter(created_at__date__gte=start_date)
    elif end_date:
        chunks = chunks.filter(created_at__date__lte=end_date)

    # Group chunks by created date
    grouped_chunks = {}
    for chunk in chunks:
        date_key = localtime(chunk.created_at).strftime("%d-%m-%Y")
        if date_key not in grouped_chunks:
            grouped_chunks[date_key] = []
        grouped_chunks[date_key].append({
            "id": chunk.id,
            "chunk_name": chunk.chunk_name,
            "transcription": chunk.transcription,
            "created_at": chunk.created_at,
            "is_edited": chunk.is_edited,
            "is_deleted": chunk.is_deleted,
            "is_trained": chunk.is_trained,
            "uploaded_file": chunk.uploaded_file.id,
        })

    response_data = [
        {
            "folderName": date,
            "data": chunks
        }
        for date, chunks in grouped_chunks.items()
    ]

    return Response(response_data)


# @csrf_exempt
# def train_stt(request):
#     if request.method != "POST":
#         return JsonResponse({"error": "Invalid request method"}, status=400)

#     try:
#         data = json.loads(request.body)
#         chunk_ids = data.get("chunk_ids", [])  # Extract the list of chunk IDs

#         if not chunk_ids:
#             return JsonResponse({"error": "No IDs provided"}, status=400)

#         chunks = ProcessedChunk.objects.filter(id__in=chunk_ids, is_deleted=False)

#         if not chunks.exists():
#             return JsonResponse({"error": "No valid processed chunks found"}, status=404)

#         # Create a ZIP file
#         zip_filename = "processed_chunks.zip"
#         zip_path = os.path.join(tempfile.gettempdir(), zip_filename)

#         with zipfile.ZipFile(zip_path, "w") as zipf:
#             for chunk in chunks:
#                 chunk_audio_filename = chunk.chunk_name  # Assuming this is the filename
#                 audio_path = os.path.join(settings.MEDIA_ROOT, "stt_chunks", chunk_audio_filename)

#                 if not os.path.exists(audio_path):
#                     continue  # Skip missing audio files

#                 # Create transcription text file
#                 transcription_text = chunk.transcription or "No transcription available"
#                 txt_filename = f"{chunk.chunk_name}.txt"
#                 txt_path = os.path.join(tempfile.gettempdir(), txt_filename)

#                 with open(txt_path, "w", encoding="utf-8") as txt_file:
#                     txt_file.write(transcription_text)

#                 # Add both files to ZIP
#                 zipf.write(audio_path, os.path.basename(audio_path))
#                 zipf.write(txt_path, txt_filename)

#                 # Remove temp text file
#                 os.remove(txt_path)

#         # Send ZIP file to AI API
#         ai_api_url = "https://example.com/transcription-api"  # Replace with actual API
#         with open(zip_path, "rb") as zip_file:
#             response = requests.post(ai_api_url, files={"file": zip_file})

#         # Clean up ZIP file
#         os.remove(zip_path)

#         if response.status_code == 200:
#             return JsonResponse({"message": "ZIP file sent successfully", "response": response.json()})
#         else:
#             return JsonResponse({"error": "Failed to send ZIP", "status": response.status_code})

#     except json.JSONDecodeError:
#         return JsonResponse({"error": "Invalid JSON format"}, status=400)

from rest_framework.decorators import api_view, permission_classes , authentication_classes
from rest_framework.permissions import IsAuthenticated



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def train_stt(request):
    module_name = request.data.get("moduleName")
    for_train = request.data.get("forTrain", [])
    user = request.user

    if not module_name:
        return Response({"error": "moduleName is required."}, status=400)
    if not for_train:
        return Response({"error": "No training data provided."}, status=400)

    # Step 1: Create version and training progress
    new_version = create_version(module_name, for_train)
    training_id = create_stt_training_progress(
        user=user,
        module_name=module_name,
        version_name=new_version,
    )

    chunks_path = os.path.join(settings.MEDIA_ROOT, "stt_chunks")
    zip_output_dir = os.path.join(settings.MEDIA_ROOT, "training_zips")
    os.makedirs(zip_output_dir, exist_ok=True)
    zip_path = os.path.join(zip_output_dir, f"{module_name}_train_data.zip")

    # Step 2: Create zip of audio + transcript files
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for chunk_id in for_train:
            try:
                chunk = ProcessedChunk.objects.select_related('uploaded_file').get(id=chunk_id)
                audio_path = os.path.join(chunks_path, chunk.chunk_name)

                if os.path.exists(audio_path):
                    zipf.write(audio_path, arcname=chunk.chunk_name)

                # Save corresponding .txt file for transcription
                text_name = os.path.splitext(chunk.chunk_name)[0] + ".txt"
                text_path = os.path.join(zip_output_dir, text_name)

                with open(text_path, 'w', encoding='utf-8') as f:
                    f.write(chunk.transcription or "")
                zipf.write(text_path, arcname=text_name)
                os.remove(text_path)

            except ProcessedChunk.DoesNotExist:
                continue

    # Step 3: Send to external training API
    try:
        with open(zip_path, 'rb') as zip_file:
            response = requests.post(
                f'{settings.STT_TRAIN_API}/finetune',
                files={
                    'zip_file': zip_file,
                },
                data={
                    'request_id': str(training_id)  # important param
                },
                timeout=30
            )

        api_response = response.json()
        print("API response:", api_response)

        # Optional: Update training progress (if model stats come immediately)
        stats = api_response.get("api_response", {}).get("model_stats", {})
        if stats:
            STTTrainingProgress.objects.filter(id=training_id).update(
                epoch=stats.get("epoch"),
                total_epochs=stats.get("total_epochs"),
                f1_score=stats.get("f1_score"),
                model_name='Whisper',
                status='training'
            )

    except Exception as e:
        print("Training API call failed:", e)
        api_response = {"error": str(e)}

    finally:
        # Step 4: Cleanup and mark as trained
        if os.path.exists(zip_path):
            os.remove(zip_path)

        ProcessedChunk.objects.filter(id__in=for_train).update(is_trained=True)

    return Response({
        "message": "Training request submitted.",
        "training_id": training_id,
        "api_response": api_response
    }, status=status.HTTP_202_ACCEPTED)



from collections import defaultdict
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stt_training_progress(request):
    versions = STTTrainingVersions.objects.prefetch_related('stttrainingprogress_set').all()

    grouped_by_date = defaultdict(list)

    for version in versions:
        version_date = version.created_at.date().isoformat()

        progress_list = []
        for progress in version.stttrainingprogress_set.all():
            audio_ids = version.version_audio_id or []
            valid_ids = [i for i in audio_ids if isinstance(i, int)]
            chunks = ProcessedChunk.objects.filter(id__in=valid_ids)

            trained_data = [
                {
                    "audio": chunk.chunk_name,
                    "transcription": chunk.transcription or ""
                }
                for chunk in chunks
            ]

            progress_list.append({
                "id": progress.id,
                "user": progress.user.id,
                "module_name": progress.module_name,
                "model_name": progress.model_name,
                "epoch": progress.epoch,
                "total_epochs": progress.total_epochs,
                "f1_score": progress.f1_score,
                "status": progress.status,
                "created_at": progress.created_at.isoformat(),
                "trainedData": trained_data
            })

        grouped_by_date[version_date].append({
            "version_name": version.version_name,
            "version_module": version.version_module,
            "version_created_at": version.created_at.isoformat(),
            "created_at": version.created_at,  # For sorting
            "progress": progress_list
        })

    # Prepare response with sorted versions and dates
    response_data = []
    for date, versions_list in sorted(grouped_by_date.items(), reverse=True):
        # Sort versions in reverse chronological order
        sorted_versions = sorted(versions_list, key=lambda v: v["created_at"], reverse=True)
        # Remove the temporary sort key before returning
        for v in sorted_versions:
            v.pop("created_at")
        response_data.append({
            "date": date,
            "versions": sorted_versions
        })

    return Response(response_data)



@api_view(['POST'])
@authentication_classes([STTAPIKeyAuthentication])  # Enforce API Key Authentication
def updatestttrainingprogress(request):
    # Extract the ID of the TrainingProgress object to update
        training_progress_id = request.data.get("id")
        file_names = request.data.get('file_ids', [])
        print('The id i got', file_names)
        # Validate required fields
        if not training_progress_id:
            return Response({"error": "Training Progress ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Look up the existing TrainingProgress object
            training_progress = STTTrainingProgress.objects.get(id=training_progress_id)

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

        except STTTrainingProgress.DoesNotExist:
            return Response({"error": "Training progress not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response(
                {"message": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
