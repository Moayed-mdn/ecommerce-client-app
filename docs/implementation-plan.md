# JustShop Frontend Documentation Implementation Plan

## Status

This document remains the authoritative roadmap for the repository's documentation system and owner-document structure.

Current state:

- Phases 1 through 5 are complete.
- This file should still be used for documentation ownership, maintenance rules, and cleanup workflow references.
- `docs/operations/` (Operations and performance)
- `docs/refactoring-plan/` (Storefront Runtime Integration & Commerce Consolidation programs)

## Program Successors

The documentation system now supports two major refactoring programs:
1. **Storefront Runtime Integration (Maintenance)**: Established the SSR infrastructure and runtime contracts.
2. **Storefront Commerce Consolidation (Active)**: Unifying routing, shell, and commerce state into the runtime foundation.

## 1. Purpose And Scope

This document defines the standardized end-to-end roadmap for building the complete documentation system for the `justshop-frontend` Nuxt 4 application. It converts the validated target documentation architecture into an implementation sequence that is dependency-safe, measurable, auditable, and aligned with the existing codebase.

This plan is based on the current repository state:

- Framework: Nuxt `4.2.1`, Vue `3.5.x`, Nitro server routes
- State management: Pinia with `pinia-plugin-persistedstate`
- Localization: `@nuxtjs/i18n` with English and Arabic locale bundles
- Data access: Nuxt server API handlers, `$fetch`, Apollo GraphQL client for search
- Current runtime config usage: `NUXT_PUBLIC_API_BASE`, `NUXT_PUBLIC_GRAPHQL_URL`, `NUXT_PUBLIC_SITE_URL`
- Existing project surfaces to document: `app/`, `server/`, `shared/utils/routes.ts`, `types/`, `i18n/`, `nuxt.config.ts`, `package.json`

Implementation objective:

- Create a durable documentation system that explains how the project is structured, configured, extended, verified, and deployed.
- Enforce synchronization rules so any future code, configuration, or deployment change updates documentation in the same change set.
- Remove non-product and redundant files only through a controlled audit workflow that protects required Nuxt assets and convention-based auto-loaded modules.

Success definition:

- All validated documentation files exist with project-specific content.
- Every core application surface has exactly one primary documentation owner file.
- No new undocumented environment variable, store, plugin, route family, or deployment behavior can enter the repository.
- High-confidence unused files are removed safely after backup and dependency validation.

## 2. Target Documentation Tree

The following structure must be created exactly as approved.

```text
justshop-frontend/
├── README.md
├── CONTRIBUTING.md
├── AGENTS.md
├── CHANGELOG.md
├── .env.example
├── docs/
│   ├── index.md
│   ├── getting-started/
│   │   ├── overview.md
│   │   ├── prerequisites.md
│   │   ├── installation.md
│   │   ├── running-locally.md
│   │   └── project-structure.md
│   ├── architecture/
│   │   ├── overview.md
│   │   ├── rendering-strategy.md
│   │   ├── routing-and-navigation.md
│   │   ├── data-fetching.md
│   │   ├── state-management.md
│   │   ├── auth-and-security.md
│   │   └── api-integration.md
│   ├── configuration/
│   │   ├── overview.md
│   │   ├── nuxt-config.md
│   │   ├── runtime-config.md
│   │   ├── environment-variables.md
│   │   ├── modules.md
│   │   ├── plugins.md
│   │   └── feature-flags.md
│   ├── development/
│   │   ├── coding-standards.md
│   │   ├── components.md
│   │   ├── composables.md
│   │   ├── pages-layouts-middleware.md
│   │   ├── server-routes.md
│   │   ├── styling-and-ui.md
│   │   ├── testing.md
│   │   ├── accessibility.md
│   │   └── troubleshooting.md
│   ├── operations/
│   │   ├── build-and-release.md
│   │   ├── deployment.md
│   │   ├── environments.md
│   │   ├── monitoring-and-logging.md
│   │   ├── performance.md
│   │   ├── seo.md
│   │   └── incident-playbook.md
│   ├── reference/
│   │   ├── glossary.md
│   │   ├── decisions.md
│   │   ├── faq.md
│   │   └── external-services.md
│   └── templates/
│       ├── adr-template.md
│       ├── page-doc-template.md
│       └── feature-doc-template.md
└── docs-assets/
    ├── architecture/
    └── screenshots/
```

### 2.1 File Responsibility Register

