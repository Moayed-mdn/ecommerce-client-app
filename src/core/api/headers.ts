import { useStorefrontContext } from '../tenant/composables'
import { STOREFRONT_RUNTIME_CONTRACT_VERSION } from '../runtime/contracts/constants'

export const useStorefrontHeaders = () => {
  const context = useStorefrontContext()
  const requestHeaders = import.meta.server
    ? useRequestHeaders(['host', 'x-forwarded-host', 'cookie', 'accept-language'])
    : null

  // Resolved HERE, synchronously, at the time useStorefrontHeaders() itself is
  // called (always from a component/composable's setup scope, e.g.
  // useStorefrontPayload() -> useStorefrontApi() -> useStorefrontHeaders()).
  // getHeaders() below is invoked later from ofetch's onRequest interceptor,
  // which can run *after* an await inside an async watch handler — by then
  // there's no active Nuxt instance for useNuxtApp() to resolve, hence:
  // "A composable that requires access to the Nuxt instance was called
  // outside of a plugin, Nuxt hook, Nuxt middleware, or Vue setup function."
  // `i18n` here is just a captured object reference, not a fresh composable
  // call, so reading `.locale.value` off it later is always safe.
  const { $i18n: i18n } = useNuxtApp()

  const getHeaders = () => {
    const currentLocale = i18n.locale.value as string

    const headers: Record<string, string> = {
      'X-Tenant-Id': String(context.value.tenant?.id || ''),
      'X-Storefront-Locale': currentLocale || context.value.locale,
      'X-Storefront-Version': STOREFRONT_RUNTIME_CONTRACT_VERSION,
    }

    if (context.value.requestId) {
      headers['X-Request-Id'] = context.value.requestId
    }

    if (context.value.preview && context.value.previewToken) {
      headers['X-Preview-Token'] = context.value.previewToken
    }

    if (requestHeaders?.host) {
      headers.host = requestHeaders.host
    }

    if (requestHeaders?.['x-forwarded-host']) {
      headers['x-forwarded-host'] = requestHeaders['x-forwarded-host']
    }

    if (requestHeaders?.cookie) {
      headers.cookie = requestHeaders.cookie
    }

    if (requestHeaders?.['accept-language']) {
      headers['accept-language'] = requestHeaders['accept-language']
    }

    return headers
  }

  return {
    getHeaders
  }
}