from django.contrib import admin
from .models import  Expense, Program, Organization, Donor, Donation, ProgramPerformance

admin.site.register(Organization)
admin.site.register(Donor)
admin.site.register(Donation)
admin.site.register(Program)
admin.site.register(ProgramPerformance)
admin.site.register(Expense)
