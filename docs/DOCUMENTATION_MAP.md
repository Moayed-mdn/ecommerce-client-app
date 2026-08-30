# 📚 JustShop Frontend - Documentation Map

**Complete visual guide to all documentation**  
**Last Updated**: June 7, 2026

---

## 🎯 Quick Navigation by Role

### 👨‍💻 New Developer
```
START → 00-START-HERE.md
     → getting-started/overview.md
     → development/coding-standards.md
     → architecture/overview.md
     → Your first task!
```

### 🤖 Working with AI
```
START → AI_PROMPT_TEMPLATE.md (copy-paste)
     → AI_RULES_ENFORCEMENT_SYSTEM.md
     → AI_COLLABORATION_CHECKLIST.md (verify)
     → Get work done!
```

### 🏗️ Understanding Architecture
```
START → architecture/overview.md
     → architecture/rendering-strategy.md
     → architecture/routing-and-navigation.md
     → architecture/data-fetching.md
```

### 🐛 Fixing Bugs
```
START → development/troubleshooting.md
     → debugging/ (find your issue)
     → fixes/ (see similar fixes)
     → Fix it!
```

### ✨ Adding Features
```
START → development/coding-standards.md
     → development/components.md
     → architecture/ (understand system)
     → Implement!
```

---

## 📊 Complete Documentation Tree

