# Feature Specification: Esmalteria Express MVP

**Feature Branch**: `001-esmalteria-express-mvp`  
**Created**: 2026-05-28  
**Status**: Draft  
**Input**: User description: "Act as a Senior Technical Product Manager and Lead Systems Architect. Build a unified B2B2C mobile app for beauty salons with Django/DRF backend and React Native/Expo mobile client, including RBAC, InfinitePay PIX payments, Lalamove shipping, Channels real-time updates, and strict stock concurrency control."

## Clarifications

### Session 2026-05-28

- Q: If Lalamove quotation times out or no motorcycle courier accepts within 15 minutes, what should the system do? → A: Keep the order in a pending/shipping-unavailable state, show a clear retry message, and allow admin/manual recovery. This keeps checkout safe without creating a courier order.
- Q: When `select_for_update()` blocks a second buyer from purchasing the last unit, what should the client receive? → A: The system returns a typed conflict response with a clear out-of-stock message and emits a catalog update so connected clients can refresh availability.
- Q: If the admin's connection drops exactly when they swipe to dispatch an order, what should the backend/UI do? → A: Make dispatch idempotent: the backend stores the action only once, the UI can safely retry, and the order shows a pending-dispatch state until the courier response is confirmed.
- Q: If the PIX webhook is delayed by 10 minutes and the user closes the app, how should the system finalize the payment experience? → A: Process the webhook asynchronously when it arrives; the app can reopen later and see the approved order state via polling/WebSocket reconciliation.
- Q: What session lifetime should magic-link authentication enforce by default? → A: 7-day token lifetime.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Client Shops and Pays (Priority: P1)

A client logs in through a magic link, browses the catalog, adds items to cart, checks shipping, pays by PIX, and receives real-time order status updates.

**Why this priority**: This is the primary revenue-generating user journey and the core MVP value.

**Independent Test**: A tester can log in as a client, browse products, complete checkout, and observe the order move from payment initiation to approval and tracking without using any admin-only screens.

**Acceptance Scenarios**:

1. **Given** a valid client session and available products, **When** the client adds items to the cart and proceeds to checkout, **Then** the app shows a shipping quote, PIX payload, and order confirmation state.
2. **Given** a paid PIX event is received, **When** the webhook is processed, **Then** the order transitions to approved/preparing and the client sees the status update in real time.

---

### User Story 2 - Admin Manages Orders and Dispatch (Priority: P2)

An admin reviews incoming orders, monitors stock and sales, and dispatches approved orders through Lalamove.

**Why this priority**: Admin operations are required to fulfill client orders and keep inventory and logistics consistent.

**Independent Test**: A tester can sign in as an admin, view the dashboard, inspect pending orders, dispatch an approved order, and verify the tracking details are stored and visible.

**Acceptance Scenarios**:

1. **Given** an approved order awaiting delivery, **When** the admin dispatches it, **Then** the system places the courier order and stores the delivery tracking reference.
2. **Given** low stock products, **When** the admin opens the dashboard, **Then** the product alerts and sales summary are visible.

---

### User Story 3 - System Protects Stock and Integrations (Priority: P3)

The system prevents overselling, handles webhook delays and duplicates, and keeps client and admin apps synchronized when inventory changes.

**Why this priority**: Reliability is essential for financial correctness and operational trust, but it supports the primary journeys rather than defining them.

**Independent Test**: A tester can simulate simultaneous purchase attempts, duplicate payment webhooks, and courier-related failures and verify the system returns consistent errors without corrupting stock or order state.

**Acceptance Scenarios**:

1. **Given** two clients attempt to purchase the final unit at the same time, **When** the payment confirmation is processed, **Then** only one order succeeds and the other receives a clear out-of-stock response.
2. **Given** a duplicate payment webhook for the same order, **When** the webhook is reprocessed, **Then** stock is not deducted twice and the order remains idempotent.
3. **Given** a courier request fails or times out, **When** dispatch is attempted, **Then** the order remains in a safe state and the admin is informed of the failure.

### Edge Cases

