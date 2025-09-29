from django.core.management.base import BaseCommand
from tf_app.models import KnownLabel

LABELS = [
    (1, "BlurredTicker"),
    (2, "BlurredFlasher"),
    (3, "BlurredTop"),
    (4, "HalfTicker"),
    (5, "HalfFlasher"),
    (6, "HalfTop"),
    (7, "Top"),
    (8, "Bottom"),
    (9, "Flasher"),
]

class Command(BaseCommand):
    help = "Load TF known labels with fixed IDs"

    def handle(self, *args, **kwargs):
        for id, name in LABELS:
            obj = KnownLabel.objects.filter(label_name=name).first()
            if obj:
                if obj.id != id:
                    obj.id = id
                    obj.save(update_fields=["id"])
                    self.stdout.write(self.style.WARNING(f"Updated ID for: {name} to {id}"))
                else:
                    self.stdout.write(self.style.NOTICE(f"Exists: {id} - {name}"))
            else:
                KnownLabel.objects.create(id=id, label_name=name)
                self.stdout.write(self.style.SUCCESS(f"Created: {id} - {name}"))
        self.stdout.write(self.style.SUCCESS("All TF labels loaded."))