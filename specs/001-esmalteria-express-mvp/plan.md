# Implementation Plan: Esmalteria Express MVP

**Branch**: `001-esmalteria-express-mvp` | **Date**: 2026-05-28 | **Spec**: `/specs/001-esmalteria-express-mvp/spec.md`
**Input**: Feature specification from `/specs/001-esmalteria-express-mvp/spec.md`

## Summary

Build an MVP mobile + API commerce flow for salons with RBAC, magic-link auth, PIX payment via InfinitePay, Lalamove dispatch, and real-time stock/order updates. Core architecture enforces service-layer business logic, transactional stock settlement with deterministic row locking, webhook idempotency, retry-safe dispatch, and explicit failure contracts for client/admin UX resilience.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript strict (mobile)  
**Primary Dependencies**: Django 5, DRF, Channels, Celery, Redis, PostgreSQL 16, React Native Expo, React Navigation, Zustand, React Query, NativeWind  
**Storage**: PostgreSQL 16 (primary), Redis (broker/cache/channels layer)  
**Testing**: pytest + Django test suite (backend), React Native Testing Library + Jest (mobile), API contract and integration tests  
**Target Platform**: Linux containers for API/worker infra; Android/iOS via Expo for client/admin app  
**Project Type**: Mobile app + web service  
**Performance Goals**: shipping quote response/failure in <=5s for 95% of requests; no stock oversell under concurrent settlements; real-time updates delivered to active clients without manual refresh  
**Constraints**: strict transaction safety for stock writes, idempotent webhook/dispatch processing, mandatory HMAC validation for webhook, typed error envelope on integration failures, default 7-day auth token lifetime  
**Scale/Scope**: single-salon MVP, dual roles (ADMIN/CLIENT), catalog/order/dispatch flows with external payment + courier integrations

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Gate 1 - Zero Omission / complete implementation artifacts**: PASS. Plan and design artifacts are complete with no placeholder logic.
- **Gate 2 - KISS + YAGNI**: PASS. Scope is limited to explicit MVP requirements (FR-001..FR-019) without speculative modules.
- **Gate 3 - Service-first backend boundaries**: PASS. Business workflows remain in service layer; controllers are orchestration only.
- **Gate 4 - Concurrency safety**: PASS. Stock settlement requires `transaction.atomic()` + `select_for_update()` and deterministic lock ordering.
- **Gate 5 - Type discipline**: PASS. Python service typing + TypeScript strict/no `any` are preserved.
- **Gate 6 - Security guardrails**: PASS. HMAC webhook validation, authenticated endpoints, role permissions, and secret handling are explicit.

Post-Phase-1 re-check: PASS. `research.md`, `data-model.md`, `quickstart.md`, and `contracts/api-contract.md` remain constitution-compliant.

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
├── core/
├── catalog/
├── orders/
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
│   └── services/
└── tests/
```

**Structure Decision**: Use a mobile + API split with service-centric backend modules and role-aware mobile navigation to enforce RBAC and keep business logic isolated from transport/UI layers.

## Phase 0: Outline & Research

Research focus and resolutions are documented in `/specs/001-esmalteria-express-mvp/research.md`:

1. Webhook idempotency ledger and duplicate event handling.
2. Deadlock-safe stock settlement order (`Order` then `Product` rows by ascending id).
3. Eager-loading strategy for order/dashboard surfaces.
4. Channels liveness policy (heartbeat/idle/group expiry).
5. Render containment strategy for real-time mobile updates.
6. Lalamove failure and recoverable order behavior.
7. Magic-link session policy with default 7-day lifetime.

## Phase 1: Design & Contracts

1. Data model completed in `/specs/001-esmalteria-express-mvp/data-model.md` with entities, validations, and state transitions.
2. Public interface contracts completed in `/specs/001-esmalteria-express-mvp/contracts/api-contract.md`.
3. Execution and verification flow documented in `/specs/001-esmalteria-express-mvp/quickstart.md`.
4. Agent context pointer verified in `.github/copilot-instructions.md` under `SPECKIT START/END` markers.

## Phase 2: Task Planning Preview

Task decomposition remains in `/specs/001-esmalteria-express-mvp/tasks.md` and should preserve FR-015 through FR-019 traceability in contract, integration, and edge-case tests.

## Complexity Tracking

No constitution violations identified; no complexity exceptions required.
