from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import NotAuthenticated, ValidationError
from django.db import transaction as db_transaction
from django.utils import timezone

from .models import Organization, Donor, Donation, Expense, Program, ProgramPerformance
from .serializers import OrganizationSerializer, DonorSerializer, DonationSerializer, ExpenseSerializer, ProgramSerializer, ProgramPerformanceSerializer


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

    def list(self, request, *args, **kwargs):
        queryset = Program.objects.all()
        serializer = ProgramSerializer(queryset, many=True)
        return Response(serializer.data)


class ProgramPerformanceViewSet(viewsets.ModelViewSet):
    queryset = ProgramPerformance.objects.all()
    serializer_class = ProgramPerformanceSerializer
    # permission_classes = [IsAuthenticated]  # Enable authentication for this viewset

    @db_transaction.atomic
    def create(self, request, *args, **kwargs):
        # Create a new performance record for the program
        program = Program.objects.get(id=request.data.get('program'))
        performance = ProgramPerformance.objects.create(
            program=program,
            metric=request.data.get('metric'),
            value=request.data.get('value'),
            units=request.data.get('units', '')  # Include units if provided
        )
        return Response(ProgramPerformanceSerializer(performance).data, status=201)

    @db_transaction.atomic
    def update(self, request, *args, **kwargs):
        # Update existing performance record
        instance = self.get_object()
        program = Program.objects.get(id=request.data.get('program'))
        instance.program = program
        instance.metric = request.data.get('metric')
        instance.value = request.data.get('value')
        instance.units = request.data.get('units', instance.units)
        instance.save()
        return Response(ProgramPerformanceSerializer(instance).data)

    @db_transaction.atomic
    def destroy(self, request, *args, **kwargs):
        # Delete performance record
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Program performance deleted successfully."}, status=204)
