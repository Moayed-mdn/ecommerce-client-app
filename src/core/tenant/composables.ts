import type { StorefrontContext } from './types'

export const useStorefrontContext = () => {
  return useState<StorefrontContext>('storefront_context', () => ({
    tenant: null,
    locale: 'en',
    currency: 'USD',
    theme: 'default',
    preview: false,
    previewToken: null,
    route: '',
    requestId: '',
    navigation: null,
    themePayload: null,
  }))
}

export const useTenant = () => {
  const context = useStorefrontContext()
  
  const tenant = computed(() => context.value.tenant)
  const tenantId = computed(() => context.value.tenant?.id)
  const tenantSlug = computed(() => context.value.tenant?.slug)
  
  const isActive = computed(() => context.value.tenant?.status === 'active')
  
  return {
    tenant,
    tenantId,
    tenantSlug,
    isActive,
  }
}