| File | Core responsibility |
|---|---|
| `README.md` | Repository entry point, quick start, scripts, top-level links into the formal docs tree. |
| `CONTRIBUTING.md` | Contributor workflow, review rules, documentation update obligations, approval gates. |
| `AGENTS.md` | Mandatory operating rules for AI agents and automation touching code or docs. |
| `CHANGELOG.md` | Human-readable release history and externally visible changes. |
| `.env.example` | Non-secret canonical list of all required environment variables and placeholder values. |
| `docs/index.md` | Documentation hub and navigation map. |
| `docs/getting-started/overview.md` | Project purpose, business scope, major features, and onboarding path. |
| `docs/getting-started/prerequisites.md` | Required toolchain, Node version, package manager, backend/API prerequisites. |
| `docs/getting-started/installation.md` | Clean installation procedure and first-run setup. |
| `docs/getting-started/running-locally.md` | Local execution flow, dev scripts, SSR/runtime notes, troubleshooting. |
| `docs/getting-started/project-structure.md` | Project directory semantics for `app/`, `server/`, `shared/`, `types/`, `i18n/`, `public/`. |
| `docs/architecture/overview.md` | System-level architecture and domain boundaries. |
| `docs/architecture/rendering-strategy.md` | SSR, client-only, runtime boundaries, plugin mode decisions. |
| `docs/architecture/routing-and-navigation.md` | Nuxt pages, route params, shared route constants, locale routing behavior. |
| `docs/architecture/data-fetching.md` | `$fetch`, `useApi`, server APIs, GraphQL search flow, async data patterns. |
| `docs/architecture/state-management.md` | Pinia store ownership, hydration, persisted auth token behavior, cart boundaries. |
| `docs/architecture/auth-and-security.md` | Login, register, Google auth callback, auth middleware, token/cookie handling. |
| `docs/architecture/api-integration.md` | Nuxt server route proxy pattern and external backend API mapping. |
| `docs/configuration/overview.md` | Configuration ownership map and where project settings live. |
| `docs/configuration/nuxt-config.md` | Module registration, CSS, imports, i18n, Nitro and TypeScript config. |
| `docs/configuration/runtime-config.md` | Public/private runtime config usage rules and SSR-safe access rules. |
| `docs/configuration/environment-variables.md` | Complete env catalog, scope, usage, defaults, and validation rules. |
| `docs/configuration/modules.md` | Why each Nuxt module exists and how it integrates with the app. |
| `docs/configuration/plugins.md` | Plugin lifecycle, ordering, client/server suffix rules, current plugin responsibilities. |
| `docs/development/coding-standards.md` | Naming, formatting, comments, dependency introduction, and review standards. |
| `docs/development/components.md` | Component layer patterns and ownership boundaries. |
| `docs/development/composables.md` | Composable naming, side-effect rules, and shared logic patterns. |
| `docs/development/pages-layouts-middleware.md` | Rules for pages, layouts, and route middleware placement. |
| `docs/development/server-routes.md` | `server/api` conventions, proxy structure, response and error handling. |
| `docs/development/styling-and-ui.md` | CSS token usage, component/page styles, UI composition rules. |
| `docs/development/testing.md` | Verification strategy for current repo and future automated test additions. |
| `docs/development/accessibility.md` | Accessibility baselines for forms, navigation, and interactive elements. |
| `docs/development/troubleshooting.md` | Known failure modes, diagnosis flow, and resolution steps. |
| `docs/operations/build-and-release.md` | Build commands, release procedure, and release evidence requirements. |
| `docs/operations/deployment.md` | Deployment process, prerequisites, post-deploy validation, rollback steps. |
| `docs/operations/environments.md` | Differences across local, staging, and production environments. |
| `docs/operations/monitoring-and-logging.md` | Logging expectations, alerting targets, and incident evidence collection. |
| `docs/operations/performance.md` | Performance budget, bundle/runtime hotspots, and optimization rules. |
| `docs/operations/seo.md` | Search metadata, route discoverability, robots, sitemap, and localized SEO. |
| `docs/operations/incident-playbook.md` | Incident response workflow and rollback command ownership. |
| `docs/reference/glossary.md` | Shared definitions for business and technical terms. |
| `docs/reference/decisions.md` | Index of architecture decisions and ADR references. |
| `docs/reference/faq.md` | Repeated developer questions and approved answers. |
| `docs/reference/external-services.md` | External backend, GraphQL, auth, and service contract summaries. |
| `docs/templates/adr-template.md` | Standard ADR authoring template. |
| `docs/templates/page-doc-template.md` | Standard page-level documentation template. |
| `docs/templates/feature-doc-template.md` | Standard feature documentation template. |
| `docs-assets/architecture/` | Diagrams exported from architecture reviews. |
| `docs-assets/screenshots/` | UI screenshots used by setup and operations documentation. |

## 3. Current Codebase Alignment Baseline

The documentation system must reflect the real codebase that already exists.

### 3.1 Existing Code Assets That New Documentation Must Align With

