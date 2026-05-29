# Research: Esmalteria Express MVP

## Decision 1: Webhook Idempotency Model

- **Decision**: Persist provider event ids and short-circuit duplicate webhook events before stock mutation.
- **Rationale**: Payment gateways retry by design; idempotency prevents double status transitions and stock deductions.
- **Alternatives considered**:
  - Reject duplicates with 4xx: increases retry pressure and operational noise.
  - Best-effort in-memory dedupe: unsafe across process restarts.

## Decision 2: Deadlock-Safe Stock Settlement

- **Decision**: Inside one transaction, lock `Order` first, then `Product` rows in ascending id order.
- **Rationale**: Deterministic lock order is the most reliable deadlock mitigation for concurrent webhook workers.
- **Alternatives considered**:
  - Arbitrary product lock order: deadlock-prone under concurrency.
  - SKIP LOCKED for settlement: can skip required rows and violate correctness.

## Decision 3: Query Strategy for Order Surfaces

- **Decision**: Default to eager-loading for order list/detail endpoints with `select_related('client')` and prefetch for order items/products.
- **Rationale**: Admin dashboard and order tracking flows naturally produce nested serialization; eager loading avoids N+1 query explosions.
- **Alternatives considered**:
  - Lazy-loading by default: unacceptable for dashboard and kanban throughput.
  - Caching-only mitigation: treats symptoms, not query design flaws.

## Decision 4: Channels Liveness and Resource Control

- **Decision**: Enforce heartbeat + idle disconnect + Redis group expiry.
- **Rationale**: Long-lived salon sessions can leave stale sockets; explicit liveness controls bound memory and fan-out costs.
- **Alternatives considered**:
  - No heartbeat policy: stale sockets accumulate and increase broadcast overhead.
  - Very aggressive disconnect timers: harms user experience under spotty mobile networks.

## Decision 5: Mobile Real-Time Render Containment

- **Decision**: Normalize event payloads by entity id and update selector-based store slices only; memoize dashboard rows/cards.
- **Rationale**: Prevent full-screen rerender storms when frequent order/stock events arrive.
- **Alternatives considered**:
  - Whole-store replacement per event: causes unnecessary render churn.
  - Polling-only UI sync: increases latency and bandwidth waste.

## Decision 6: Lalamove Failure Handling

- **Decision**: Keep orders in a pending shipping-unavailable state when quote/acceptance fails and allow retry/manual recovery.
- **Rationale**: Preserves order intent while avoiding false-dispatch or silent cancellation.
- **Alternatives considered**:
  - Auto-cancel order: user-hostile and operationally disruptive.
  - Assume dispatch success without provider confirmation: inconsistent state risk.

## Decision 7: Magic-Link Session Lifetime

- **Decision**: Enforce a default 7-day authenticated session lifetime for magic-link login tokens.
- **Rationale**: Balances security and usability for salon operators and clients who need persistent mobile access without constant re-login.
- **Alternatives considered**:
  - 24-hour lifetime: safer but too disruptive for routine salon operations.
  - Short-lived access + refresh tokens: stronger control but unnecessary complexity for MVP scope.
