# ADR-008: Critical Correctness Patterns (August 2026 Audit)

**Date:** 2026-08-27  
**Status:** Accepted  
**Context:** Full application audit revealed patterns that have caused production crashes and data-mixing bugs in this codebase  
**Decision Owner:** Development Team  
**Related:** See `docs/fixes/COMPOSABLE_CONTEXT_FIX.md`, `docs/fixes/REACTIVE_CACHE_KEY_FIX.md`, `docs/fixes/LANGUAGE_SWITCHING_FIX_COMPLETE.md`

## Context

This codebase experienced multiple production-breaking bugs of the same structural class:
1. **Locale data mixing** - EN/AR content served to wrong locale after language switch
2. **Composable context crashes** - "Must be called at the top of a setup function" errors after locale switches or manual refreshes
3. **Stale locale detection** - Server-side code reading stale cookie instead of URL path

An independent audit (August 2026) identified three classes of bugs that have recurred or nearly recurred multiple times, indicating these are patterns the team struggles to maintain. This ADR documents the mandatory patterns to prevent regression.

## Decision

### 1. Locale Detection: URL Path is Source of Truth

**Rule:** All server-side locale detection MUST prioritize URL path over the `i18n_redirected` cookie.

**Why:** The `i18n_redirected` cookie is only updated by `@nuxtjs/i18n`'s browser-language detection on the root path (`redirectOn: 'root'` in `nuxt.config.ts`). It is NOT updated when users switch language via the in-app switcher. After the first manual language switch, the cookie remains stale for the entire session, causing server-side utilities to serve wrong-locale headers/data to the backend.

**Correct Pattern:**
```typescript
// ✅ CORRECT - server/utils/locale.ts
export const getEventLocale = (event: H3Event): string => {
  // 1. Check URL path FIRST (always correct)
  const path = event.path || ''
  for (const code of PREFIXED_LOCALES) {
    if (path === `/${code}` || path.startsWith(`/${code}/`)) {
      return code
    }
  }

  // 2. Check explicit header
  const explicitHeader = getHeader(event, 'x-storefront-locale')
  if (explicitHeader) return explicitHeader

  // 3. Check Accept-Language
  const acceptLanguage = getHeader(event, 'accept-language')
  if (acceptLanguage?.toLowerCase().startsWith('ar')) return 'ar'

  // 4. Cookie is LAST RESORT ONLY
  const cookieLocale = getCookie(event, 'i18n_redirected')
  if (cookieLocale) return cookieLocale

  return DEFAULT_LOCALE
}
```

**Reference Implementation:** `server/utils/locale.ts`

---

### 2. CMS Links: Always Use `useCmsLink()` / `<CmsLink>`

**Rule:** All CMS-authored or merchant-entered hrefs MUST go through `useCmsLink()` composable or `<CmsLink>` component. Never inline `startsWith('/en/')` or `startsWith('/ar/')` checks.

**Why:** Merchants can type `/en/shop` or `/shop` into a CMS text field. Nothing stops them. Without normalization, this produces double-prefixed routes like `/ar/en/shop` when rendered in Arabic locale, breaking navigation.

**Correct Pattern:**
```typescript
// ✅ CORRECT
import { useCmsLink } from '~/composables/useCmsLink'
const { resolveHref } = useCmsLink()
const href = resolveHref(props.item.url)  // Handles any shape safely
```

```vue
<!-- ✅ CORRECT -->
<CmsLink :href="item.url">{{ item.label }}</CmsLink>
```

**Incorrect Pattern:**
```typescript
// ❌ WRONG - brittle, doesn't handle all merchant inputs
const href = item.url.startsWith('/en/') || item.url.startsWith('/ar/')
  ? item.url.substring(4)
  : item.url
```

**Reference Implementation:** `app/composables/useCmsLink.ts`, `app/components/cms/CmsLink.vue`

---

### 3. Single Source of Truth for Locale List

**Rule:** All locale arrays MUST derive from `STOREFRONT_RUNTIME_SUPPORTED_LOCALES` in `src/core/runtime/contracts/constants.ts`. Never hardcode `['en', 'ar']` inline.

**Why:** When a locale is added or removed, there should be ONE place to update, not seven scattered hardcoded arrays across different files.

**Correct Pattern:**
```typescript
// ✅ CORRECT
import { STOREFRONT_RUNTIME_SUPPORTED_LOCALES } from '~~/src/core/runtime/contracts/constants'

const localePrefix = new Set(STOREFRONT_RUNTIME_SUPPORTED_LOCALES)
if ([...STOREFRONT_RUNTIME_SUPPORTED_LOCALES].includes(pathParts[0])) {
  // ...
}
```

**Incorrect Pattern:**
```typescript
// ❌ WRONG - hardcoded duplication
const localePrefix = new Set(['en', 'ar'])
if (['en', 'ar'].includes(pathParts[0])) {
  // ...
}
```

**Reference Implementation:** `src/core/runtime/contracts/constants.ts`

**Note:** `server/utils/locale.ts`'s `PREFIXED_LOCALES` is a derived subset (non-default locales only) for the `prefix_except_default` i18n strategy. It correctly derives from the constant.

---

### 4. Composable Context Safety: Capture Refs in Setup, Read `.value` Later

**Rule:** When a composable like `useI18n()` or `useStorefrontContext()` is called from inside a function that will be invoked later (an async callback, a reactive key getter for `useAsyncData`, an interceptor, a `setContext` handler), the composable MUST be called once, synchronously, when the enclosing composable/setup runs. The later-invoked function MUST only read `.value` off the already-captured reference.

