# AI Session Handoff Prompt For Documentation Maintenance And Audit Continuity

You are continuing the documentation architecture and audit-closure project for the Nuxt 4 repository at `/home/leader/projects/laravel/tenant/justshop-frontend`.

Your mission is to continue from the current documented state without redoing completed phases, losing continuity, or inventing undocumented behavior. Treat this prompt and `docs/implementation-plan.md` as the continuity baseline, with live code remaining the source of truth.

Use `docs/refactoring-plan/README.md` when the task involves the separate storefront runtime transformation program or archived runtime-planning material. Note: the storefront runtime rollout/kill-switch/pilot-tenant system described in older phase-7/phase-8 planning docs was removed from the codebase — this project has never shipped to production, so there was no live migration for that program to gate. Runtime is the default architecture for any tenant, not a feature flag.

### Active Refactoring Program
- **Hub**: [README.md](docs/refactoring-plan/README.md)
- **Active Plan**: [PLAN-SUMMARY.md](docs/refactoring-plan/PLAN-SUMMARY.md) — authoritative; the prior Consolidation and Runtime Integration execution plans were removed on `2026-08-29` for encoding rollout/kill-switch complexity that doesn't apply to a project that has never shipped to production.
- **Goal**: Transition from "hybrid runtime infrastructure" to "unified commerce storefront" (routing, shell, auth, cart consolidation).

## 1. Core Objective

Maintain a complete, project-specific documentation system for this storefront so a human developer or AI agent can:

- understand the repo without oral explanation
- install and run it locally
- follow runtime, configuration, and architectural rules safely
- make future code or documentation changes without introducing drift
- execute release, deployment, and incident procedures from written docs alone
- continue cleanup and governance work without repeating finished steps

## 2. Current Repository Context

Repository root:
`/home/leader/projects/laravel/tenant/justshop-frontend`

Current stack and runtime shape visible in code:

- Nuxt 4
- Vue 3
- TypeScript
- Pinia with persisted state
- `@nuxtjs/i18n`
- Nitro `server/api` routes
- Apollo client for GraphQL search
- internal Nuxt server API proxying to an external backend API
- English and Arabic locale bundles

High-priority anchors for future documentation or audit work:

- `/home/leader/projects/laravel/tenant/justshop-frontend/docs/implementation-plan.md`
- `/home/leader/projects/laravel/tenant/justshop-frontend/docs/index.md`
- `/home/leader/projects/laravel/tenant/justshop-frontend/docs/reference/decisions.md`
- `/home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/README.md`
- `/home/leader/projects/laravel/tenant/justshop-frontend/AGENTS.md`
- `/home/leader/projects/laravel/tenant/justshop-frontend/CONTRIBUTING.md`
- `/home/leader/projects/laravel/tenant/justshop-frontend/CHANGELOG.md`
- `/home/leader/projects/laravel/tenant/justshop-frontend/nuxt.config.ts`
- `/home/leader/projects/laravel/tenant/justshop-frontend/package.json`
- `/home/leader/projects/laravel/tenant/justshop-frontend/shared/utils/routes.ts`
- `/home/leader/projects/laravel/tenant/justshop-frontend/app/composables/useApi.ts`
- `/home/leader/projects/laravel/tenant/justshop-frontend/app/composables/useClientApi.ts`
- `/home/leader/projects/laravel/tenant/justshop-frontend/app/plugins/api.ts`
- `/home/leader/projects/laravel/tenant/justshop-frontend/app/utils/serverApi.ts`
- `/home/leader/projects/laravel/tenant/justshop-frontend/app/pages/auth/google/callback.vue`
- `/home/leader/projects/laravel/tenant/justshop-frontend/app/pages/orders/index.vue`
- `/home/leader/projects/laravel/tenant/justshop-frontend/app/pages/orders/[orderNumber].vue`
- `/home/leader/projects/laravel/tenant/justshop-frontend/app/pages/orders/track.vue`
- `/home/leader/projects/laravel/tenant/justshop-frontend/app/composables/useOrders.ts`
- `/home/leader/projects/laravel/tenant/justshop-frontend/app/composables/useTheme.ts`
- `/home/leader/projects/laravel/tenant/justshop-frontend/types/ofetch.d.ts`

## 3. Milestones Already Completed

Preserve these outcomes and build on them instead of recreating them:

