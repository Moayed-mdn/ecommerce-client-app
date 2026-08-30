# JustShop Storefront Runtime — Plan Summary

This document is a plain-language overview of the **Storefront Runtime Integration** program for the JustShop multi-tenant e-commerce platform. It is written for readers who did not work on the codebase and can be shared externally.

**Repositories:** `justshop-frontend` (Nuxt) + `laratenant-backend` (Laravel)  
**Original plan length:** 18 weeks, 9 phases (0–8)  
**Authoritative technical doc:** this file (the multi-phase execution plan this used to point to was removed — see §5 note below)

---

## 1. What problem this solves

Before this work, the public storefront behaved partly like a normal Nuxt app (hardcoded pages, components fetching their own data) and partly like a future "platform" (catch-all route, mocks). That made it hard to:

- Run **many merchant stores** on one codebase
- Serve **CMS-driven pages** from Laravel
- Keep **tenant data isolated** (cache, API, SEO)
- Roll out changes **safely** (preview, cache, feature flags)

The program replaces **mocked runtime behavior** with a **real, contract-driven pipeline**: Laravel owns business data and rules; Nuxt owns rendering and SSR.

---

## 2. Target architecture (who owns what)

| Layer | Owns |
|--------|------|
| **Laravel (backend)** | Which store is this request for (domain → tenant), URL → page type (home, marketing, category, product), page JSON (sections + SEO), navigation, theme tokens, preview tokens, cache invalidation |
| **Nuxt (frontend)** | SSR, catch-all page `app/pages/[...slug].vue`, reading DTOs only (no raw Laravel models in Vue), layout + section registry, hydration |

**Dual runtime (important):** High-risk flows stay on **dedicated Nuxt pages** until explicitly migrated later:

- Login, register, cart, checkout, orders, profile, email verification, Google auth
- Search (still file-based today)

Catalog and marketing traffic use the **new catch-all runtime**.

---

## 3. Non-negotiable rules

1. **Contracts first** — No feature work until API/DTO contracts are frozen.
2. **DTOs only in the UI** — Sections get `sections[].props`; they must not call APIs themselves.
3. **Tenant in every cache key** — tenant + locale + runtime version + path.
4. **Structured logs** — `tenant_id`, `locale`, `path`, `request_id`.
5. **Do not delete legacy routes** without approval, evidence, and regression tests.
6. **No phase closes** with open Severity 1 or 2 bugs.

---

## 4. Phases at a glance

| Phase | Weeks (plan) | Goal | Status (repo) |
|-------|----------------|------|----------------|
| **0** | 1 | Program setup: environments, CI, RACI, traceability | Organizational; not tracked in code |
| **1** | 2–3 | Freeze **runtime contracts** (API, DTOs, SEO, cache keys, preview security) | **Done** |
| **2** | 4–6 | **Laravel** runtime APIs: resolve route, page, navigation, theme, preview | **Done** |
| **3** | 7–9 | **Nuxt** wires catch-all to real APIs (no mocks on active path) | **Done** |
| **4** | 10–11 | Section/layout hardening: presentational sections, safe fallbacks | **Done** |
| **5** | 12–13 | Preview mode + tenant-safe cache invalidation | **Done** |
| **6** | 14–15 | Certification: SEO, isolation, performance baselines, observability | **Done** (automated in repo; production dashboards optional) |
| **7** | 16–17 | ~~Controlled production rollout (internal → pilot → full, kill switch)~~ | **Removed** — this project has never shipped to production, so there was nothing to gate. Runtime is unconditional for every tenant now; see below. |
| **8** | 18 | Legacy retirement log + handover docs + safe code cleanup | **Done** (repo closeout) |

**Program milestones M1–M6 and M8:** met in the repository. **M7** (production rollout) does not apply — the rollout/kill-switch/pilot-tenant machinery was removed from the codebase rather than executed, since there is no production traffic for it to gate.

---

## 5. What each phase delivered (concrete)

### Phase 1 — Contracts

Specs for runtime API, DTO mapping, logging, cache keys, SEO, preview security. Validated in CI via `npm run runtime:contracts:check`.

### Phase 2 — Backend APIs

Endpoints under `/api/v1/storefront/runtime/`:

- `resolve` — path → page type + id
- `page/{id}` — sections + SEO
- `navigation`, `theme`
- `preview/validate`

Tenant resolved from **HTTP Host** (e.g. `demo.justshop.test` must exist on the `stores.domain` row).

### Phase 3 — Frontend integration

`useRouteResolver` and `useStorefrontPayload` call Laravel. Catch-all renders `RuntimeSectionRenderer` from `sections[].component`.

### Phase 4 — Sections

Runtime sections (Hero, Category grid, Category summary, Product grid, etc.) only render props from the payload.

