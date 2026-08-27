import type { RuntimePagePayloadResponse } from '~~/src/core/runtime/contracts/types'
import { useStorefrontApi } from '~~/src/core/api/client'
import { useStorefrontContext } from '~~/src/core/tenant/composables'
import { API_ROUTES } from '~~/shared/utils/routes'
import { createCacheKey } from '~~/src/core/cache/createCacheKey'
import { STOREFRONT_RUNTIME_SUPPORTED_LOCALES_LIST } from '~~/src/core/runtime/contracts/constants'

const AUTH_PAGE_TYPES = ['login', 'register', 'forgot-password', 'reset-password', 'verify-email'] as const

export const useAuthPageTemplate = () => {
  const context = useStorefrontContext()
  const storefrontApi = useStorefrontApi()
  const route = useRoute()
  const { locale } = useI18n()

  const pageType = computed(() => {
    const path = route.path.replace(/\/$/, '')
    const segments = path.split('/').filter(Boolean)
    const relevantSegments = segments.filter(s => !STOREFRONT_RUNTIME_SUPPORTED_LOCALES_LIST.includes(s))
    const type = relevantSegments[relevantSegments.length - 1] ?? 'login'
    if ((AUTH_PAGE_TYPES as readonly string[]).includes(type)) {
      return type
    }
    return 'login'
  })

  const { data, pending, error } = useAsyncData(
    () => createCacheKey({
      locale: locale.value,
      tenantSlug: context.value.tenant?.slug,
      resource: 'auth-page-template',
      identifier: pageType.value,
    }),
    async () => {
      const pageId = `auth_${pageType.value}`

      const response = await storefrontApi<RuntimePagePayloadResponse>(
        API_ROUTES.storefront.runtime.page(pageId),
        {
          query: { path: `/${pageType.value}` },
          showError: false,
        },
      )

      if (response.error) {
        return null
      }

      return response.data?.data?.page ?? null
    },
  )

  const navigationFromTemplate = computed(() => {
    const page = data.value
    if (!page?.template?.sections) return null

    const headerSection = Object.values(page.template.sections).find(
      s => s.type === 'header',
    )
    const footerSection = Object.values(page.template.sections).find(
      s => s.type === 'footer' || s.type === 'footer-minimal' || s.type === 'footer-legal',
    )

    return {
      header: (headerSection?.data?.navigation as Array<Record<string, unknown>>) ?? [],
      footer: (footerSection?.data?.navigation as Array<Record<string, unknown>>) ?? [],
    }
  })

  watchEffect(() => {
    if (navigationFromTemplate.value) {
      context.value.navigation = navigationFromTemplate.value as typeof context.value.navigation
    }
  })

  return {
    page: data,
    navigation: navigationFromTemplate,
    pending,
    error,
  }
}