| Existing asset | Documentation impact |
|---|---|
| `nuxt.config.ts` | Drives `README.md`, `docs/configuration/nuxt-config.md`, `runtime-config.md`, `modules.md`, `environment-variables.md`, `operations/environments.md`. |
| `package.json` | Drives script sections in `README.md`, `getting-started/running-locally.md`, and `operations/build-and-release.md`. |
| `app/stores/auth.ts` and `app/stores/cart.ts` | Drive `architecture/state-management.md` and `architecture/auth-and-security.md`. |
| `app/composables/useApi.ts` | Primary reference for `architecture/data-fetching.md` and `development/composables.md`. |
| `app/plugins/apollo.client.ts` and `app/graphql/queries/search.ts` | Drive GraphQL documentation in `architecture/data-fetching.md`, `configuration/plugins.md`, and `reference/external-services.md`. |
| `server/api/**` | Primary source for `development/server-routes.md`, `architecture/api-integration.md`, and deployment verification cases. |
| `server/utils/api.ts` | Documents server-side proxy behavior and runtime config usage. |
| `shared/utils/routes.ts` | Documents route contracts for frontend, internal API, and external backend mapping. |
| `app/middleware/*.ts` | Drives auth/routing sections in `architecture/auth-and-security.md` and `development/pages-layouts-middleware.md`. |
| `app/plugins/01.auth.client.ts`, `02.cart.client.ts`, `theme.client.ts`, `api.ts` | Drive plugin order and boot sequence guidance. |
| `i18n/locales/**` | Drive localization workflow in `project-structure.md`, `coding-standards.md`, and `seo.md`. |
| `app/assets/css/**` and `app/components/**` | Drive styling and component structure documentation. |
| `types/**` | Drive type ownership rules and duplication avoidance guidance. |

### 3.2 Mandatory Interface Rules For All New Documentation Files

- No new markdown file may describe behavior that is not visible in current code, approved backlog decisions, or deployment requirements.
- Each markdown file must name the code owners or code surfaces it documents.
- Each markdown file must link to the relevant implementation files when possible.
- No documentation file may redefine technical behavior already owned by another file; it must link to the owner file instead.
- Cross-references must be one-way by ownership:
  - setup facts live in `getting-started/*`
  - framework and flow decisions live in `architecture/*`
  - settings and env facts live in `configuration/*`
  - engineering rules live in `development/*`
  - release and runtime procedures live in `operations/*`
  - reusable definitions and templates live in `reference/*` and `templates/*`

## 4. File-By-File Alignment Specifications

Every new file must explicitly align to existing code assets and avoid overlapping ownership.

