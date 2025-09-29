import os
import requests
from annotation_project import settings
from .models import  MediaFile
from django.core.files.storage import default_storage
from rest_framework.response import Response

def save_media_file(module_name , name , file , media_type):
    """
    This function saves the image file to the database and local storage
    """
    try:

        uploaded_media_path = os.path.join("fr_media", f"{media_type}s" , name)
        # Save the file using default_storage
        # This will save the file in the MEDIA_ROOT/uploaded_images directory
        saved_media_path = default_storage.save(uploaded_media_path, file)


        # Create an instance of the ImageFile model
        try:
            image_file = MediaFile(
                name=name,
                media_type=media_type,
                media_file=saved_media_path,
                module_name=module_name
            )
            image_file.save()
        except Exception as e:
            print(f"Error creating MediaFile instance: {e}")
            return None
        return image_file , image_file.id, module_name
    except Exception as e:
        print(f"Error saving file: {e}")
        return None
    


# This function is going to be used in fr view in ProcessImageView
# This function will send file path to Image AI APIimport requests

def get_fr_image_response(file_path):
    """
    Sends an image file to the AI API for processing.

    Parameters:
        file_path (str): Path to the image file to be sent.

    Returns:
        dict: Contains the API response or error message.
    """
    headers = {
        'accept': 'application/json',
        'X-API-Key': settings.FR_API_KEY,
    }

    try:
        with open(file_path, 'rb') as image_file:
            files = {
                'image': (os.path.basename(file_path), image_file, 'image/png'),
            }

            # Add timeout here
            response = requests.post(
                settings.FR_IMAGE_API,
                headers=headers,
                files=files,
                timeout=60  # seconds — adjust as needed
            )

            return {
                'status_code': response.status_code,
                'response': response.json() if 'application/json' in response.headers.get('Content-Type', '') else response.text,
            }

    except FileNotFoundError:
        return {'status_code': 404, 'response': 'Image file not found'}

    except requests.exceptions.ConnectTimeout:
        return {'status_code': 504, 'response': 'Connection to image processing API timed out.'}

    except requests.exceptions.ConnectionError as e:
        return {'status_code': 502, 'response': f'Connection error: {str(e)}'}

    except Exception as e:
        return {'status_code': 500, 'response': str(e)}

    
# This function is going to send file path to video AI API
def get_fr_video_response(file_path):
    """
    Sends an image file to the AI API for processing.

    Parameters:
        file_path (str): Path to the image file to be sent.

    Returns:
        dict: Contains the API response or error message.
    """
    headers = {
        'accept': 'application/json',
        'X-API-Key': settings.FR_API_KEY,  # this IMAGE_API_KEY is going to be set in settings.py
    }

    try:
        with open(file_path, 'rb') as video_file:
            files = {
                'video': (os.path.basename(file_path), video_file, 'video/mp4'),  # or 'image/jpeg' as needed  # or image/png here image_file is temporary name onc i will get what external api expects i will rename it 
            }

            response = requests.post(settings.FR_VIDEO_API, headers=headers, files=files)

            return {
                'status_code': response.status_code,
                'response': response.json() if response.headers.get('Content-Type') == 'application/json' else response.text,
            }
    except FileNotFoundError:
        return {'status_code': 404, 'response': 'Image file not found'}
    except Exception as e:
        return {'status_code': 500, 'response': str(e)}