**Why:** Vue composables that need an active component instance (like `useI18n()` from vue-i18n) throw "Must be called at the top of a setup function" when called outside a valid setup context. This happens when:
- `useAsyncData`'s reactive key function re-evaluates after a locale switch or manual `.refresh()`
- Apollo's `setContext` callback fires during a GraphQL request
- $fetch's `onRequest` interceptor fires during an API call

At those moments, there may be no active component instance, so calling the composable again fails.

**Correct Pattern:**
```typescript
// ✅ CORRECT - src/core/api/headers.ts (reference implementation)
export const useStorefrontHeaders = () => {
  // Capture composables ONCE, synchronously, when useStorefrontHeaders() is called
  const context = useStorefrontContext()
  const { $i18n: i18n } = useNuxtApp()

  // getHeaders is invoked later (from ofetch's onRequest interceptor)
  // It ONLY reads .value off already-captured refs
  const getHeaders = () => {
    const currentLocale = i18n.locale.value as string
    return {
      'X-Storefront-Locale': currentLocale || context.value.locale,
      // ...
    }
  }

  return { getHeaders }
}
```

```typescript
// ✅ CORRECT - src/core/cache/createCacheKey.ts (fixed)
export const useCacheKey = () => {
  // Resolve composables ONCE, synchronously, when useCacheKey() is called
  const context = useStorefrontContext()
  const { $i18n: i18n } = useNuxtApp()

  // getCacheKey is invoked later (from useAsyncData's reactive key)
  // It ONLY reads .value off already-captured refs
  const getCacheKey = (options: Omit<CacheKeyOptions, 'locale' | 'tenantSlug'>): string => {
    return createCacheKey({
      locale: i18n.locale.value as string,
      tenantSlug: context.value.tenant?.slug,
      ...options,
    })
  }

  return { getCacheKey }
}
```

**Incorrect Pattern:**
```typescript
// ❌ WRONG - composable called inside the later-invoked function
export const useCacheKey = () => {
  const getCacheKey = (options) => {
    const context = useStorefrontContext()  // ❌ Called too late!
    const { locale } = useI18n()            // ❌ Called too late!
    return createCacheKey({ locale: locale.value, ...options })
  }
  return { getCacheKey }
}
```

**Reference Implementations:**
- `src/core/api/headers.ts` - The canonical example with detailed comment
- `src/core/cache/createCacheKey.ts` - Fixed version
- `app/plugins/apollo.ts` - Correct usage for Apollo's `setContext`

**Affected Contexts:**
- `useAsyncData(() => getCacheKey(...), ...)`
- Apollo Client's `setContext(() => ({ headers: {...} }))`
- `$fetch.create({ onRequest() {...} })`
- Any arrow function passed to Vue's `watch`, `computed`, `setTimeout`, or Promise `.then()`

---

## How These Were Found

An independent full-application audit (August 2026) swept the codebase for:
1. Hardcoded locale-prefix checks (found zero after prior fixes)
2. Direct `i18n_redirected` cookie reads (found several, verified all were in correct locations)
3. Composable context violations (found one in `useCacheKey()`, missed in initial review)
4. Hardcoded locale arrays (found seven copies, now consolidated)

This audit was triggered after multiple similar bugs recurred over several months, indicating these patterns were not being maintained by the team.

## Consequences

### Positive
- Single reference document for future code reviews
- Lint rules can be tied back to specific production incidents
- New team members have a clear "do this, not that" guide
- Pattern violations can be flagged with "see ADR-008" in PR reviews

### Negative
- Adds overhead to onboarding (new patterns to learn)
- Requires team discipline to follow patterns even when "simpler" alternatives exist
- Some patterns (composable context rule) are subtle and not immediately obvious from the code alone

## Compliance

### Automated Enforcement
- ESLint rule added (see `Priority 3` section below) to flag hardcoded locale arrays outside the canonical constant file
- **TODO:** Add ESLint rule or grep-based CI check for composable calls inside arrow functions passed to `useAsyncData`, `setContext`, etc.

### Manual Enforcement
- Code reviews MUST verify new `useAsyncData` calls follow the composable context pattern (Rule 4)
- Code reviews MUST verify any new CMS/merchant-entered href rendering uses `useCmsLink()` or `<CmsLink>` (Rule 2)
- Any new server-side locale detection code MUST reference `server/utils/locale.ts`'s `getEventLocale()` (Rule 1)

### Regression Prevention
A one-paragraph "why this exists" note has been added to the lint rule referencing that these exact bugs happened in this codebase before, so future engineers understand what they're re-opening if they disable the rule.

## Related Documents
- `docs/fixes/COMPOSABLE_CONTEXT_FIX.md` - Original fix for composable context crash
- `docs/fixes/REACTIVE_CACHE_KEY_FIX.md` - Original fix for locale-aware cache keys
- `docs/fixes/LANGUAGE_SWITCHING_FIX_COMPLETE.md` - Original fix for locale detection priority
- `docs/development/AI_AGENT_RULES.md` - Developer-facing rules summary
- `server/utils/locale.ts` - Reference implementation for Rule 1
- `app/composables/useCmsLink.ts` - Reference implementation for Rule 2
- `src/core/runtime/contracts/constants.ts` - Canonical constant for Rule 3
- `src/core/api/headers.ts` - Reference implementation for Rule 4

## Revision History
- 2026-08-27: Initial version based on August 2026 full-application audit
