# Testing

## Purpose

This document describes the current verification strategy for the JustShop frontend and the testing reality visible in the live repository.

Code surfaces this file aligns with:

- `package.json`
- `docs/getting-started/running-locally.md`
- `app/pages/**`
- `server/api/**`

## Current Reality

The live repo does not currently contain:

- automated unit tests
- integration test files
- end-to-end test files
- CI workflows in `.github/`

The repo now does include targeted storefront runtime verification scripts:

- `npm run runtime:contracts:check`
- `npm run runtime:verify:phase6`
- `npm run runtime:verify:phase7`

Current verification is therefore manual plus build- and script-oriented for the storefront runtime migration.

## Current Available Commands

| Command | Current role |
|---|---|
| `npm run dev` | Manual development verification |
| `npm run build` | Production compilation check |
| `npm run preview` | Local production-preview validation |
| `npm run generate` | Optional static-generation validation |
| `npm run runtime:contracts:check` | Validates the checked-in storefront runtime schemas and examples |
| `npm run runtime:smoke` | Verifies built SSR runtime pages, SEO markers, and runtime shell output against the Laravel runtime backend |

## Storefront Runtime Smoke Verification

The storefront runtime has repo-backed preflight verification:

- `npm run runtime:smoke` covers SSR runtime smoke for homepage, marketing, category, and product routes, plus canonical and JSON-LD markers.
- Local script success does not replace manual verification of system routes (cart, checkout, orders, auth) or the browser smoke checks below.

## Required Current Verification Flow

For meaningful change validation in this repo today:

1. run diagnostics for edited files where practical
2. run `npm run build` for substantive changes
3. manually verify affected routes and flows in the browser
4. confirm docs are updated when the change affects architecture, routes, stores, plugins, env vars, or runtime behavior

## Manual Smoke Coverage

Current high-value smoke checks should cover:

- home page and hero content
- runtime homepage SSR through the catch-all route when the Laravel runtime backend is reachable
- runtime marketing page SSR such as `/about-us`
- runtime category page SSR such as `/products/category/<slug>`
- runtime product page SSR such as `/products/product/<slug>` or the backend-approved product runtime path
- product listing and category listing
- product detail, variant selection, and add-to-cart
- cart behavior for guest and authenticated users
- login and register flows
- profile access and profile update flows
- orders list, order detail, and guest order tracking
- search autocomplete and `/search?q=<term>` results
- checkout success and cancel return pages

## What To Verify By Change Type

### Docs-Only Changes

- diagnostics on edited markdown files
- link and owner-doc consistency
- `npm run runtime:contracts:check` when storefront runtime contract docs or artifacts change

### UI Or Styling Changes

- affected page render and responsive behavior
- focus, button, and form interactions
- hydration-sensitive screens such as cart and search

### Data Or API Changes

- related `server/api` route behavior
- auth and locale header handling
- end-to-end browser flow for the affected feature

### Store Or Persistence Changes

- auth persistence across refresh
- guest cart local storage behavior
- merge-on-login cart behavior

## When To Add Automated Tests

Automated tests would add the most value when changes affect:

- auth or route protection
- cart merge and checkout behavior
- order lookup or reorder flows
- composables with branching business logic
- pure utilities that are hard to verify manually

Until a test framework is introduced, prefer targeted manual checks and `npm run build` over speculative placeholder tests.

## Current Gaps

- No general-purpose unit, integration, or end-to-end test harness is wired into `package.json`.
- No CI automation is visible in the repo.
- No component preview or visual regression tooling is present.

For the storefront runtime specifically:

- Contract schemas and examples are validated locally by `npm run runtime:contracts:check`.
- CI execution of that command remains a later delivery task because no repository workflow is currently present.
- Verification should explicitly cover runtime SSR for homepage, marketing, category, and product pages, plus regressions for the fixed system routes (auth, cart, checkout, profile, and orders).
- If the Laravel runtime backend is unavailable locally, treat `npm run build` plus system-route SSR smoke checks as local verification and complete runtime SSR verification in an environment where Nitro can reach the backend runtime APIs.

## Change Rules

- Update this document when test scripts, test frameworks, or CI workflows are added.
- If a new automated test layer becomes the standard, document which checks remain mandatory manually and which move into automation.
