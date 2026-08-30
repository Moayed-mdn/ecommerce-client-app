# Storefront Architecture: System Routes And Storefront Runtime

## Note On This Document's History

This document previously described a "migration strategy" with a legacy-vs-new dual runtime, phased traffic cutover, canary rollout, and rollback plan. That framing described a migration that never happened — this project has been in development the whole time and has never shipped to production. There is no legacy system being replaced. Runtime is the architecture, not a feature being rolled out. This document now describes the actual, current design.

## The Two Route Kinds

Nuxt's router gives file-based routes precedence over the catch-all. This project uses that directly — not as a migration mechanism, but as the permanent split between two kinds of routes:

- **System Routes** — `app/pages/login.vue`, `cart.vue`, `checkout/**`, `orders/**`, `profile.vue`, etc. Fixed business/system pages, hardcoded Vue.
- **Storefront Runtime Routes** — any path with no matching file goes to `app/pages/[...slug].vue`, which resolves the route against the Laravel backend and renders CMS-defined sections.

See `docs/development/pages-layouts-middleware.md` for the full current page/layout inventory, and `docs/architecture/storefront-shell.md` for how both route kinds reach the shared shell.

```mermaid
graph TD
    User[User Request] --> NuxtRouter[Nuxt Router]
    NuxtRouter -->|File exists| System[System Route, e.g. app/pages/login.vue]
    NuxtRouter -->|No file match| Runtime[[...slug].vue]

    subgraph "Storefront Runtime"
        Runtime --> Resolver[Route Resolver]
        Resolver --> CMS[Laravel CMS]
        CMS --> Engine[Section Rendering Engine]
        Engine --> Registry[Component Registry]
    end

    subgraph "Shared Infrastructure"
        System --> StorefrontCore[Storefront Core]
        Runtime --> StorefrontCore
        StorefrontCore --> API[Tenant-aware API]
    end
```

## Tenant Resolution

Every request resolves to a tenant by hostname in `server/middleware/01.tenant.ts` before anything else runs. There is no rollout gate, kill switch, or tenant allowlist — a request either resolves to a valid, active tenant or it 404s as `runtime.tenant_not_found`.

## Preview

Preview (`?preview=1&previewToken=...`) is a real CMS feature for merchants to see unpublished changes — unrelated to the removed rollout system. It stays as-is.
