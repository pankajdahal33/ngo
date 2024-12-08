from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotAuthenticated
from django.db import transaction as db_transaction
from rest_framework.response import Response

from .models import (
    Organization, Donor, Donation, Expense, Program, ProgramPerformance
)
from .serializers import (
    OrganizationSerializer, DonorSerializer, DonationSerializer, ExpenseSerializer, ProgramSerializer, ProgramPerformanceSerializer

)

class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]

class DonorViewSet(viewsets.ModelViewSet):
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    permission_classes = [IsAuthenticated]

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [IsAuthenticated]

   
    

class ExpenseViewSet(viewsets.ModelViewSet):

    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated]

    @db_transaction.atomic
    def create(self, request, *args, **kwargs):
        total_budget = request.data.get('total_budget')
        if not total_budget:
            raise NotAuthenticated("Total budget is required")
        program = Program.objects.create(
            name=request.data.get('name'),
            description=request.data.get('description'),
            start_date=request.data.get('start_date'),
            end_date=request.data.get('end_date'),
            total_budget=total_budget
        )
        return program

    @db_transaction.atomic
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        total_budget = request.data.get('total_budget')
        if not total_budget:
            raise NotAuthenticated("Total budget is required")
        instance.name = request.data.get('name')
        instance.description = request.data.get('description')
        instance.start_date = request.data.get('start_date')
        instance.end_date = request.data.get('end_date')
        instance.total_budget = total_budget
        instance.save()
        return instance

    @db_transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return instance

class ProgramPerformanceViewSet(viewsets.ModelViewSet):
    queryset = ProgramPerformance.objects.all()
    serializer_class = ProgramPerformanceSerializer
    permission_classes = [IsAuthenticated]

    @db_transaction.atomic
    def create(self, request, *args, **kwargs):
        program = Program.objects.get(id=request.data.get('program'))
        performance = ProgramPerformance.objects.create(
            program=program,
            metric=request.data.get('metric'),
            value=request.data.get('value')
        )
        return performance

    @db_transaction.atomic

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        program = Program.objects.get(id=request.data.get('program'))
        instance.program = program
        instance.metric = request.data.get('metric')
        instance.value = request.data.get('value')
        instance.save()
        return instance

    @db_transaction.atomic
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return instance








