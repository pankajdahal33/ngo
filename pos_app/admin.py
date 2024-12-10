from django.contrib import admin
from .models import  Expense, Program, Organization, Donor, Donation, Category, SubProgram

admin.site.register(Organization)
admin.site.register(Donor)
admin.site.register(Donation)
admin.site.register(Program)
admin.site.register(Expense)
admin.site.register(Category)
admin.site.register(SubProgram)
