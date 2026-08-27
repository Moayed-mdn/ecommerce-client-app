# Composable Context Safety Checklist

## Purpose

This checklist prevents the "Must be called at the top of a setup function" class of runtime errors that have crashed this application multiple times in production.

**Related:** See `docs/reference/adr-008-critical-patterns-audit-2026-08.md` for full context and regression history.

## The Problem

Vue composables like `useI18n()`, `useRoute()`, `useNuxtApp()`, and similar require an active component instance when called. They throw errors when called:
- Inside an async function after an `await`
- Inside a `setTimeout`, `setInterval`, or Promise `.then()` callback
- Inside a `watch()` callback
- Inside interceptors (`onRequest`, `onResponse`, `setContext`)
- Inside arrow functions passed to `useAsyncData()` when that function re-evaluates

## When These Errors Occur

The error typically appears as:
```
[nuxt] A composable that requires access to the Nuxt instance was called 
outside of a plugin, Nuxt hook, Nuxt middleware, or Vue setup function.
```

Or from vue-i18n:
```
Must be called at the top of a `setup` function
```

## The Solution Pattern

**Rule:** If a composable needs to be read inside a later-invoked function, capture the composable's result ONCE at the top of the enclosing function/composable, then only read `.value` off that captured reference later.

### ✅ CORRECT Pattern

```typescript
export const useSafeComposable = () => {
  // ✅ Call composables ONCE, synchronously, when useSafeComposable() runs
  const context = useStorefrontContext()
  const { $i18n: i18n } = useNuxtApp()
  const route = useRoute()

  // This function runs later (from useAsyncData, interceptor, etc.)
  // It ONLY reads .value, never calls composables
  const getLaterValue = () => {
    return {
      locale: i18n.locale.value,
      tenant: context.value.tenant?.slug,
      path: route.path,
    }
  }

  return { getLaterValue }
}
```

### ❌ WRONG Pattern

```typescript
export const useDangerousComposable = () => {
  const getDangerValue = () => {
    // ❌ WRONG - composable called inside the later-invoked function
    const context = useStorefrontContext()
    const { locale } = useI18n()
    const route = useRoute()
    
    return {
      locale: locale.value,
      tenant: context.value.tenant?.slug,
      path: route.path,
    }
  }

  return { getDangerValue }
}
```

## High-Risk Contexts (Check These First)

### 1. useAsyncData Reactive Keys

```typescript
// ❌ WRONG
const { data } = useAsyncData(
  () => {
    const { locale } = useI18n()  // ❌ Called when computed re-evaluates
    return `cache-${locale.value}`
  },
  handler
)

// ✅ CORRECT
const { locale } = useI18n()  // ✅ Called once in setup
const { data } = useAsyncData(
  () => `cache-${locale.value}`,  // ✅ Only reads .value
  handler
)
```

### 2. Apollo Client setContext

```typescript
// ❌ WRONG
const authLink = setContext(() => {
  const authStore = useAuthStore()  // ❌ Called on every request
  return { headers: { Authorization: `Bearer ${authStore.token}` } }
})

// ✅ CORRECT
const authStore = useAuthStore()  // ✅ Called once in plugin
const authLink = setContext(() => {
  return { headers: { Authorization: `Bearer ${authStore.token}` } }
})
```

### 3. $fetch Interceptors

```typescript
// ❌ WRONG
const api = $fetch.create({
  onRequest({ options }) {
    const { locale } = useI18n()  // ❌ Called on every request
    options.headers['Accept-Language'] = locale.value
  }
})

// ✅ CORRECT
const { $i18n: i18n } = useNuxtApp()  // ✅ Called once
const api = $fetch.create({
  onRequest({ options }) {
    options.headers['Accept-Language'] = i18n.locale.value
  }
})
```

### 4. Watch Callbacks

```typescript
// ❌ WRONG
watch(someRef, async (newValue) => {
  await doSomething()
  const route = useRoute()  // ❌ Called after await
  navigateTo(route.path)
})

// ✅ CORRECT
const route = useRoute()  // ✅ Called once before watch
watch(someRef, async (newValue) => {
  await doSomething()
  navigateTo(route.path)  // ✅ Just reads the captured ref
})
```

## Code Review Checklist

When reviewing code that uses composables, check:

- [ ] **Is the composable called at the top level of a `setup()` function, plugin, or composable?**
- [ ] **If the composable's value is used in an arrow function, is the composable called OUTSIDE that arrow function?**
- [ ] **If the composable's value is used after an `await`, is the composable called BEFORE the await?**
- [ ] **If the composable's value is used in an interceptor/callback, is the composable called when the interceptor is defined, not when it fires?**
- [ ] **Does the code only read `.value` from the captured ref in later-invoked contexts?**

## Reference Implementations

These files in the codebase demonstrate the correct pattern:

1. **`src/core/api/headers.ts`** - The canonical example with detailed comments
   ```typescript
   export const useStorefrontHeaders = () => {
     const context = useStorefrontContext()
     const { $i18n: i18n } = useNuxtApp()
     
     const getHeaders = () => {
       const currentLocale = i18n.locale.value as string
       return { 'X-Storefront-Locale': currentLocale, ... }
     }
     
     return { getHeaders }
   }
   ```

2. **`src/core/cache/createCacheKey.ts`** - Fixed August 2026
   ```typescript
   export const useCacheKey = () => {
     const context = useStorefrontContext()
     const { $i18n: i18n } = useNuxtApp()
     
     const getCacheKey = (options) => {
       return createCacheKey({
         locale: i18n.locale.value as string,
         ...options,
       })
     }
     
     return { getCacheKey }
   }
   ```

3. **`app/plugins/apollo.ts`** - Correct Apollo Client setup
   ```typescript
   export default defineNuxtPlugin((nuxtApp) => {
     const locale = nuxtApp.$i18n?.locale
     
     const authLink = setContext(() => {
       if (locale?.value) {
         extraHeaders['Accept-Language'] = locale.value
       }
       return { headers: extraHeaders }
     })
     
     // ...
   })
   ```

## Testing for This Bug

This bug class is notoriously hard to catch in development because it only appears when:
1. A locale switch triggers re-evaluation of a reactive key
2. A manual `.refresh()` call re-evaluates a useAsyncData key
3. An interceptor fires during a request after component teardown

**Manual reproduction steps:**
1. Navigate to a page that uses the composable in question
2. Switch locale (EN ↔ AR) multiple times rapidly
3. Manually refresh the data (if applicable)
4. Check browser console for the error

**Automated testing:**
Currently no automated way to test this. Consider adding:
- E2E test that switches locales multiple times on pages with complex composables
- Unit test that manually calls the composable outside a Vue context and asserts it throws

## Why This Keeps Happening

This pattern is counterintuitive for several reasons:
1. **It "works" in development** - The error only appears under specific timing conditions
2. **The "lazy evaluation" approach seems cleaner** - Calling composables "when needed" feels DRY
3. **The error message is confusing** - It doesn't clearly explain the captured-ref solution
4. **Vue's reactivity is "magic"** - The difference between "calling a composable" and "reading .value" isn't obvious

## Regression Prevention

- This checklist exists because this bug class has occurred at least THREE times in this codebase
- Each fix was applied locally without documenting the general pattern
- Future occurrences should reference this checklist and ADR-008

## Future Work

Consider:
- ESLint plugin to detect composable calls inside arrow functions passed to specific APIs
- TypeScript utility type that enforces captured refs in certain contexts
- Automated E2E test that exercises locale switching on all major pages

---

**Last Updated:** 2026-08-27  
**See Also:** `docs/reference/adr-008-critical-patterns-audit-2026-08.md`
