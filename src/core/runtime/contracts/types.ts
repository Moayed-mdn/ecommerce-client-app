import {
  STOREFRONT_RUNTIME_CACHE_ARTIFACTS,
  STOREFRONT_RUNTIME_CONTRACT_VERSION,
  STOREFRONT_RUNTIME_LAYOUTS,
  STOREFRONT_RUNTIME_PAGE_TYPES,
  STOREFRONT_RUNTIME_SUPPORTED_LOCALES,
} from './constants'

export type StorefrontRuntimeVersion = typeof STOREFRONT_RUNTIME_CONTRACT_VERSION
export type StorefrontRuntimeLocale = (typeof STOREFRONT_RUNTIME_SUPPORTED_LOCALES)[number]
export type RuntimePageType = (typeof STOREFRONT_RUNTIME_PAGE_TYPES)[number]
export type RuntimeLayout = (typeof STOREFRONT_RUNTIME_LAYOUTS)[number]
export type RuntimeCacheArtifact = (typeof STOREFRONT_RUNTIME_CACHE_ARTIFACTS)[number]

export type RuntimeRouteStatus = 'matched' | 'not_found'
export type RuntimeErrorCode =
  | 'runtime.tenant_not_found'
  | 'runtime.tenant_inactive'
  | 'runtime.invalid_locale'
  | 'runtime.route_not_found'
  | 'runtime.page_not_found'
  | 'runtime.preview_invalid'
  | 'runtime.preview_expired'
  | 'runtime.validation_failed'
  | 'runtime.internal_error'

export interface RuntimeRequestHeaders {
  host: string
  storefrontVersion: StorefrontRuntimeVersion
  storefrontLocale: StorefrontRuntimeLocale
  requestId: string
  previewToken?: string | null
}

export interface RuntimeRouteResolutionRequest {
  headers: RuntimeRequestHeaders
  query: {
    path: string
    locale?: StorefrontRuntimeLocale
  }
}

export interface RuntimePagePayloadRequest {
  headers: RuntimeRequestHeaders
  params: {
    id: string
  }
  query: {
    preview?: boolean
  }
}

export interface RuntimeNavigationRequest {
  headers: RuntimeRequestHeaders
}

export interface RuntimeThemeRequest {
  headers: RuntimeRequestHeaders
}

export interface RuntimePreviewValidationRequest {
  headers: RuntimeRequestHeaders
  body: {
    token: string
    pageId: string
    path: string
    locale: StorefrontRuntimeLocale
  }
}

export interface RuntimeRequestContext {
  requestId: string
  tenantId: string | null
  tenantKey: string | null
  locale: StorefrontRuntimeLocale
  path: string
  runtimeVersion: StorefrontRuntimeVersion
  preview: boolean
}

export interface RuntimeCacheDescriptor {
  key: string
  artifact: RuntimeCacheArtifact
  ttlSeconds: number
  tags: string[]
  bypassed: boolean
}

export interface RuntimeRouteMatch {
  status: RuntimeRouteStatus
  routeType: RuntimePageType
  pageId: string | null
  resourceType: 'page' | 'product' | 'category' | 'auth' | 'cart' | 'search' | 'profile' | 'orders' | 'order' | 'none'
  resourceId: string | null
  path: string
  locale: StorefrontRuntimeLocale
  layout: RuntimeLayout | null
}

export interface RuntimeRouteResolutionResponse {
  requestContext: RuntimeRequestContext
  data: RuntimeRouteMatch
  cache: RuntimeCacheDescriptor
}

export interface RuntimeSectionDto {
  id: string
  type: string
  component: string
  props: Record<string, unknown>
  version: string
  dataState: 'ready' | 'empty' | 'error'
}

export interface RuntimeSeoPayload {
  title: string
  description: string
  canonicalUrl: string
  robots: 'index,follow' | 'noindex,nofollow' | 'noindex,follow'
  hreflang: Array<{
    locale: StorefrontRuntimeLocale
    url: string
  }>
  openGraph: {
    title: string
    description: string
    type: 'website' | 'product'
    imageUrl: string | null
  }
  twitter: {
    card: 'summary' | 'summary_large_image'
    title: string
    description: string
    imageUrl: string | null
  }
  jsonLd: Record<string, unknown>[]
}

export interface RuntimeTemplateSection {
  type: string
  settings: Record<string, unknown>
  data: Record<string, unknown>
}

export interface RuntimePageTemplate {
  id: number
  handle: string
  sections: Record<string, RuntimeTemplateSection>
  section_order: string[]
}

export interface RuntimePagePayload {
  id: string
  pageType: RuntimePageType
  title: string
  slug: string
  locale: StorefrontRuntimeLocale
  layout: RuntimeLayout
  status: 'published' | 'draft'
  sections: RuntimeSectionDto[]
  seo: RuntimeSeoPayload
  publishedAt: string | null
  updatedAt: string
  layout_order?: string[]
  template?: RuntimePageTemplate
  themeHeaderSection?: {
    id: string
    type: string
    settings: Record<string, unknown>
    blocks?: {
      id: string
      type: string
      name: string | null
      settings: Record<string, unknown>
      content: Record<string, unknown> | null
      position: number
    }[]
  }
  chrome_sections?: Record<string, Record<string, unknown>>
}

