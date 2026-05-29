# Quickstart: Esmalteria Express MVP

## 1. Prerequisites

- Docker + Docker Compose
- Python 3.11 toolchain (for local commands outside containers)
- Node.js LTS (for Expo local workflows)

## 2. Environment

1. Copy `.env.example` to `.env`.
2. Fill DB, Redis, InfinitePay, and Lalamove credentials.
3. Ensure webhook secret key is configured.

## 3. Boot the stack

1. Run `docker compose up --build`.
2. Confirm services are healthy: `postgres`, `redis`, `api`, `celery_worker`, `celery_beat`, `mobile`.

## 4. Backend setup

1. Run migrations inside API container.
2. Create admin user.
3. Seed baseline `SystemSettings` singleton.

## 5. Mobile setup

1. Start Expo app.
2. Validate deep-link config for `esmalteria://auth?token=...`.
3. Confirm root RBAC navigator splits admin/client routes.

## 6. Validation checklist

### Payment and stock integrity

- Trigger a paid webhook once: order moves to `APPROVED_PREPARING`, stock decreases exactly once.
- Replay the same webhook event id: status remains stable, stock unchanged.

### Authentication policy

- Trigger magic-link authentication and confirm issued token/session expiration is 7 days (`604800` seconds).

### Concurrency safety

- Simulate concurrent settlements for the same product.
- Confirm deterministic lock order prevents deadlock and no oversell occurs.

### Shipping resilience

- Simulate Lalamove timeout/no acceptance.
- Confirm order transitions to recoverable shipping-unavailable state.

### Real-time behavior

- Keep multiple clients connected for extended duration.
- Confirm heartbeat and idle disconnect behavior prevent stale socket accumulation (heartbeat every 25s, disconnect after 2 missed pongs, idle timeout 60s).

### Error contract behavior

- Validate endpoint error envelope and code mapping for `/api/orders/quote-shipping`, `/api/orders/{order_id}/pay`, `/api/webhooks/infinitepay`, and `/api/orders/{order_id}/dispatch`.

### Frontend render behavior

- Emit repeated WebSocket order updates.
- Confirm only affected dashboard rows rerender.
