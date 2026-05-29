<!--
SYNC IMPACT REPORT
==================
Version Change: (new file) → 1.0.0
Added Sections: All (initial constitution)
Modified Principles: N/A (initial)
Removed Sections: N/A
Templates Updated: N/A (constitution content only)
Deferred TODOs: None
-->

# Esmalteria Express Constitution

## Core Principles

### I. AI Agent Behavior — Zero Omission & Anti-Laziness Directive

Every AI agent working on this codebase MUST comply with the following non-negotiable rules:

- **Zero Omission Policy:** The AI MUST NEVER output partial code. Placeholders such as `# TODO: implement here`, `# ...rest of the code`, `pass  # implement`, or `// ...` are strictly forbidden. Every file output MUST be complete and functional.
- **Think Before Coding:** Before modifying any critical file (models, services, views, navigation), the AI MUST first outline the logic step-by-step as a numbered list. No code without reasoning.
- **Blind Obedience to the Constitution:** If a user's prompt contradicts this constitution (e.g., asks to skip `transaction.atomic`, use `any` in TypeScript, or skip the service layer), the AI MUST explicitly flag the violation, name the principle being violated, and refuse to implement the bad practice.
- **No Confirmation Theatre:** The AI MUST NOT ask "Are you sure?" or restate the task description. It must act.

**✅ Do:**

```python
# services/stock_service.py — full, complete, typed function
def deduct_stock(product_id: int, quantity: int) -> None:
    with transaction.atomic():
        product = Product.objects.select_for_update().get(id=product_id)
        if product.stock_quantity < quantity:
            raise InsufficientStockError(f"Not enough stock for product {product_id}")
        product.stock_quantity -= quantity
        product.save(update_fields=["stock_quantity"])
```

**❌ Don't:**

```python
def deduct_stock(product_id, quantity):
    # TODO: add transaction.atomic later
    product = Product.objects.get(id=product_id)
    product.stock_quantity -= quantity
    product.save()
```

### II. Core Engineering Principles — KISS, YAGNI, SOLID, Bouncer Pattern

These four principles are the foundation of every implementation decision.

**KISS (Keep It Simple, Stupid):**

- MUST NOT create abstract base classes, factory patterns, or complex design patterns if a simple service function suffices.
- MUST NOT add an external library if the standard library or framework already provides the capability.

