# Storefront Shell

## Owner

- Shell wrapper: `app/components/shell/StorefrontShell.vue`
- Header: `app/components/shell/StorefrontShellHeader.vue`
- Footer: `app/components/shell/StorefrontShellFooter.vue`
- Visibility model: `app/composables/useStorefrontShell.ts`

## How a page actually reaches the shell

There are exactly two paths into `StorefrontShell`:

1. **`layout: 'system'`** (`app/layouts/system.vue`) — used by every
   fixed-route page: `login`, `register`, `forgot-password`,
   `reset-password`, `verify-email`, `cart`, `checkout/*`, `orders/*`,
   `profile`, `categories`, `auth/google/callback`.
   `useSystemPageTemplate()` fetches a backend template for the page's
   detected type, but only to read **chrome** sections
   (`header`, `announcement_bar`, `footer`, `copyright_bar`) and feed
   them to the shell via `provide('layoutOrder', ...)` /
   `provide('chromeSections', ...)`. The page body itself is always
   the page component's own hardcoded template — there is no
   backend-driven body content for system pages.

2. **`layout: false` + `RuntimeLayoutManager`**
   (`src/core/rendering/LayoutManager.vue`, auto-registered with the
   `Runtime` prefix) — used only by `app/pages/[...slug].vue`, the
   catch-all for CMS/tenant-defined pages. It resolves the route via
   `useRouteResolver`/`useStorefrontPayload`, then renders
   `RuntimeLayoutManager` → `StorefrontShell variant="runtime-bridge"`,
   with `RuntimeSectionRenderer` filling the `content` slot from
   backend-defined sections (see `src/core/rendering/registry.ts` for
   the section-type → component map).

`app/layouts/default.vue` (`StorefrontShell variant="full"`) is the
implicit Nuxt fallback layout — it's live because it applies to any
page with no explicit `layout:` (currently the merchant pages) and is
also set explicitly by `search.vue`.

There is no `auth`, `catalog`, `product`, `marketing`, `runtime`,
`runtime-default`, or `storefront` layout anymore — those were
either unreferenced duplicates of the two paths above, or (for
`catalog`/`product`/`marketing`/`runtime`) four files that rendered
identical markup and were collapsed into `LayoutManager.vue` directly.

## Shell variants

| Variant | Set by | Effect |
|---|---|---|
| `full` | `system.vue`, `default.vue` | topbar, search, footer all shown |
| `runtime-bridge` | `LayoutManager.vue` | commerce affordances on CMS-driven pages |
| `minimal` / `auth-template` | not currently set by any live layout | hides topbar/search; kept in `useStorefrontShell.ts` in case a future auth-specific shell is reintroduced |

## SSR

Shell visibility uses `provide`/`inject` from the active layout
(SSR-safe). `StorefrontShell` provides its own `StorefrontShellConfig`
based on its `variant` prop — layouts should NOT also call
`provideStorefrontShell()` themselves, since `StorefrontShell` is
always the layout's direct child and would just override it (this
used to happen in `system.vue`; removed as a no-op).

Cart and auth UI remain `ClientOnly` where required inside header
components.
