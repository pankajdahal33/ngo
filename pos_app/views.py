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
    # permission_classes = [IsAuthenticated]

class DonorViewSet(viewsets.ModelViewSet):
    queryset = Donor.objects.all()
    serializer_class = DonorSerializer
    # permission_classes = [IsAuthenticated]

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    # append donor to the response
    def list(self, request, *args, **kwargs):
        queryset = Donation.objects.all()
        serializer = DonationSerializer(queryset, many=True)
        for data in serializer.data:
            donor = Donor.objects.get(id=data['donor'])
            data['donor'] = DonorSerializer(donor).data
        return Response(serializer.data)
    # permission_classes = [IsAuthenticated]



class ExpenseViewSet(viewsets.ModelViewSet):

    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    # append program to the response
    def list(self, request, *args, **kwargs):
        queryset = Expense.objects.all()
        serializer = ExpenseSerializer(queryset, many=True)
        for data in serializer.data:
            program = Program.objects.get(id=data['program'])
            data['program'] = ProgramSerializer(program).data
        return Response(serializer.data)
    # permission_classes = [IsAuthenticated]


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    # permission_classes = [IsAuthenticated]

   

class ProgramPerformanceViewSet(viewsets.ModelViewSet):
    queryset = ProgramPerformance.objects.all()
    serializer_class = ProgramPerformanceSerializer
    # permission_classes = [IsAuthenticated]

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








