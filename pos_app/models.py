from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import pre_save
from django.dispatch import receiver

class Organization(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to="logos/", blank=True, null=True)
    pan_no = models.CharField(max_length=50, blank=True, null=True)
    website = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Track updates
    status = models.CharField(max_length=10, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')

    def __str__(self):
        return self.name


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
    donation_purpose = models.CharField(max_length=255)
    date = models.DateField(auto_now_add=True)
    method = models.CharField(max_length=50, choices=[('Online', 'Online'), ('Cash', 'Cash')])
    voucher = models.FileField(upload_to="vouchers/", blank=True, null=True)
    receipt_generated = models.BooleanField(default=False)
    receipt_number = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.receipt_number:
            self.receipt_number = f"R{self.pk}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        super().save(*args, **kwargs)

    def generate_receipt(self):
        self.receipt_generated = True
        self.receipt_number = f"R{self.pk}"
        self.save()

    def __str__(self):
        return f"Donation {self.pk} by {self.donor.name}"


class Program(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Track updates

    def __str__(self):
        return self.name
    
class SubProgram(models.Model):
    name = models.CharField(max_length=355)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="subprograms")
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    total_budget = models.DecimalField(max_digits=15, decimal_places=2)
    agreement = models.FileField(upload_to="agreements/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)    
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Track updates

    def __str__(self):
        return self.name

class Expense(models.Model):
    program = models.ForeignKey('SubProgram', on_delete=models.CASCADE, related_name="expenses")
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    reversed = models.BooleanField(default=False)
    bill = models.FileField(upload_to="bills/", blank=True, null=True)
    expanse_category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="expenses")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Track updates

    
    def __str__(self):
        return self.title
