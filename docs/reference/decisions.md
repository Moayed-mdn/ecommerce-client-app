# Decisions

## Purpose

This document is the current index of architecture and governance decisions that are already visible in the JustShop frontend codebase.

Code surfaces this file aligns with:

- `docs/implementation-plan.md`
- `docs/templates/adr-template.md`
- `nuxt.config.ts`
- `shared/utils/routes.ts`
- `app/stores/auth.ts`
- `app/stores/cart.ts`
- `app/plugins/**`
- `server/api/**`
- `server/utils/api.ts`

## Current Status

- Standalone ADRs now exist for request-helper consolidation, API-base runtime boundaries, and Google callback ownership.
- Phase 5 audit-closure work and the review-required type decisions are complete for the validated `2026-05-27` cleanup batch.
- Storefront runtime Phase 8 closeout is complete for repo scope (`2026-05-29`): unused migration composables removed, keep/retire log published, Phase 7 operator rollout deferred.
- Storefront runtime rollout/kill-switch/pilot-tenant gating removed (`2026-08-28`): this project has never shipped to production, so the deferred Phase 7 rollout program described above will not run. `src/core/runtime/rollout/`, `src/core/runtime/feature-flags/`, `featureFlags` on `StorefrontContext`, `legacyPassthrough` in the route-resolution contract, and the related env vars were deleted. Runtime now applies unconditionally to every resolved tenant.
- This file remains the index for implemented decisions, open ADRs, and any remaining backlog topics.
- When a future decision needs formal rationale, create an ADR using `docs/templates/adr-template.md` and add it to this index.

## Implemented Decisions

| Decision area | Current decision | Primary evidence | Owner docs | ADR status |
|---|---|---|---|---|
| Backend-integrated application flows | Auth, cart, products, orders, profile, and checkout flows go through internal Nitro `server/api` routes instead of direct frontend-to-backend calls. | `server/api/**`, `server/utils/api.ts`, `app/composables/useApi.ts` | `docs/architecture/api-integration.md`, `docs/development/server-routes.md` | Implemented, no ADR file yet |
| Search integration boundary | Search uses direct client-side Apollo GraphQL requests instead of the main Nitro proxy pattern. | `app/plugins/apollo.client.ts`, `app/graphql/queries/search.ts`, `app/pages/search.vue` | `docs/architecture/data-fetching.md`, `docs/reference/external-services.md` | Implemented, no ADR file yet |
| Auth persistence model | The auth store persists only the token, while user details are fetched separately after startup or callback handling. | `app/stores/auth.ts`, `app/composables/useAuth.ts`, `app/plugins/01.auth.client.ts` | `docs/architecture/auth-and-security.md`, `docs/architecture/state-management.md` | Implemented, no ADR file yet |
| Guest cart model | Guest cart state lives in browser local storage and is merged into the server cart after login. | `app/stores/cart.ts`, `app/plugins/02.cart.client.ts` | `docs/architecture/state-management.md`, `docs/architecture/auth-and-security.md` | Implemented, no ADR file yet |
| Shared route ownership | Route literals are centralized in `shared/utils/routes.ts` for app routes, internal API routes, and backend path fragments. | `shared/utils/routes.ts` | `docs/architecture/routing-and-navigation.md`, `docs/architecture/api-integration.md`, `docs/development/coding-standards.md` | Implemented, no ADR file yet |
| Storefront catalog canonical paths | Live storefront category and product detail traffic currently canonicalize to `/shop/category/:slug` and `/shop/product/:slug`, with `/products/**` retained as compatibility redirects until the frontend plan and Laravel runtime resolver are realigned together. | `shared/utils/storefront-routes.ts`, `app/middleware/storefront-legacy-redirect.global.ts`, `app/pages/[...slug].vue`, `.dbg/trae-debug-log-storefront-redirect-loop.ndjson` | `docs/architecture/storefront-routes.md`, `docs/refactoring-plan/wave1-canonical-route-recovery.md` | Implemented, no ADR file yet |
| Plugin startup order | Client startup order is explicitly coordinated with numeric plugin prefixes so auth hydration runs before cart initialization. | `app/plugins/01.auth.client.ts`, `app/plugins/02.cart.client.ts` | `docs/configuration/plugins.md`, `docs/architecture/rendering-strategy.md` | Implemented, no ADR file yet |
| Localization strategy | The app uses `@nuxtjs/i18n` with `en` and `ar` locales and `prefix_except_default` routing. | `nuxt.config.ts`, `i18n/locales/**` | `docs/configuration/nuxt-config.md`, `docs/architecture/routing-and-navigation.md`, `docs/operations/seo.md` | Implemented, no ADR file yet |
| Storefront runtime contract-first boundary | Freeze the Laravel-to-Nuxt storefront runtime interface as versioned DTOs, schemas, examples, and owner docs before Phase 2 API work or Phase 3 frontend integration proceeds. | `src/core/runtime/contracts/**`, `scripts/check-runtime-contracts.mjs`, `docs/architecture/storefront-runtime-contracts.md` | `docs/architecture/storefront-runtime-api-contract-specification-v1.md`, `docs/architecture/storefront-runtime-dto-mapping-specification-v1.md`, `docs/development/storefront-runtime-contract-test-matrix-v1.md` | Implemented in `docs/reference/adr-007-storefront-runtime-contract-first-boundary.md` |

