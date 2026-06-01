"""Integration tests for concurrency and stock locking."""

from decimal import Decimal
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

from django.test import TransactionTestCase
from django.contrib.auth import get_user_model

from catalog.models import Category, Product
from orders.services.order_service import settle_order
from api.exceptions import APIError

User = get_user_model()


class StockLockingConcurrencyTest(TransactionTestCase):
    """
    Test that concurrent orders compete fairly for stock.
    Only one should succeed when stock_quantity == 1.
    """

    def setUp(self):
        self.category = Category.objects.create(name="Cat", slug="cat-conc")
        self.product = Product.objects.create(
            category=self.category,
            name="Limited Edition",
            price="100.00",
            stock_quantity=1,
            is_active=True,
        )
        self.user1 = User.objects.create(
            phone="+5511111111111", role="CLIENT", is_active=True
        )
        self.user2 = User.objects.create(
            phone="+5511111111112", role="CLIENT", is_active=True
        )

    def test_only_one_concurrent_order_succeeds(self):
        results = []
        errors = []
        lock = threading.Lock()

        def try_order(user):
            try:
                order = settle_order(
                    user=user,
                    items=[
                        {
                            "product_id": self.product.pk,
                            "quantity": 1,
                            "unit_price": Decimal("100.00"),
                        }
                    ],
                )
                with lock:
                    results.append(order.pk)
            except APIError as e:
                with lock:
                    errors.append(e.code)
            except Exception as e:
                with lock:
                    errors.append(str(e))

        with ThreadPoolExecutor(max_workers=2) as executor:
            futures = [
                executor.submit(try_order, self.user1),
                executor.submit(try_order, self.user2),
            ]
            for f in as_completed(futures):
                f.result()

        # Exactly one should succeed
        self.assertEqual(
            len(results), 1, f"Expected 1 success, got {len(results)}. Errors: {errors}"
        )
        # Exactly one should fail with insufficient stock
        self.assertEqual(len(errors), 1)
        self.assertIn("INSUFFICIENT_STOCK", errors[0])

        # Product stock should be 0
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, 0)
