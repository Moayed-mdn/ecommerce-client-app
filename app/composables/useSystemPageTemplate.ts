import { computed, watch, type Ref } from 'vue'
import { useStorefrontContext } from '~~/src/core/tenant/composables'
import type { RuntimeTemplateSectionDetail, RuntimeNavigationItem, RuntimeSystemTemplate } from '~~/src/core/runtime/contracts/types'
import { STOREFRONT_RUNTIME_SUPPORTED_LOCALES_LIST } from '~~/src/core/runtime/contracts/constants'

type NavData = { header: RuntimeNavigationItem[]; footer: RuntimeNavigationItem[] } | null

const SYSTEM_PAGE_TYPES: Record<string, string> = {
  'cart': 'cart',
  'search': 'search',
  'shop': 'shop',
  'profile': 'account',
  'categories': 'categories',
  'login': 'login',
  'register': 'register',
  'forgot-password': 'forgot_password',
  'reset-password': 'reset_password',
  'verify-email': 'verify_email',
  'checkout': 'checkout',
}

const CHECKOUT_MAP: Record<string, string> = {
  success: 'checkout_success',
  cancel: 'checkout_cancel',
}

function detectPageType(route: ReturnType<typeof useRoute>): string | null {
  const path = route.path.replace(/\/$/, '')
  const segments = path.split('/').filter(Boolean)
  const localePrefix = new Set(STOREFRONT_RUNTIME_SUPPORTED_LOCALES_LIST)
  const relevant = segments.filter(s => !localePrefix.has(s))

  if (relevant.includes('checkout')) {
    const idx = relevant.indexOf('checkout')
    const next = relevant[idx + 1]
    if (next && CHECKOUT_MAP[next]) return CHECKOUT_MAP[next]
    return 'checkout'
  }

  if (relevant.includes('orders')) {
    const idx = relevant.indexOf('orders')
    if (idx >= 0) {
      const next = relevant[idx + 1]
      if (next) return next === 'track' ? 'order_track' : 'order'
      return 'orders'
    }
  }

  if (relevant.includes('verify-email')) {
    return 'verify_email'
  }

  if (relevant.includes('reset-password')) {
    return 'reset_password'
  }

  if (relevant.includes('forgot-password')) {
    return 'forgot_password'
  }

  const last = relevant[relevant.length - 1]
  if (last && SYSTEM_PAGE_TYPES[last]) return SYSTEM_PAGE_TYPES[last]

  return null
}

export function useSystemPageTemplate() {
  const route = useRoute()
  const context = useStorefrontContext()
  const api = useApi()
  const { locale } = useI18n()

  const pageType = computed(() => detectPageType(route))

  const templateCacheKey = computed(() => `system-template-${detectPageType(route) ?? 'none'}-${locale.value}`)
  const { data, pending, error, refresh } = useAsyncData(
    () => templateCacheKey.value,
    async () => {
      const type = detectPageType(route)
      if (!type) return null

      const res = await api<{
        data: RuntimeSystemTemplate | null
      }>(`/api/storefront/runtime/template/${type}`, { showError: false })

      return res?.data?.data ?? null
    },
    {
      default: () => null,
    },
  )

  const navCacheKey = computed(() => `system-navigation-${locale.value}`)
  const { data: navData, pending: navPending, refresh: navRefresh } = useAsyncData(
    () => navCacheKey.value,
    async (): Promise<NavData> => {
      const res = await api<{
        data: { header: RuntimeNavigationItem[]; footer: RuntimeNavigationItem[] }
      }>('/api/storefront/runtime/navigation', { showError: false })

      const nav = res?.data?.data ?? null

      if (nav) {
        context.value.navigation = nav as { header: RuntimeNavigationItem[]; footer: RuntimeNavigationItem[] }
      }

      return nav as NavData
    },
    {
      default: () => null as NavData,
    },
  )

  watch(locale, (newLocale) => {
    context.value.locale = newLocale
    refresh()
    navRefresh()
  })

  const template = computed(() => data.value as RuntimeSystemTemplate | null)

  const sectionOrder = computed<string[]>(() => template.value?.section_order ?? [])

  const sectionMap = computed<Record<string, RuntimeTemplateSectionDetail>>(() =>
    template.value?.sections ?? {}
  )

  const isEmpty = computed(() => !template.value || sectionOrder.value.length === 0)

  return {
    template,
    pageType,
    sectionOrder,
    sectionMap,
    isEmpty,
    pending: pending || navPending,
    error,
  }
}
