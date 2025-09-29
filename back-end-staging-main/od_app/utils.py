

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



import uuid
from .models import ODTrainingVersions, KnownLabel


def create_od_version(module_name, label_names, image_ids):
    """
    Creates a new training version for OD with version naming like v1.0, v1.1, etc.
    
    Args:
        module_name (str): The name of the module (e.g., 'OD')
        label_names (list): List of unique label names (e.g., 'Top Ticker', 'Bottom Ticker')
        image_ids (list): List of ProcessedImage IDs used for training
    """
    from .models import ODTrainingVersions

    latest_version = ODTrainingVersions.objects.filter(version_module=module_name).order_by('-id').first()

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

    # Create and return new OD version
    new_version = ODTrainingVersions.objects.create(
        version_name=new_version_name,
        version_module=module_name,
        version_images_id=image_ids,
        version_labels=label_names
    )

    return new_version


def create_od_training_progress(user, module_name, version):
    """
    Creates a training progress entry for the OD module.
    
    Args:
        user: Django user instance
        module_name (str): Module name ('OD')
        version: ODTrainingVersions instance
    """
    from .models import ODTrainingProgress

    try:
        training_progress = ODTrainingProgress.objects.create(
            user=user,
            module_name=module_name,
            release_version=version,
            model_name="ODModel",
            epoch=0,
            total_epochs=0,
            status="training"
        )
        return training_progress.id
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error creating OD training progress: {e}")
        return None

from xml.dom import minidom   
def generate_pascal_voc_xml(filename, width, height, objects):
    """
    Generates Pascal VOC XML annotation for a single image.
    Args:
        filename (str): Image filename
        width (int): Image width
        height (int): Image height
        objects (list): List of dicts with keys: label, x, y, width, height
    Returns:
        str: Pascal VOC XML as string
    """
    import xml.etree.ElementTree as ET

    annotation = ET.Element("annotation")
    ET.SubElement(annotation, "filename").text = filename
    size = ET.SubElement(annotation, "size")
    ET.SubElement(size, "width").text = str(width)
    ET.SubElement(size, "height").text = str(height)
    ET.SubElement(size, "depth").text = "3"

    for obj in objects:
        obj_elem = ET.SubElement(annotation, "object")
        ET.SubElement(obj_elem, "name").text = obj["label"]
        ET.SubElement(obj_elem, "label_id").text = str(obj["id"]-1) 
        bndbox = ET.SubElement(obj_elem, "bndbox")
        ET.SubElement(bndbox, "xmin").text = str(int(obj["x"]))
        ET.SubElement(bndbox, "ymin").text = str(int(obj["y"]))
        ET.SubElement(bndbox, "xmax").text = str(int(obj["x"] + obj["width"]))
        ET.SubElement(bndbox, "ymax").text = str(int(obj["y"] + obj["height"]))

    return minidom.parseString(ET.tostring(annotation, encoding="utf-8")).toprettyxml(indent="  ")