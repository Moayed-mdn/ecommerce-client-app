import type {
  RuntimeNavigationResponse,
  RuntimePagePayloadResponse,
  RuntimePreviewValidationResponse,
  RuntimeThemeResponse,
} from '../contracts/types'
import type { RuntimeResolvedRoute, StorefrontRuntimeBundle } from './types'
import { useStorefrontApi } from '../../api/client'
import { API_ROUTES } from '../../../../shared/utils/routes'
import { useStorefrontContext } from '../../tenant/composables'

/**
 * Normalize a runtime API tenantId for use as the canonical tenant identifier.
 *
 * The runtime API returns tenantId in "store_{id}" format (e.g. "store_42").
 * The canonical tenant identifier expected by Store::find() and all downstream
 * X-Tenant-Id header generators is the bare numeric ID ("42") or numeric (42).
 *
 * Only strips the "store_" prefix when the value matches the exact pattern
 * /^store_\d+$/. All other values pass through unchanged.
 *
 * Accepts:
 *   "store_1"   -> "1"
 *   "store_42"  -> "42"
 *   1           -> 1
 *   "merchant-store" -> "merchant-store"
 *   "abc"       -> "abc"
 *   undefined   -> undefined
 *   null        -> undefined
 */
export function normalizeTenantId(value: string | number | null | undefined): string | number | undefined {
  if (value === null || value === undefined) {
    return undefined
  }
  if (typeof value === 'string' && /^store_\d+$/.test(value)) {
    return value.replace(/^store_/, '')
  }
  return value
}

// Plain error factory — no Nuxt composables, safe to call anywhere
const makeError = (statusCode: number, message: string, data?: any): Error => {
  const err = new Error(message) as any
  err.statusCode = statusCode
  err.data = data
  err.__storefront_error = true
  return err
}

// ⚠️ PERF FIX: navigation and theme don't vary per-route (the backend computes
// them purely from tenant + locale), but fetchPayload used to re-request both
// on *every* route navigation alongside the page payload. That's 2 redundant
// network round-trips per click through the store. Cache the last-fetched
// copy per tenant+locale for the lifetime of the session and reuse it across
// navigations, only refetching when the tenant or locale actually changes
// (or when previewing, which always bypasses cache — matching backend
// behavior for preview requests).
interface RuntimeArtifactCacheEntry {
  key: string
  navigation?: RuntimeNavigationResponse
  theme?: RuntimeThemeResponse
}

const useRuntimeArtifactCache = () =>
  useState<RuntimeArtifactCacheEntry | null>('storefront-runtime-artifact-cache', () => null)

