import requests
import logging
from django.core.exceptions import MultipleObjectsReturned
from .models import TrainingProgress, TrainingVersions,AudioChunks

logger = logging.getLogger(__name__)


# def create_version(module_name, speaker_folders,audios_id):
#     """
#     Creates a new version based on the highest existing version of the specified module.
#     """
#     latest_version = TrainingVersions.objects.filter(version_module=module_name).order_by('-id').first()
    
#     # If there's an existing version
#     if latest_version and latest_version.version_name:
#         try:
#             # Extract version number from existing version name (e.g., v1.0 -> 1)
#             version_number = int(latest_version.version_name.split('v')[-1].split('.')[0])
#             # Increment the version number by 1
#             new_version_name = f"v{version_number + 1}.0"
#         except ValueError:
#             # If version naming is not expected, default to v1.0
#             new_version_name = "v1.0"
#     else:
#         # If no version exists, start with v1.0
#         new_version_name = "v1.0"

#     # Create a new version entry
#     new_version = TrainingVersions.objects.create(
#         version_name=new_version_name,
#         version_module=module_name,
#         version_speakers= speaker_folders,
#         audios_id=audios_id

#     )

#     return new_version_name

def create_version(module_name, speaker_folders, audios_id):
    """
    Creates a new version with minor/major increments.
    """
    latest_version = TrainingVersions.objects.filter(version_module=module_name).order_by('-id').first()

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
    new_version = TrainingVersions.objects.create(
        version_name=new_version_name,
        version_module=module_name,
        version_speakers=speaker_folders,
        audios_id=audios_id
    )

    return new_version_name


def group_audio_by_speaker(audio_chunks):
    # Create a dictionary to group audio chunks by speaker
    speaker_groups = {}

    # Loop through each chunk and group by speaker
    for chunk in audio_chunks:
        speaker = chunk['speaker']
        
        # If the speaker is not in the dictionary, add it
        if speaker not in speaker_groups:
            speaker_groups[speaker] = {
                "speaker": speaker,
                "chunks": [],
            }
        
        # Add the current chunk's id and audio_chunks_name to the speaker's list
        speaker_groups[speaker]["chunks"].append({
            "id": chunk['id'],
            "audioChunk": chunk['audio_chunks_name'][0]
        })
    
    # Prepare the result
    result = [
        {
            "speaker": speaker,
            "chunks": details["chunks"],
        }
        for speaker, details in speaker_groups.items()
    ]
    
    return result


def delete_embeddings(speaker=None, chunk_name=None, folder=False):

    try:
        if not speaker or not chunk_name:
            return {"error": "Speaker and audio ID are required"}

        # Define AI API endpoint
        AI_API_URL = "https://your-ai-api.com/delete-embeddings"

        # Prepare request payload
        if folder:
            payload = {
            "speaker": speaker,
            }
            response = requests.post(AI_API_URL, json=payload)
            # Handle API response
            if response.status_code == 200:
                return {"message": "Speaker untrained successfully"}
            else:
                return {
                    "error": "Failed to delete embeddings",
                    "details": response.json()
                }
            
        payload = {
            "speaker": speaker,
            "chunk_name":  chunk_name
        }

        response = requests.post(AI_API_URL, json=payload)

        # Handle API response
        if response.status_code == 200:
            return {"message": "Embeddings deleted successfully"}
        else:
            return {
                "error": "Failed to delete embeddings",
                "details": response.json()
            }

    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


def create_training_progress(user, module_name, version_name, model_name="DefaultModel", epoch=0, total_epochs=0, f1_score=0, status="training"):
    
    try:
        # Ensure version name and module combination is unique
        version_obj, created = TrainingVersions.objects.get_or_create(
            version_name=version_name,
            version_module=module_name
        )
    except MultipleObjectsReturned:
        # If multiple objects exist, fetch the latest one and log a warning
        version_obj = TrainingVersions.objects.filter(version_name=version_name, version_module=module_name).latest('id')
        logger.warning(f"Duplicate TrainingVersions found for version: {version_name}, using latest entry.")

    # Create the training progress entry
    training_progress = TrainingProgress.objects.create(
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


def reset_is_edited(audios_id):
    """Set is_edited to False for the given audio chunk IDs"""
    print('inside the AudioChunks ')
    AudioChunks.objects.filter(id__in=audios_id).update(is_edited=False)

