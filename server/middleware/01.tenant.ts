import { resolveTenant } from '../../src/core/tenant/resolver'
import { getEventLocale } from '../utils/locale'

export default defineEventHandler(async (event) => {
  // 1. Resolve hostname
  const hostname = getHeader(event, 'host') || 'localhost'

  // 2. Resolve tenant
  const tenant = await resolveTenant(hostname)

  // 3. Reject malformed tenants
  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found',
      data: { runtimeCode: 'runtime.tenant_not_found' },
    })
  }

  // 4. Inject tenant into context
  event.context.tenant = tenant
  event.context.tenantId = tenant.id
  event.context.tenantSlug = tenant.slug

  // 5. Setup initial storefront context for SSR
  // This will be picked up by useStorefrontContext on the client
  const locale = getEventLocale(event)
  const query = getQuery(event)
  const preview = query.preview === 'true' || query.preview === '1'
  const previewToken = typeof query.previewToken === 'string'
    ? query.previewToken
    : typeof query.token === 'string'
      ? query.token
      : null
  const requestId = String(getHeader(event, 'x-request-id') || crypto.randomUUID())

  event.context.storefrontContext = {
    tenant,
    locale,
    currency: tenant.settings?.currency || 'USD',
    theme: tenant.settings?.theme || 'default',
    preview,
    previewToken,
    route: event.path,
    requestId,
    navigation: null,
    themePayload: null,
  }
})