```
docs/
│
├── 00-START-HERE.md ⭐⭐⭐
│   └── Your absolute entry point
│
├── index.md ⭐⭐⭐
│   └── Complete documentation hub
│
├── DOCUMENTATION_MAP.md ⭐⭐
│   └── This file - visual navigation guide
│
├── 🤖 AI GOVERNANCE (6 files)
│   ├── AI_PROMPT_TEMPLATE.md ⭐⭐⭐
│   │   └── Copy-paste template for every AI task
│   ├── AI_RULES_ENFORCEMENT_SYSTEM.md ⭐⭐⭐
│   │   └── Make AI follow architecture rules
│   ├── AI_DOCUMENTATION_RULES.md ⭐⭐
│   │   └── Prevent documentation chaos
│   ├── AI_COLLABORATION_CHECKLIST.md ⭐⭐
│   │   └── Systematic verification checklist
│   └── ai-session-handoff-prompt.md
│       └── Session continuity prompt
│
├── 📖 GETTING STARTED/ (5 files) ⭐⭐⭐
│   ├── overview.md ⭐⭐⭐
│   │   └── Project introduction
│   ├── prerequisites.md ⭐⭐
│   │   └── Tooling requirements
│   ├── installation.md ⭐⭐
│   │   └── Installation steps
│   ├── running-locally.md ⭐⭐⭐
│   │   └── Local setup and smoke checks
│   └── project-structure.md ⭐⭐
│       └── Repository structure
│
├── 🏗️ ARCHITECTURE/ (20 files) ⭐⭐
│   ├── overview.md ⭐⭐⭐
│   │   └── Top-level architecture
│   ├── rendering-strategy.md ⭐⭐⭐
│   │   └── SSR, client-only, hydration
│   ├── routing-and-navigation.md ⭐⭐⭐
│   │   └── Route families, middleware
│   ├── data-fetching.md ⭐⭐⭐
│   │   └── REST proxy and GraphQL
│   ├── state-management.md ⭐⭐
│   │   └── Pinia stores and persistence
│   ├── auth-and-security.md ⭐⭐
│   │   └── Auth flows and protection
│   ├── api-integration.md ⭐⭐
│   │   └── Backend integration model
│   ├── storefront-routes.md ⭐⭐
│   │   └── Canonical storefront paths
│   ├── storefront-shell.md ⭐
│   │   └── Unified shell layouts
│   ├── theme-system-architecture.md ⭐
│   │   └── Theme system design
│   ├── cms-rendering-engine.md
│   │   └── CMS rendering
│   ├── storefront-core-design.md
│   │   └── Core storefront design
│   ├── storefront-migration-strategy.md
│   │   └── System routes vs storefront runtime routes (historical note: no longer a migration plan)
│   ├── storefront-runtime-contracts.md
│   │   └── Runtime contract hub
│   ├── storefront-runtime-api-contract-specification-v1.md
│   │   └── API contract specification
│   ├── storefront-runtime-dto-mapping-specification-v1.md
│   │   └── DTO mapping rules
│   └── [other architecture docs]
│
├── 💻 DEVELOPMENT/ (11 files) ⭐⭐⭐
│   ├── AI_AGENT_RULES.md ⭐⭐⭐
│   │   └── Core development principles
│   ├── coding-standards.md ⭐⭐⭐
│   │   └── Coding, naming, SSR rules
│   ├── components.md ⭐⭐⭐
│   │   └── Component patterns and ownership
│   ├── composables.md ⭐⭐
│   │   └── Composable responsibilities
│   ├── pages-layouts-middleware.md ⭐⭐
│   │   └── Page, layout, middleware rules
│   ├── server-routes.md ⭐⭐
│   │   └── Nitro server conventions
│   ├── styling-and-ui.md ⭐⭐
│   │   └── Styling stack and UI rules
│   ├── testing.md ⭐
│   │   └── Testing standards
│   ├── accessibility.md ⭐
│   │   └── Accessibility expectations
│   ├── troubleshooting.md ⭐⭐
│   │   └── Setup and runtime troubleshooting
│   └── storefront-runtime-contract-test-matrix-v1.md
│       └── Runtime contract testing
│
├── ⚙️ CONFIGURATION/ (6 files) ⭐⭐
│   ├── overview.md ⭐⭐
│   │   └── Configuration ownership
│   ├── nuxt-config.md ⭐⭐⭐
│   │   └── nuxt.config.ts reference
│   ├── runtime-config.md ⭐⭐
│   │   └── Runtime config boundaries
│   ├── environment-variables.md ⭐⭐⭐
│   │   └── Env variable catalog
│   ├── modules.md ⭐
│   │   └── Nuxt module inventory
│   └── plugins.md ⭐⭐
│       └── Plugin inventory and order
│
├── 🔧 OPERATIONS/ (13 files) ⭐⭐
│   ├── build-and-release.md ⭐⭐
│   │   └── Build commands and releases
│   ├── environments.md ⭐⭐
│   │   └── Environment model
│   ├── deployment.md ⭐⭐⭐
│   │   └── Deployment guide
│   ├── monitoring-and-logging.md ⭐⭐
│   │   └── Logging and monitoring
│   ├── performance.md ⭐⭐
│   │   └── Performance optimization
│   ├── seo.md ⭐⭐
│   │   └── SEO metadata and rules
│   ├── incident-playbook.md ⭐
│   │   └── Incident triage
│   ├── storefront-runtime-logging-specification-v1.md
│   ├── storefront-runtime-cache-key-standard-v1.md
│   ├── storefront-runtime-seo-contract-specification-v1.md
│   └── storefront-runtime-preview-security-specification-v1.md
│
├── 📋 REFERENCE/ (11 files) ⭐
│   ├── glossary.md ⭐⭐
│   │   └── Technical terminology
│   ├── external-services.md ⭐
│   │   └── External integrations
│   ├── decisions.md ⭐
│   │   └── Architecture decision index
│   ├── faq.md ⭐⭐
│   │   └── Frequently asked questions
│   ├── adr-001-request-helper-consolidation.md
│   ├── adr-002-api-base-runtime-boundary.md
│   ├── adr-003-google-callback-owner.md
│   ├── adr-004-orders-protection-policy.md
│   ├── adr-005-theme-behavior-roadmap.md
│   ├── adr-006-naming-normalization.md
│   └── adr-007-storefront-runtime-contract-first-boundary.md
│
├── 🐛 DEBUGGING/ (3 files)
│   ├── debug-nuxt-composable-error.md
│   ├── debug-storefront-redirect-loop.md
│   └── debug-storefront-tenant-domain.md
│
├── 🔨 FIXES/ (5 files)
│   ├── COMPLETE_DOMAIN_MISMATCH_SOLUTION.md
│   ├── COMPLETE_FIX_SUMMARY.md
│   ├── GRADIENT_HERO_BANNER_FIX.md
│   ├── SOLUTION.md
│   └── SSR_HYDRATION_FIX.md
│
├── 🧪 TESTING/ (2+ files)
│   ├── TEST_SSR_HYDRATION.md
│   └── playwright/
│       └── [Playwright test docs]
│
├── 🎨 THEME SYSTEM/ (2 files)
│   ├── THEME_HEADER_USAGE.md
│   └── THEME_INTEGRATION_README.md
│
├── 🔗 INTEGRATION/ (2 files)
│   ├── STOREFRONT_INTEGRATION_STATUS.md
│   └── STOREFRONT_THEME_INTEGRATION_COMPLETE.md
│
├── 📅 PLANNING/ (2 files)
│   ├── STOREFRONT_INTEGRATION_PLAN.md
│   └── STOREFRONT_THEME_SYSTEM_PLAN.md
│
├── 🏗️ REFACTORING PLAN/ (13+ files)
│   ├── README.md ⭐⭐
│   │   └── Refactoring program hub
│   ├── shopify-like-storefront-master-plan.md ⭐⭐
│   │   └── North star execution plan
│   ├── PLAN-SUMMARY.md ⭐⭐⭐
│   │   └── Plain-language summary of what is actually built (now the authoritative doc — the two multi-phase execution plans that used to sit above it were removed for encoding mandatory rollout/kill-switch complexity that doesn't apply to a pre-launch product)
│   ├── wave1-canonical-route-recovery.md
│   ├── storefront-phase-1-execution-backlog.md
│   ├── storefront-runtime-phase-2-3-implementation-stories.md
│   ├── storefront-runtime-phase-6-certification.md
│   ├── storefront-certification-report.md
│   ├── audits/
│   │   └── storefront-commerce-consolidation-audit.md
│   └── archive/
│
├── 📊 RUNTIME ANALYSIS/ (15 files)
│   ├── codebase-violations.md
│   ├── component-fetching-audit.md
│   ├── current-api-flow.md
│   ├── current-cache-risks.md
│   ├── current-rendering-flow.md
│   ├── current-routing-flow.md
│   ├── current-seo-flow.md
│   ├── current-tenant-risks.md
│   ├── final-platform-audit.md
│   ├── missing-requirements.md
│   ├── phase1-completion-report.md
│   ├── phase2-completion-report.md
│   ├── phase3-completion-report.md
│   ├── phase4-completion-report.md
│   └── platform-readiness-decision.md
│
├── 📝 SESSIONS/ (9 files)
│   ├── SESSION_13_COMPLETE.md
│   ├── SESSION_14_COMPLETE.md
│   ├── SESSION_15_COMPLETE.md
│   ├── SESSION_16_COMPLETE.md
│   ├── SESSION_16_SUMMARY.md
│   ├── SESSION_DOMAIN_MISMATCH_FIX.md
│   ├── SESSION_DOMAIN_MISMATCH_SUMMARY.md
│   ├── TEST_SESSION_13.md
│   └── GIT_COMMIT_SESSION_16.md
│
├── 📄 REPORTS/ (1 file)
│   └── BEFORE_AFTER_VISUAL.md
│
├── 🔄 BACKEND/ (1 file)
│   └── laravel-cms-architecture.md
│
├── ⚡ QUICK REFERENCE/ (3 files) ⭐⭐
│   ├── QUICK_FIX_REFERENCE.md ⭐
│   ├── COMMON_TASKS_GUIDE.md ⭐⭐⭐ (NEW!)
│   └── DOCUMENTATION_QUICK_LINKS.md ⭐⭐⭐ (NEW!)
│
└── 📝 TEMPLATES/ (3 files)
    ├── adr-template.md
    ├── feature-doc-template.md
    └── page-doc-template.md
```

