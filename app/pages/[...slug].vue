<template>
  <div
    class="storefront-runtime min-h-screen bg-(--color-bg-page) text-(--color-text-primary)"
    :style="runtimeShellStyle"
  >
    <!-- Show subtle loading overlay when fetching new locale data -->
    <div v-if="pending" class="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <UiLoadingSpinner class="w-8 h-8" />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Loading {{ locale === 'ar' ? 'Arabic' : 'English' }} content...
        </span>
      </div>
    </div>

    <template v-if="resolvedRoute && runtimePage">
      <RuntimeLayoutManager :layout="runtimePage.layout || resolvedRoute.layout || undefined">
        <RuntimeSectionRenderer :sections="sectionsToRender" :theme="runtimeTheme" />
      </RuntimeLayoutManager>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { CmsSection, RuntimeResolvedRoute, StorefrontRuntimeBundle } from '../../src/core/runtime/router/types'
import type { RuntimePagePayload, RuntimePageTemplate, RuntimeTemplateSection, RuntimeNavigationItem } from '../../src/core/runtime/contracts/types'
import { normalizeError } from '../../src/core/api/errors'
import { createTenantCacheKey } from '../../src/core/cache/createTenantCacheKey'
import { useRouteResolver } from '../../src/core/runtime/router/useRouteResolver'
import { useStorefrontPayload } from '../../src/core/runtime/router/useStorefrontPayload'
import { mapRuntimeSeoPayload, useRuntimeSeo } from '../../src/core/seo/useRuntimeSeo'
import { useStorefrontContext } from '../../src/core/tenant/composables'
import { provideTheme } from '../../src/core/theme/composables/useTheme'
import UiLoadingSpinner from '../components/ui/LoadingSpinner.vue'
import { STOREFRONT_RUNTIME_SUPPORTED_LOCALES_LIST } from '../../src/core/runtime/contracts/constants'

definePageMeta({
  layout: false,
})

const storefrontContext = useStorefrontContext()
const { locale } = useI18n()
const route = useRoute()

// ✅ Extract locale from path - this is reactive and updates cache key
const currentLocale = computed(() => {
  const pathParts = route.path.split('/').filter(Boolean)
  if (pathParts.length > 0 && STOREFRONT_RUNTIME_SUPPORTED_LOCALES_LIST.includes(pathParts[0])) {
    return pathParts[0] as 'en' | 'ar'
  }
  return locale.value
})

// Sync locale to context only on client side (after mount)
if (process.client) {
  watch(currentLocale, (newLocale) => {
    if (storefrontContext.value.locale !== newLocale) {
      console.log('[Locale] Updating storefrontContext.locale to:', newLocale)
      storefrontContext.value.locale = newLocale
    }
  }, { immediate: true })
}

if (storefrontContext.value.featureFlags.storefront_runtime === false) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
  })
}

const nuxtApp = useNuxtApp()
const { resolveRoute } = useRouteResolver()
const { fetchPayload } = useStorefrontPayload()
const { injectSeo } = useRuntimeSeo()

const previewToken = computed(() => {
  if (typeof route.query.previewToken === 'string') {
    return route.query.previewToken
  }
  return typeof route.query.token === 'string' ? route.query.token : null
})

const isPreview = computed(() =>
  route.query.preview === 'true' || route.query.preview === '1'
)

const runtimeDataKey = computed(() =>
  createTenantCacheKey('catch-all-runtime-page', {
    tenantKey: String(
      storefrontContext.value.tenant?.slug ||
      storefrontContext.value.tenant?.id ||
      'default'
    ),
    locale: currentLocale.value,  // ✅ Use currentLocale directly
    artifact: 'page',
    route: route.path,
    previewState: isPreview.value ? 'preview' : 'live',
  })
)

const syncRuntimeContext = () => {
  storefrontContext.value.route = route.path
  storefrontContext.value.preview = isPreview.value
  storefrontContext.value.previewToken = previewToken.value
}

// Plain error class — zero Nuxt composables, safe anywhere including async
class StorefrontPageError extends Error {
  statusCode: number
  isNotFound: boolean
  originalError: unknown

  constructor(message: string, statusCode: number, isNotFound = false, originalError?: unknown) {
    super(message)
    this.name = 'StorefrontPageError'
    this.statusCode = statusCode
    this.isNotFound = isNotFound
    this.originalError = originalError
  }
}

