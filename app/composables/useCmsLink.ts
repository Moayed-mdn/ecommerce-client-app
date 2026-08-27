// Import the canonical locale list from the runtime contracts constant.
// This ensures locale changes propagate everywhere automatically.
import { STOREFRONT_RUNTIME_SUPPORTED_LOCALES } from '~~/src/core/runtime/contracts/constants'

const LOCALE_CODES = [...STOREFRONT_RUNTIME_SUPPORTED_LOCALES]

const localePrefixPattern = new RegExp(`^/(${LOCALE_CODES.join('|')})(?=/|$)`)

/**
 * True for anything that should be left completely untouched: external URLs,
 * mailto/tel links, in-page anchors, empty/placeholder values.
 */
export const isExternalOrSpecialHref = (href: string): boolean => {
  if (!href || href === '#') return true
  return /^([a-z][a-z0-9+.-]*:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href)
}

/**
 * Strips a leading locale segment if present, e.g. "/en/shop" -> "/shop",
 * "/ar/shop" -> "/shop". Leaves everything else untouched.
 *
 * CMS-authored hrefs (menu links, CTA buttons, category/product overrides)
 * come from merchants typing a path into a text field. Nothing stops them
 * from typing "/en/shop" — this makes that input safe to feed into
 * localePath()/NuxtLinkLocale without producing "/en/en/shop" or "/ar/en/shop".
 */
export const toLocaleNeutralPath = (href: string): string => {
  return href.replace(localePrefixPattern, '') || '/'
}

/**
 * Single source of truth for turning a raw, merchant-entered CMS href into
 * the correct locale-aware path for the CURRENT locale. Use this (or the
 * <CmsLink> component, which wraps it) anywhere a CMS href needs rendering,
 * instead of re-deriving the "already has a locale prefix?" check inline.
 */
export const useCmsLink = () => {
  const localePath = useLocalePath()

  const resolveHref = (href: string | null | undefined): string => {
    if (!href) return '#'
    if (isExternalOrSpecialHref(href)) return href
    if (!href.startsWith('/')) return href

    return localePath(toLocaleNeutralPath(href))
  }

  return { resolveHref }
}