export interface RuntimePagePayloadResponse {
  requestContext: RuntimeRequestContext
  data: {
    page: RuntimePagePayload
  }
  cache: RuntimeCacheDescriptor
}

export interface RuntimeNavigationItem {
  id: string
  label: string
  path: string
  external: boolean
  children: RuntimeNavigationItem[]
}

export interface RuntimeNavigationResponse {
  requestContext: RuntimeRequestContext
  data: {
    header: RuntimeNavigationItem[]
    footer: RuntimeNavigationItem[]
  }
  cache: RuntimeCacheDescriptor
}

export interface ColorScheme {
  name: string
  background: string
  text: string
  button_background: string
  button_text: string
  secondary_background: string
  border: string
}

export interface RuntimeThemeResponse {
  requestContext: RuntimeRequestContext
  data: {
    themeKey: string
    branding?: {
      storeName: string
      tagline: string
    }
    tokens: {
      colorPrimary: string
      colorSecondary: string
      colorAccent: string
      colorSurface: string
      colorText: string
      fontBody: string
      fontHeading: string
    }
    assets: {
      logoUrl: string | null
      faviconUrl: string | null
    }
    settings: {
      radius: 'none' | 'sm' | 'md' | 'lg'
      direction: 'ltr' | 'rtl'
      colors?: {
        primary: string
        secondary: string
        accent: string
        background: string
        text: string
        [key: string]: string
      }
      color_schemes?: {
        [key: string]: ColorScheme
      }
    }
    buttons?: {
      primary: ButtonConfig
      secondary: ButtonConfig
      outline: ButtonConfig
    }
  }
  cache: RuntimeCacheDescriptor
}

export interface ButtonConfig {
  backgroundColor: string
  textColor: string
  borderColor: string
  borderWidth: number
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  paddingX: 'sm' | 'md' | 'lg' | 'xl'
  paddingY: 'sm' | 'md' | 'lg'
  fontSize: 'sm' | 'base' | 'lg'
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold'
  hoverEffect: 'opacity' | 'darken' | 'lift' | 'scale'
}

export interface RuntimePreviewValidationResponse {
  requestContext: RuntimeRequestContext
  data: {
    valid: boolean
    previewState: 'authorized' | 'denied' | 'expired'
    pageId: string | null
    expiresAt: string | null
    cacheBypass: boolean
  }
}

export interface RuntimeErrorResponse {
  requestContext: RuntimeRequestContext
  error: {
    code: RuntimeErrorCode
    message: string
    httpStatus: 400 | 401 | 403 | 404 | 409 | 422 | 500 | 503
    retryable: boolean
    details: Record<string, unknown>
  }
}

// ── System Template types (Phase 0: Template-Everything) ──────────────────

export interface RuntimeBlockInstance {
  id: string
  type: string
  name: string | null
  settings: Record<string, unknown>
  content: Record<string, unknown> | null
  position: number
  is_enabled?: boolean
}

export interface RuntimeTemplateSectionDetail {
  id: string
  type: string
  settings: Record<string, unknown>
  data: Record<string, unknown>
  blocks?: RuntimeBlockInstance[]
  enabled?: boolean
}

export interface RuntimeSystemTemplate {
  id: number
  type: string
  handle: string
  name: string
  sections: Record<string, RuntimeTemplateSectionDetail>
  section_order: string[]
}

export interface RuntimeTemplateResponse {
  requestContext: RuntimeRequestContext
  data: RuntimeSystemTemplate
  cache: RuntimeCacheDescriptor
}

export interface RuntimeSectionGroupSection {
  id: string
  type: string
  settings: Record<string, unknown>
  data: Record<string, unknown>
}

export interface RuntimeSectionGroup {
  handle: string
  sections: RuntimeSectionGroupSection[]
}

export interface RuntimeSectionGroupResponse {
  requestContext: RuntimeRequestContext
  data: {
    header: RuntimeSectionGroup
    footer: RuntimeSectionGroup
  }
  cache: RuntimeCacheDescriptor
}

// ── Expanded Theme types (Phase 0) ────────────────────────────────────────

export interface ThemeBranding {
  logo_url: string | null
  favicon_url: string | null
  store_name: string
  tagline: string
}

export interface ThemeSocialLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  youtube?: string
  tiktok?: string
  linkedin?: string
  pinterest?: string
}

export interface ThemeTopbarSettings {
  show_topbar: boolean
  phone: string
  announcement_text: string
  announcement_link: string
}

export interface ThemeFooterSettings {
  show_newsletter: boolean
  copyright_text: string
  payment_icons: string[]
}

export interface ThemeSeoSettings {
  default_title: string
  default_description: string
  default_og_image: string
}

export interface ThemeSearchSettings {
  placeholder: string
  show_suggestions: boolean
  products_per_page: number
}

export interface ThemeMaintenanceSettings {
  enabled: boolean
  message: string
}