---

## 🎯 Documentation by Task

### Task: Add a New Feature
```
1. READ: development/coding-standards.md
2. READ: development/components.md
3. READ: architecture/data-fetching.md
4. USE: AI_PROMPT_TEMPLATE.md
5. CHECK: architecture/ for patterns
6. IMPLEMENT: Following standards
7. VERIFY: AI_COLLABORATION_CHECKLIST.md
```

### Task: Fix a Bug
```
1. CHECK: development/troubleshooting.md
2. CHECK: debugging/ (similar issues)
3. CHECK: fixes/ (similar fixes)
4. READ: Relevant architecture docs
5. USE: AI_PROMPT_TEMPLATE.md
6. FIX: Following standards
7. VERIFY: Tests pass
```

### Task: Understand System
```
1. READ: architecture/overview.md
2. READ: architecture/rendering-strategy.md
3. READ: architecture/routing-and-navigation.md
4. READ: architecture/data-fetching.md
5. EXPLORE: Code with context
```

### Task: Configure Environment
```
1. READ: configuration/environment-variables.md
2. READ: configuration/runtime-config.md
3. CHECK: .env.example
4. UPDATE: Your .env file
5. VERIFY: npm run dev works
```

### Task: Deploy
```
1. READ: operations/deployment.md
2. CHECK: operations/build-and-release.md
3. BUILD: npm run build
4. VERIFY: Production build
5. DEPLOY: Follow checklist
```

---

## 📈 Documentation Priority Levels

### ⭐⭐⭐ Critical (Must Read)
- 00-START-HERE.md
- index.md (documentation hub)
- AI_PROMPT_TEMPLATE.md
- AI_RULES_ENFORCEMENT_SYSTEM.md
- getting-started/overview.md
- getting-started/running-locally.md
- development/coding-standards.md
- development/components.md
- architecture/overview.md
- architecture/rendering-strategy.md
- architecture/routing-and-navigation.md
- architecture/data-fetching.md
- configuration/nuxt-config.md
- configuration/environment-variables.md

### ⭐⭐ Important (Should Read)
- All other development/
- All other architecture/
- All configuration/
- operations/deployment.md
- operations/monitoring-and-logging.md
- reference/glossary.md
- reference/faq.md
- refactoring-plan/README.md
- quick-reference/ (all)

### ⭐ Reference (Read as Needed)
- debugging/
- fixes/
- testing/
- sessions/
- runtime-analysis/
- refactoring-plan/ (detailed plans)
- All other categories

