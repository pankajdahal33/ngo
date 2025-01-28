from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# ======================
# Core Organization Models
# ======================
class Organization(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to="logos/", blank=True, null=True)
    pan_no = models.CharField(max_length=50, blank=True, null=True)
    website = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')

    def __str__(self):
        return self.name

# ======================
# Donation Management
# ======================
class Donor(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True, null=True)
    pan_no = models.CharField(max_length=50, blank=True, null=True)
    donor_type = models.CharField(max_length=20, choices=[('Individual', 'Individual'), ('Corporate', 'Corporate')], default='Individual')

    def __str__(self):
        return self.name

class Donation(models.Model):
    donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name="donations")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)  # Non-editable field
    method = models.CharField(max_length=50, choices=[('Online', 'Online'), ('Cash', 'Cash')])
    voucher = models.FileField(upload_to="vouchers/", blank=True, null=True)
    receipt_generated = models.BooleanField(default=False)
    receipt_number = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        """Generate receipt number after saving (using actual ID)"""
        if not self.pk:  # First save
            super().save(*args, **kwargs)
        if not self.receipt_number:
            self.receipt_number = f"R{self.pk}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Donation {self.pk} by {self.donor.name}"

# ======================
# Program Management
# ======================
class Program(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    total_budget = models.DecimalField(max_digits=15, decimal_places=2)
    expenses_incurred = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    agreement = models.FileField(upload_to="agreements/", blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def update_expenses(self, amount):
        self.expenses_incurred += amount
        self.save()

    def __str__(self):
        return self.name

class ProgramPerformance(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="performances")
    metric = models.CharField(max_length=255)
    value = models.FloatField()
    units = models.CharField(max_length=50, blank=True, null=True)
    date_recorded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.metric}: {self.value} {self.units}"

# ======================
# Financial Categorization
# ======================
class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class SubCategory(models.Model):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="subcategories")
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.category.name} → {self.name}"

# ======================
# Expense Management
# ======================
class Expense(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="expenses")
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    reversed = models.BooleanField(default=False)
    bill = models.FileField(upload_to="bills/", blank=True, null=True)
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name="expenses")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

# ======================
# Reporting
# ======================
class ExportDetail(models.Model):
    export_type = models.CharField(max_length=50, choices=[('Report', 'Report'), ('Analytics', 'Analytics')])
    created_at = models.DateTimeField(auto_now_add=True)
    file_path = models.FileField(upload_to="exports/")
    exported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.export_type