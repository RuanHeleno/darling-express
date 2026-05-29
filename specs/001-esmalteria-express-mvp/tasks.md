# Tasks: Esmalteria Express MVP

**Input**: Design documents from `/specs/001-esmalteria-express-mvp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated tests are required by the specification's mandatory testing scenarios and plan quality gates; this task list includes explicit contract, concurrency, and idempotency coverage.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no dependency conflicts)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story phases only

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize runtime and project skeletons.

- [x] T001 Create Docker orchestration in `docker-compose.yml` with `postgres`, `redis`, `api`, `celery_worker`, `celery_beat`, and `mobile`
- [x] T002 [P] Create backend container build in `backend/Dockerfile`
- [x] T003 [P] Create mobile container build in `mobile/Dockerfile`
- [x] T004 Create environment template in `.env.example` including DB, Redis, InfinitePay, Lalamove, and webhook signature variables
- [x] T005 Scaffold Django project entrypoints in `backend/manage.py`, `backend/config/asgi.py`, and `backend/config/urls.py`
- [x] T006 [P] Scaffold backend apps in `backend/users/`, `backend/core/`, `backend/catalog/`, and `backend/orders/`
- [x] T007 Scaffold Expo project shell in `mobile/package.json`, `mobile/app.json`, and `mobile/src/App.tsx`
- [x] T008 [P] Configure strict TypeScript in `mobile/tsconfig.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core architecture, models, and cross-cutting foundations required before user stories.

**⚠️ CRITICAL**: No story implementation starts before this phase completes.

- [x] T009 Configure backend dependencies and settings in `backend/pyproject.toml` (or `backend/requirements.txt`) and `backend/config/settings/*.py`
- [x] T010 Configure mobile dependencies in `mobile/package.json` for React Navigation, Zustand, React Query, and NativeWind
- [ ] T011 Implement `CustomUser` model and admin registration in `backend/users/models.py` and `backend/users/admin.py`
- [ ] T012 Implement `SystemSettings` singleton in `backend/core/models.py` and `backend/core/admin.py`
- [ ] T013 [P] Implement `Category` and `Product` models in `backend/catalog/models.py`
- [ ] T014 [P] Implement `Order` and `OrderItem` models in `backend/orders/models.py`
- [ ] T015 Add idempotency ledger model `WebhookEvent` in `backend/orders/models.py` with unique (`provider`, `provider_event_id`) constraint
- [ ] T016 Generate and commit initial migrations in `backend/users/migrations/`, `backend/core/migrations/`, `backend/catalog/migrations/`, and `backend/orders/migrations/`
- [ ] T017 Implement API error envelope and exception handling in `backend/config/settings/*.py` and `backend/api/exceptions.py`
- [ ] T018 Configure Channels + Redis layer with expiry defaults in `backend/config/settings/*.py` and `backend/config/asgi.py`

**Checkpoint**: Foundation ready. User stories can begin.

---

## Phase 3: User Story 1 - Client Shops and Pays (Priority: P1) 🎯 MVP

**Goal**: Client can authenticate, browse, quote shipping, pay via PIX, and receive order updates.

**Independent Test**: Login as client, add products to cart, request quote, generate PIX, receive approval update after webhook.

### Implementation for User Story 1

