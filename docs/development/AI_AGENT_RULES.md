# AGENTS.md

## Purpose

This file defines the mandatory operating rules for AI agents and automation working in `/home/leader/projects/laravel/tenant/justshop-frontend`.

Use this file together with:

- `CONTRIBUTING.md` for shared contributor workflow
- `docs/index.md` for the current documentation map and owner documents
- `docs/implementation-plan.md` for the authoritative documentation roadmap
- `docs/refactoring-plan/README.md` for the storefront refactoring program map
- `README.md` for repository entry points and setup commands
- `PLAYWRIGHT_CONTEXT.md` for Playwright E2E testing context and status
- `PLAYWRIGHT_COMPLETION_SUMMARY.md` for completed test infrastructure overview

## Current Program Context

- The repository documentation system is complete through the implementation-plan phases and now operates in maintenance mode.
- The active storefront refactoring program is authoritatively described in `docs/refactoring-plan/PLAN-SUMMARY.md`. The prior `storefront-commerce-consolidation-execution-plan.md` and `storefront-runtime-integration-execution-plan.md` were removed on `2026-08-29` for encoding rollout/kill-switch/pilot-tenant complexity that doesn't apply to a project that has never shipped to production.
- When a request touches storefront routing, shell composition, auth, cart, search, tenant isolation, or SSR continuity, inspect `docs/refactoring-plan/README.md` first to determine the active source-of-truth document.

## Repository Facts You Must Preserve

Current code-backed project surfaces:

- Nuxt 4 with Vue 3 and TypeScript
- Pinia stores in `app/stores/` with persisted auth state and cart state
- `@nuxtjs/i18n` with English and Arabic locale bundles in `i18n/locales/`
- Nitro server routes under `server/api/`
- Server-side backend proxy helpers in `server/utils/api.ts`
- Shared route contracts in `shared/utils/routes.ts`
- Apollo client search integration in `app/plugins/apollo.client.ts`

Important files to inspect before documenting related behavior:

- `nuxt.config.ts`
- `package.json`
- `shared/utils/routes.ts`
- `app/stores/auth.ts`
- `app/stores/cart.ts`
- `app/composables/useApi.ts`
- `server/utils/api.ts`
- `app/plugins/01.auth.client.ts`
- `app/plugins/02.cart.client.ts`
- `app/plugins/api.ts`
- `app/plugins/apollo.client.ts`

## Required Workflow

1. Inspect before editing.
2. Read the live source files that own the behavior you are about to change or document.
3. Treat `docs/implementation-plan.md` as the controlling roadmap for documentation sequencing unless the user explicitly changes scope.
4. Treat `docs/refactoring-plan/PLAN-SUMMARY.md` as the active storefront transformation roadmap when the task concerns storefront consolidation work.
5. Follow the documented phase order. Do not skip ahead when an upstream owner document is missing.
6. Update documentation in the same change set whenever you modify:
   - environment variables
   - routes or route families
   - stores
   - plugins
   - modules
   - deployment or runtime behavior
   - external integrations
   - refactoring program assumptions or phase ownership
7. Keep root docs concise and navigational. Put deep technical detail in `docs/`.
8. Run diagnostics after substantive edits and fix issues you introduced when practical.

## Maintenance Cadence

- On every change set, update the owner docs, `.env.example`, and governance files that the change affects before handoff.
- On every major architectural or governance decision, update `docs/reference/decisions.md` in the same change set and add a standalone ADR when durable rationale or supersession tracking is needed.
- For file-cleanup work, re-run the removal workflow from `docs/implementation-plan.md`, record review-required keep/remove outcomes in `docs/reference/decisions.md`, and update `CHANGELOG.md` when deletions affect contributor workflow or repository structure.
- Before closing a cleanup batch, verify diagnostics and rerun `npm run build` when removed files could affect runtime, typing, or build behavior.
- When consolidation phases advance or are superseded, update `docs/refactoring-plan/README.md` and `docs/index.md` in the same change set.

## Accuracy Rules

- Do not present guesses as facts.
- Prefer current code over stale plan assumptions when they conflict, and record the discrepancy.
- Link or point to the owner document instead of duplicating long explanations.
- Keep Nuxt terminology exact: `pages`, `layouts`, `middleware`, `plugins`, `composables`, `server/api`, `runtimeConfig`.
- Document runtime boundaries clearly: client, server, or both.

## Security Rules

- Never add real secrets, tokens, keys, or production credentials to the repository.
- Never put real values in `.env.example`.
- Do not expose server-only guidance as client-safe behavior.
- Do not bypass the internal `server/api` proxy layer for backend auth or application data flows unless the user explicitly changes architecture.
- Treat auth, cart, profile, checkout, and external API integration as sensitive areas that require code-backed wording.

## Implementation Rules For This Repo