- Phase 1 complete: root governance docs, setup docs, `.env.example`, and the docs hub exist.
- Phase 2 complete: getting-started docs, glossary, and templates exist.
- Phase 3 complete: architecture, configuration, and missing reference owner docs exist.
- Phase 4 complete: development docs, operations docs, FAQ, and `CHANGELOG.md` exist.
- Phase 5 cleanup complete: confirmed-removable files were deleted only after backup safeguards and successful build validation.
- Phase 5 type cleanup complete: `types/ofetch.d.ts` is the canonical fetch augmentation, while `app/types/ofetch.d.ts`, `types/filters.d.ts`, and `types/generated.d.ts` were removed.
- Resolved code discrepancies: Standardized `guestLookup(...)` signature in `useOrders.ts` and `track.vue`, fixed `OrderListResponse` types, improved reorder error handling, and resolved `package.json` naming and `@nuxt/icon` configuration.
- Implemented architectural ADRs: Standardized on `useApi()` (ADR-001), separated public/server API base (ADR-002), consolidated Google callback logic (ADR-003), enabled orders index protection (ADR-004), restored theme behavior with expanded dark-mode tokens (ADR-005), and normalized component/composable naming (ADR-006).

## 4. Verification Already Completed

Earlier sessions already reported:

- diagnostics checks on created markdown files
- successful `npm run build` validation after the confirmed-removable cleanup
- successful `npm run build` validation after the type-declaration cleanup
- sampled restore from `backup/unused-files-2026-05-27.tar.gz`

Do not assume the repo is unchanged since then. Re-validate live code before any new edits.

## 5. Cleanup Already Executed

These artifacts were already deleted in the approved Phase 5 batch and must not be recreated casually:

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
- `app/types/ofetch.d.ts`
- `types/filters.d.ts`
- `types/generated.d.ts`

Backup safety artifacts already exist at:

- `chore/backup-unused-files-2026-05-27`
- `backup/unused-files-2026-05-27.tar.gz`

## 6. Current Canonical Decisions To Preserve

- `types/ofetch.d.ts` is the canonical `ofetch` augmentation owner.
- The repo still uses internal `server/api` routes as the main backend integration path for application flows.
- Search still uses direct client-side Apollo GraphQL access.
- Auth hydration still runs before cart initialization through numeric plugin order.

## 7. Current Open Discrepancies

The initial high-priority audit backlog is now fully resolved and formalized via Implemented ADRs. Any new discrepancies discovered in future sessions should be recorded here before being moved to `docs/reference/decisions.md`.

## 8. Current ADR State

Architectural backlog topics are tracked via formal ADRs:

- `docs/reference/adr-001-request-helper-consolidation.md` (Implemented)
- `docs/reference/adr-002-api-base-runtime-boundary.md` (Implemented)
- `docs/reference/adr-003-google-callback-owner.md` (Implemented)
- `docs/reference/adr-004-orders-protection-policy.md` (Implemented)
- `docs/reference/adr-005-theme-behavior-roadmap.md` (Implemented)
- `docs/reference/adr-006-naming-normalization.md` (Implemented)

## 9. Mandatory First Actions For A New Session

Before making substantive edits, do these in order:

1. Read `docs/implementation-plan.md`.
2. Read `AGENTS.md`.
3. Read `CONTRIBUTING.md`.
4. Read `docs/index.md`.
5. Read `docs/reference/decisions.md`.
6. Inspect the live code surfaces that own the behavior you plan to change or document.
7. Verify whether any relevant repo files changed since the last audit-closure pass.
8. Confirm whether the active task is:
   - documentation wording cleanup
   - ADR creation or refinement
   - code-backed discrepancy resolution
   - handoff-summary preparation

Do not skip validation just because earlier sessions already completed major phases.

## 10. Required Validation Response Before New Work

Before editing files, send a short validation summary that includes:

- a paragraph summarizing the current project objective
- which phases are already complete
- what Phase 5 work has already been executed
- which unresolved discrepancies you confirmed in live code
- what you will do next

Do not begin editing until that validation step is complete.

## 11. Current Best Next Steps

Unless the user changes priority, the likely next work is one of:

1. Perform a complete UI audit for dark-mode using the newly expanded tokens in `_colors.css`.
2. Refactor existing `useApi` calls to take advantage of the new `successMessage` and `showError` options.
3. Consolidate `app/utils/` and `shared/utils/` boundaries based on the final architectural plan.

## 12. Hard Constraints

You must obey all of the following:

- do not fabricate implementation details
- do not recreate deleted cleanup artifacts without explicit need and evidence
- do not bypass the internal `server/api` layer for auth or backend-integrated app flows unless architecture is explicitly changed
- do not delete additional files without re-running the documented validation workflow and obtaining approval
- do not touch unrelated `README.md` worktree changes unless the user explicitly asks
- do not create undocumented new dependencies
- keep edits ASCII unless a file already requires non-ASCII content
- run diagnostics after substantive edits
- run practical validation when the change justifies it

## 13. Required Final Deliverable Format

At the end of the session, provide a concise handoff summary with these sections:

1. `Completed`
2. `Verification`
3. `Discrepancies`
4. `Open Questions`
5. `Next`

Each section must be factual, specific, and based on the live repo state at the time of handoff.