- [ ] T019 [US1] Implement magic link JWT service and endpoint in `backend/users/services/auth_service.py` and `backend/users/views.py`
- [ ] T020 [US1] Implement auth serializers and URL routes in `backend/users/serializers.py` and `backend/config/urls.py`
- [ ] T020A [US1] Define endpoint-level error mapping for `auth`, `quote-shipping`, `pay`, and `webhooks/infinitepay` in `backend/api/errors.py` and `specs/001-esmalteria-express-mvp/contracts/api-contract.md`
- [ ] T021 [US1] Implement product/category list serializers and viewsets in `backend/catalog/serializers.py` and `backend/catalog/views.py`
- [ ] T022 [US1] Enforce canonical eager loading in order read querysets in `backend/orders/views.py` using `select_related('client')` and `prefetch_related(Prefetch('orderitem_set', queryset=OrderItem.objects.select_related('product')))` (or exact related-name equivalent)
- [ ] T023 [US1] Implement shipping quote service in `backend/orders/services/lalamove_service.py` with `free_shipping_threshold` logic
- [ ] T024 [US1] Implement quote endpoint in `backend/orders/views.py` and `backend/orders/serializers.py`
- [ ] T025 [US1] Implement PIX generation service in `backend/orders/services/infinitepay_service.py`
- [ ] T026 [US1] Implement checkout payment endpoint in `backend/orders/views.py`
- [ ] T027 [US1] Implement mobile deep-link bootstrap in `mobile/src/navigation/linking.ts`
- [ ] T028 [US1] Implement auth store in `mobile/src/stores/authStore.ts`
- [ ] T028A [US1] Implement delayed-webhook reconciliation on app reopen in `mobile/src/features/checkout/` and `mobile/src/api/orders.ts`
- [ ] T029 [US1] Implement client catalog screen in `mobile/src/screens/ClientCatalogScreen.tsx` and feature logic in `mobile/src/features/catalog/`
- [ ] T030 [US1] Implement cart screen and free-shipping progress in `mobile/src/screens/CartScreen.tsx` and `mobile/src/components/ShippingProgressBar.tsx`
- [ ] T031 [US1] Implement checkout PIX screen in `mobile/src/screens/CheckoutScreen.tsx` and API client in `mobile/src/api/orders.ts`
- [ ] T032 [US1] Implement order WebSocket listener and reconciliation in `mobile/src/features/checkout/` and `mobile/src/navigation/`

**Checkpoint**: US1 delivers functional MVP checkout flow.

---

## Phase 4: User Story 2 - Admin Manages Orders and Dispatch (Priority: P2)

**Goal**: Admin can monitor operations and dispatch approved orders with tracking.

**Independent Test**: Login as admin, view dashboard metrics, move order to dispatch, persist tracking URL.

### Implementation for User Story 2

- [ ] T033 [US2] Implement root RBAC navigator split in `mobile/src/navigation/RootNavigator.tsx`, `mobile/src/navigation/AdminStack.tsx`, and `mobile/src/navigation/ClientStack.tsx`
- [ ] T034 [US2] Implement dashboard aggregation endpoint in `backend/orders/views.py` and service in `backend/orders/services/order_service.py`
- [ ] T035 [US2] Implement loyalty ranking endpoint in `backend/orders/views.py` and query service in `backend/orders/services/order_service.py`
- [ ] T036 [US2] Implement dispatch command service in `backend/orders/services/lalamove_service.py` with idempotent retry-safe behavior
- [ ] T037 [US2] Implement dispatch endpoint and status transition wiring in `backend/orders/views.py` and `backend/orders/serializers.py`
- [ ] T037A [US2] Implement partial courier cancellation/failure retry behavior in `backend/orders/services/lalamove_service.py` and `backend/orders/models.py`
- [ ] T038 [US2] Implement admin dashboard screen in `mobile/src/screens/AdminDashboardScreen.tsx`
- [ ] T039 [US2] Implement admin orders kanban screen in `mobile/src/screens/OrdersKanbanScreen.tsx`
- [ ] T040 [US2] Implement loyalty ranking screen in `mobile/src/screens/LoyaltyScreen.tsx`
- [ ] T041 [US2] Add memoized admin row/card components in `mobile/src/features/admin/components/` to avoid full-screen rerenders

**Checkpoint**: US2 is independently operable for admin flow.

---

## Phase 5: User Story 3 - System Protects Stock and Integrations (Priority: P3)

**Goal**: System remains consistent under concurrency, retries, and long-lived real-time sessions.

**Independent Test**: Replay duplicate webhook, run concurrent last-item settlement, verify no oversell and deterministic status.

### Implementation for User Story 3

