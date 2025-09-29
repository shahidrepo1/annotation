import os
import uuid
import requests
from pydub import AudioSegment
from annotation_project import settings
from django.core.files.storage import default_storage


def get_stt_response(file_path):
    """
    Sends an audio file to the specified URL for speech-to-text (STT) processing.

    Parameters:
        file_path (str): The path to the audio file to be uploaded.

    Returns:
        dict: A dictionary containing the response status and data.
    """
    headers = {
        'api_key': settings.STT_API_KEY,
        'news_type': 'live',
        'language': 'urdu',
    }
    
    url = settings.STT_API  # Ensure this is set to 'http://192.168.18.81:2000/transcribe_video/'
    
    try:
        with open(file_path, 'rb') as audio_file:
            files = {
                'video_file': (file_path.split('/')[-1], audio_file, 'audio/wav'),
            }
            
            response = requests.post(url, headers=headers, files=files)
            
            if response.status_code == 200:
                return {
                    'status_code': 200,
                    'response': response.json()
                }
            else:
                return {
                    'status_code': response.status_code,
                    'response': response.text
                }
    
    except FileNotFoundError:
        return {'status_code': 404, 'response': 'File not found'}
    except Exception as e:
        return {'status_code': 500, 'response': str(e)}



def process_audio_chunks(audio_path, timestamps):
    try:
        # Load the audio file
        audio = AudioSegment.from_file(audio_path)

        # Get the base directory for saving the chunks
        speakers_dir = os.path.join(settings.MEDIA_ROOT, "stt_chunks")
        os.makedirs(speakers_dir, exist_ok=True)

        # List to hold chunk details
        audio_chunks = []

        # Iterate over timestamps and save the audio chunks
        for index, ts in enumerate(timestamps):
            start_ms = ts["start"] * 1000  # Convert to milliseconds
            end_ms = ts["end"] * 1000  # Convert to milliseconds
            text = ts["text"]  # Extract text from timestamps

            # Extract the chunk
            chunk = audio[start_ms:end_ms]

            # Generate a unique filename
            unique_id = uuid.uuid4().hex  
            chunk_name = f"chunk_{index + 1}_{unique_id}.wav"
            chunk_path = os.path.join(speakers_dir, chunk_name)

            # Save the chunk
            chunk.export(chunk_path, format="wav")

            # Store chunk details
            audio_chunks.append({
                "audio_chunk": chunk_name,
                "text": text
            })

        return audio_chunks

    except Exception as e:
        return {"error": str(e)}

from stt_app.models import STTTrainingProgress, STTTrainingVersions

def create_version(module_name, audios_id):
    """
    Creates a new version with minor/major increments.
    """
    latest_version = STTTrainingVersions.objects.filter(version_module=module_name).order_by('-id').first()

    if latest_version and latest_version.version_name:
        try:
            # Extract version number (e.g., "v1.3" → major=1, minor=3)
            version_parts = latest_version.version_name.lstrip('v').split('.')
            major = int(version_parts[0])
            minor = int(version_parts[1])

            # Increment logic: minor goes from 0 to 9, then major increases
            if minor < 9:
                minor += 1
            else:
                major += 1
                minor = 0

            new_version_name = f"v{major}.{minor}"
        except (ValueError, IndexError):
            # If parsing fails, start fresh
            new_version_name = "v1.0"
    else:
        # If no version exists, start with v1.0
        new_version_name = "v1.0"

    # Create a new version entry
    new_version = STTTrainingVersions.objects.create(
        version_name=new_version_name,
        version_module=module_name,
        version_audio_id=audios_id
    )

    return new_version_name


from django.core.exceptions import MultipleObjectsReturned
import logging

logger = logging.getLogger(__name__)


def create_stt_training_progress(user, module_name, version_name, model_name="DefaultModel", epoch=0, total_epochs=0, f1_score=0, status="training"):
    
    try:
        # Ensure version name and module combination is unique
        version_obj, created = STTTrainingVersions.objects.get_or_create(
            version_name=version_name,
            version_module=module_name
        )
    except MultipleObjectsReturned:
        # If multiple objects exist, fetch the latest one and log a warning
        version_obj = STTTrainingVersions.objects.filter(version_name=version_name, version_module=module_name).latest('id')
        logger.warning(f"Duplicate TrainingVersions found for version: {version_name}, using latest entry.")

    # Create the training progress entry
    training_progress = STTTrainingProgress.objects.create(
        user=user,
        module_name=module_name,
        model_name=model_name,
        release_version=version_obj,
        epoch=epoch,
        total_epochs=total_epochs,
        f1_score=f1_score,
        status=status  # Ensure this matches the field in your model
    )
    return training_progress.id
