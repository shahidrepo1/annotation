import os
import uuid
import requests
from annotation_project import settings
from .models import MediaFile
from django.core.files.storage import default_storage
from moviepy.editor import VideoFileClip    
import os


def save_media_file(module_name, name, file, media_type):
    """
    Save uploaded media file and create a new database entry.
    """
    try:
        # Create base directory if it doesn't exist
        base_dir = os.path.join('ad_media', media_type + 's')
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
        media_file = MediaFile.objects.create(
            name=unique_name,
            file=file_path,
            module_name=module_name,
            media_type=media_type
        )

        return media_file, media_file.id, module_name

    except Exception as e:
        print(f"Error while saving media file: {str(e)}")
        # Cleanup if file was saved but DB entry failed
        if 'file_path' in locals() and default_storage.exists(file_path):
            default_storage.delete(file_path)
        return None, None, None

#this api is going to send video to add detection api and recive response 
def get_ad_video_response(file_path):
    """
    Sends a video file to the AD API for processing.

    Parameters:
        file_path (str): Path to the video file to be sent

    Returns:
        dict: Contains the API response or error message
    """
    try:
        with open(file_path, 'rb') as video_file:
            files = {
                'file': (os.path.basename(file_path), video_file, 'video/mp4')
            }

            response = requests.post(
                f"{settings.AD_API_URL}/process_video/",
                files=files
            )
            print(f"Response from AD get video API: {response.status_code} - {response.text}")  # Debug print
            # Check if response is JSON
            if response.headers.get('Content-Type') == 'application/json':
                data = response.json()
                # Transform the response to match our expected format
                transformed_response = []
                for segment in data:
                    transformed_response.append({
                        'label': segment['label'],
                        'start_time': segment['timestamp']['start'],
                        'end_time': segment['timestamp']['end'],
                        'file_name': segment.get('file_name')
                    })
                
                return {
                    'status_code': response.status_code,
                    'response': transformed_response
                }
            else:
                return {
                    'status_code': response.status_code,
                    'response': response.text
                }

    except FileNotFoundError:
        return {
            'status_code': 404,
            'response': 'Video file not found'
        }
    except Exception as e:
        return {
            'status_code': 500,
            'response': str(e)
        }
    

def process_video_chunks(video_path, segments):
    """Create video chunks from timestamps"""
    try:
        video = VideoFileClip(video_path)
        chunks_data = {}

        # Create ads directory
        ads_dir = os.path.join(settings.MEDIA_ROOT, "Ads")
        os.makedirs(ads_dir, exist_ok=True)

        for segment in segments:
            label = segment['label']
            # Changed from timestamp to direct start_time and end_time
            start = segment['start_time']
            end = segment['end_time']

            # Create label directory
            label_dir = os.path.join(ads_dir, label)
            os.makedirs(label_dir, exist_ok=True)

            # Extract and save chunk
            chunk = video.subclip(start, end)
            unique_id = uuid.uuid4().hex
            chunk_name = f"{label}_{start}_{end}_{unique_id}.mp4"
            chunk_path = os.path.join(label_dir, chunk_name)
            
            chunk.write_videofile(chunk_path)

            # Store chunk info
            if label not in chunks_data:
                chunks_data[label] = []
            chunks_data[label].append(chunk_name)

        video.close()
        return {
            "message": "Video chunks processed successfully",
            "data": chunks_data
        }

    except Exception as e:
        print(f"Error in process_video_chunks: {str(e)}")  # Add debug print
        return {"error": str(e)}
    
def extract_frame(video_path, timestamp):
    """This Function is going capture a frame from video"""
    try:
        video = VideoFileClip(video_path)
        frame = video.get_frame(timestamp)
        
        # Create frames directory
        frames_dir = os.path.join('ad_media', 'frames')  
        os.makedirs(os.path.join(settings.MEDIA_ROOT, frames_dir), exist_ok=True)
        
        # Save frame with organized path
        unique_id = uuid.uuid4().hex
        frame_name = f"frame_{timestamp}_{unique_id}.jpg"
        frame_path = os.path.join(frames_dir, frame_name)
        abs_path = os.path.join(settings.MEDIA_ROOT, frame_path)
        
        import imageio
        imageio.imwrite(abs_path, frame)
        video.close()
        
        return {
            "success": True,
            "frame_path": frame_path,  # Returns relative path
            "frame_name": frame_name
        }
    except Exception as e:
        print(f"Error extracting frame: {e}")
        return {"success": False, "error": str(e)}
    

def get_ad_audio_response(file_path):
    """
    Sends an audio file to the AD API for processing.

    Parameters:
        file_path (str): Path to the audio file to be sent

    Returns:
        dict: Contains the API response or error message
    """
    

    try:
        with open(file_path, 'rb') as audio_file:
            files = {
                'file': (os.path.basename(file_path), audio_file, 'audio/wav')
            }

            response = requests.post(
                settings.AD_AUDIO_PROCESS_API_URL,  # Add this URL in settings.py
                files=files
            )

            return {
                'status_code': response.status_code,
                'response': response.json() if response.headers.get('Content-Type') == 'application/json' else response.text
            }

    except FileNotFoundError:
        return {
            'status_code': 404,
            'response': 'Audio file not found'
        }
    except Exception as e:
        return {
            'status_code': 500,
            'response': str(e)
        }
    

def get_ad_audio_video_ai_response(file_path):
    """
    Sends a video file (with audio) to the combined AD detection API.

    Parameters:
        file_path (str): Path to the video file.

    Returns:
        dict: Contains the API response or error message.
    """
    try:
        with open(file_path, 'rb') as video_file:
            files = {
                'file': (os.path.basename(file_path), video_file, 'video/mp4')
            }

            response = requests.post(
                settings.AD_AUDIO_VIDEO_API_URL, 
                files=files
            )

            print(f"Combined AV Detection Response: {response.status_code} - {response.text}")

            if response.headers.get('Content-Type') == 'application/json':
                data = response.json()

                # Optional: transform data if needed
                transformed_response = []
                for segment in data:
                    transformed_response.append({
                        'label': segment['label'],
                        'start_time': segment['timestamp']['start'],
                        'end_time': segment['timestamp']['end'],
                        'file_name': segment.get('file_name')
                    })

                return {
                    'status_code': response.status_code,
                    'response': transformed_response
                }

            else:
                return {
                    'status_code': response.status_code,
                    'response': response.text
                }

    except FileNotFoundError:
        return {
            'status_code': 404,
            'response': 'File not found'
        }
    except Exception as e:
        return {
            'status_code': 500,
            'response': str(e)
        }