- Reuse `shared/utils/routes.ts` instead of introducing duplicate route literals where a shared constant already exists.
- Preserve SSR-safe guards around browser-only APIs such as `localStorage`, `window`, and `document`.
- Respect plugin mode and ordering semantics already visible in `app/plugins/`, especially `01.auth.client.ts` and `02.cart.client.ts`.
- Keep auth persistence behavior aligned with `app/stores/auth.ts` and the persisted cookie storage currently configured there.
- Keep guest cart behavior aligned with `app/stores/cart.ts`, including client-only local storage handling and merge-on-login behavior.

### useAsyncData Cache Key Rules

**CRITICAL:** All cache keys MUST include locale to prevent mixing English/Arabic data. When using `useAsyncData` with reactive cache keys:

**Multilingual Requirement:**
- ✅ **ALWAYS** include `locale` in cache keys: `en:product:laptop` vs `ar:product:laptop`
- ✅ **ALWAYS** include `tenantId` for multi-tenant data isolation
- ✅ Cache keys MUST be reactive - use arrow function pattern: `() => createCacheKey({...})`
- ❌ **NEVER** use static cache keys like `'product-list'` that don't include locale

**Implementation Pattern for Page Components:**

In page components (`app.vue`, pages, layouts):
- **DO NOT** use the `useCacheKey()` wrapper - it calls composables inside the arrow function which breaks in SSR
- **DO** use `createCacheKey()` directly with explicit refs extracted in setup()
- **DO** extract all composable values (`useStorefrontContext()`, `useI18n()`) in the setup function
- **DO** access only `.value` properties inside the arrow function

```typescript
// ❌ WRONG - Causes "composable called outside of setup" error
const { getCacheKey } = useCacheKey()
const { data } = await useAsyncData(
  () => getCacheKey({ resource: 'product' }), // Calls composables here!
  async () => { ... }
)

// ❌ WRONG - Static key without locale causes EN/AR data mixing
const { data } = await useAsyncData(
  'product-list', // No locale = wrong data for users!
  async () => { ... }
)

// ✅ CORRECT - Locale-aware, reactive, SSR-safe
const storefrontContext = useStorefrontContext()
const { locale } = useI18n()
const { data } = await useAsyncData(
  () => createCacheKey({
    locale: locale.value,              // ✅ Required for multilingual
    tenantId: storefrontContext.value.tenant?.id, // ✅ Required for multi-tenant
    resource: 'product'
  }),
  async () => { ... }
)
```

**Exception:** Inside composables (functions starting with `use`), `useCacheKey()` is safe to use because the composable has proper Nuxt context.

**Rationale:** 
1. **Multilingual:** Without locale in keys, switching EN→AR shows stale English data until page reload
2. **SSR Safety:** Arrow function `() => key` is evaluated by Nuxt internals during key computation, which happens outside Vue setup context. Any composable call at that point fails.
3. **Reactivity:** Using `() => createCacheKey({...})` ensures data refetches when locale changes

**This ensures:**
1. ✅ No EN/AR data mixing (locale-specific caching)
2. ✅ Automatic refetch on language switch (reactivity)
3. ✅ No "composable called outside setup" errors (SSR-safe)
4. ✅ Multi-tenant data isolation

**See also:** 
- `COMPOSABLE_CONTEXT_FIX.md` - Technical SSR error details
- `REACTIVE_CACHE_KEY_FIX.md` - Language switching behavior
- `docs/architecture/cache-deduplication.md` - Full cache architecture

## SSR And Hydration Rules

- Treat hydration mismatches as SSR/client render divergence first, not as a component-resolution problem.
- When browser-only state such as `localStorage`, guest cart state, media queries, `window`, or `document` drives a small UI fragment, prefer isolating the smallest affected subtree.
- `ClientOnly` is acceptable for minimal client-personalized UI such as guest-cart badges, guest-cart counters, theme toggles, or browser-only widgets that are not SEO-critical.
- When using `ClientOnly`, keep the wrapped subtree as small as possible and preserve layout stability with a fallback when needed.
- Do not use `ClientOnly` to wrap page-level content, layouts, runtime shells, primary navigation, SEO content, or main storefront sections only to silence hydration warnings.
- If the mismatch affects core content or shared structure, fix the SSR/client state divergence at the source instead of hiding it.

## File Removal And Cleanup

- Do not delete files only because they appear unreferenced. Nuxt auto-load conventions apply to `app/pages/`, `app/layouts/`, `app/middleware/`, `app/plugins/`, `app/stores/`, and `server/api/`.
- Follow the unused-file workflow in `docs/implementation-plan.md` before deleting confirmed removable files.
- Do not perform destructive cleanup without explicit user approval when deletion is involved.

## Handoff Requirements

When you finish a task, provide:

- files created or updated
- any unresolved questions
- any discrepancy found between live code and existing docs or plan assumptions
- the next recommended documentation files in phase order
