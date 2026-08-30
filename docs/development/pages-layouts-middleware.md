# Pages, Layouts, And Middleware

## Purpose

This document describes how route-backed pages, shared layouts, and route middleware are currently used in the JustShop frontend.

Code surfaces this file aligns with:

- `app/pages/**`
- `app/layouts/**`
- `app/middleware/**`
- `shared/utils/routes.ts`

## Current Layout Inventory

The live repo currently defines exactly two layout files:

| Layout | Current use |
|---|---|
| `system.vue` | Every fixed-route page: auth, cart, checkout, orders, profile, categories. Provides chrome (header/footer/announcement/copyright) from a backend template via `useSystemPageTemplate()`; page body is always hardcoded in the page component. |
| `default.vue` | Implicit fallback for any page with no `layout:` set (currently the merchant pages), and set explicitly by `search.vue`. |

CMS-driven pages (`app/pages/[...slug].vue`) use `layout: false` and
render their own shell via `RuntimeLayoutManager` — see
`docs/architecture/storefront-shell.md` for that path.

There is no `auth`, `catalog`, `product`, `marketing`, `runtime`,
`runtime-default`, or `storefront` layout — an earlier iteration
created these but none were ever wired to a live route; they were
removed rather than left as unreferenced duplicates.

There is also a special no-layout case:

- `app/pages/[...slug].vue` and `app/pages/verify-email/[id]/[hash].vue` both use `definePageMeta({ layout: false })` — the slug catch-all builds its own shell via `RuntimeLayoutManager`; verify-email renders standalone with no shell at all.

## Current Page Families

The route-backed pages currently group into these feature areas:

| Page family | Current files | Current responsibility |
|---|---|---|
| Catch-all / CMS | `[...slug].vue` | Any route not matched below: resolves and renders tenant-defined, backend-driven pages |
| Auth | `login.vue`, `register.vue`, `forgot-password.vue`, `reset-password.vue`, `auth/google/callback.vue`, `verify-email/[id]/[hash].vue` | Sign-in, sign-up, Google callback handling, and email verification |
| Search | `search.vue` | Client-side GraphQL search results page |
| Cart and checkout | `cart.vue`, `checkout/index.vue`, `checkout/success.vue`, `checkout/cancel.vue` | Cart management and Stripe return flows |
| Orders | `orders/index.vue`, `orders/[orderNumber].vue`, `orders/track.vue` | Authenticated order history/detail and guest order lookup |
| Profile | `profile.vue` | Authenticated profile management |
| Categories | `categories.vue` | System categories listing |
| Merchant | `merchant/hero-banners/**` | Merchant-side hero banner CRUD (no `layout:` set — uses `default.vue`) |

## Current Placement Rules

### What Belongs In Pages

- route-specific orchestration
- page metadata through `definePageMeta(...)`
- page-level `useHead(...)` usage
- composition of feature components and composables
- route param and query handling

### What Belongs In Layouts

- shared shell structure that wraps multiple pages
- top-level navigation or auth framing
- page slot composition

### What Belongs In Middleware

- navigation and access control rules
- route-entry logic that should run before page rendering
