from venv import logger
from ad_app.models import AdTrainingProgress, AdTrainingVersions


def group_by_label(ad_chunks):
    """
    Groups ad chunks by their labels with timestamp information.
    
    Args:
        ad_chunks (list): List of serialized AdChunk objects
        
    Returns:
        list: List of dictionaries with label and associated chunks with timestamps
    """
    # Create a dictionary to group chunks by label
    label_groups = {}

    # Loop through each chunk and group by label
    for chunk in ad_chunks:
        label = chunk['label']
        
        # If the label is not in the dictionary, add it
        if label not in label_groups:
            label_groups[label] = {
                "label": label,
                "chunks": [],
            }
        
        # Add the current chunk's info to the label's list
        label_groups[label]["chunks"].append({
            "id": chunk['id'],
            "timestamp": {
                "start": chunk['start_time'],
                "end": chunk['end_time']
            },
            "media_file": chunk['media_file_url'] if 'media_file_url' in chunk else None,
        })
    
    # Convert dictionary to list format
    result = [
        {
            "label": label,
            "chunks": details["chunks"],
        }
        for label, details in label_groups.items()
    ]
    
    return result



def create_ad_version(module_name, person_labels, segment_ids):
    """
    Creates a new version with minor/major increments for Face Recognition.
    
    Args:
        module_name (str): Name of the module (e.g., 'FR')
        person_labels (list): List of unique person names used in training
        image_ids (list): List of ProcessedImage IDs used for training
    """
    latest_version = AdTrainingVersions.objects.filter(version_module=module_name).order_by('-id').first()

    if latest_version and latest_version.version_name:
        try:
            version_parts = latest_version.version_name.lstrip('v').split('.')
            major = int(version_parts[0])
            minor = int(version_parts[1])

            if minor < 9:
                minor += 1
            else:
                major += 1
                minor = 0

            new_version_name = f"v{major}.{minor}"
        except (ValueError, IndexError):
            new_version_name = "v1.0"
    else:
        new_version_name = "v1.0"

    # Create new version with both images and person labels
    new_version = AdTrainingVersions.objects.create(
        version_name=new_version_name,
        version_module=module_name,
        version_segments=segment_ids,      # Changed from version_images_id
        version_labels=person_labels   
    )

    return new_version



def create_ad_training_progress(user, module_name, version):
    """Creates training progress record"""
    try:
        # Create training progress with version object directly
        training_progress = AdTrainingProgress.objects.create(
            user=user,
            module_name=module_name,
            release_version=version,  # Use version object directly
            model_name="DefaultModel",
            epoch=0,
            total_epochs=0,  # Add default value
            status="training"
        )
        return training_progress.id
    except Exception as e:
        logger.error(f"Error creating training progress: {e}")
        return None