## Standalone ADRs

These ADRs now formalize the highest-priority backlog topics without claiming the refactors are already implemented.

| Topic | Current direction | ADR | Status |
|---|---|---|---|
| Request-helper consolidation | Standardize future app-side REST usage on `useApi()` and keep Nitro-to-backend calls in `server/utils/api.ts`, while treating the other helper surfaces as legacy overlap. | `docs/reference/adr-001-request-helper-consolidation.md` | Implemented |
| Public vs server API base separation | Separate the server-only backend base from client-visible runtime config before future runtime-config cleanup. | `docs/reference/adr-002-api-base-runtime-boundary.md` | Implemented |
| Google callback ownership | Make `app/pages/auth/google/callback.vue` the single callback owner and stop treating route middleware as a second callback processor. | `docs/reference/adr-003-google-callback-owner.md` | Implemented |
| Orders route protection policy | Protect the main orders index and details while keeping guest tracking public. | `docs/reference/adr-004-orders-protection-policy.md` | Implemented |
| Theme behavior roadmap | Restore system preference detection and user-choice persistence by removing hardcoded light-mode overrides. | `docs/reference/adr-005-theme-behavior-roadmap.md` | Implemented |
| Naming and directory normalization | Standardize on lowercase component feature folders and remove redundant `use` prefixes from composables. | `docs/reference/adr-006-naming-normalization.md` | Implemented |
| Storefront runtime contract-first boundary | Freeze the migration boundary between Laravel and Nuxt before runtime API implementation continues. | `docs/reference/adr-007-storefront-runtime-contract-first-boundary.md` | Implemented |

## Remaining ADR Backlog

All identified high-priority backlog topics from the initial audit now have formal ADRs. Future entries will be added here as new discrepancies or architectural pivots are discovered.

## Resolved Code Discrepancies

These minor code-vs-doc or internal mismatches were resolved as part of the audit closure.

| Discrepancy | Resolution | Primary evidence | Date |
|---|---|---|---|
| `useOrders.ts` and `track.vue` argument mismatch | Standardized `guestLookup` signature to `(orderNumber, email)` to match the usage in the tracking page. | `app/composables/useOrders.ts`, `app/pages/orders/track.vue` | 2026-05-27 |

## Audit Closure Baseline

Validated against the live repo on `2026-05-27`:

- All confirmed-removable files listed in `docs/implementation-plan.md` were present before cleanup and have now been deleted through the documented Phase 5 workflow.
- The review-required type declaration candidates now have executed keep/remove decisions recorded below.
- Destructive cleanup was executed only after explicit user approval.
- Backup safety artifacts were created at `chore/backup-unused-files-2026-05-27` and `backup/unused-files-2026-05-27.tar.gz`.
- Backup restoration was sampled successfully by extracting `app/composables/test.ts` from the archive.

## Review-Required Candidate Decisions

These are the executed keep/remove decisions for the review-required candidates from the implementation plan.

| File | Owner area | Current decision | Rationale | Next trigger |
|---|---|---|---|---|
| `app/types/ofetch.d.ts` | Duplicate `ofetch` augmentation under `app/` | Removed | `.nuxt/tsconfig.json` includes both `../types/**/*.d.ts` and `../app/**/*`, so this file duplicated the same module augmentation path. | Closed in this cleanup batch. |
| `types/ofetch.d.ts` | Canonical fetch option typing under root `types/` | Kept and expanded | The root declaration is explicitly included by Nuxt TypeScript config and now carries both `showError` and `successMessage`. | Revisit only if fetch helper ownership changes again. |
| `types/filters.d.ts` | Empty root type-declaration file | Removed | The file contained only `export {}` and no repo references were found. | Closed in this cleanup batch. |
| `types/generated.d.ts` | Unreferenced placeholder type file | Removed | No code references to `BestSellerDTO` or related placeholder exports were found, and no code generation workflow in the repo targets this file. | Closed in this cleanup batch. |

## Confirmed-Removable Execution Status

The following Phase 5 deletion set has now been removed and is recoverable from `backup/unused-files-2026-05-27.tar.gz`:

- `.dbg/route-double-prefix.env`
- `.dbg/trae-debug-log-route-double-prefix.ndjson`
- `.marscode/deviceInfo.json`
- `app/pages/products/.marscode/deviceInfo.json`
- `project-tree.text`
- `search_and_print.sh`
- `app/composables/test.ts`
- `app/setting.json`
- `app/assets/icons/call.txt`
- `app/assets/icons/search.txt`
- `app/assets/icons/logo2.png`
- `app/assets/icons/logo3.png`
- `app/assets/icons/logo4.png`
- `app/assets/icons/logo4 (Copy).png`
- `app/assets/icons/logo5.png`

## Decision Update Rules

- Add a new entry here whenever a major architectural or governance decision is accepted.
- Create a standalone ADR when the decision needs durable rationale, trade-off history, or supersession tracking.
- Update the related owner docs in the same change set as the code and the decision record.
- Do not delete older entries silently; mark them superseded when a later ADR or implementation replaces them.

## Related Docs

- `docs/implementation-plan.md`
- `docs/templates/adr-template.md`
- `docs/architecture/overview.md`
- `docs/architecture/api-integration.md`
- `docs/architecture/data-fetching.md`
- `docs/architecture/state-management.md`
- `docs/configuration/plugins.md`
