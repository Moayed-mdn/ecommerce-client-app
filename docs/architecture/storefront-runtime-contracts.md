# Storefront Runtime Contracts

## Purpose

This document is the hub for the approved Phase 1 runtime contract package for the storefront runtime migration.

Code and artifact surfaces this package aligns with:

- `docs/refactoring-plan/PLAN-SUMMARY.md`
- `src/core/runtime/contracts/constants.ts`
- `src/core/runtime/contracts/types.ts`
- `src/core/runtime/contracts/schemas/**`
- `src/core/runtime/contracts/examples/**`
- `scripts/check-runtime-contracts.mjs`
- `src/core/runtime/router/**`
- `src/core/tenant/**`
- `app/pages/[...slug].vue`
- `/home/leader/projects/laravel/tenant/laratenant-backend/routes/api/v1/storefront/**`
- `/home/leader/projects/laravel/tenant/laratenant-backend/routes/api/v1/public/cms.php`

## Phase 1 Scope

The Phase 1 package defines the contract boundary that Phases 2 and 3 must implement without redesigning it:

- Laravel is the authority for tenant resolution, route resolution, DTO serialization, preview validation, SEO assembly, and cache invalidation decisions.
- Nuxt is the authority for SSR orchestration, layout selection, section rendering, DTO consumption, and hydration safety.
- No frontend component may consume raw Laravel payloads directly.
- Legacy-sensitive flows such as auth, checkout, account, cart, and orders remain outside the migrated catch-all runtime until later phases explicitly allow cutover.

## Contract Inventory

| Deliverable | Owner document | Machine-readable artifacts |
|---|---|---|
| `Runtime API Contract Specification v1` | `docs/architecture/storefront-runtime-api-contract-specification-v1.md` | `src/core/runtime/contracts/types.ts`, `src/core/runtime/contracts/schemas/*.json` |
| `DTO Mapping Specification v1` | `docs/architecture/storefront-runtime-dto-mapping-specification-v1.md` | `src/core/runtime/contracts/types.ts` |
| `Runtime Logging Specification v1` | `docs/operations/storefront-runtime-logging-specification-v1.md` | `src/core/runtime/contracts/constants.ts` |
| `Runtime Cache Key Standard v1` | `docs/operations/storefront-runtime-cache-key-standard-v1.md` | contract examples under `src/core/runtime/contracts/examples/` |
| `SEO Contract Specification v1` | `docs/operations/storefront-runtime-seo-contract-specification-v1.md` | page payload schema and examples |
| `Preview Security Specification v1` | `docs/operations/storefront-runtime-preview-security-specification-v1.md` | preview schema and examples |
| `Contract Test Matrix v1` | `docs/development/storefront-runtime-contract-test-matrix-v1.md` | `scripts/check-runtime-contracts.mjs` |
| `Phase 2/3 Implementation Stories` | `docs/refactoring-plan/storefront-runtime-phase-2-3-implementation-stories.md` | references the frozen Phase 1 contracts |

## Supported Runtime Surface In Scope

- `Locales`: `en`, `ar`
- `Route outcomes`: `matched`, `redirect`, `not_found`
- `Page types`: `home`, `marketing_page`, `category_page`, `product_page`
- `Layouts`: `default`, `marketing`, `catalog`, `product`
- `Cache artifacts`: `route`, `page`, `navigation`, `theme`, `seo`

## Explicitly Preserved Outside The New Runtime

The following frontend route families remain on dedicated file routes (steady-state dual runtime after Phase 8 closeout):

- `app/pages/login.vue`
- `app/pages/register.vue`
- `app/pages/cart.vue`
- `app/pages/orders/**`
- `app/pages/profile.vue`
- `app/pages/checkout/**`
- `app/pages/auth/google/callback.vue`
- `app/pages/verify-email/**`

## Contract Rules

- API DTOs use `camelCase` field names.
- Log records use backend-observability field names including `tenant_id`, `locale`, `path`, and `request_id`.
- Every runtime cache key includes tenant, locale, runtime version, artifact, and normalized path.
- Preview-authorized requests bypass shared caches and must remain tenant-scoped and page-scoped.
- Catch-all runtime orchestration in `app/pages/[...slug].vue` must capture Nuxt composable context during setup and reuse it for redirects, error conversion, and SEO updates instead of calling Nuxt composables from later async callbacks.
- Section DTOs are presentational-only. They carry normalized props for rendering and must not require section components to fetch direct API data.
- Nuxt resolves runtime sections from the explicit `sections[].component` contract field, not by inferring a component from `sections[].type`.
- Runtime section components consume the standardized frontend rendering boundary `{ section, data }`, where `section` is the full DTO metadata and `data` is the validated `sections[].props` payload.
- Unknown runtime components and invalid runtime section props must render the safe fallback UI rather than attempt best-effort rendering.

## Validation Artifacts

The checked-in validation artifacts for Phase 1 live here:

- `src/core/runtime/contracts/schemas/`
- `src/core/runtime/contracts/examples/`
- `scripts/check-runtime-contracts.mjs`

The schema package now validates both request and response examples so Phase 2 and Phase 3 can derive implementation directly from the frozen request/response pairs.

Run the validation command with:

```bash
npm run runtime:contracts:check
```

This command is intended to run locally now and in CI once a workflow is wired in later phases.
