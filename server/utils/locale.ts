import type { H3Event } from 'h3'
import { STOREFRONT_RUNTIME_SUPPORTED_LOCALES } from '../../src/core/runtime/contracts/constants'

// Locale codes that appear as a URL prefix. Keep in sync with nuxt.config.ts
// i18n.locales. defaultLocale is 'en' and strategy is 'prefix_except_default',
// so only non-default locales show up as a path prefix (e.g. /ar/..).
const DEFAULT_LOCALE = 'en'
const PREFIXED_LOCALES = STOREFRONT_RUNTIME_SUPPORTED_LOCALES.filter(l => l !== DEFAULT_LOCALE)

/**
 * Resolves the locale for the current server-side request.
 *
 * Do NOT use the `i18n_redirected` cookie as the primary signal here. It is
 * only written by @nuxtjs/i18n's browser-language detection, which this app
 * configures with `redirectOn: 'root'` (see nuxt.config.ts) — meaning the
 * cookie is only updated when a visitor lands on `/`, and is left untouched
 * for the rest of the session when they switch language via the in-app
 * switcher (which navigates straight to /ar/... or back to the unprefixed
 * default). Every server-side call that read the cookie as "the current
 * locale" was therefore serving stale (usually English) content/headers to
 * the backend after the very first manual language switch, even though the
 * page itself was correctly showing /ar/... and client-rendered i18n text.
 *
 * The URL path prefix is the only signal that is always in sync with what
 * the user is actually looking at, so it takes priority. Cookie is kept as a
 * last-resort fallback only (e.g. for requests with no path/header context).
 */
export const getEventLocale = (event: H3Event): string => {
  const path = event.path || ''
  for (const code of PREFIXED_LOCALES) {
    if (path === `/${code}` || path.startsWith(`/${code}/`)) {
      return code
    }
  }

  const explicitHeader = getHeader(event, 'x-storefront-locale')
  if (explicitHeader) return explicitHeader

  const acceptLanguage = getHeader(event, 'accept-language')
  if (acceptLanguage?.toLowerCase().startsWith('ar')) return 'ar'

  const cookieLocale = getCookie(event, 'i18n_redirected')
  if (cookieLocale) return cookieLocale

  return DEFAULT_LOCALE
}

/**
 * Same resolution, but also tries a Referer URL's path first. Useful for
 * endpoints that don't themselves carry a locale-prefixed path (e.g. OAuth
 * redirect kick-off routes), where the Referer is the actual storefront page
 * the user was on (e.g. /ar/login) when they triggered the request.
 */
export const getEventLocaleWithReferer = (event: H3Event): string => {
  const referer = getHeader(event, 'referer')
  if (referer) {
    try {
      const refererPath = new URL(referer).pathname
      for (const code of PREFIXED_LOCALES) {
        if (refererPath === `/${code}` || refererPath.startsWith(`/${code}/`)) {
          return code
        }
      }
    } catch {
      // ignore malformed referer
    }
  }

  return getEventLocale(event)
}