- What happens when Lalamove quotation times out or returns no motorcycle availability? The system keeps the order in a pending shipping-unavailable state, surfaces a clear retry message to the client or admin, and does not create a courier order until a valid quotation is available.
- How does the system behave when the InfinitePay webhook arrives late or is delivered more than once? Webhook processing is asynchronous and idempotent; duplicate events are acknowledged without reapplying stock/order mutations, and the mobile app reconciles order state on reopen via API and WebSocket.
- What response does a second buyer receive when row locking blocks the last available product? The system returns a typed conflict response with a clear out-of-stock message and emits a catalog update so connected clients can refresh availability.
- What happens when an admin loses connectivity while dispatching an order? The dispatch action must be idempotent, the UI may retry safely, and the order remains in a pending-dispatch state until the courier response is confirmed.
- How are partial courier failures, cancellations, or retries handled without corrupting order state? Courier failures/cancellations keep the order in a recoverable state with no duplicate transitions, and retries are idempotent so tracking and status are never duplicated.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST support role-based access with `ADMIN` and `CLIENT` views from a single mobile application.
- **FR-002**: The system MUST allow an admin to create and manage client users; public self-registration MUST NOT be available.
- **FR-003**: The system MUST allow clients to authenticate using a magic-link flow that returns a session token to the mobile app.
- **FR-004**: The system MUST allow clients to browse categories, products, and current availability.
- **FR-005**: The system MUST allow clients to add items to a cart without reserving stock.
- **FR-006**: The system MUST calculate shipping based on order subtotal, free-shipping threshold, and client/store coordinates.
- **FR-007**: The system MUST create a PIX payment payload for eligible orders when payment is enabled.
- **FR-008**: The system MUST process InfinitePay webhook events and update the order only when a valid paid event is confirmed.
- **FR-009**: The system MUST enforce idempotency for payment webhook processing so repeated events for the same order do not duplicate stock deductions.
- **FR-010**: The system MUST deduct inventory only after payment confirmation and must do so using locked transactional updates.
- **FR-011**: The system MUST notify connected clients in real time when product availability changes or stock is exhausted.
- **FR-012**: The system MUST allow an admin to dispatch approved orders through a courier quotation that can be converted into a placed delivery order.
- **FR-013**: The system MUST persist courier order identifiers and tracking references for dispatched orders.
- **FR-014**: The system MUST present sales, stock alerts, order status, and loyalty ranking views to admins.
- **FR-015**: The system MUST return clear, client-friendly errors when shipping, payment, webhook, or inventory operations fail.
- **FR-016**: The system MUST keep all service-layer logic typed and isolate business logic from UI and controller layers.
- **FR-017**: The system MUST reconcile delayed payment outcomes when the client app is offline/closed and reflect the latest authoritative order state on app reopen.
- **FR-018**: The system MUST handle courier cancellation/failure retries idempotently and preserve a recoverable order status without corrupting logistics metadata.
- **FR-019**: The system MUST issue magic-link authenticated sessions with a default 7-day token lifetime.

### Key Entities _(include if feature involves data)_

- **CustomUser**: A salon user account with role, phone, salon name, and location coordinates.
- **SystemSettings**: Singleton configuration for payment enablement, free-shipping threshold, and integration keys.
- **Category**: Product grouping metadata used to organize the catalog.
- **Product**: Sellable item with pricing, cost, active state, and strict stock quantity.
- **Order**: Purchase record containing client, status, totals, payment method, and logistics references.
- **OrderItem**: Line item snapshot linking a product and quantity to an order.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A client can complete checkout and receive a payment payload in under 2 minutes on a normal connection.
- **SC-002**: 100% of confirmed payments update order state exactly once, even if the webhook is delivered multiple times.
- **SC-003**: 95% of shipping quote requests return a result or a clear failure message within 5 seconds under normal network conditions.
- **SC-004**: Simultaneous attempts to buy the final unit never oversell stock.
- **SC-005**: Admin users can dispatch an approved order and see the tracking reference persist successfully in at least 99% of successful dispatch attempts.
- **SC-006**: Clients receive inventory-change updates without manual refresh when their connected session remains active.

## Assumptions

- Clients have a mobile device with network access during login, checkout, and order tracking.
- Admins manage orders from the same mobile application using a role-based navigation path.
- Existing salon staff will create client accounts; no public sign-up flow is required.
- Shipping, payment, and real-time updates rely on external provider availability and normal API credentials being configured.
- The MVP focuses on a single salon context with relational inventory and order tracking; marketplace-style multi-tenant behavior is out of scope.
