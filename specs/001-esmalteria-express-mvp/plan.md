# Implementation Plan: Esmalteria Express MVP

**Branch**: `001-esmalteria-express-mvp` | **Date**: 2026-05-29 | **Spec**: `/specs/001-esmalteria-express-mvp/spec.md`
**Input**: Feature specification from `/specs/001-esmalteria-express-mvp/spec.md`

## Summary

Deliver a salon commerce MVP with a mobile client/admin app and a Django API that supports RBAC, magic-link auth, catalog browsing, PIX payments, Lalamove dispatch, and real-time order/stock updates. The implementation is intentionally service-driven on the backend, uses transactional stock settlement with deterministic locking, enforces webhook and dispatch idempotency, and keeps the mobile UI state normalized for efficient real-time updates.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript strict (mobile)  
**Primary Dependencies**: Django 5, DRF, Channels, Celery, Redis, PostgreSQL 16, React Native Expo, React Navigation, Zustand, React Query, NativeWind  
**Storage**: PostgreSQL 16 for application data; Redis for broker/cache/channel fan-out  
**Testing**: pytest and Django test suite for backend, React Native Testing Library + Jest for mobile, API contract and integration coverage  
**Target Platform**: Linux containers for backend services; iOS/Android via Expo for the mobile app  
**Project Type**: Mobile app + API service  
**Performance Goals**: shipping quote or recoverable failure within 5s for 95% of requests; no stock oversell under concurrency; real-time updates without manual refresh for connected clients  
**Constraints**: strict transactional stock writes, idempotent payment webhook and dispatch processing, HMAC validation for webhooks, typed error envelopes for integrations, 7-day default session lifetime, no `any` in TypeScript  
**Scale/Scope**: single-salon MVP with ADMIN and CLIENT roles, catalog/order/dispatch/payment flows, and external payment/courier providers

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Zero Omission / complete artifacts**: PASS. The specification, research, data model, quickstart, and contract artifacts are present and consistent.
- **KISS + YAGNI**: PASS. The scope covers only the explicit MVP flows and avoids speculative abstractions.
- **Service-first backend boundaries**: PASS. Business workflows belong in backend services, not views or serializers.
- **Concurrency safety**: PASS. Stock settlement requires `transaction.atomic()` and `select_for_update()` with deterministic lock order.
- **Type discipline**: PASS. Backend service signatures are typed and mobile code is constrained to strict TypeScript.
- **Security guardrails**: PASS. Webhooks require HMAC validation, endpoints enforce auth/RBAC, and secrets stay out of source.

Post-Phase-1 re-check: PASS. The current `research.md`, `data-model.md`, `quickstart.md`, and `contracts/api-contract.md` remain aligned with the constitution.

## Project Structure

### Documentation (this feature)

```text
specs/001-esmalteria-express-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── users/
│   └── services/
├── core/
├── catalog/
├── orders/
│   └── services/
├── api/
├── config/
└── tests/
    ├── unit/
    ├── integration/
    └── contract/

mobile/
├── src/
│   ├── navigation/
│   ├── features/
│   ├── components/
│   ├── stores/
│   ├── services/
│   ├── api/
│   └── screens/
└── tests/
```

**Structure Decision**: Use a mobile + API split with backend modules organized by domain (`users`, `core`, `catalog`, `orders`, `config`) and a role-aware Expo client. This matches the task list, keeps the backend service-centric, and makes RBAC/navigation boundaries explicit.

## Phase 0: Outline & Research

The research decisions already documented in `/specs/001-esmalteria-express-mvp/research.md` are the implementation baseline:

1. Persist webhook provider event ids and reject duplicates before stock mutation.
2. Lock `Order` first and `Product` rows in ascending id order to avoid deadlocks.
3. Eager-load nested order data for admin/dashboard and tracking surfaces.
4. Enforce Channels heartbeat, idle disconnect, and Redis group expiry.
5. Normalize incoming realtime payloads by id and update only affected store slices.
6. Keep failed courier quotations in a recoverable shipping-unavailable state.
7. Use a fixed 7-day magic-link session lifetime for MVP.

## Phase 1: Design & Contracts

1. The data model is defined in `/specs/001-esmalteria-express-mvp/data-model.md` with `CustomUser`, `SystemSettings`, `Category`, `Product`, `Order`, `OrderItem`, and `WebhookEvent`.
2. The API contract is defined in `/specs/001-esmalteria-express-mvp/contracts/api-contract.md` with auth, catalog, shipping, payment, webhook, dispatch, websocket, and error-envelope behavior.
3. The execution and validation flow is defined in `/specs/001-esmalteria-express-mvp/quickstart.md`.
4. The repo-level Copilot pointer already references this plan in `.github/copilot-instructions.md`.

## Phase 2: Task Planning Preview

The implementation checklist in `/specs/001-esmalteria-express-mvp/tasks.md` should remain aligned to the following execution shape:

- Setup backend/mobile containers and environment scaffolding.
- Build backend models, services, endpoints, and migrations.
- Build mobile navigation, stores, screens, and API clients.
- Add webhook, stock-locking, and realtime hardening.
- Finish with contract, integration, and operational validation.

## Complexity Tracking

No constitution violations require justification at this stage.