| New file | Must reference or align with | Interface and extension rule | Conflict avoidance protocol |
|---|---|---|---|
| `README.md` | `package.json`, `nuxt.config.ts`, `app/`, `server/` | Summarize only; deep detail must link into `docs/`. | Do not duplicate full env, deployment, or architecture details. |
| `CONTRIBUTING.md` | Repository workflow, `package.json`, future CI rules | Define PR, review, doc-update, and dependency approval process. | Keep behavioral system documentation out of this file. |
| `AGENTS.md` | `CONTRIBUTING.md`, `nuxt.config.ts`, `server/api/**` | Encode mandatory AI and automation rules. | Must mirror contributor rules, not invent separate standards. |
| `CHANGELOG.md` | Release output, deploy history | Track externally visible changes only. | Do not use as an implementation note archive. |
| `.env.example` | `nuxt.config.ts`, `server/utils/api.ts`, `app/plugins/apollo.client.ts` | Include placeholders for every active env variable. | Never include secrets or inferred unused vars. |
| `docs/index.md` | All docs files | Acts as navigation hub only. | Do not store source-of-truth technical rules here. |
| `docs/getting-started/overview.md` | `README.md`, `app/pages/**`, `server/api/**` | Introduce the app and user-facing feature areas. | Avoid repeating install steps. |
| `docs/getting-started/prerequisites.md` | `.nvmrc`, `package.json`, backend/API expectations | Define toolchain and external dependency requirements. | Do not embed project architecture. |
| `docs/getting-started/installation.md` | `.env.example`, `package.json`, `nuxt.config.ts` | Explain clean install and first launch. | Keep troubleshooting details minimal and link out. |
| `docs/getting-started/running-locally.md` | `package.json`, `nuxt.config.ts`, `server/api/**` | Document local runtime flow and validation checkpoints. | Do not duplicate operations deployment rules. |
| `docs/getting-started/project-structure.md` | `app/`, `server/`, `types/`, `shared/`, `i18n/` | Explain what belongs where in this repo. | Do not document runtime behavior already owned by architecture files. |
| `docs/architecture/overview.md` | `app/`, `server/`, `shared/utils/routes.ts` | Define main runtime layers and boundaries. | Must link to more specific architecture subfiles for details. |
| `docs/architecture/rendering-strategy.md` | pages, plugins, middleware, runtime config usage | Define SSR/client/server boundaries and auto-load behavior. | Do not restate plugin config tables from configuration docs. |
| `docs/architecture/routing-and-navigation.md` | `app/pages/**`, `app/middleware/**`, `shared/utils/routes.ts`, i18n config | Document route families and locale-aware navigation. | Single owner for path semantics: this file. |
| `docs/architecture/data-fetching.md` | `app/composables/useApi.ts`, `server/utils/api.ts`, GraphQL search files | Define approved fetch patterns and when to use each. | Prohibit duplicate helper introductions without updating this file. |
| `docs/architecture/state-management.md` | `app/stores/auth.ts`, `app/stores/cart.ts`, auth/cart plugins | Define store boundaries, hydration, persistence, and state ownership. | Global state rules must live only here. |
| `docs/architecture/auth-and-security.md` | auth pages, auth middleware, auth server routes, auth store | Document credential flow, cookie/token handling, route protection. | Avoid duplicating generic route docs. |
| `docs/architecture/api-integration.md` | `server/api/**`, `server/utils/api.ts`, `shared/utils/routes.ts` | Explain internal API proxying to external backend. | All external endpoint mapping ownership stays here. |
| `docs/configuration/overview.md` | `nuxt.config.ts`, `.env.example`, plugins, modules | Provide configuration ownership map. | Do not become a second `nuxt-config.md`. |
| `docs/configuration/nuxt-config.md` | `nuxt.config.ts` | Explain current config blocks and approved change process. | All details must match live config exactly. |
| `docs/configuration/runtime-config.md` | `nuxt.config.ts`, `server/utils/api.ts`, `app/plugins/apollo.client.ts` | Explain public vs private runtime config boundaries. | Must forbid exposing server-only values on client. |
| `docs/configuration/environment-variables.md` | `nuxt.config.ts`, `server/utils/api.ts`, Apollo plugin | Maintain authoritative env table. | No undocumented variable may remain active in code. |
| `docs/configuration/modules.md` | `package.json`, `nuxt.config.ts` | Document purpose and configuration of registered modules. | New dependency cannot be added without updating this file. |
| `docs/configuration/plugins.md` | `app/plugins/**`, plugin injection patterns | Explain plugin order, mode suffixes, and side effects. | Prevent parallel undocumented global helpers. |
| `docs/configuration/feature-flags.md` | future feature flag source only | Reserve governance pattern before flags are added. | Must clearly state current status if no flags exist. |
| `docs/development/coding-standards.md` | existing components, composables, stores, utils | Encode naming, comments, and dependency approval rules. | This is the single owner of repo coding rules. |
| `docs/development/components.md` | `app/components/**` | Define component folder ownership and component API style. | Avoid repeating styling token rules in full. |
| `docs/development/composables.md` | `app/composables/**` | Define composable naming, side effects, and SSR boundaries. | New helper must not overlap `useApi` without review. |
| `docs/development/pages-layouts-middleware.md` | `app/pages/**`, `app/layouts/**`, `app/middleware/**` | Define when to place logic in pages, layouts, or middleware. | Protect against duplicated navigation logic. |
| `docs/development/server-routes.md` | `server/api/**`, `server/utils/api.ts` | Define request proxy, error format, validation, and ownership rules. | Client code must not bypass server routes unless explicitly approved. |
| `docs/development/styling-and-ui.md` | `app/assets/css/**`, `app/components/ui/**`, `@nuxt/ui` | Define style token, CSS organization, and UI library usage. | New styling strategy needs explicit approval and doc update. |
| `docs/development/testing.md` | current scripts, manual verification flow, future framework choice | Define staged validation until automated tests exist. | Must distinguish required checks from future enhancements. |
| `docs/development/accessibility.md` | forms, navigation, search, cart, auth pages | Define accessibility acceptance criteria. | Avoid duplicating SEO ownership. |
| `docs/development/troubleshooting.md` | known setup/runtime pain points | Centralize repeated operational and setup issues. | Must link back to source owner docs for canonical fixes. |
| `docs/operations/build-and-release.md` | `package.json`, deployment flow | Define build artifact and release checklist. | Do not duplicate environment variable tables. |
| `docs/operations/deployment.md` | runtime config, server routes, preview/prod processes | Define deployment steps, smoke tests, rollback. | Single owner for deployment process. |
| `docs/operations/environments.md` | `.env.example`, `nuxt.config.ts`, external API dependencies | Define per-environment differences and owners. | No environment-specific secret values may be written here. |
| `docs/operations/monitoring-and-logging.md` | current server logging middleware, future observability stack | Document logging expectations and evidence collection. | Must note current gaps rather than invent tooling. |
| `docs/operations/performance.md` | CSS assets, search, product routes, image assets | Define performance hotspots and review expectations. | Avoid storing general coding conventions here. |
| `docs/operations/seo.md` | route structure, i18n, head metadata usage | Define metadata, localized URLs, and crawl rules. | Keep runtime metadata ownership clear. |
| `docs/operations/incident-playbook.md` | deployment flow, rollback process, auth/cart critical flows | Define incident roles and urgent validation path. | Do not overload with generic troubleshooting detail. |
| `docs/reference/glossary.md` | domain terms, Nuxt terminology, backend naming | Define shared vocabulary. | Do not duplicate architecture explanations. |
| `docs/reference/decisions.md` | architecture changes, ADRs | Index rationale, not implementation detail. | Every major decision must point to an ADR. |
| `docs/reference/faq.md` | repeated setup or runtime questions | Keep concise answer library. | Answers must cite canonical docs owner pages. |
| `docs/reference/external-services.md` | backend API, GraphQL endpoint, auth providers | Document contract owners and integration summaries. | Do not restate internal server route logic in full. |
| `docs/templates/adr-template.md` | `reference/decisions.md` | Standardize decision authoring. | Must remain template-only. |
| `docs/templates/page-doc-template.md` | page-related docs | Standardize page documentation structure. | No project facts belong in template placeholders. |
| `docs/templates/feature-doc-template.md` | feature documentation work | Standardize feature writeups. | Keep examples generic and reusable. |