const isNuxtError = (error: unknown): error is Error & { __nuxt_error: true } =>
  Boolean(error && typeof error === 'object' && '__nuxt_error' in error)

const toRuntimePageError = (error: unknown) => {
  if (error instanceof StorefrontPageError) {
    return {
      statusCode: error.statusCode,
      statusMessage: error.message,
      data: {
        runtimeCode: error.isNotFound ? 'runtime.page_not_found' : undefined,
        originalStack: error.stack,
      },
    }
  }

  const normalized = normalizeError(error)
  const isRolloutDisabled =
    normalized.code === 'runtime.rollout_disabled' ||
    (normalized.statusCode === 403 &&
      /storefront runtime is not enabled/i.test(normalized.message))

  return {
    statusCode: isRolloutDisabled ? 404 : (normalized.statusCode || 500),
    statusMessage: isRolloutDisabled ? 'Page not found' : normalized.message,
    data: {
      ...normalized,
      // Preserve the runtime code so error.vue can render the right variant
      runtimeCode: normalized.code,
      originalStack: (error as Error)?.stack,
    },
  }
}

const { data: runtimeData, pending, error } = await useAsyncData(
  () => runtimeDataKey.value,
  async () => {
    syncRuntimeContext()
    const resolved = await resolveRoute(route.path)
    if (resolved.status === 'not_found' || resolved.legacyPassthrough) {
      throw new StorefrontPageError('Page not found', 404, true)
    }
    const bundle = await fetchPayload(resolved)
    if (!bundle) {
      throw new StorefrontPageError('The storefront runtime payload is unavailable.', 500)
    }
    return { resolved, bundle } // no mutation of external state
  },
  { watch: [runtimeDataKey, () => route.path, () => route.query.preview, () => route.query.previewToken, () => route.query.token] }
)

watch(runtimeData, (val) => {
  if (!val) return
  if (val.bundle.theme) {
    storefrontContext.value.themePayload = val.bundle.theme
  }
  const sections = val.bundle.page?.template?.sections
  if (sections) {
    const headerSection = Object.values(sections).find((s: RuntimeTemplateSection) => s.type === 'header')
    const footerSection = Object.values(sections).find((s: RuntimeTemplateSection) =>
      s.type === 'footer' || s.type === 'footer-minimal' || s.type === 'footer-legal'
    )
    const templateNav = {
      header: (headerSection?.data?.navigation as RuntimeNavigationItem[]) ?? [],
      footer: (footerSection?.data?.navigation as RuntimeNavigationItem[]) ?? [],
    }
    if (templateNav.header.length || templateNav.footer.length) {
      storefrontContext.value.navigation = templateNav
    }
  }
}, { immediate: true })



// We are synchronously in setup() here — createError is safe
if (error.value) {
  if (isNuxtError(error.value)) {
    throw error.value
  }

  const runtimeError = nuxtApp.runWithContext(() => createError(toRuntimePageError(error.value)))
  throw runtimeError
}

type RuntimePageState = {
  resolved?: RuntimeResolvedRoute | null
  bundle?: StorefrontRuntimeBundle | null
  page?: StorefrontRuntimeBundle['page'] | null
  navigation?: StorefrontRuntimeBundle['navigation'] | null
  theme?: StorefrontRuntimeBundle['theme'] | null
} | null

const runtimeState = computed(() => runtimeData.value as RuntimePageState)
const resolvedRoute = computed(() => runtimeState.value?.resolved ?? null)

const runtimeBundle = computed<StorefrontRuntimeBundle | null>(() => {
  const state = runtimeState.value
  if (!state) return null
  if (state.bundle) return state.bundle
  return state.page && state.navigation && state.theme
    ? { page: state.page, navigation: state.navigation, theme: state.theme }
    : null
})

const runtimePage = computed(() =>
  runtimeBundle.value?.page ?? runtimeState.value?.page ?? null
)

const runtimeTheme = computed(() => runtimeBundle.value?.theme ?? null)

