import { EXTERNAL_API_ROUTES } from '~~/shared/utils/routes'
import { buildExternalApiUrl } from '../../../utils/api'
import { getEventLocaleWithReferer } from '../../../utils/locale'

export default defineEventHandler(async (event) => {
  const target = buildExternalApiUrl(event, EXTERNAL_API_ROUTES.auth.googleRedirect)
  const requestUrl = getRequestURL(event)
  const host = requestUrl.host.split(':')[0] || 'localhost'
  const locale = getEventLocaleWithReferer(event)
  const tenantId = String(event.context.tenantId || '')

  const origin = getHeader(event, 'origin')
  const referer = getHeader(event, 'referer')

  const response = await fetch(`${target}${requestUrl.search}`, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      Accept: 'application/json',
      Host: host,
      ...(origin ? { Origin: origin } : {}),
      ...(referer ? { Referer: referer } : {}),
      'X-Tenant-Id': tenantId,
      'X-Storefront-Locale': locale,
    },
  })

  const redirectLocation = response.headers.get('location')
  if (redirectLocation) {
    return sendRedirect(event, redirectLocation, response.status)
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return await response.json()
  }

  return await response.text()
})
