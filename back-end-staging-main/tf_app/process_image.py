



import os

import requests
import uuid
from moviepy.editor import VideoFileClip  
from annotation_project import settings
from .models import MediaFile
from django.core.files.storage import default_storage


def save_media_file(module_name , name , file , media_type):
    """
    This function saves the image file to the database and local storage
    """
    try:

        # Create base directory if it doesn't exist
        base_dir = os.path.join('tf_media', media_type + 's')
        full_base_dir = os.path.join(settings.MEDIA_ROOT, base_dir)
        os.makedirs(full_base_dir, exist_ok=True)

        # Generate unique filename
        filename, ext = os.path.splitext(name)
        unique_suffix = uuid.uuid4().hex[:8]
        unique_name = f"{filename}_{unique_suffix}{ext}"

        # Construct relative path
        relative_path = os.path.join(base_dir, unique_name)

        # Save file
        file_path = default_storage.save(relative_path, file)
        print(f"File saved at: {file_path}")

        # Verify file was saved
        if not default_storage.exists(file_path):
            raise Exception("File was not saved properly")

        # Create database entry
        try:
            image_file = MediaFile(
                name=unique_name,
                media_type=media_type,
                media_file=relative_path,
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



def get_tf_response(file_path):
    """
    Sends an image file to the AI API for processing.

    Parameters:
        file_path (str): Path to the image file to be sent.

    Returns:
        dict: Contains the API response or error message.
    """
    headers = {
        'accept': 'application/json',
        'api_key': settings.TF_API_KEY,  # Use the correct API key for the TF API
    }

    try:
        with open(file_path, 'rb') as file:
            files = {
                'file': (os.path.basename(file_path), file),
            }

            # Add timeout here
            response = requests.post(
                settings.TF_API_URL,
                headers=headers,
                files=files,
                timeout=120  # seconds — adjust as needed
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


# import cv2
# import os
# import uuid
# from django.conf import settings


# def extract_video_frame_at_timestamp(video_path, timestamp_seconds):
#     """
#     Extracts a frame from a video at a specific timestamp and saves it as an image.

#     Args:
#         video_path (str): Absolute path to the video file.
#         timestamp_seconds (float): Timestamp in seconds to extract the frame.

#     Returns:
#         str: Absolute path to the saved frame image.
#     """
#     try:
#         cap = cv2.VideoCapture(video_path)
#         if not cap.isOpened():
#             raise Exception("Failed to open video file.")

#         fps = cap.get(cv2.CAP_PROP_FPS)
#         frame_number = int(fps * timestamp_seconds)
#         cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

#         success, frame = cap.read()
#         if not success:
#             raise Exception(f"Failed to extract frame at {timestamp_seconds}s")

#         # Prepare save path
#         save_dir = os.path.join(settings.MEDIA_ROOT, "tf_extracted_frames")
#         os.makedirs(save_dir, exist_ok=True)
#         filename = f"frame_{uuid.uuid4().hex[:8]}.jpg"
#         frame_path = os.path.join(save_dir, filename)

#         cv2.imwrite(frame_path, frame)
#         cap.release()

#         return frame_path

#     except Exception as e:
#         raise Exception(f"Error extracting frame: {str(e)}")

def extract_video_frame_at_timestamp(video_path, timestamp):
    """This Function is going capture a frame from video"""
    try:
        video = VideoFileClip(video_path)
        frame = video.get_frame(timestamp)
        
        # Create frames directory
        frames_dir = os.path.join('tf_media', 'images')  
        os.makedirs(os.path.join(settings.MEDIA_ROOT, frames_dir), exist_ok=True)
        
        # Save frame with organized path
        unique_id = uuid.uuid4().hex
        frame_name = f"frame_{timestamp}_{unique_id}.jpg"
        frame_path = os.path.join(frames_dir, frame_name)
        abs_path = os.path.join(settings.MEDIA_ROOT, frame_path)
        
        import imageio
        imageio.imwrite(abs_path, frame)
        video.close()
        
        return  frame_name  # Returns file name
           
    except Exception as e:
        print(f"Error extracting frame: {e}")
        return {"success": False, "error": str(e)}

