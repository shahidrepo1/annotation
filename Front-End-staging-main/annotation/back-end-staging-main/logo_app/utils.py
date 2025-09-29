import json
import os
import shutil
import cv2
import uuid
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.conf import settings
import requests
from .models import ImageDetail, LogoTrainingProgress, LogoTrainingVersions
from .serializers import ImageDetailSerializer

from django.core.exceptions import MultipleObjectsReturned
import logging

logger = logging.getLogger(__name__)



def process_video_to_images(video_file, user, module_name, interval_seconds=10):
    """
    Extract frames from video every `interval_seconds` and save them as ImageDetail objects.
    Returns a list of serialized image data.
    """
    # Save video temporarily
    temp_path = default_storage.save(f'temp_videos/{uuid.uuid4()}.mp4', video_file)
    video_full_path = os.path.join(settings.MEDIA_ROOT, temp_path)
    print('modle module', module_name)
    cap = cv2.VideoCapture(video_full_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    interval = int(fps * interval_seconds)

    saved_images = []

    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            current_frame = int(cap.get(cv2.CAP_PROP_POS_FRAMES))
            if current_frame % interval == 0:
                _, buffer = cv2.imencode('.jpg', frame)
                image_data = ContentFile(buffer.tobytes(), name=f"{uuid.uuid4()}.jpg")

                image_instance = ImageDetail.objects.create(
                    user=user,
                    image=image_data,
                    module_name=module_name,
                    is_annotated=False
                )
                serialized = ImageDetailSerializer(image_instance, context={'request': None}).data
                saved_images.append(serialized)

    finally:
        cap.release()
        os.remove(video_full_path)

    return saved_images



def create_version(module_name, audios_id):
    """
    Creates a new version with minor/major increments.
    """
    latest_version = LogoTrainingVersions.objects.filter(version_module=module_name).order_by('-id').first()

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
    new_version = LogoTrainingVersions.objects.create(
        version_name=new_version_name,
        version_module=module_name,
        version_image_id=audios_id
    )

    return new_version_name

import xml.etree.ElementTree as ET
from xml.dom import minidom

def create_logo_training_progress(user, module_name, version_name, model_name="DefaultModel", epoch=0, total_epochs=0, f1_score=0, status="training"):
    
    try:
        # Ensure version name and module combination is unique
        version_obj, created = LogoTrainingVersions.objects.get_or_create(
            version_name=version_name,
            version_module=module_name
        )
    except MultipleObjectsReturned:
        # If multiple objects exist, fetch the latest one and log a warning
        version_obj = LogoTrainingVersions.objects.filter(version_name=version_name, version_module=module_name).latest('id')
        logger.warning(f"Duplicate TrainingVersions found for version: {version_name}, using latest entry.")

    # Create the training progress entry
    training_progress = LogoTrainingProgress.objects.create(
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

def generate_pascal_voc_xml(filename, width, height, labels):
    annotation = ET.Element("annotation")

    ET.SubElement(annotation, "folder").text = "dataset1"
    ET.SubElement(annotation, "filename").text = filename

    size = ET.SubElement(annotation, "size")
    ET.SubElement(size, "width").text = str(width)
    ET.SubElement(size, "height").text = str(height)
    ET.SubElement(size, "depth").text = "3"

    for label in labels:
        obj = ET.SubElement(annotation, "object")
        ET.SubElement(obj, "name").text = label.name
        bndbox = ET.SubElement(obj, "bndbox")
        ET.SubElement(bndbox, "xmin").text = str(int(label.x))
        ET.SubElement(bndbox, "ymin").text = str(int(label.y))
        ET.SubElement(bndbox, "xmax").text = str(int(label.x + label.width))
        ET.SubElement(bndbox, "ymax").text = str(int(label.y + label.height))

    return minidom.parseString(ET.tostring(annotation, encoding='utf-8')).toprettyxml(indent="  ")




def send_zip_to_logo_training_api(training_data_zip_path, training_id, training_data_folder):
    """Sends the zip file to the AI API and cleans up afterward. Returns success or failure gracefully."""
    try:
        with open(training_data_zip_path, 'rb') as f:
            files = {
                'Zip_file': (os.path.basename(training_data_zip_path), f, 'application/zip')
            }

            ai_api_url = f"http://192.168.18.164:9000/logo-train/?training_id={training_id}"
            try:
                response = requests.post(ai_api_url, files=files, timeout=10)
                logger.info(f"Response from AI API: {response.status_code} - {response.text}")

                if response.status_code == 200:
                    return {
                        "status": True,
                        "message": "AI training API call successful.",
                        "response_text": response.text
                    }
                else:
                    return {
                        "status": True,
                        "message": f"AI training API returned status {response.status_code}.",
                        "response_text": response.text
                    }

            except requests.exceptions.RequestException as e:
                logger.error(f"Connection to AI API failed: {e}")
                return {
                    "status": True,
                    "message": f"Could not connect to AI training API: {str(e)}"
                }

    except Exception as e:
        logger.error(f"Error while preparing zip for AI API: {e}", exc_info=True)
        return {
            "status": True,
            "message": f"Unexpected error: {str(e)}"
        }

    finally:
        # Always cleanup
        if os.path.exists(training_data_zip_path):
            os.remove(training_data_zip_path)
            logger.info(f"Deleted zip file: {training_data_zip_path}")

        if os.path.exists(training_data_folder):
            shutil.rmtree(training_data_folder)
            logger.info(f"Deleted training data folder: {training_data_folder}")