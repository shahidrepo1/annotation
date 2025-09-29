
from asyncio.log import logger
from .models import FRTrainingProgress, ProcessedImage , FRTrainingVersions



def group_by_label(processed_images):
    """
    Groups processed images by their labels.
    
    Args:
        processed_images (list): List of serialized ProcessedImage objects
        
    Returns:
        list: List of dictionaries with label and associated images
    """
    # Create a dictionary to group images by label
    label_groups = {}

    # Loop through each image and group by label
    for image in processed_images:
        label = image['label']
        
        # If the label is not in the dictionary, add it
        if label not in label_groups:
            label_groups[label] = {
                "label": label,
                "images": [],
            }
        
        # Add the current image's info to the label's list
        label_groups[label]["images"].append({
            "id": image['id'],
            "processedImage": image['processed_image']
        })
    
    # Convert dictionary to list format
    result = [
        {
            "label": label,
            "images": details["images"],
        }
        for label, details in label_groups.items()
    ]
    
    return result

# Update is eidted
# This function is not working properly have to make it right 
def reset_is_edited(image_id):
    """get the image id and and reset is_eidted to True"""
    try:
        image = ProcessedImage.objects.get(id = image_id)
        image.is_edited = True
        image.save(update_fields=['is_edited'])
        return True
        print(f"this is what i have got in reste_is_eidted {image.is_edited}")
    except ProcessedImage.DoesNotExist:
        return False


def create_fr_version(module_name, person_labels, image_ids):
    """
    Creates a new version with minor/major increments for Face Recognition.
    
    Args:
        module_name (str): Name of the module (e.g., 'FR')
        person_labels (list): List of unique person names used in training
        image_ids (list): List of ProcessedImage IDs used for training
    """
    latest_version = FRTrainingVersions.objects.filter(version_module=module_name).order_by('-id').first()

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
    new_version = FRTrainingVersions.objects.create(
        version_name=new_version_name,
        version_module=module_name,
        version_images_id=image_ids,
        version_labels=list(set(person_labels))  # Store unique labels
    )

    return new_version_name


def create_fr_training_progress(user, module_name, version_name):
    """Creates training progress record"""
    try:
        version_obj = FRTrainingVersions.objects.get(
            version_name=version_name,
            version_module=module_name
        )
        
        training_progress = FRTrainingProgress.objects.create(
            user=user,
            module_name=module_name,
            release_version=version_obj,
            model_name="DefaultModel",
            epoch=0,
            total_epochs=0,
            status="training"
        )
        return training_progress.id
    except Exception as e:
        logger.error(f"Error creating training progress: {e}")
        return None