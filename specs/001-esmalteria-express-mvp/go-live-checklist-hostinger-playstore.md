# Go-Live Checklist: Domain, Hostinger, Backend, and Google Play

This checklist is intended for first production launch. Execute in order.

## 0. Ownership and timeline

- [ ] Define release owner (single accountable person).
- [ ] Define technical owner for backend infra.
- [ ] Define technical owner for mobile release.
- [ ] Define planned launch date and rollback window.
- [ ] Define incident contact channel (phone/Slack/WhatsApp).

## 1. Domain purchase and DNS

- [ ] Purchase a production domain from preferred registrar.
- [ ] Enable domain auto-renew.
- [ ] Create registrar access recovery options (2FA + backup email).
- [ ] Decide production API host name (example: api.example.com).
- [ ] Create DNS A record for API subdomain pointing to Hostinger VM IP.
- [ ] Set low TTL during rollout window (example: 300s).
- [ ] Validate DNS propagation with `dig`/`nslookup`.

## 2. Hostinger VM purchase and base provisioning

- [ ] Buy VPS/KVM plan sized for expected traffic.
- [ ] Choose Linux distro and region close to target users.
- [ ] Create non-root sudo user.
- [ ] Disable password SSH login; use SSH keys only.
- [ ] Enable firewall (allow 22, 80, 443).
- [ ] Configure fail2ban or equivalent.
- [ ] Apply system updates and security patches.
- [ ] Configure server timezone and NTP sync.
- [ ] Install Docker Engine and Docker Compose plugin.
- [ ] Add operational user to docker group (if policy allows).

## 3. Repository and environment bootstrap

- [ ] Clone repository on server.
- [ ] Checkout deployment branch/tag to be released.
- [ ] Create production `.env` file with real values.
- [ ] Set `DJANGO_SETTINGS_MODULE=config.settings.prod`.
- [ ] Set `DJANGO_DEBUG=0`.
- [ ] Set `DJANGO_ALLOWED_HOSTS` including API domain.
- [ ] Set `DJANGO_CORS_ALLOWED_ORIGINS` to required production origins only.
- [ ] Set strong `DJANGO_SECRET_KEY`.
- [ ] Set production `DATABASE_URL` and `REDIS_URL`.
- [ ] Set `INFINITEPAY_API_KEY` and `INFINITEPAY_WEBHOOK_SECRET`.
- [ ] Set `LALAMOVE_API_KEY` and `LALAMOVE_BASE_URL`.
- [ ] Confirm secrets are not committed to git.

## 4. TLS certificate setup (Nginx in compose)

- [ ] Obtain TLS certificate for API domain.
- [ ] Place certificate files on server:
- [ ] deploy/nginx/ssl/fullchain.pem
- [ ] deploy/nginx/ssl/privkey.pem
- [ ] Verify file permissions restrict private key access.
- [ ] Confirm Nginx config references these exact paths.
- [ ] Confirm port 443 is exposed in production compose.

## 5. Backend deployment with Docker Compose

- [ ] Pull/build images:
- [ ] `docker compose -f compose.prod.yaml pull`
- [ ] `docker compose -f compose.prod.yaml build --pull`
- [ ] Start services:
- [ ] `docker compose -f compose.prod.yaml up -d`
- [ ] Confirm all services are up:
- [ ] `docker compose -f compose.prod.yaml ps`
- [ ] Confirm API migrations completed successfully.
- [ ] Confirm API health endpoint and HTTPS response.
- [ ] Confirm HTTP redirects to HTTPS.
- [ ] Review logs for api, nginx, celery worker, celery beat.

## 6. Data protection and operations baseline

- [ ] Configure automatic PostgreSQL backups.
- [ ] Test database restore process on a safe environment.
- [ ] Define retention policy for backups.
- [ ] Configure log retention and rotation.
- [ ] Set monitoring/alerts for CPU, memory, disk, restart loops.
- [ ] Set uptime monitoring for public API URL.

## 7. Backend functional acceptance (production-like)

- [ ] Execute auth magic link flow successfully.
- [ ] Execute quote shipping flow successfully.
- [ ] Execute payment creation flow successfully.
- [ ] Validate webhook signature rejection on invalid payload/signature.
- [ ] Validate duplicate webhook idempotency behavior.
- [ ] Validate stock is deducted exactly once after valid paid webhook.
- [ ] Validate dispatch flow and tracking URL persistence.
- [ ] Validate websocket order status updates.

## 8. Google Play Console setup

- [ ] Create/verify Google Play developer account.
- [ ] Complete Play Console organization/contact details.
- [ ] Create app entry in Play Console.
- [ ] Configure package name and app signing strategy.
- [ ] Configure Play App Signing.
- [ ] Store keystore/recovery credentials securely.

## 9. Mobile production build configuration

- [ ] Ensure production API base URL points to HTTPS public API domain.
- [ ] Ensure no localhost/10.0.2.2 values in production profile.
- [ ] Validate deep-link scheme configuration for production.
- [ ] Verify release versionCode/versionName increment policy.
- [ ] Build signed AAB using production EAS profile.
- [ ] Archive build metadata (commit hash, config, build time).

## 10. Store compliance and listing assets

- [ ] Prepare app icon, feature graphic, screenshots (required sizes).
- [ ] Prepare privacy policy URL.
- [ ] Prepare terms/support contact.
- [ ] Complete data safety form with accurate declarations.
- [ ] Complete content rating questionnaire.
- [ ] Verify permissions requested by app are justified.

## 11. Play rollout strategy

- [ ] Upload AAB to Internal Testing track.
- [ ] Add internal testers and validate end-to-end flows.
- [ ] Promote to Closed Testing track if needed.
- [ ] Validate crash-free rate and critical analytics.
- [ ] Promote to Production with staged rollout (example: 5% -> 20% -> 100%).
- [ ] Monitor errors, ANRs, and payment/webhook success rates during rollout.

## 12. Post-launch operations

- [ ] Verify first real user order from app to delivery pipeline.
- [ ] Verify first real webhook event handling in production logs.
- [ ] Verify business dashboard/admin critical screens.
- [ ] Confirm on-call and rollback plan availability.
- [ ] Tag release in git and document final deployment notes.

## 13. Rollback checklist

- [ ] Keep previous working image tags available.
- [ ] Keep previous known-good compose env snapshot.
- [ ] Define command path for rollback deploy.
- [ ] Define decision threshold to trigger rollback.
- [ ] Validate DB schema backward compatibility assumptions before rollback.

## 14. Sign-off

- [ ] Backend owner sign-off.
- [ ] Mobile owner sign-off.
- [ ] Product/business owner sign-off.
- [ ] Launch approved.
