# API Contract: Esmalteria Express MVP

## Authentication

### POST /api/auth/magic-link

- **Purpose**: Authenticate user and return JWT for mobile deep-link bootstrap.
- **Behavior**: Session tokens are issued with default 7-day lifetime.
- **Request**:

```json
{
  "phone": "+55XXXXXXXXXXX"
}
```

- **Response 200**:

```json
{
  "token": "jwt-token",
  "role": "ADMIN",
  "expires_in_seconds": 604800,
  "expires_at": "2026-06-04T12:00:00Z",
  "deep_link": "esmalteria://auth?token=jwt-token"
}
```

## Catalog

### GET /api/catalog/products

- **Purpose**: List active products for client feed.
- **Query behavior**: Must include eager-loading policy for category joins where needed.

## Shipping Quote

### POST /api/orders/quote-shipping

- **Purpose**: Return dynamic shipping cost.
- **Request**:

```json
{
  "cart_items": [{ "product_id": 1, "quantity": 2 }]
}
```

- **Response 200**:

```json
{
  "shipping_cost": "0.00",
  "currency": "BRL",
  "is_free_shipping": true,
  "quotation_id": null
}
```

- **Response 202 (shipping unavailable recoverable)**:

```json
{
  "code": "SHIPPING_UNAVAILABLE",
  "message": "No courier available now. Retry shortly."
}
```

## Payment

### POST /api/orders/{order_id}/pay

- **Purpose**: Create PIX payload when payments are enabled.
- **Response 200**:

```json
{
  "payment_method": "PIX_INFINITEPAY",
  "qr_code": "base64-or-url",
  "brcode": "000201..."
}
```

## Webhook

### POST /api/webhooks/infinitepay

- **Purpose**: Receive payment confirmation events.
- **Security**: HMAC signature required.
- **Behavior**:
  - Invalid signature -> `400`
  - Duplicate `provider_event_id` -> `200` idempotent success with no state mutation
  - Valid new paid event -> settle order exactly once
  - Delayed paid event while client is offline -> settle server state and expose updated order status on next client fetch/reconnect
- **Response 200**:

```json
{
  "status": "processed"
}
```

## Dispatch

### POST /api/orders/{order_id}/dispatch

- **Purpose**: Place courier order for approved/preparing order.
- **Behavior**:
  - Idempotent retry-safe dispatch command
  - On transport failure, preserve recoverable order state
  - On partial courier cancellation/failure, preserve recoverable order state with no duplicate tracking/status mutation
- **Response 200**:

```json
{
  "order_id": 10,
  "status": "IN_TRANSIT",
  "lalamove_order_id": "abc123",
  "tracking_url": "https://..."
}
```

## WebSocket Events

### Channel: catalog_updates

- **Event payload**:

```json
{
  "type": "product_stock_updated",
  "product_id": 1,
  "stock_quantity": 0,
  "is_active": false
}
```

### Channel: order_updates:{order_id}

- **Event payload**:

```json
{
  "type": "order_status_updated",
  "order_id": 10,
  "status": "APPROVED_PREPARING"
}
```

## Error Envelope

All non-2xx responses should follow:

```json
{
  "code": "MACHINE_READABLE_CODE",
  "message": "Human-friendly message",
  "details": {}
}
```
