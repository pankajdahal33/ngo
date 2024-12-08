import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from pos_app.models import Category, Supplier, Product, Customer, Employee, Expense, SalaryPayment, DailyBalance, Income, Transaction, SalesOrder, SalesOrderItem, StockHistory
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Seed database with sample data'

    def handle(self, *args, **kwargs):
        self.seed_users()
        self.seed_categories()
        self.seed_suppliers()
        self.seed_products()
        self.seed_customers()
        self.seed_employees()
        self.seed_expenses()
        self.seed_salary_payments()
        self.seed_daily_balances()
        self.seed_incomes()
        self.seed_transactions()
        self.seed_sales_orders()
        self.seed_sales_order_items()
        self.seed_stock_histories()
        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))

    def seed_users(self):
        users = [
            {'username': 'admin', 'email': 'admin@example.com', 'password': 'admin123', 'first_name': 'Admin', 'last_name': 'User'},
            {'username': 'cashier', 'email': 'cashier@example.com', 'password': 'cashier123', 'first_name': 'Cashier', 'last_name': 'User'},
            {'username': 'manager', 'email': 'manager@example.com', 'password': 'manager123', 'first_name': 'Manager', 'last_name': 'User'}
        ]
        for user_data in users:
            if not User.objects.filter(username=user_data['username']).exists():
                User.objects.create_user(**user_data)

    def seed_categories(self):
        categories = [
            {'name': 'Beverages', 'description': 'Drinks and beverages'},
            {'name': 'Snacks', 'description': 'Snacks and munchies'},
            {'name': 'Dairy', 'description': 'Milk and dairy products'},
            {'name': 'Bakery', 'description': 'Bread and bakery items'}
        ]
        for category_data in categories:
            Category.objects.get_or_create(**category_data)

    def seed_suppliers(self):
        suppliers = [
            {'name': 'Supplier 1', 'contact_person': 'John Doe', 'email': 'supplier1@example.com', 'phone': '1234567890', 'address_line1': '123 Street', 'city': 'City', 'province': 'Province', 'postal_code': '12345', 'country': 'Country'},
            {'name': 'Supplier 2', 'contact_person': 'Jane Doe', 'email': 'supplier2@example.com', 'phone': '0987654321', 'address_line1': '456 Avenue', 'city': 'City', 'province': 'Province', 'postal_code': '54321', 'country': 'Country'},
            {'name': 'Supplier 3', 'contact_person': 'Alice Smith', 'email': 'supplier3@example.com', 'phone': '1122334455', 'address_line1': '789 Boulevard', 'city': 'City', 'province': 'Province', 'postal_code': '67890', 'country': 'Country'}
        ]
        for supplier_data in suppliers:
            Supplier.objects.get_or_create(**supplier_data)

    def seed_products(self):
        categories = Category.objects.all()
        suppliers = Supplier.objects.all()
        for i in range(1, 11):
            Product.objects.get_or_create(
                category=random.choice(categories),
                supplier=random.choice(suppliers),
                name=f'Product {i}',
                description=f'Description for product {i}',
                sku=f'SKU{i}',
                barcode=f'1234567890{i:03d}',
                price=random.uniform(5.0, 50.0),
                cost_price=random.uniform(2.0, 25.0),
                quantity=random.randint(10, 200),
                reorder_level=random.randint(5, 20),
                reorder_quantity=random.randint(10, 50),
                expiration_date=timezone.now() + timezone.timedelta(days=random.randint(30, 365)),
                is_active=True
            )

    def seed_customers(self):
        for i in range(1, 11):
            Customer.objects.get_or_create(
                first_name=f'Customer{i}',
                last_name=f'Lastname{i}',
                phone=f'123456789{i:02d}',
                email=f'customer{i}@example.com',
                reward_points=random.randint(0, 500)
            )

    def seed_employees(self):
        positions = ['cashier', 'manager', 'stock_manager']
        for i in range(1, 6):
            Employee.objects.get_or_create(
                first_name=f'Employee{i}',
                last_name=f'Lastname{i}',
                email=f'employee{i}@example.com',
                phone=f'123456789{i:02d}',
                position=random.choice(positions),
                salary=random.uniform(3000, 7000),
                hire_date=timezone.now() - timezone.timedelta(days=random.randint(30, 365))
            )

    def seed_expenses(self):
        user = User.objects.first()
        categories = ['Utilities', 'Supplies', 'Maintenance']
        for i in range(1, 6):
            Expense.objects.get_or_create(
                category=random.choice(categories),
                description=f'Expense description {i}',
                amount=random.uniform(50.0, 500.0),
                date=timezone.now() - timezone.timedelta(days=random.randint(1, 30)),
                created_by=user
            )

    def seed_salary_payments(self):
        user = User.objects.first()
        employees = Employee.objects.all()
        for employee in employees:
            SalaryPayment.objects.get_or_create(
                employee=employee,
                amount=employee.salary,
                payment_date=timezone.now() - timezone.timedelta(days=random.randint(1, 30)),
                created_by=user
            )

    def seed_daily_balances(self):
        user = User.objects.first()
        for i in range(1, 11):
            DailyBalance.objects.get_or_create(
                opening_balance=random.uniform(1000, 5000),
                closing_balance=random.uniform(1000, 5000),
                total_income=random.uniform(500, 2000),
                total_expense=random.uniform(100, 1000),
                profit_or_loss=random.uniform(-500, 1500),
                date=timezone.now() - timezone.timedelta(days=i),
                created_by=user
            )

    def seed_incomes(self):
        user = User.objects.first()
        for i in range(1, 6):
            Income.objects.get_or_create(
                description=f'Income description {i}',
                amount=random.uniform(100.0, 1000.0),
                date=timezone.now() - timezone.timedelta(days=random.randint(1, 30)),
                created_by=user
            )

    def seed_transactions(self):
        user = User.objects.first()
        transaction_types = ['Income', 'Expense', 'Salary Payment', 'Sales']
        for i in range(1, 11):
            Transaction.objects.get_or_create(
                type=random.choice(transaction_types),
                reference_id=random.randint(1, 10),
                amount=random.uniform(100.0, 1000.0),
                date=timezone.now() - timezone.timedelta(days=random.randint(1, 30)),
                description=f'Transaction description {i}',
                created_by=user
            )

    def seed_sales_orders(self):
        customers = Customer.objects.all()
        user = User.objects.first()
        for i in range(1, 11):
            SalesOrder.objects.get_or_create(
                customer=random.choice(customers),
                user=user,
                order_date=timezone.now() - timezone.timedelta(days=random.randint(1, 30)),
                status=random.choice(['completed', 'pending', 'canceled']),
                sub_total=random.uniform(50.0, 500.0),
                discount=random.uniform(0.0, 50.0),
                total_amount=random.uniform(50.0, 500.0),
                reward_points_used=random.randint(0, 50),
                reward_points_earned=random.randint(0, 100)
            )

    def seed_sales_order_items(self):
        sales_orders = SalesOrder.objects.all()
        products = Product.objects.all()
        for sales_order in sales_orders:
            for i in range(1, 4):
                product = random.choice(products)
                quantity = random.randint(1, 10)
                SalesOrderItem.objects.get_or_create(
                    sales_order=sales_order,
                    product=product,
                    quantity=quantity,
                    unit_price=product.price,
                    total_price=product.price * quantity
                )

    def seed_stock_histories(self):
        products = Product.objects.all()
        user = User.objects.first()
        change_types = ['Purchase', 'Sale', 'Return', 'Adjustment']
        for product in products:
            for i in range(1, 4):
                StockHistory.objects.get_or_create(
                    product=product,
                    change_quantity=random.randint(1, 50),
                    change_type=random.choice(change_types),
                    date=timezone.now() - timezone.timedelta(days=random.randint(1, 30)),
                    user=user,
                    remarks=f'Stock history remark {i}'
                )