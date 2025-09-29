

from .models import TFTrainingProgress, TFTrainingVersions, ProcessedImage

def group_by_label(processed_images):
    """
    Groups processed images by their labels.
    Args:
        processed_images (list): List of serialized ProcessedImage objects
    Returns:
        list: List of dictionaries with label and associated images and coordinates
    """
    label_groups = {}

    for image in processed_images:
        label_data = image.get('label')
        label = label_data.get('label_name', 'Unknown') if isinstance(label_data, dict) else 'Unknown'
        
        if label not in label_groups:
            label_groups[label] = {
                "label": label,
                "images": []
            }

        label_groups[label]["images"].append({
            "id": image['id'],
            "processedImage": image['processed_image'],
            "x": image.get('x'),
            "y": image.get('y'),
            "width": image.get('width'),
            "height": image.get('height')
        })

    return [
        {
            "label": label,
            "images": data["images"]
        }
        for label, data in label_groups.items()
    ]



def create_tf_version(module_name, label_names, image_ids):
    """
    Creates a new training version for TF with version naming like v1.0, v1.1, etc.
    
    Args:
        module_name (str): The name of the module (e.g., 'TF')
        label_names (list): List of unique label names (e.g., 'Top Ticker', 'Bottom Ticker')
        image_ids (list): List of ProcessedImage IDs used for training
    """
    from tf_app.models import TFTrainingVersions

    latest_version = TFTrainingVersions.objects.filter(version_module=module_name).order_by('-id').first()

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

    # Create and return new TF version
    new_version = TFTrainingVersions.objects.create(
        version_name=new_version_name,
        version_module=module_name,
        version_images_id=image_ids,
        version_labels=label_names
    )

    return new_version


def create_tf_training_progress(user, module_name, version):
    """
    Creates a training progress entry for the TF module.
    
    Args:
        user: Django user instance
        module_name (str): Module name ('TF')
        version: TFTrainingVersions instance
    """
    from tf_app.models import TFTrainingProgress

    try:
        training_progress = TFTrainingProgress.objects.create(
            user=user,
            module_name=module_name,
            release_version=version,
            model_name="TFModel",
            epoch=0,
            total_epochs=0,
            status="training"
        )
        return training_progress.id
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error creating TF training progress: {e}")
        return None

import xml.etree.ElementTree as ET
from xml.dom import minidom

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
        ET.SubElement(obj, "label").text = str(label["label"]) 
        ET.SubElement(obj, "label_id").text = str(label["id"]-1)  # use ID as name
        bndbox = ET.SubElement(obj, "bndbox")
        ET.SubElement(bndbox, "xmin").text = str(int(label["x"]))
        ET.SubElement(bndbox, "ymin").text = str(int(label["y"]))
        ET.SubElement(bndbox, "xmax").text = str(int(label["x"] + label["width"]))
        ET.SubElement(bndbox, "ymax").text = str(int(label["y"] + label["height"]))

    return minidom.parseString(ET.tostring(annotation, encoding='utf-8')).toprettyxml(indent="  ")