// ── Template-driven sections ─────────────────────────────────────
// When a page has a template with resolved sections but no old-format
// sections array, convert template sections to CmsSection[] for rendering.
const COMPONENT_FOR_TYPE: Record<string, string> = {
  hero: 'HeroSection',
  hero_banner: 'HeroSection',
  features: 'FeatureListSection',
  feature_list: 'FeatureListSection',
  content: 'ContentSection',
  rich_text: 'ContentSection',
  cta: 'CtaSection',
  call_to_action: 'CtaSection',
  category_grid: 'CategoryGridSection',
  product_grid: 'ProductGridSection',
  products: 'ProductGridSection',
  search_filters: 'SystemSectionProductFilters',
  faq: 'FaqSection',
  gallery: 'GallerySection',
  video: 'VideoSection',
  testimonials: 'TestimonialsSection',
  pricing: 'PricingSection',
}

const templateSectionsToCms = (template: RuntimePageTemplate): CmsSection[] => {
  return template.section_order
    .map((sectionId) => {
      const raw = template.sections[sectionId]
      if (!raw) return null

      const type = raw.type
      const component = COMPONENT_FOR_TYPE[type]
      if (!component) return null

      const props: Record<string, unknown> = { ...raw.data }

      // Normalize field names so both heading/title and text/subtitle consumers work
      if (props.heading !== undefined && props.title === undefined) {
        props.title = props.heading
      }
      if (props.title !== undefined && props.heading === undefined) {
        props.heading = props.title
      }
      if (props.text !== undefined && props.subtitle === undefined) {
        props.subtitle = props.text
      }
      if (props.subtitle !== undefined && props.text === undefined) {
        props.text = props.subtitle
      }

      return {
        id: sectionId,
        type,
        component,
        props,
        version: '1',
        dataState: 'ready' as const,
      }
    })
    .filter(Boolean) as CmsSection[]
}

const sectionsToRender = computed<CmsSection[]>(() => {
  const page = runtimePage.value
  if (!page) return []

  // Prefer old-format sections when available
  if (page.sections?.length) {
    return page.sections
  }

  // Fall back to template-driven sections
  if (page.template) {
    return templateSectionsToCms(page.template)
  }

  return []
})

// ✅ Also provide theme via provide/inject for components that use it
provideTheme(runtimeTheme)

// Provide layout_order so StorefrontShell can render sections in template-defined order
const layoutOrderRef = ref<string[]>(runtimePage.value?.layout_order ?? ['header', 'content', 'footer'])
watch(runtimePage, (page) => {
  layoutOrderRef.value = page?.layout_order ?? ['header', 'content', 'footer']
}, { immediate: true })
provide('layoutOrder', layoutOrderRef)

// Provide theme header section data (with blocks) for chrome rendering
const themeHeaderSectionRef = ref<RuntimePagePayload['themeHeaderSection'] | null>(runtimePage.value?.themeHeaderSection ?? null)
watch(runtimePage, (page) => {
  themeHeaderSectionRef.value = page?.themeHeaderSection ?? null
}, { immediate: true })
provide('themeHeaderSection', themeHeaderSectionRef)

// Provide chrome section settings (announcement_bar, copyright_bar, etc.)
const chromeSectionsRef = ref<Record<string, Record<string, unknown>>>(runtimePage.value?.chrome_sections ?? {})
watch(runtimePage, (page) => {
  chromeSectionsRef.value = page?.chrome_sections ?? {}
}, { immediate: true })
provide('chromeSections', chromeSectionsRef)

const runtimeShellStyle = computed<Record<string, string>>(() => {
  const theme = runtimeBundle.value?.theme
  if (!theme) return {} as Record<string, string>

  return {
    '--runtime-radius': `var(--radius-${theme.settings.radius})`,
  }
})

useHead(() => {
  const theme = runtimeBundle.value?.theme

  return {
    // ✅ FIX BUG 2: Don't set htmlAttrs here - let app.vue handle it
    // This prevents overriding app.vue's correct dir from useLocaleHead
    meta: theme?.tokens?.colorPrimary
      ? [{ name: 'theme-color', content: theme.tokens.colorPrimary }]
      : [],
    link: theme?.assets?.faviconUrl
      ? [{ rel: 'icon', href: theme.assets.faviconUrl }]
      : [],
  }
})

watchEffect(() => {
  if (runtimePage.value?.seo) {
    injectSeo(mapRuntimeSeoPayload(runtimePage.value.seo))
  }
})
</script>