## 5. Dependency-Ordered Implementation Timeline

The implementation sequence below is mandatory. No file may be created before the prerequisite files it depends on exist.

### 5.1 Phase Summary

| Phase | Objective | Prerequisites | Deliverables | Measurable milestone |
|---|---|---|---|---|
| Phase 0 | Baseline audit and removal freeze | None | This plan, current-state audit snapshot | 100 percent of existing code surfaces mapped to future docs owners |
| Phase 1 | Foundation files | Phase 0 | `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `.env.example`, `docs/index.md` | Entry-point docs cover setup, rules, env baseline, and links |
| Phase 2 | Onboarding and structure docs | Phase 1 | `docs/getting-started/*`, `docs/reference/glossary.md`, templates | New developer can install and navigate repo without verbal help |
| Phase 3 | Architecture and configuration docs | Phase 2 | `docs/architecture/*`, `docs/configuration/*`, `docs/reference/external-services.md`, `docs/reference/decisions.md` | All runtime, store, route, env, module, and plugin surfaces documented |
| Phase 4 | Development and operations docs | Phase 3 | `docs/development/*`, `docs/operations/*`, `CHANGELOG.md`, `docs/reference/faq.md` | Coding, review, build, deployment, and incident procedures documented |
| Phase 5 | Audit closure and governance | Phase 4 | Removal workflow execution, ADR baseline, docs maintenance cadence | High-confidence unused files removed safely and governance rules enforced |

### 5.2 Prioritized File Creation Order

1. `AGENTS.md`
2. `CONTRIBUTING.md`
3. `.env.example`
4. `README.md`
5. `docs/index.md`
6. `docs/templates/adr-template.md`
7. `docs/templates/page-doc-template.md`
8. `docs/templates/feature-doc-template.md`
9. `docs/getting-started/overview.md`
10. `docs/getting-started/prerequisites.md`
11. `docs/getting-started/installation.md`
12. `docs/getting-started/running-locally.md`
13. `docs/getting-started/project-structure.md`
14. `docs/reference/glossary.md`
15. `docs/configuration/overview.md`
16. `docs/configuration/nuxt-config.md`
17. `docs/configuration/runtime-config.md`
18. `docs/configuration/environment-variables.md`
19. `docs/configuration/modules.md`
20. `docs/configuration/plugins.md`
21. `docs/configuration/feature-flags.md`
22. `docs/architecture/overview.md`
23. `docs/architecture/rendering-strategy.md`
24. `docs/architecture/routing-and-navigation.md`
25. `docs/architecture/data-fetching.md`
26. `docs/architecture/state-management.md`
27. `docs/architecture/auth-and-security.md`
28. `docs/architecture/api-integration.md`
29. `docs/development/coding-standards.md`
30. `docs/development/components.md`
31. `docs/development/composables.md`
32. `docs/development/pages-layouts-middleware.md`
33. `docs/development/server-routes.md`
34. `docs/development/styling-and-ui.md`
35. `docs/development/testing.md`
36. `docs/development/accessibility.md`
37. `docs/development/troubleshooting.md`
38. `docs/reference/external-services.md`
39. `docs/reference/decisions.md`
40. `docs/reference/faq.md`
41. `docs/operations/build-and-release.md`
42. `docs/operations/environments.md`
43. `docs/operations/deployment.md`
44. `docs/operations/monitoring-and-logging.md`
45. `docs/operations/performance.md`
46. `docs/operations/seo.md`
47. `docs/operations/incident-playbook.md`
48. `CHANGELOG.md`

### 5.3 Phase Exit Criteria

| Phase | Exit criteria |
|---|---|
| Phase 1 | Root docs exist, environment variables are enumerated, and contribution rules are enforceable. |
| Phase 2 | Installation has been followed successfully on a clean machine or clean clone. |
| Phase 3 | Each active code surface has one owner doc and no unowned module/plugin/store/env remains. |
| Phase 4 | Deployment and release instructions are executable without oral handoff. |
| Phase 5 | Removal candidates are either deleted safely or explicitly retained with written rationale. |

## 6. Standardized Coding Specification Constraints

These constraints must be applied by every developer and AI agent when implementing the documentation system and any supporting code changes.

### 6.1 Naming Rules

- Markdown filenames under `docs/` must use lowercase kebab-case.
- Vue components must remain PascalCase and stay in feature-scoped folders under `app/components/`.
- Composables must use `useXxx.ts` naming and expose a single clear responsibility.
- Pinia stores must keep short lowercase store ids and single-feature ownership.
- Route handlers under `server/api/` must follow Nuxt HTTP suffix naming such as `.get.ts`, `.post.ts`, `.put.ts`, `.patch.ts`, `.delete.ts`.
- Shared route constants must remain centralized in `shared/utils/routes.ts`; duplicate path literals are prohibited when a reusable route constant already exists.

### 6.2 Function And Variable Naming Rules

- Use `camelCase` for variables and functions.
- Use descriptive domain names over abbreviations unless the abbreviation is a project standard such as `API`.
- Prefix boolean variables with readable state semantics such as `is`, `has`, `can`, or `should`.
- Names must reflect runtime boundary when necessary, for example `serverApi`, `publicConfig`, `authStore`.

### 6.3 Mandatory Comment Policy

- Core modules must begin with a short header comment when the file coordinates a cross-cutting concern.
- Header comments are mandatory for:
  - `shared/utils/routes.ts`
  - any new server proxy helper
  - any plugin that injects global behavior
  - any store handling persisted state or hydration-sensitive logic
- Inline comments are required only for:
  - SSR vs client-only guards
  - multi-step auth/cart merge logic
  - non-obvious runtime config usage
  - temporary compatibility workarounds
- Comment rules:
  - explain why, not obvious syntax
  - keep comments current with behavior
  - remove obsolete comments in the same change set that changes behavior

### 6.4 Third-Party Dependency Approval Workflow

- No new dependency may be introduced without explicit approval in code review.
- Every dependency proposal must document:
  - business reason
  - existing alternative considered
  - bundle/runtime impact
  - SSR compatibility
  - security and maintenance posture
- Approved dependency additions must update:
  - `package.json`
  - `docs/configuration/modules.md` or `docs/development/styling-and-ui.md` as relevant
  - `README.md` if the setup flow changes
- Any dependency that injects global runtime behavior also requires `AGENTS.md` and `CONTRIBUTING.md` rule updates.

## 7. Verification, Review, And Acceptance Criteria

### 7.1 Staged Code Review Checkpoints

| Checkpoint | Trigger | Reviewer focus | Acceptance gate |
|---|---|---|---|
| CR-1 Foundation | After Phase 1 | accuracy of scripts, env list, and governance rules | No setup instruction conflicts with `package.json` or `nuxt.config.ts` |
| CR-2 Structure | After Phase 2 | onboarding clarity and directory ownership | New contributor can identify where to add page, component, route, composable, and store code |
| CR-3 Architecture | After Phase 3 | runtime accuracy, SSR/client boundaries, auth/state correctness | No undocumented active module, plugin, store, or env remains |
| CR-4 Engineering | After Phase 4 | coding rules, server route guidance, deployment runbooks | Reviewers can execute documented verification steps successfully |
| CR-5 Closure | After Phase 5 | audit decisions and removal safety | Each removed file has evidence, backup, and dependency validation record |

### 7.2 Targeted Functional Verification Cases

| Module or file group | Required verification case |
|---|---|
| `README.md` | Follow quick start on a clean clone and reach `npm run dev` successfully. |
| `AGENTS.md` and `CONTRIBUTING.md` | Review a sample code change and verify that required doc-update rules identify all impacted docs. |
| `.env.example` and env docs | Compare all runtime config and `process.env` usages to ensure every active variable is present exactly once. |
| `getting-started/*` | Fresh developer can install dependencies, create local env, and explain repo structure without oral guidance. |
| `architecture/rendering-strategy.md` | Verify SSR/client-only behavior matches `.client.ts` plugins and browser-only logic guards. |
| `architecture/routing-and-navigation.md` | Verify documented routes exist in `app/pages/**` and path constants align with `shared/utils/routes.ts`. |
| `architecture/data-fetching.md` | Verify documented fetch patterns match `useApi.ts`, server proxy helpers, and Apollo search usage. |
| `architecture/state-management.md` | Verify only `auth` and `cart` stores exist currently and persisted token behavior is documented correctly. |
| `architecture/auth-and-security.md` | Verify login, register, email verification, and Google callback flows against current pages, middleware, and server handlers. |
| `architecture/api-integration.md` | Confirm each internal route family maps to an external API route family or local handling path. |
| `configuration/nuxt-config.md` | Verify every documented config key exists in `nuxt.config.ts`. |
| `configuration/runtime-config.md` | Confirm client docs never expose private server runtime fields. |
| `configuration/modules.md` | Verify each module in `nuxt.config.ts` is documented with purpose and operational impact. |
| `configuration/plugins.md` | Verify plugin order and mode suffixes match existing filenames and responsibilities. |
| `development/components.md` | Inspect component folder conventions and ensure examples match real repo structure. |
| `development/composables.md` | Verify all current composables are categorized as active, deprecated, or removal candidates. |
| `development/server-routes.md` | Confirm route method suffixes and folder layout match the real `server/api/` tree. |
| `development/styling-and-ui.md` | Confirm CSS token and component stylesheet descriptions match `app/assets/css/**`. |
| `development/testing.md` | Verify the document clearly separates current manual checks from future automated test strategy. |
| `operations/build-and-release.md` | Run build flow and confirm expected commands and outputs are correct. |
| `operations/deployment.md` | Execute a dry-run deploy checklist and confirm smoke-test steps cover auth, cart, products, orders, search, and profile. |
| `operations/environments.md` | Verify local, staging, and production rules do not contradict runtime config and API dependencies. |
| `operations/seo.md` | Confirm route localization and metadata guidance is compatible with Nuxt and i18n strategy. |
| `reference/external-services.md` | Verify backend API and GraphQL endpoint ownership is accurate. |

### 7.3 Cross-Environment Compatibility Checks

The following compatibility checks are mandatory before phase sign-off:

- Local environment:
  - `npm install`
  - `npm run dev`
  - page navigation across home, product list, product detail, cart, auth, orders, profile, and search
- Build environment:
  - `npm run build`
  - `npm run preview`
  - verify no documented step assumes dev-only behavior
- Configuration boundary:
  - verify `NUXT_PUBLIC_*` values are documented as client-visible
  - verify server-only descriptions never instruct direct client usage
- Localization:
  - confirm English and Arabic localization notes align with current `i18n` config and locale files
- SSR safety:
  - confirm docs warn against unguarded `window`, `document`, and local storage usage outside client-only code paths

## 8. Unused File Audit And Formal Removal Workflow

### 8.1 Audit Method

The audit was performed using four checks:

1. repository tree inspection
2. direct string-reference scan across source files
3. Nuxt convention awareness to exclude auto-loaded files from false positives
4. manual review of suspicious files and duplicate declarations

Important rule:

- A file is only classified as `confirmed removable` when it is non-runtime, explicitly unreferenced, or clearly redundant relative to an active replacement.
- Convention-based Nuxt files such as pages, middleware, plugins, stores, and server handlers are not removable solely because they lack explicit import references.

### 8.2 Confirmed Removable Files

| File | Classification | Evidence | Removal priority |
|---|---|---|---|
| `.dbg/route-double-prefix.env` | Debug artifact | Non-product debug environment file; not part of Nuxt runtime or build flow. | High |
| `.dbg/trae-debug-log-route-double-prefix.ndjson` | Debug artifact | Tool-generated trace log; no application reference. | High |
| `.marscode/deviceInfo.json` | IDE artifact | Editor metadata; not used by app runtime. | High |
| `app/pages/products/.marscode/deviceInfo.json` | IDE artifact | Nested editor metadata file; not part of page routing. | High |
| `project-tree.text` | Snapshot artifact | Static tree dump duplicated by live repository structure; not referenced by the app. | High |
| `search_and_print.sh` | Utility artifact | Manual helper script; not part of package scripts, build, or runtime. | Medium |
| `app/composables/test.ts` | Orphaned experimental helper | Defines `$api` helper but has no consumer; does not match active plugin or composable usage. | High |
| `app/setting.json` | Local editor config artifact | No reference in runtime or build config; not a Nuxt configuration file. | High |
| `app/assets/icons/call.txt` | Orphaned asset artifact | Non-image placeholder file with no source references. | High |
| `app/assets/icons/search.txt` | Orphaned asset artifact | Non-image placeholder file with no source references. | High |
| `app/assets/icons/logo2.png` | Orphaned asset variant | No source references; active logo file is `logo.png`. | Medium |
| `app/assets/icons/logo3.png` | Orphaned asset variant | No source references; active logo file is `logo.png`. | Medium |
| `app/assets/icons/logo4.png` | Orphaned asset variant | No source references; active logo file is `logo.png`. | Medium |
| `app/assets/icons/logo4 (Copy).png` | Duplicate artifact | Duplicate-named variant; no source references. | Medium |
| `app/assets/icons/logo5.png` | Orphaned asset variant | No source references; active logo file is `logo.png`. | Medium |

### 8.3 Review-Required Duplicate Or Redundant Candidates

These files are not approved for immediate deletion, but they require explicit owner review because they look redundant or incomplete.

| File | Audit concern | Required validation before deletion |
|---|---|---|
| `app/types/ofetch.d.ts` | Extends `ofetch` with `showError` and `successMessage`; may supersede the root version. | Verify TypeScript include path and whether root declarations are still needed. |
| `types/ofetch.d.ts` | Partial duplicate of `app/types/ofetch.d.ts`; risk of conflicting declaration ownership. | Consolidate into one canonical declaration file. |
| `types/filters.d.ts` | Empty file containing only `export {}`. | Confirm no tooling relies on its presence, then remove if unnecessary. |
| `types/generated.d.ts` | Mostly commented placeholder content, no obvious live ownership. | Confirm no code generation process targets this file. |

### 8.4 Explicitly Retained Despite Low Direct Reference Count

The following categories must not be removed based only on import scan results:

- `app/pages/**`
- `app/layouts/**`
- `app/middleware/**`
- `app/plugins/**`
- `app/stores/**`
- `server/api/**`
- `server/middleware/**`
- `public/favicon.ico`
- `public/robots.txt`

Reason:

- Nuxt auto-loads these by convention, or they are runtime web assets expected by browsers and crawlers.

### 8.5 Removal Workflow

1. Create a backup branch named `chore/backup-unused-files-<date>`.
2. Export a backup archive of all `confirmed removable` files to `backup/unused-files-<date>.tar.gz` outside the deploy artifact path.
3. Re-run dependency validation:
   - string-reference scan across source
   - `npm run build`
   - local smoke navigation
4. Delete only `confirmed removable` files.
5. Rebuild and verify:
   - home page
   - auth pages
   - product list and product detail
   - cart and orders pages
   - search flow
6. For each `review-required` candidate:
   - assign owner
   - document keep/remove decision in `docs/reference/decisions.md`
   - delete only after owner approval
7. Record every deletion in `CHANGELOG.md` if it affects contributor workflow or repository structure.

### 8.6 Removal Acceptance Criteria

- No build regression after deletion.
- No TypeScript or runtime error attributable to deleted files.
- No missing asset error in browser console for retained pages.
- No deleted file is later discovered to be auto-loaded by Nuxt or a toolchain step.
- Backup archive is restorable and tested for at least one sampled file.

## 9. Rules That Every Developer And AI Must Follow

- Update documentation in the same change set whenever modifying architecture, env vars, routes, stores, modules, plugins, deployment flow, or external integrations.
- Do not invent undocumented behavior; verify against live code before writing.
- Do not expose secrets, tokens, private keys, or production values in code, docs, screenshots, or `.env.example`.
- Keep `.env.example` and `docs/configuration/environment-variables.md` synchronized.
- Preserve Nuxt terminology exactly: `pages`, `layouts`, `middleware`, `plugins`, `composables`, `server/api`, `runtimeConfig`.
- Document whether behavior runs on client, server, or both.
- Do not add a new store, plugin, module, or route family without updating its owner documentation file.
- Do not create overlapping helpers when an approved shared utility already exists.
- Mark assumptions clearly; do not present guesses as facts.
- Prefer links between owner documents over duplicating long explanations.
- Add an ADR entry for every major architectural or governance decision.

## 10. Phase Success Metrics

| Phase | Metric | Target |
|---|---|---|
| Phase 1 | Root governance files completed | 5 of 5 foundation files approved |
| Phase 2 | Onboarding completion rate | New contributor reaches running app with zero undocumented blockers |
| Phase 3 | Runtime documentation coverage | 100 percent of active modules, plugins, stores, and env vars documented |
| Phase 4 | Operational readiness | Build and deployment checklists executed successfully end-to-end |
| Phase 5 | Audit closure | 100 percent of confirmed removable files deleted or formally retained with rationale |

## 11. Immediate Execution Recommendation

Start with Phase 1 and create the following files first:

1. `AGENTS.md`
2. `CONTRIBUTING.md`
3. `.env.example`
4. `README.md`
5. `docs/index.md`

Reason:

- These files establish governance, onboarding, and env ownership, which every downstream doc depends on.
- They also reduce the risk of future documentation drift while the rest of the structure is being built.
