from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.db.models import Sum
from django.http import HttpResponse
import csv
from .models import (
    Organization, Donor, Donation, Program,
    ProgramPerformance, Category, SubCategory,
    Expense, ExportDetail
)

# ======================
# Admin Mixins & Utilities
# ======================
class ExportCsvMixin:
    """Add CSV export action to admin classes"""
    def export_as_csv(self, request, queryset):
        meta = self.model._meta
        field_names = [field.name for field in meta.fields]
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename={meta}.csv'
        writer = csv.writer(response)
        
        writer.writerow(field_names)
        for obj in queryset:
            writer.writerow([getattr(obj, field) for field in field_names])
        return response
    export_as_csv.short_description = "Export Selected (CSV)"

# ======================
# Inline Editors
# ======================
class ProgramPerformanceInline(admin.TabularInline):  # or admin.StackedInline
    model = ProgramPerformance
    readonly_fields = ('date_recorded',)  # Add this line to make it read-only
    extra = 1  # Number of empty forms to display

class SubCategoryInline(admin.TabularInline):
    model = SubCategory
    extra = 1
    fields = ('name', 'description')

# ======================
# Custom Admin Classes
# ======================
@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'phone', 'email', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'pan_no')
    list_editable = ('status',)

@admin.register(Donor)
class DonorAdmin(admin.ModelAdmin, ExportCsvMixin):
    list_display = ('name', 'donor_type', 'total_donations', 'last_donation')
    list_filter = ('donor_type',)
    search_fields = ('name', 'email')
    actions = ['export_as_csv']

    def total_donations(self, obj):
        return obj.donations.aggregate(Sum('amount'))['amount__sum']
    total_donations.short_description = "Total Donated (₹)"

    def last_donation(self, obj):
        last = obj.donations.order_by('-date').first()
        return last.date if last else 'Never'
    last_donation.short_description = "Last Donation"

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin, ExportCsvMixin):
    list_display = ('receipt_number', 'donor_link', 'amount', 'date', 'receipt_status')
    list_filter = ('method', 'receipt_generated')
    search_fields = ('receipt_number', 'donor__name')
    readonly_fields = ('receipt_number', 'date')  # Add 'date' here
    actions = ['generate_receipts', 'export_as_csv']

    fieldsets = (
        (None, {
            'fields': ('donor', 'amount', 'method')
        }),
        ('Documents', {
            'fields': ('voucher', 'receipt_number'),
            'classes': ('collapse',)
        }),
        ('Additional Info', {
            'fields': ('description',),  # Remove 'date' from here
            'classes': ('collapse',)
        }),
    )
    def donor_link(self, obj):
        url = reverse("admin:pos_app_donor_change", args=[obj.donor.id])  # Correct reverse name
        return format_html('<a href="{}">{}</a>', url, obj.donor.name)
    donor_link.short_description = "Donor"

    def receipt_status(self, obj):
        color = 'green' if obj.receipt_generated else 'red'
        text = 'Generated' if obj.receipt_generated else 'Pending'
        return format_html('<span style="color: {};">{}</span>', color, text)
    receipt_status.short_description = "Receipt Status"

    def generate_receipts(self, request, queryset):
        updated = 0
        for donation in queryset:
            if not donation.receipt_generated:
                donation.generate_receipt()
                updated += 1
        self.message_user(request, f"{updated} receipts generated")
    generate_receipts.short_description = "Generate receipts"


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'date_range', 'budget_status', 'performance_count')
    inlines = [ProgramPerformanceInline]
    search_fields = ('name',)
    list_filter = ('is_active',)

    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'is_active')
        }),
        ('Budget & Dates', {
            'fields': ('total_budget', 'start_date', 'end_date')
        }),
        ('Documents', {
            'fields': ('agreement',),
            'classes': ('collapse',)
        })
    )

    def date_range(self, obj):
        return f"{obj.start_date} to {obj.end_date or 'Ongoing'}"
    date_range.short_description = "Duration"

    def budget_status(self, obj):
        remaining = obj.total_budget - obj.expenses_incurred
        return f"₹{remaining} remaining"
    budget_status.short_description = "Budget"

    def performance_count(self, obj):
        return obj.performances.count()
    performance_count.short_description = "Metrics"

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'subcategory_count')
    inlines = [SubCategoryInline]
    search_fields = ('name',)

    def subcategory_count(self, obj):
        return obj.subcategories.count()
    subcategory_count.short_description = "Subcategories"

@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'expense_count')
    list_filter = ('category',)
    search_fields = ('name',)

    def expense_count(self, obj):
        return obj.expenses.count()
    expense_count.short_description = "Expenses"

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin, ExportCsvMixin):
    list_display = ('title', 'category_chain', 'amount', 'date', 'reversed_status')
    list_filter = ('subcategory__category', 'reversed')
    search_fields = ('title', 'description')
    actions = ['export_as_csv']
    readonly_fields = ('date',)  # Mark 'date' as read-only


    fieldsets = (
        (None, {
            'fields': ('title', 'program', 'subcategory', 'amount')
        }),
        ('Details', {
            'fields': ('date', 'description', 'reversed'),
            'classes': ('collapse',)
        }),
        ('Documentation', {
            'fields': ('bill',),
            'classes': ('collapse',)
        })
    )

    def category_chain(self, obj):
        return f"{obj.subcategory.category} → {obj.subcategory}"
    category_chain.short_description = "Category"

    def reversed_status(self, obj):
        return format_html(
            '✅' if obj.reversed else '❌'
        )
    reversed_status.short_description = "Reversed"

@admin.register(ExportDetail)
class ExportDetailAdmin(admin.ModelAdmin):
    list_display = ('export_type', 'exported_by', 'created_at')
    list_filter = ('export_type',)
    readonly_fields = ('created_at',)
    search_fields = ('exported_by__username',)

    def save_model(self, request, obj, form, change):
        if not obj.exported_by:
            obj.exported_by = request.user
        super().save_model(request, obj, form, change)

# ======================
# Admin Customization
# ======================
admin.site.site_header = "NGO Management System"
admin.site.site_title = "NGO Admin Portal"
admin.site.index_title = "Dashboard"