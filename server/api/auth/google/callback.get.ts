import { EXTERNAL_API_ROUTES } from '~~/shared/utils/routes'
import {
  buildExternalApiUrl,
  getNormalizedRequestHost,
  normalizeProxySetCookie,
  requestWithForwardedHost,
} from '../../../utils/api'
import { getEventLocale } from '../../../utils/locale'
import { STOREFRONT_RUNTIME_CONTRACT_VERSION } from '../../../../src/core/runtime/contracts/constants'

export default defineEventHandler(async (event) => {
  const configuredTarget = buildExternalApiUrl(event, EXTERNAL_API_ROUTES.auth.googleCallback)
  const targetBase = configuredTarget
  const requestUrl = getRequestURL(event)
  const host = getNormalizedRequestHost(event)
  // NOTE: Referer here is the OAuth provider's domain (accounts.google.com), not a
  // storefront page, so it can't tell us which locale the user started from. This
  // endpoint would need the original locale round-tripped through the OAuth `state`
  // param for a fully correct answer; Accept-Language is the best available signal
  // short of that, and is at least no longer overridden by the stale cookie.
  const rawLocale = getEventLocale(event)
  const locale = rawLocale.split('-')[0].split(',')[0].trim().toLowerCase()
  const tenantId = String(event.context.tenantId || '')

  // Get all cookies from the incoming request
  const cookieHeader = getHeader(event, 'cookie') || ''

  // Bootstrap CSRF cookie if we don't have the required session cookies
  const hasXsrfToken = cookieHeader.includes('XSRF-TOKEN')
  const hasEcommerceSession = cookieHeader.includes('ecommerce_session')

  if (!hasXsrfToken || !hasEcommerceSession) {
    const apiBase = useRuntimeConfig().public.apiBase
    const buildApiRoot = (apiBase: string) => apiBase.replace(/\/api\/?(v1|users)?\/?$/, '')
    const apiRoot = buildApiRoot(apiBase)
    const csrfUrl = `${apiRoot}/sanctum/csrf-cookie`
    
    try {
      const csrfResponse = await requestWithForwardedHost(csrfUrl, {
        method: 'GET',
        headers: new Headers({
          Accept: 'application/json',
          Host: host,
          'X-Tenant-Id': tenantId,
          'X-Storefront-Locale': locale,
          'X-Storefront-Version': STOREFRONT_RUNTIME_CONTRACT_VERSION,
        }),
      })
      // Forward the new cookies from the CSRF request
      for (const setCookieHeader of csrfResponse.setCookie) {
        appendResponseHeader(event, 'set-cookie', normalizeProxySetCookie(setCookieHeader))
      }
    } catch (csrfErr) {
      console.error('[auth/google/callback] CSRF bootstrap failed:', csrfErr)
    }
  }
  
  const finalCookieHeader = getHeader(event, 'cookie') || cookieHeader
  const response = await requestWithForwardedHost(`${targetBase}${requestUrl.search}`, {
    method: 'GET',
    headers: new Headers({
      Accept: 'application/json',
      Host: host,
      'X-Tenant-Id': tenantId,
      'X-Storefront-Locale': locale,
      'X-Storefront-Version': STOREFRONT_RUNTIME_CONTRACT_VERSION,
      Cookie: finalCookieHeader,
    }),
  })

  for (const setCookieHeader of response.setCookie) {
    appendResponseHeader(event, 'set-cookie', normalizeProxySetCookie(setCookieHeader))
  }

  const redirectLocation = response.location
  if (redirectLocation) {
    const redirectUrl = new URL(redirectLocation, requestUrl.origin)
    if (redirectUrl.pathname.startsWith('/auth/google/callback')) {
      redirectUrl.protocol = requestUrl.protocol
      redirectUrl.host = requestUrl.host
      redirectUrl.pathname = `/${locale}${redirectUrl.pathname}`
    }

    return sendRedirect(event, redirectUrl.toString(), response.statusCode)
  }

  const contentType = response.contentType || ''
  if (contentType.includes('application/json')) {
    return response.data
  }

  return typeof response.data === 'string' ? response.data : ''
})
