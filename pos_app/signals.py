# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Product, StockHistory, Transaction, DailyBalance
# from django.contrib.auth.models import User

# @receiver(post_save, sender=Product)
# def create_initial_stock_history(sender, instance, created, **kwargs):
#     if created and instance.quantity > 0:
#         # Assign a valid User instance
#         # Ensure the user is passed in the view or use a fallback
#         user = User.objects.first()
#         if not user:
#                 raise ValueError("No default user found. Please create at least one user.")

#         # Create initial StockHistory record
#         StockHistory.objects.create(
#             product=instance,
#             change_quantity=instance.quantity,
#             change_type="STOCK_IN",
#             user=user,
#             remarks="Initial stock added"
#         )

#         # Create corresponding Transaction record
#         Transaction.objects.create(
#             transaction_type="STOCK_CHANGE",
#             reference_id=f"Product-{instance.id}",
#             amount=instance.cost_price * instance.quantity,
#             description="Initial stock added",
#             created_by=user
#         )
