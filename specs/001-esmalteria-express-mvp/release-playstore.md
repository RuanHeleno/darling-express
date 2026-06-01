# Android Release and Production Deployment Runbook

## 1. Production architecture

- Server stack runs on Hostinger using Docker Compose from `compose.prod.yaml`.
- Public endpoint exposed by Nginx and routed to Django ASGI app.
- Mobile app is distributed by Google Play as an Android App Bundle (AAB).
- Mobile production builds must point to a public HTTPS API URL.

## 2. Backend deployment on Hostinger

1. Configure DNS and domain for API, for example `api.example.com`.
2. Provision TLS certificate (recommended with reverse proxy/CDN or host-managed TLS).
3. Copy repository to server and configure environment variables for production.
4. Set strong values for all secrets (`DJANGO_SECRET_KEY`, payment provider keys, webhook secret).
5. Run:
   - `docker compose -f compose.prod.yaml pull`
   - `docker compose -f compose.prod.yaml build --pull`
   - `docker compose -f compose.prod.yaml up -d`
6. Verify health:
   - `docker compose -f compose.prod.yaml ps`
   - `docker compose -f compose.prod.yaml logs --tail=200 api nginx celery_worker celery_beat`
7. Validate webhook endpoint reachability from InfinitePay dashboard.

## 2.1 TLS files expected by Nginx

Before starting production compose, place these files on the server:

- `deploy/nginx/ssl/fullchain.pem`
- `deploy/nginx/ssl/privkey.pem`

The Nginx production config redirects HTTP to HTTPS and terminates TLS at port 443.

## 3. Mobile environment strategy

Use explicit API URLs per environment:

- Development emulator: `http://10.0.2.2:8000`
- Development device on LAN: `http://<LAN_IP>:8000`
- Production: `https://api.example.com`

Keep production URL injected via Expo env at build time.

## 4. Play Store release flow

1. Create and secure Android signing key (keystore) and backup it.
2. Build production artifact (AAB) with EAS profile `production`.
3. Upload AAB to Google Play Console (internal testing first).
4. Test payment, shipping quote, order status updates, and deep-link login in internal track.
5. Promote to closed/open/production after quality gates pass.

## 5. Mandatory pre-release checks

- API endpoint is HTTPS and stable.
- CORS allows the production app origin only as needed.
- Webhook signature validation is enabled and tested.
- Duplicate webhook events are idempotent.
- Concurrency tests for stock settlement pass.
- Order websocket updates are validated under reconnect scenarios.

## 6. Rollback and incident basics

- Keep previous image tags available for fast rollback.
- Use `docker compose -f compose.prod.yaml up -d` with pinned image tags for deterministic redeploy.
- Keep daily database backups and restore drills documented.