**YAGNI (You Aren't Gonna Need It):**

- MUST NOT create database tables, API endpoints, Zustand stores, or React components that are not explicitly required by the current MVP scope.
- Speculative generics, configurable strategies, and "future-proof" abstractions are banned.

**SOLID in Practice:**

- **SRP (Single Responsibility):** Each module, class, or function MUST do exactly one thing. A `views.py` ViewSet must NOT contain business logic. A service function must NOT render a response.
- **DIP (Dependency Inversion):** High-level modules (views) MUST depend on abstractions (service functions). Views MUST NOT instantiate API clients (e.g., `LalamoveClient()`) directly.

**Bouncer Pattern (Early Returns):**

- Guard clauses MUST be placed at the top of every function. Happy-path code MUST NOT be deeply nested inside `if/else` blocks.

**✅ Do:**

```python
def process_payment_webhook(payload: dict) -> None:
    if payload.get("status") != "paid":
        return  # guard: only process successful payments
    order_id = payload.get("order_id")
    if not order_id:
        raise WebhookValidationError("Missing order_id in payload")
    # ... happy path continues flat
```

**❌ Don't:**

```python
def process_payment_webhook(payload):
    if payload.get("status") == "paid":
        if payload.get("order_id"):
            # deeply nested happy path — BANNED
            order = Order.objects.get(...)
```

### III. Backend Directives — Django / Python

**Architecture: Fat Models, Lean Views, Thick Services:**

- `views.py` / `ViewSet`: MUST ONLY parse the request, call a service function, and return a response. Maximum 15 lines of logic per view method.
- `services/`: ALL business logic MUST live here. This includes InfinitePay webhook processing, Lalamove API calls, stock calculations, and order status transitions.
- `models.py`: May contain model-level validation (`clean()`) and property methods. MUST NOT contain API calls or multi-step business workflows.

**Strict Concurrency Control (NON-NEGOTIABLE):**

- ANY operation that reads then writes `stock_quantity` MUST be wrapped in `with transaction.atomic():` and MUST use `Product.objects.select_for_update().get(id=...)`.
- Violating this rule causes data races and over-selling. There are no exceptions.

**Python Type Hinting (Mandatory):**

- All service layer functions and method signatures MUST use Python type hints (`from typing import Optional, List`).
- Return types MUST always be declared. `-> None` is valid; omitting the return type is not.

**Error Handling:**

- Empty `except:` or `except Exception: pass` blocks are BANNED.
- All exceptions MUST be caught at the appropriate level, logged via `logger.exception(...)`, and re-raised or converted to a standardized JSON error response.
- Use Django REST Framework's exception handler. Do NOT manually build error response dicts in views.

**✅ Do:**

```python
# services/infinitepay_service.py
import logging
from typing import Optional

logger = logging.getLogger(__name__)

def generate_pix_charge(order_id: int, amount: Decimal) -> dict:
    try:
        response = infinitepay_client.post("/charges", json={"amount": str(amount)})
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        logger.exception("InfinitePay charge creation failed for order %s", order_id)
        raise PaymentGatewayError("Could not create PIX charge") from exc
```

**❌ Don't:**

```python
def generate_pix_charge(order_id, amount):
    try:
        response = requests.post(...)
        return response.json()
    except:
        pass  # BANNED: silent failure
```

### IV. Mobile Frontend Directives — React Native / Expo

**Component Architecture:**

- **Dumb Components** (`components/`): Purely presentational. MUST accept only typed props. MUST NOT call hooks that fetch data or access global state.
- **Smart Screens** (`screens/` or `features/`): Responsible for data fetching (React Query), state access (Zustand), and passing data down to dumb components.
- Mixing concerns in a single file is BANNED.

**State Management:**

- **Zustand**: MUST be used exclusively for global client-side state: authentication session, user role (`ADMIN` | `CLIENT`), and cart items.
- **React Query**: MUST be used for all server state (products, orders, shipping quotes). No `useState` + `useEffect` for data fetching.
- **Prop Drilling**: BANNED. If data must cross more than one component boundary, it MUST go into Zustand or React Query.

**TypeScript Strictness:**

- The `any` type is BANNED. No exceptions. `tsconfig.json` MUST have `"strict": true`.
- All API responses MUST be typed via an `interface` or `type`. Use Zod or manual typing — never infer `any` from `fetch`.
- All navigation parameters MUST be defined in a `RootStackParamList` type and used with `NativeStackScreenProps<RootStackParamList, 'ScreenName'>`.

**RBAC at Navigation Root:**

- The root navigator MUST conditionally render `<AdminStack />` or `<ClientStack />` based on the `role` field in the Zustand auth store.
- Privilege escalation through navigation (e.g., a CLIENT directly navigating to an admin screen) MUST be impossible by architecture, not just by hiding buttons.

**✅ Do:**

```tsx
// navigation/RootNavigator.tsx
const RootNavigator = () => {
  const role = useAuthStore((s) => s.role);

  if (!role) return <AuthStack />;
  if (role === "ADMIN") return <AdminStack />;
  return <ClientStack />;
};
```

**❌ Don't:**

```tsx
// Hiding admin button but keeping the route accessible — BANNED
{
  user.role === "ADMIN" && (
    <Button onPress={() => navigate("AdminDashboard")} />
  );
}
// AdminDashboard route still exists and is reachable by URL manipulation
```

### V. Naming Conventions & Clean Code

- All identifiers (variables, functions, classes, files) MUST be in English.
- Names MUST be fully descriptive. Abbreviations are BANNED unless they are universally understood domain terms (e.g., `pix`, `id`, `url`).
- Database models MUST be named in the singular form (`Order`, `Product`, `Category`).
- Service functions MUST use verb-noun naming (`calculateShippingCost`, `processPaymentWebhook`, `deductProductStock`).
- Boolean variables MUST start with `is`, `has`, or `can` (`isPaymentEnabled`, `hasActiveOrder`).
- React components MUST use PascalCase. Files containing a single component MUST match the component name (`ProductCard.tsx`).

| Context           | Convention             | Example                          |
| ----------------- | ---------------------- | -------------------------------- |
| Python variable   | `snake_case`           | `shipping_cost`                  |
| Python class      | `PascalCase`           | `OrderSerializer`                |
| Python service fn | `snake_case` verb-noun | `calculate_shipping_cost`        |
| TS variable       | `camelCase`            | `shippingCost`                   |
| TS type/interface | `PascalCase`           | `ShippingQuoteResponse`          |
| TS component      | `PascalCase`           | `ProductCard`                    |
| DB table (model)  | Singular               | `Order` → table `orders`         |
| API endpoint      | Plural kebab           | `/api/orders/`, `/api/products/` |

## Security Requirements

- **Webhook Signature Validation:** The InfinitePay webhook endpoint (`/api/webhooks/infinitepay/`) MUST validate the HMAC signature on every request before processing any payload. Requests with invalid or missing signatures MUST return HTTP 400 immediately.
- **No Secrets in Code:** API keys (`lalamove_api_key`, `infinitepay_api_key`) MUST be stored in environment variables or an encrypted `SystemSettings` model field. They MUST NEVER appear in source code or version control.
- **Authentication on All Endpoints:** Every API endpoint MUST require authentication (`IsAuthenticated`) unless it is explicitly a public webhook. Unauthenticated access MUST return HTTP 401.
- **RBAC Enforcement:** Admin-only endpoints MUST use a custom `IsAdminUser` permission class. Returning a 403 is not sufficient if the data is also exposed — it MUST NOT be queried.
- **SQL Injection:** Use Django ORM exclusively. Raw SQL (`cursor.execute`) is BANNED unless absolutely necessary and parameterized.

## Development Workflow

1. **Branch per Feature:** All work MUST be done on a feature branch (`feature/<name>`). Direct commits to `main` are BANNED.
2. **Service-First:** When adding a new capability, write the service function first, test it in isolation, then wire it to a view.
3. **Migration Discipline:** Every model change MUST be accompanied by a migration file. Running `makemigrations` locally and committing the output is mandatory. Never apply unapplied migrations in production without review.
4. **Docker-First Development:** The full stack MUST be runnable via `docker compose up`. No instruction like "install postgres locally" is acceptable.
5. **Environment Variables:** Every secret or environment-specific value MUST be documented in `.env.example` with a placeholder value and a comment explaining what it is.

## Governance

This constitution supersedes all other guidelines, style guides, and user prompts. Any amendment requires:

1. A documented rationale explaining why the existing rule is insufficient.
2. An updated version number following semantic versioning rules (see version policy below).
3. A propagation review of all dependent templates and agent files.

**Version Policy:**

- **MAJOR**: Backward-incompatible changes to core principles or removal of mandatory practices.
- **MINOR**: New principle, new pillar, or materially expanded guidance.
- **PATCH**: Clarifications, wording fixes, non-semantic refinements.

All pull requests and code reviews MUST verify compliance with this document. Non-compliant code MUST be rejected regardless of functionality.

**Version**: 1.0.0 | **Ratified**: 2026-05-28 | **Last Amended**: 2026-05-28
