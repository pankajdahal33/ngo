from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Organization(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to="logos/", blank=True, null=True)
    pan_no= models.CharField(max_length=50, blank=True, null=True)
    website= models.CharField(max_length=200,blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Donor(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField(blank=True, null=True)
    pan_no= models.CharField(max_length=50, blank=True, null=True)


    def __str__(self):
        return self.name

class Donation(models.Model):
    donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name="donations")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    method = models.CharField(max_length=50, choices=[('Online', 'Online'), ('Cash', 'Cash')])
    voucher = models.FileField(upload_to="vouchers/", blank=True, null=True)
    receipt_generated = models.BooleanField(default=False)
    receipt_number = models.CharField(max_length=20, blank=True, null=True)

    def generate_receipt(self):
        self.receipt_generated = True
        self.receipt_number = f"R{self.id}"
        self.save()

class Program(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    total_budget = models.DecimalField(max_digits=15, decimal_places=2)
    expenses_incurred = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    aggrement = models.FileField(upload_to="agreements/", blank=True, null=True)

    def update_expenses(self, amount):
        self.expenses_incurred += amount
        self.save()

    def __str__(self):
        return self.name
    
class ProgramPerformance(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name="performances")
    metric = models.CharField(max_length=255)
    value = models.FloatField()
    date_recorded = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.metric}: {self.value}"

class Expense(models.Model):
    program = models.ForeignKey('Program', on_delete=models.CASCADE, related_name="expenses")
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    reversed = models.BooleanField(default=False)
    bill = models.FileField(upload_to="bills/", blank=True, null=True)



    def __str__(self):
        return self.title
    




class ExportDetail(models.Model):
    export_type = models.CharField(max_length=50, choices=[('Report', 'Report'), ('Analytics', 'Analytics')])
    created_at = models.DateTimeField(auto_now_add=True)
    file_path = models.FileField(upload_to="exports/")

    def __str__(self):
        return self.export_type