export const useStorefrontPayload = () => {
  const context = useStorefrontContext()
  const storefrontApi = useStorefrontApi()
  const artifactCache = useRuntimeArtifactCache()
  const requestHost = import.meta.server
    ? useRequestHeaders(['host']).host || context.value.tenant?.domain || 'localhost'
    : null

  const fetchPayload = async (resolved: RuntimeResolvedRoute): Promise<StorefrontRuntimeBundle | null> => {
    if (resolved.status !== 'matched' || resolved.pageId === null) {
      return null
    }

    if (context.value.preview && context.value.previewToken) {
      await validatePreview(resolved)
    }

    const artifactKey = `${context.value.tenant?.slug || context.value.tenant?.id || 'default'}:${context.value.locale}`
    const bypassArtifactCache = Boolean(context.value.preview)
    const cached = !bypassArtifactCache && artifactCache.value?.key === artifactKey ? artifactCache.value : null

    const pagePromise = storefrontApi<RuntimePagePayloadResponse>(
      API_ROUTES.storefront.runtime.page(resolved.pageId as string),
      {
        query: {
          path: resolved.path,
          ...(context.value.preview ? { preview: 1 } : {}),
        },
        showError: false,
      },
    )

    const navPromise = cached?.navigation
      ? Promise.resolve({ data: cached.navigation, error: null })
      : storefrontApi<RuntimeNavigationResponse>(
        API_ROUTES.storefront.runtime.navigation,
        {
          query: { path: resolved.path },
          showError: false,
        },
      )

    const themePromise = cached?.theme
      ? Promise.resolve({ data: cached.theme, error: null })
      : storefrontApi<RuntimeThemeResponse>(
        API_ROUTES.storefront.runtime.theme,
        {
          query: { path: resolved.path },
          showError: false,
        },
      )

    const [pageResponse, navigationResponse, themeResponse] = await Promise.all([
      pagePromise,
      navPromise,
      themePromise,
    ])

    if (pageResponse.error) {
      throw makeError(
        pageResponse.error.statusCode || 500,
        pageResponse.error.message,
        pageResponse.error,
      )
    }

    if (navigationResponse.error) {
      throw makeError(
        navigationResponse.error.statusCode || 500,
        navigationResponse.error.message,
        navigationResponse.error,
      )
    }

    if (themeResponse.error) {
      throw makeError(
        themeResponse.error.statusCode || 500,
        themeResponse.error.message,
        themeResponse.error,
      )
    }

    if (!pageResponse.data || !navigationResponse.data || !themeResponse.data) {
      throw makeError(500, 'The storefront runtime payload is incomplete.')
    }

    syncTenantContext(pageResponse.data, navigationResponse.data, themeResponse.data)

    // Re-derive the key post-sync: syncTenantContext may have just resolved
    // the canonical tenant slug for the very first request of the session.
    const resolvedArtifactKey = `${context.value.tenant?.slug || context.value.tenant?.id || 'default'}:${context.value.locale}`
    if (!bypassArtifactCache) {
      artifactCache.value = {
        key: resolvedArtifactKey,
        navigation: navigationResponse.data,
        theme: themeResponse.data,
      }
    }

    return {
      page: pageResponse.data.data.page,
      navigation: navigationResponse.data.data,
      theme: themeResponse.data.data,
    } satisfies StorefrontRuntimeBundle
  }

  const validatePreview = async (resolved: RuntimeResolvedRoute): Promise<void> => {
    const previewToken = context.value.previewToken

    if (!previewToken || resolved.pageId === null) {
      throw makeError(403, 'Preview access requires a valid preview token.')
    }

    const { data, error } = await storefrontApi<RuntimePreviewValidationResponse>(
      API_ROUTES.storefront.runtime.previewValidate,
      {
        method: 'POST',
        body: {
          token: previewToken,
          pageId: resolved.pageId,
          path: resolved.path,
          locale: context.value.locale,
        },
        showError: false,
      },
    )

    if (error) {
      throw makeError(error.statusCode || 403, error.message, error)
    }

    if (!data?.data.valid || data.data.previewState !== 'authorized') {
      throw makeError(403, 'Preview access was denied.')
    }
  }

  const syncTenantContext = (
    pageResponse: RuntimePagePayloadResponse,
    navigationResponse: RuntimeNavigationResponse,
    themeResponse: RuntimeThemeResponse,
  ): void => {
    const host = import.meta.server
      ? requestHost || context.value.tenant?.domain || 'localhost'
      : window.location.host

    if (pageResponse.requestContext?.requestId) {
      context.value.requestId = pageResponse.requestContext.requestId
    }

    const storeName =
      themeResponse.data.branding?.storeName ||
      context.value.tenant?.name ||
      'Storefront'

    context.value.tenant = {
      id: normalizeTenantId(pageResponse.requestContext?.tenantId) || context.value.tenant?.id || 'default',
      name: storeName,
      slug: pageResponse.requestContext?.tenantKey || context.value.tenant?.slug || 'default',
      domain: host.split(':')[0] || 'localhost',
      status: 'active',
      settings: {
        ...(context.value.tenant?.settings || {}),
        theme: themeResponse.data.themeKey,
        direction: themeResponse.data.settings.direction,
      },
    }

    context.value.theme = themeResponse.data.themeKey
    context.value.navigation = navigationResponse.data
    context.value.themePayload = themeResponse.data

  }

  return { fetchPayload }
}
