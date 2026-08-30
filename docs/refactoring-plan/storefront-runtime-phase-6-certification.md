# Storefront Runtime Phase 6 Certification

## Scope

Phase 6 certifies observability, performance baselines, SEO contract completeness, and tenant isolation for the storefront runtime without changing the Phase 3–5 rendering or preview architecture.

## Automated Evidence

### Backend (Laravel)

Run:

```bash
cd laratenant-backend
php artisan test tests/Feature/Storefront/StorefrontRuntimeTest.php tests/Unit/Storefront/RuntimeServicesTest.php tests/Unit/Storefront/RuntimeSupportTest.php
```

Certification coverage includes:

- structured runtime logs with required observability fields
- local route/page latency baselines (5-request batches under 5000ms in CI)
- request id echo in `requestContext.requestId`
- cross-tenant page payload rejection for marketing, category, and product ids
- tenant-scoped runtime cache keys per host
- SEO contract completeness for `home`, `marketing_page`, `category_page`, and `product_page`
- preview cross-tenant replay rejection (Phase 5, retained)
- tenant-scoped cache invalidation (unit)

### Frontend (Nuxt)

- structured client runtime logs via `src/core/runtime/observability/logRuntimeEvent.ts`
- section fallback warnings emit `runtime.section.fallback` with contract fields (`src/core/runtime/observability/logRuntimeEvent.ts`)
- SSR smoke checks `storefront-runtime`, navigation/footer aria labels, canonical, and JSON-LD markers
- `X-Request-Id` propagation from SSR middleware and API `requestContext` sync
- contract schemas: `npm run runtime:contracts:check`
- production build: `npm run build`

### SSR smoke (built server)

```bash
# Terminal 1
cd laratenant-backend && php artisan serve --host=127.0.0.1 --port=8001

# Terminal 2
cd justshop-frontend && npm run build && PORT=3100 node .output/server/index.mjs

# Terminal 3
cd justshop-frontend && npm run runtime:verify:phase6
```

Default routes: `/`, `/about-us`, `/products/category/electronics`, `/products/running-sneakers`  
Default host header: `demo.justshop.test`

## Manual / Environment-Owned Items (not encoded in repo)

Per the execution plan, these remain environment and operations responsibilities:

- production dashboards and alerting for runtime errors, latency, cache health, and hydration warnings
- load tests at approved production concurrency
- browser/mobile UAT matrix
- formal sign-off reports (performance, isolation, SEO, readiness, rollback rehearsal)

## Gate Status

| Criterion | Automated in repo | Notes |
|---|---|---|
| Observability field completeness | Yes | Backend log spy + frontend structured logger |
| Performance baseline | Yes | Local 5-request batch guardrails |
| SEO contract | Yes | API field assertions + SSR canonical/JSON-LD smoke |
| Tenant isolation | Yes | Cross-tenant page + preview + cache key tests |
| Dashboards / alerting | No | DevOps/SRE owned |
| Formal sign-off package | No | QA/Security/SEO leads |

## Next phase

The rollout/kill-switch/pilot-tenant gating referenced in earlier planning docs was removed from the codebase — this project has never shipped to production, so runtime now applies unconditionally to every resolved tenant instead of being gated behind a rollout mode.
