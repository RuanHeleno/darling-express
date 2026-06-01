# Quickstart: Esmalteria Express MVP

## 1. Prerequisites

- Docker + Docker Compose
- Python 3.11 toolchain (for local commands outside containers)
- Node.js LTS + Yarn Classic (for Expo local workflows)

## 2. Environment

1. Copy `.env.example` to `.env`.
2. Keep `.env` for non-secret runtime knobs and frontend public vars only.
3. Create secret files under `.secrets/` following `.secrets/.example`.
4. Ensure Docker secret files are populated before `docker compose -f compose.dev.yaml up`.

## 3. Boot the stack

1. Run `docker compose -f compose.dev.yaml up --build`.
2. Confirm services are healthy: `postgres`, `redis`, `api`, `celery_worker`, `celery_beat`, `mobile`.

## 4. Backend setup

1. Run migrations inside API container.
2. Create admin user.
3. Seed baseline `SystemSettings` singleton.

## 5. Mobile setup

1. Mobile service starts with compose; alternatively run locally with `yarn start`.
2. For Android emulator use `adb reverse tcp:8000 tcp:8000` when API URL is `http://localhost:8000`.
3. For physical devices, set `EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:8000` in `.env`.
4. Validate deep-link config for `esmalteria://auth?token=...`.
5. Confirm root RBAC navigator splits admin/client routes.

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

## 7. Production deployment (Hostinger + Docker)

1. Configure a public API domain (example: `api.example.com`) and HTTPS.
2. Set production environment variables/secrets for backend and providers.
3. Place TLS certificate files in `deploy/nginx/ssl/`:
   - `fullchain.pem`
   - `privkey.pem`
4. Start production stack:
   - `docker compose -f compose.prod.yaml build --pull`
   - `docker compose -f compose.prod.yaml up -d`
5. Confirm runtime state:
   - `docker compose -f compose.prod.yaml ps`
   - `docker compose -f compose.prod.yaml logs --tail=200 api nginx celery_worker celery_beat`
6. Validate HTTPS endpoint:
   - `curl -I https://api.example.com`

## 8. Android release workflow (Google Play)

1. Build production AAB with EAS profile `production`.
2. Upload first to Internal Testing on Google Play Console.
3. Validate auth deep link, payment webhook, shipping quote, and live order updates.
4. Promote track after quality gates pass.

Detailed runbook: `specs/001-esmalteria-express-mvp/release-playstore.md`.

Detailed go-live checklist: `specs/001-esmalteria-express-mvp/go-live-checklist-hostinger-playstore.md`.
