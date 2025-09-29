from django.contrib import admin
from django.utils.html import format_html
from ad_app.models import MediaFile, AdChunk, KnownAdLabel, AdTrainingVersions, AdTrainingProgress

@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ('id','name', 'media_type', 'module_name', 'uploaded_at', 'is_annotated', 'actions_column')
    search_fields = ('name', 'module_name')
    actions = ['mark_deleted', 'delete_selected']

    def actions_column(self, obj):
        return format_html(
            '<a class="button" href="{}">Delete</a>',
            f'/admin/ad_app/mediafile/{obj.id}/delete/'
        )
    actions_column.short_description = 'Actions'

    def mark_deleted(self, request, queryset):
        queryset.update(is_deleted=True)
    mark_deleted.short_description = "Mark selected files as deleted"

@admin.register(AdChunk)
class AdChunkAdmin(admin.ModelAdmin):
    list_display = ('id','media_file','data_type', 'label', 'module_name', 'start_time', 'end_time',  'is_edited', 'actions_column','frame')
    search_fields = ('media_file__name', 'label')
    actions = ['mark_deleted', 'delete_selected']
    
    def actions_column(self, obj):
        return format_html(
            '<a class="button" href="{}">Delete</a>',
            f'/admin/ad_app/adchunk/{obj.id}/delete/'
        )
    actions_column.short_description = 'Actions'

    def mark_deleted(self, request, queryset):
        queryset.update(is_deleted=True)
    mark_deleted.short_description = "Mark selected chunks as deleted"

@admin.register(KnownAdLabel)
class KnownAdLabelAdmin(admin.ModelAdmin):
    list_display = ('label_name', 'user_email', 'actions_column')
    search_fields = ('label_name', 'user_email')
    actions = ['delete_selected']

    def actions_column(self, obj):
        return format_html(
            '<a class="button" href="{}">Delete</a>',
            f'/admin/ad_app/knownlabel/{obj.id}/delete/'
        )
    actions_column.short_description = 'Actions'

@admin.register(AdTrainingVersions)
class AdTrainingVersionsAdmin(admin.ModelAdmin):
    list_display = ('version_name', 'version_module', 'created_at', 'actions_column')
    search_fields = ('version_name', 'version_module')
    actions = ['delete_selected']

    def actions_column(self, obj):
        return format_html(
            '<a class="button" href="{}">Delete</a>',
            f'/admin/ad_app/adtrainingversions/{obj.id}/delete/'
        )
    actions_column.short_description = 'Actions'

@admin.register(AdTrainingProgress)
class AdTrainingProgressAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'module_name', 'model_name', 'status','release_version', 'created_at', 'actions_column')
    search_fields = ('user__email', 'module_name', 'model_name')
    actions = ['delete_selected']

    def actions_column(self, obj):
        return format_html(
            '<a class="button" href="{}">Delete</a>',
            f'/admin/ad_app/adtrainingprogress/{obj.id}/delete/'
        )
    actions_column.short_description = 'Actions'