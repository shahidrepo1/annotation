import os
import uuid
import requests
from pydub import AudioSegment
from annotation_project import settings
from django.core.files.storage import default_storage
from sr_app.models import AudioFile


def process_audio_chunks(audio_path, timestamps):
    try:
        # Load the audio file
        audio = AudioSegment.from_file(audio_path)

        # Get the base directory for saving the chunks
        speakers_dir = os.path.join(settings.MEDIA_ROOT, "Speakers")
        os.makedirs(speakers_dir, exist_ok=True)

        # Dictionary to hold folder names and chunk paths
        speaker_chunk_paths = {}

        # Iterate over timestamps and save the audio chunks
        for person_data in timestamps:
            person = person_data["person"]
            person_dir = os.path.join(speakers_dir, person)
            os.makedirs(person_dir, exist_ok=True)

            # List to hold the paths of the saved chunks
            chunk_paths = []

            for index, ts in enumerate(person_data["time_stamps"]):
                start_ms = ts["start"] * 1000  # Convert to milliseconds
                end_ms = ts["end"] * 1000  # Convert to milliseconds

                # Extract the chunk
                chunk = audio[start_ms:end_ms]

                # Save the chunk
                unique_id = uuid.uuid4().hex  # A unique hexadecimal string
                chunk_name = f"{person}_{index + 1}_{unique_id}.wav"
                chunk_path = os.path.join(person_dir, chunk_name)
                chunk.export(chunk_path, format="wav")

                # Append the chunk name to the list for this person
                chunk_paths.append(chunk_name)

            # Add the chunk paths to the dictionary under the person's name
            speaker_chunk_paths[person] = chunk_paths  # Store all chunk names, not just the last one

        return {"message": "Audio chunks processed and saved successfully.", "data": speaker_chunk_paths}

    except Exception as e:
        return {"error": str(e)}


def get_sr_response(file_path):
    """
    Sends an audio file to the specified URL for speaker recognition.

    Parameters:
        url (str): The endpoint to send the POST request to.
        api_key (str): The API key for authentication.
        file_path (str): The path to the audio file to be uploaded.

    Returns:
        dict: A dictionary containing the status code and response text.
    """
    headers = {
        'accept': 'application/json',
        'api_key': settings.SR_API_KEY,
    }
    
    try:
        with open(file_path, 'rb') as audio_file:
            files = {
                'video_file': (file_path.split('/')[-1], audio_file, 'audio/wav'),
            }
            response = requests.post(settings.SR_API, headers=headers, files=files)
            print(response.json())
            return {
                'timestamps': response.status_code,
                'response': response.json() if response.headers.get('Content-Type') == 'application/json' else response.text,
            }
    except FileNotFoundError:
        return {'status_code': 404, 'response': 'File not found'}
    except Exception as e:
        return {'status_code': 500, 'response': str(e)}


def save_audio_file(module_name, name, file):
    """
    Save the uploaded file to the media folder and create a corresponding database entry.
    """
    try:
        # Define the storage path
        upload_path = os.path.join("uploaded_audio", name)

        # Save the file using default_storage
        saved_path = default_storage.save(upload_path, file)

        # Create a database record
        audio_file = AudioFile.objects.create(
            name=name,
            file=saved_path,
            module_name=module_name
        )
        return audio_file, audio_file.id, module_name
    except Exception as e:
        print(f"Error saving file: {e}")
        return None
