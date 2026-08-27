import { STOREFRONT_RUNTIME_SUPPORTED_LOCALES } from '~~/src/core/runtime/contracts/constants'

// Keep in sync with nuxt.config.ts i18n.defaultLocale. Under `prefix_except_default`,
// the default locale must NEVER appear as a URL prefix — a request for `/en/products`
// (explicit prefix on the default locale) does not match any registered route and 404s,
// exactly like a request for `/en/en/products` does. Both are "wrong prefix" bugs from
// the same root cause: something outside this app's own routing generated the link
// (a backend email/notification, an external dashboard redirect, an old bookmark from
// when the strategy used to be `prefix`) and doesn't know the current locale rules.
const DEFAULT_LOCALE = 'en'

const SUPPORTED_LOCALES = new Set<string>(STOREFRONT_RUNTIME_SUPPORTED_LOCALES)

/**
 * Normalizes ANY number of leading locale segments down to at most one correct
 * one, and drops it entirely if it's the default locale. Covers, generically:
 *   /en/en/login      -> /login
 *   /ar/ar/login       -> /ar/login
 *   /en/ar/login       -> /ar/login   (last one wins — see comment below)
 *   /en/products       -> /products   (stray default-locale prefix, single segment)
 *   /ar/products       -> /ar/products (already correct, untouched)
 */
export default defineNuxtRouteMiddleware((to) => {
  const segments = to.path.split('/').filter(Boolean)

  let i = 0
  const foundLocales: string[] = []
  while (i < segments.length && SUPPORTED_LOCALES.has(segments[i])) {
    foundLocales.push(segments[i])
    i++
  }

  if (foundLocales.length === 0) return

  // If multiple locale segments are stacked, the LAST one reflects the most
  // recent/specific intent (mirrors what a chain of naive prefix-adding
  // redirects would converge on) — same resolution rule the previous
  // double-locale middleware used.
  const intendedLocale = foundLocales[foundLocales.length - 1]
  const restSegments = segments.slice(i)
  const rest = restSegments.length > 0 ? `/${restSegments.join('/')}` : ''

  const canonicalPath = intendedLocale === DEFAULT_LOCALE
    ? (rest || '/')
    : `/${intendedLocale}${rest}`

  // Only redirect when there was actually something wrong: more than one
  // locale segment stacked, OR the single segment found is the default
  // locale (which must never be a prefix under prefix_except_default).
  const needsFix = foundLocales.length > 1 || intendedLocale === DEFAULT_LOCALE

  if (needsFix && canonicalPath !== to.path) {
    if (import.meta.dev) {
      console.warn('[fix-locale-prefix] Correcting malformed locale prefix:', {
        original: to.path,
        fixed: canonicalPath,
      })
    }

    return navigateTo(
      { path: canonicalPath, query: to.query, hash: to.hash },
      { redirectCode: 302, replace: true },
    )
  }
})