### Phase 5 — Preview and cache

Preview bypasses shared cache; publishing invalidates tenant-scoped runtime cache.

### Phase 6 — Certification

Backend tests + `npm run runtime:smoke` (SSR smoke on home, marketing, category, product).

### Phase 7 — Rollout (removed)

This phase built a cohort-gating system (rollout mode, kill switch, internal/pilot tenant allowlists) for a controlled production rollout. It was removed from the codebase: this project has never shipped to production, so there was no live traffic for a rollout gate to protect, and the gate only added a config surface a reader had to reason about. Runtime now applies unconditionally to every resolved tenant.

### Phase 8 — Closeout

Documented what to keep vs retire; removed unused migration composables; handover + operating guides.

---

## 6. How a page request works (end-to-end)

```text
Browser  →  demo.justshop.test:3000/products/category/electronics
    ↓
Nuxt middleware (tenant from Host)
    ↓
Catch-all page loads:
    1) GET runtime/resolve?path=/products/category/electronics
    2) GET runtime/page/{id} + navigation + theme
    ↓
Laravel: Host → store → category "electronics" → products in category tree
    ↓
JSON: sections[] e.g. CategorySummarySection + ProductGridSection
    ↓
Nuxt: map theme tokens to CSS variables → render sections
```

**Common local pitfall:** Using `localhost` instead of `demo.justshop.test` — backend cannot resolve tenant → `runtime.tenant_not_found`.

---

## 7. Colors and branding

| Page type | Who sets colors |
|-----------|------------------|
| Runtime pages (home, category, product, CMS) | **Backend** sends theme tokens (`colorPrimary`, etc.); **frontend** applies them as CSS variables |
| Legacy pages (login, cart, checkout, …) | **Frontend** CSS design tokens + light/dark toggle |

Today, runtime theme values come from Laravel config (`config/storefront_runtime.php`), not yet from per-merchant admin UI.

---

## 8. Demo store (local)

Seeders build a full catalog (categories, many products, heroes, reviews). `DemoStorePresentationSeeder` improves the demo:

- Store name **JustShop Demo**
- Homepage: hero + departments + featured products
- Product images via placeholder URLs (needs internet for `picsum.photos`)
- Category pages include product grids

**Refresh demo data:**

```bash
cd laratenant-backend
php artisan migrate:fresh --seed
php artisan cache:clear
```

**Local URL:** `http://demo.justshop.test:3000` (add `127.0.0.1 demo.justshop.test` to `/etc/hosts`).

---

## 9. Verification commands

```bash
# Backend
cd laratenant-backend
php artisan test tests/Feature/Storefront/StorefrontRuntimeTest.php

# Frontend
cd justshop-frontend
npm run runtime:contracts:check
npm run build
npm run runtime:smoke   # needs built server + backend running
```

---

## 10. What is intentionally still future work

| Item | Why not "done" |
|------|----------------|
| Migrate cart/checkout/auth to runtime | High risk; kept on fixed system routes |
| Migrate search to runtime | Separate GraphQL flow today |
| Per-merchant theme in database | Config-based theme for now |
| Merchant-uploaded product images | Demo uses external placeholder images |
| Production load tests and dashboards | Ops/environment owned |

Future retirements were tracked in a Phase 8 decommission backlog doc that has since been removed along with the rest of the rollout-era planning docs; re-create a tracking doc here if this list grows.

---

## 11. Related documentation

| Topic | Document |
|--------|----------|
| Full execution plan | Removed (`2026-08-29`) — encoded mandatory rollout/kill-switch complexity for a project that has never shipped to production. This file is now authoritative. |
| Contract hub | [../architecture/storefront-runtime-contracts.md](../architecture/storefront-runtime-contracts.md) |
| System routes vs runtime routes | [../architecture/storefront-migration-strategy.md](../architecture/storefront-migration-strategy.md) |
| Certification evidence | [storefront-runtime-phase-6-certification.md](./storefront-runtime-phase-6-certification.md) |

The Phase 7 rollout and Phase 8 closeout/operating-guide/support-handover docs referenced here previously have been removed — they described a controlled production rollout program that never ran, for a project that has never shipped to production.

---

## 12. One-sentence summary

We turned the JustShop storefront into a **multi-tenant, Laravel-driven, Nuxt-rendered runtime**: contracts first, real APIs, SSR catalog/CMS pages, safe preview/cache, and tests in the repo; checkout/login stay on fixed system routes for now; the **engineering plan is complete in code**. The rollout/kill-switch/pilot-tenant gating built for a controlled production launch was removed — this project has never shipped to production, so runtime now applies unconditionally to every tenant rather than being gated behind a cohort flag.