- [ ] T042 [US3] Implement webhook signature validation in `backend/orders/views.py` and `backend/orders/services/infinitepay_service.py`
- [ ] T043 [US3] Implement webhook idempotency ledger writes in `backend/orders/services/infinitepay_service.py` using `WebhookEvent`
- [ ] T044 [US3] Implement deterministic lock order settlement in `backend/orders/services/order_service.py` (`Order` lock first, then `Product` locks by ascending id)
- [ ] T045 [US3] Implement stock deduction with `transaction.atomic()` and `select_for_update()` in `backend/orders/services/order_service.py`
- [ ] T046 [US3] Implement lock-contention conflict response mapping in `backend/orders/views.py`
- [ ] T047 [US3] Implement Channels consumers and routing in `backend/config/routing.py` and `backend/orders/consumers.py`
- [ ] T048 [US3] Implement heartbeat and idle-disconnect handling in `backend/orders/consumers.py`
- [ ] T049 [US3] Configure Redis channel/group expiry settings in `backend/config/settings/*.py`
- [ ] T050 [US3] Implement normalized WebSocket state updates by id in `mobile/src/features/admin/` and `mobile/src/features/checkout/`
- [ ] T051 [US3] Implement shipping-unavailable fallback state transitions in `backend/orders/services/lalamove_service.py` and `backend/orders/models.py`

**Checkpoint**: US3 hardening complete and independently verifiable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, documentation, and operational readiness.

- [ ] T052 [P] Document endpoint and event payload finalization in `specs/001-esmalteria-express-mvp/contracts/api-contract.md`
- [ ] T053 [P] Update operational validation steps in `specs/001-esmalteria-express-mvp/quickstart.md`
- [ ] T054 Validate Docker bring-up and migration flow using `docker compose up --build` and record outcomes in `specs/001-esmalteria-express-mvp/quickstart.md`
- [ ] T055 Validate TypeScript strictness and Python typing across `mobile/src/` and `backend/`
- [ ] T056 Perform final pass on logging and error envelope consistency in `backend/orders/services/*.py` and `backend/users/services/*.py`
- [ ] T057 Validate endpoint-level error contracts for `quote-shipping`, `pay`, `webhooks/infinitepay`, and `dispatch` against `specs/001-esmalteria-express-mvp/contracts/api-contract.md`
- [ ] T058 Add API contract tests for `quote-shipping`, `pay`, `webhooks/infinitepay`, and `dispatch` in `backend/tests/contract/`
- [ ] T059 Add concurrency/idempotency integration tests for duplicate webhook and final-unit race scenarios in `backend/tests/integration/`
- [ ] T060 Add mobile integration test for delayed-webhook reconciliation on app reopen in `mobile/tests/integration/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies.
- **Phase 2 (Foundational)**: depends on Phase 1; blocks all stories.
- **Phase 3 (US1)**: depends on Phase 2.
- **Phase 4 (US2)**: depends on Phase 2 and integrates with artifacts from US1.
- **Phase 5 (US3)**: depends on Phase 2 and uses US1/US2 flows for robustness validation.
- **Phase 6 (Polish)**: depends on completed target stories.

### User Story Dependencies

- **US1 (P1)**: first deliverable MVP, independent after foundation.
- **US2 (P2)**: depends on auth/RBAC and order model foundation; can proceed after US1 API surfaces exist.
- **US3 (P3)**: depends on webhook/payment and order pipeline from US1 and dispatch surfaces from US2.

### Within Each User Story

- Backend services before endpoint orchestration.
- API contracts before mobile API consumption.
- Real-time backend events before frontend event-driven UX behaviors.

## Parallel Opportunities

- [ ] T002 and T003 can run in parallel after T001.
- [ ] T006, T013, and T014 can run in parallel after T005 scaffolding.
- [ ] T027 and T028 can run in parallel after T020.
- [ ] T038, T039, and T040 can run in parallel after T033 and T034/T035.
- [ ] T048 and T049 can run in parallel after T047.
- [ ] T052 and T053 can run in parallel in polish phase.

## Parallel Example: User Story 1

```bash
# Parallel backend tasks
T023: Implement shipping quote service in backend/orders/services/lalamove_service.py
T025: Implement PIX generation service in backend/orders/services/infinitepay_service.py

# Parallel mobile tasks
T029: Implement client catalog screen in mobile/src/screens/ClientCatalogScreen.tsx
T030: Implement cart + free-shipping progress in mobile/src/screens/CartScreen.tsx
```

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate end-to-end client checkout and webhook-driven approval.

### Incremental Delivery

1. Deliver US1 checkout and payment flow.
2. Add US2 admin operations and dispatch control.
3. Add US3 concurrency/idempotency/realtime hardening.
4. Run Phase 6 polish and readiness verification.
