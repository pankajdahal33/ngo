from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import NotAuthenticated, ValidationError
from django.db import transaction as db_transaction
from django.utils import timezone

from .models import Organization, Donor, Donation, Expense, Program, SubProgram, Category
from .serializers import OrganizationSerializer, DonorSerializer, DonationSerializer, ExpenseSerializer, ProgramSerializer, SubProgramSerializer, CategorySerializer


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    # permission_classes = [IsAuthenticated]  # Enable authentication for this viewset


class DonorViewSet(viewsets.ModelViewSet):
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    # permission_classes = [IsAuthenticated]  # Enable authentication for this viewset
    # add total_donations field to the response
    def list(self, request, *args, **kwargs):
        queryset = Donor.objects.all()
        serializer = DonorSerializer(queryset, many=True)
        for data in serializer.data:
            # calculate amount donated by individual donor
            donations = Donation.objects.filter(donor=data['id'])
            total_donations = 0
            for donation in donations:
                total_donations += donation.amount
            data['total_donations'] = total_donations
            # count number of donations made by individual donor
            data['donation_count'] = len(donations)  
        return Response(serializer.data)


class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    # permission_classes = [IsAuthenticated]  # Enable authentication for this viewset

    def list(self, request, *args, **kwargs):
        queryset = Donation.objects.all()
        serializer = DonationSerializer(queryset, many=True)
        for data in serializer.data:
            donor = Donor.objects.get(id=data['donor'])
            data['donor'] = DonorSerializer(donor).data
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Ensure receipt number is auto-generated on create
        data = request.data
        if not data.get('receipt_number'):
            data['receipt_number'] = f"R{str(Donation.objects.count() + 1)}-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        return super().create(request, *args, **kwargs)


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    # permission_classes = [IsAuthenticated]  # Enable authentication for this viewset

    def list(self, request, *args, **kwargs):
        queryset = Expense.objects.all()
        serializer = ExpenseSerializer(queryset, many=True)
        for data in serializer.data:
            program = Program.objects.get(id=data['program'])
            data['program'] = ProgramSerializer(program).data
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        # Ensure that the expense has a valid amount and program
        data = request.data
        if float(data['amount']) <= 0:
            raise ValidationError("Expense amount must be positive.")
        return super().create(request, *args, **kwargs)


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    # permission_classes = [IsAuthenticated]  # Enable authentication for this viewset

   
class SubProgramViewSet(viewsets.ModelViewSet):
    queryset = SubProgram.objects.all()
    serializer_class = SubProgramSerializer
    # permission_classes = [IsAuthenticated]  # Enable authentication for this viewset

    
    
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # permission_classes = [IsAuthenticated]  # Enable authentication for this viewset
    
            
