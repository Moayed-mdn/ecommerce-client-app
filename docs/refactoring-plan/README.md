# Storefront Runtime Refactoring Plan

## Purpose

This directory contains the planning, execution, audit, and handoff documents for the storefront runtime transformation program.

Use this folder when you need the runtime-program history for the multi-tenant storefront work. Do not confuse it with `docs/implementation-plan.md`, which is the authoritative roadmap for the broader documentation system.

## Program Hubs

### 1. Storefront Runtime Integration (Complete)
The foundation program that established multi-tenant SSR rendering, runtime contracts, and Laravel-driven page resolution.
- [Plan Summary](file:///home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/PLAN-SUMMARY.md) — now the authoritative doc for this program

### 2. Storefront Commerce Consolidation (Active)
The current program transforming the runtime foundation into a unified, tenant-safe commerce storefront experience.
- [Shopify-Like Storefront Master Plan](file:///home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/shopify-like-storefront-master-plan.md)
- [Current Audit](file:///home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/audits/storefront-commerce-consolidation-audit.md)
- [Wave 1 Canonical Route Recovery](file:///home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/wave1-canonical-route-recovery.md) — historical recovery attempt, now superseded by the live `/shop/**` route alignment recorded on `2026-05-31`
- [Phase 1 Execution Backlog](file:///home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/storefront-phase-1-execution-backlog.md) — current engineering backlog: route audit, shell unification, navigation hardening with ordered waves and acceptance criteria
- [Certification Report](file:///home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/storefront-certification-report.md) — Phase 9 closeout: final legacy retirement, removal log, and remaining-gap review

**Note (2026-08-29):** `storefront-commerce-consolidation-execution-plan.md` and `storefront-runtime-integration-execution-plan.md` were removed. Both encoded multi-phase rollout/kill-switch/pilot-tenant machinery as mandatory for a controlled production launch — but this project has never shipped to production, so that machinery (and the planning around it) was removed from the codebase and its plan docs alike. `PLAN-SUMMARY.md` is now the authoritative description of what is actually built.

---

## Active Plan Navigation
| Document | Phase | Focus |
|---|---|---|
| [Shopify-Like Storefront Master Plan](file:///home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/shopify-like-storefront-master-plan.md) | North Star | Product vision, architectural direction, scope, and execution order for the Shopify-like storefront target |
| [Phase 1 Execution Backlog](file:///home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/storefront-phase-1-execution-backlog.md) | Phase 1 | Route audit, shell unification, navigation hardening — ordered waves with acceptance criteria |
| [Certification Report](file:///home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/storefront-certification-report.md) | Phase 9 | Legacy retirement, removal log, gap review, and storefront certification |
| [Wave 1 Canonical Route Recovery](file:///home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/wave1-canonical-route-recovery.md) | Historical | Superseded route-recovery attempt; see current live `/shop/**` override note |
| [Plan Summary](file:///home/leader/projects/laravel/tenant/justshop-frontend/docs/refactoring-plan/PLAN-SUMMARY.md) | All | Authoritative plain-language summary of what is actually built |


## Archive

Files under `archive/` are earlier concept and master-plan drafts. They remain useful for historical context and architecture intent, but they are superseded by the execution plan and closeout documents in this directory.

| Document | Role |
|---|---|
| `archive/platform-transformation-plan-part-1-foundation.md` | Early platform-foundation vision and architectural rules |
| `archive/platform-transformation-plan-part-2-runtime-architecture.md` | Early runtime architecture and migration target design |
| `archive/platform-transformation-plan-part-3-migration-mapping.md` | Early file-by-file migration mapping |

## Source Of Truth Rules

- Use `shopify-like-storefront-master-plan.md` for the compact product direction, execution order, and storefront target state.
- Use `PLAN-SUMMARY.md` for the actual current program status and architecture (the two multi-phase execution plans this used to point to were removed — see the note above).
- Use the Phase 8 documents for steady-state operations and closeout reality.
- Treat `archive/` as historical context, not active implementation authority.