---

## 🔍 Find Documentation Fast

### By Topic

| Topic | Location |
|-------|----------|
| Getting Started | getting-started/ |
| Coding Standards | development/coding-standards.md |
| Components | development/components.md |
| Composables | development/composables.md |
| Server Routes | development/server-routes.md |
| SSR/Rendering | architecture/rendering-strategy.md |
| Routing | architecture/routing-and-navigation.md |
| Data Fetching | architecture/data-fetching.md |
| State Management | architecture/state-management.md |
| Authentication | architecture/auth-and-security.md |
| API Integration | architecture/api-integration.md |
| Environment Variables | configuration/environment-variables.md |
| Nuxt Config | configuration/nuxt-config.md |
| Deployment | operations/deployment.md |
| Performance | operations/performance.md |
| SEO | operations/seo.md |
| Troubleshooting | development/troubleshooting.md |
| AI Collaboration | AI_*.md files |
| Refactoring | refactoring-plan/ |

---

## 🎓 Learning Paths

### Path 1: Quick Start (1 Day)
```
Hour 1: 00-START-HERE.md
Hour 2: getting-started/overview.md
Hour 3: getting-started/running-locally.md
Hour 4: development/coding-standards.md
Hour 5-8: Build first feature
```

### Path 2: Deep Dive (1 Week)
```
Day 1: All getting-started/
Day 2: All development/
Day 3: All architecture/
Day 4: All configuration/
Day 5: Practice with real tasks
```

### Path 3: Architecture Mastery (2 Weeks)
```
Week 1: All architecture + all development
Week 2: All operations + refactoring-plan + practice
```

---

## 📊 Documentation Statistics

| Category | Files | Priority |
|----------|-------|----------|
| AI Governance | 6 | ⭐⭐⭐ |
| Getting Started | 5 | ⭐⭐⭐ |
| Architecture | 20 | ⭐⭐ |
| Development | 11 | ⭐⭐⭐ |
| Configuration | 7 | ⭐⭐ |
| Operations | 13 | ⭐⭐ |
| Reference | 11 | ⭐ |
| Debugging | 3 | ⭐⭐ |
| Fixes | 5 | ⭐ |
| Testing | 2+ | ⭐ |
| Theme System | 2 | ⭐ |
| Integration | 2 | ⭐ |
| Planning | 2 | ⭐ |
| Refactoring Plan | 25+ | ⭐⭐ |
| Runtime Analysis | 15 | ⭐ |
| Sessions | 9 | ⭐ |
| Reports | 1 | ⭐ |
| Backend | 1 | ⭐ |
| Quick Reference | 3 | ⭐⭐⭐ |
| Templates | 3 | ⭐ |

**Total**: 150+ documentation files organized into 20 categories

---

## ✅ Documentation Health

### Well-Organized ✅
- [x] Clear entry points
- [x] Comprehensive hub (index.md)
- [x] Logical categories (20 folders)
- [x] AI governance system
- [x] Standards documentation
- [x] Architecture documentation
- [x] Navigation aids

### Areas of Excellence ✅
- [x] AI collaboration system
- [x] Detailed architecture docs
- [x] Comprehensive refactoring plan
- [x] Runtime analysis documentation
- [x] Phase-based organization
- [x] Template system

---

## 🚀 Quick Commands

```bash
# Documentation Search
grep -r "keyword" docs/

# Find by filename
find docs/ -name "*keyword*"

# Count files
find docs/ -type f -name "*.md" | wc -l

# List categories
ls -1 docs/
```

---

## 💡 Pro Tips

### Bookmark These (Top 5)
1. 📖 00-START-HERE.md
2. 🤖 AI_PROMPT_TEMPLATE.md
3. ⚡ quick-reference/COMMON_TASKS_GUIDE.md
4. 📋 index.md
5. 🗺️ This file (DOCUMENTATION_MAP.md)

### Keep Open While Coding
- quick-reference/COMMON_TASKS_GUIDE.md
- development/coding-standards.md
- development/components.md

### Use AI Template Every Time
- Copy: AI_PROMPT_TEMPLATE.md
- Paste: Into every AI conversation
- Result: Clean, compliant code

---

## 📞 Still Can't Find It?

### Try This Process:
1. Check this DOCUMENTATION_MAP.md (you are here)
2. Check index.md (complete hub)
3. Search by keyword in docs/
4. Check category folders
5. Browse refactoring-plan/ for transformation work
6. Ask team or AI with context

---

**Created**: June 7, 2026  
**Purpose**: Visual navigation for 150+ documentation files  
**Audience**: Everyone (developers, AI users, contributors)  
**Status**: Complete navigation guide

**→ Back to: [index.md](./index.md) | [00-START-HERE.md](./00-START-HERE.md)**
