from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (

    ExpenseViewSet,OrganizationViewSet,DonorViewSet,DonationViewSet,ProgramViewSet,ProgramPerformanceViewSet
)

router = DefaultRouter()

router.register(r'expenses', ExpenseViewSet)
router.register(r'organizations', OrganizationViewSet)
router.register(r'donors', DonorViewSet)
router.register(r'donations', DonationViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'program-performances', ProgramPerformanceViewSet)


urlpatterns = [
    path('', include(router.urls)),
]