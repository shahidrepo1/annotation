from django.contrib import admin
from logo_app.models import ImageDetail, Label, LogoKnownLabel, LogoTrainingProgress, LogoTrainingVersions

class ImageDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'image','module_name','uploaded_at', 'is_annotated','is_deleted', 'is_trained', 'is_untrained' )

class LableAdmin(admin.ModelAdmin):
    list_display = ['id', 'image', 'name', 'x', 'y', 'width', 'height']

class LogoLableAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_email', 'label_name']

admin.site.register(ImageDetail, ImageDetailAdmin)
admin.site.register(Label, LableAdmin)
admin.site.register(LogoKnownLabel, LogoLableAdmin)


@admin.register(LogoTrainingVersions)
class LogoTrainingVersionsAdmin(admin.ModelAdmin):
    list_display = ('version_name', 'version_module', 'created_at')

@admin.register(LogoTrainingProgress)
class LogoTrainingProgressAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'module_name', 'model_name', 'release_version', 'status', 'created_at')
