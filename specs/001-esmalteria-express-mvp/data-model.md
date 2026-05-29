# Data Model: Esmalteria Express MVP

## Entity: CustomUser

- **Fields**:
  - `id` (PK)
  - `role` (`ADMIN` | `CLIENT`)
  - `phone` (required)
  - `salon_name` (required for client context)
  - `address_lat` (float)
  - `address_lng` (float)
- **Relationships**:
  - One-to-many with `Order` (`Order.client`)
- **Validation rules**:
  - Public registration disallowed.
  - Only admin-managed client creation.

## Entity: AuthSessionPolicy (Configuration)

- **Fields**:
  - `id` (PK)
  - `default_token_ttl_days` (int, default `7`)
  - `updated_at`
- **Relationships**:
  - Global policy consumed by auth service token generation.
- **Validation rules**:
  - `default_token_ttl_days > 0`

## Entity: SystemSettings (Singleton)

- **Fields**:
  - `payments_enabled` (bool)
  - `free_shipping_threshold` (decimal)
  - `lalamove_api_key` (secret/encrypted)
  - `infinitepay_api_key` (secret/encrypted)
- **Relationships**:
  - Global config dependency for payment/shipping services.
- **Validation rules**:
  - Exactly one active record.

## Entity: Category

- **Fields**:
  - `id` (PK)
  - `name`
  - `slug`
  - `icon_url`
- **Relationships**:
  - One-to-many with `Product`.

## Entity: Product

- **Fields**:
  - `id` (PK)
  - `category_id` (FK)
  - `name`
  - `description`
  - `price` (decimal)
  - `cost_price` (decimal)
  - `stock_quantity` (int)
  - `is_active` (bool)
- **Relationships**:
  - Many-to-one to `Category`
  - One-to-many with `OrderItem`
- **Validation rules**:
  - Stock cannot become negative.

## Entity: Order

- **Fields**:
  - `id` (PK)
  - `client_id` (FK to `CustomUser`)
  - `status` (`PENDING`, `APPROVED_PREPARING`, `IN_TRANSIT`, `DELIVERED`, `CANCELED`, `SHIPPING_UNAVAILABLE`)
  - `subtotal` (decimal)
  - `shipping_cost` (decimal)
  - `total` (decimal)
  - `payment_method` (`PIX_INFINITEPAY`, `MANUAL`)
  - `infinitepay_transaction_id` (nullable)
  - `lalamove_order_id` (nullable)
  - `lalamove_tracking_url` (nullable)
  - `dispatch_request_id` (nullable, idempotency key)
  - `dispatch_retry_count` (int default `0`)
  - `dispatch_last_error_code` (nullable)
  - `created_at` / `updated_at`
- **Relationships**:
  - Many-to-one to `CustomUser`
  - One-to-many with `OrderItem`
- **Validation rules**:
  - Financial totals must be non-negative.

## Entity: OrderItem

- **Fields**:
  - `id` (PK)
  - `order_id` (FK)
  - `product_id` (FK)
  - `quantity` (int)
  - `unit_price` (decimal snapshot)
- **Relationships**:
  - Many-to-one to `Order`
  - Many-to-one to `Product`
- **Validation rules**:
  - `quantity > 0`

## Entity: WebhookEvent (Idempotency Ledger)

- **Fields**:
  - `id` (PK)
  - `provider` (enum: `INFINITEPAY`)
  - `provider_event_id` (unique)
  - `order_id` (FK nullable)
  - `status` (`RECEIVED`, `PROCESSED`, `IGNORED_DUPLICATE`, `FAILED`)
  - `payload_hash`
  - `processed_at`
- **Relationships**:
  - Optional many-to-one to `Order`
- **Validation rules**:
  - Unique constraint on (`provider`, `provider_event_id`).

## State Transitions

### Order status

- `PENDING` -> `APPROVED_PREPARING` (valid paid webhook)
- `APPROVED_PREPARING` -> `IN_TRANSIT` (successful dispatch)
- `IN_TRANSIT` -> `DELIVERED` (delivery completion)
- `PENDING` -> `SHIPPING_UNAVAILABLE` (shipping quote/acceptance failure)
- `PENDING` -> `CANCELED` (manual cancellation)
- `APPROVED_PREPARING` -> `APPROVED_PREPARING` (idempotent dispatch retry with no duplicate courier side effects)

### Settlement behavior

- Stock deduction occurs only in `PENDING` -> `APPROVED_PREPARING` transition.
- Duplicate paid webhook does not trigger a second transition.
- Delayed paid webhook transitions are reconciled on next client reconnect/fetch.
- Courier cancellation/failure retries must preserve recoverable status and avoid duplicate tracking metadata writes.
