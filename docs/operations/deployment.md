# Deployment

## Purpose

This document records the current deployment reality for the JustShop frontend and the minimum deployment procedure that can be supported from the repository itself.

Code surfaces this file aligns with:

- `package.json`
- `nuxt.config.ts`
- `.env.example`
- `server/api/**`
- `public/robots.txt`

## Current Repository Reality

The live repo does not currently include:

- hosting-platform configuration
- container definitions
- `.github` deployment workflows
- infrastructure-as-code files

That means the exact production deployment target is external to the repository. This document therefore captures the repo-backed deployment prerequisites and smoke checks, not platform-specific commands that are not present in code.

## Minimum Deployment Prerequisites

- correct environment values for API base, GraphQL URL, and site URL
- installed dependencies
- successful `npm run build`
- a deployment environment that can serve the built Nuxt application

## Minimum Repo-Backed Deployment Procedure

1. install dependencies
2. provide production or staging env values
3. run `npm run build`
4. deploy the built application using the hosting platform’s existing process
5. run post-deploy smoke checks

## Post-Deploy Smoke Checks

- homepage loads
- runtime CMS routes render through the catch-all page (`app/pages/[...slug].vue`) for every tenant
- product list and product detail pages load
- search page and autocomplete work
- cart works for a guest session
- login and register screens load correctly
- profile is reachable for an authenticated user
- orders list and order detail work for an authenticated user
- guest order tracking works
- checkout return pages render correctly

Also run the repo-backed smoke script:

- `npm run runtime:smoke`

## Rollback Framing

The repository does not define a rollback script or platform workflow.

Current rollback expectation:

- revert to the last known-good deployment using the hosting platform’s external rollback process
- re-run the smoke checks above
- capture the failure symptoms and affected flows

## Current Gaps

- No deployment automation is visible in the repo.
- No platform-specific start, restart, or rollback contract is encoded here.
- Deployment evidence must be gathered manually.

## Change Rules

- Update this document if deployment automation, platform config, or rollback procedures become part of the repository.
- Do not add speculative platform steps here unless the repo gains code-backed deployment ownership.
