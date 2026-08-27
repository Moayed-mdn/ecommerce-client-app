export const STOREFRONT_RUNTIME_CONTRACT_VERSION = '2026-06-26' as const

export const STOREFRONT_RUNTIME_SUPPORTED_LOCALES = ['en', 'ar'] as const
// Widened companion for .includes()/.has() against plain strings (avoids TS2345)
export const STOREFRONT_RUNTIME_SUPPORTED_LOCALES_LIST: readonly string[] = STOREFRONT_RUNTIME_SUPPORTED_LOCALES

export const STOREFRONT_RUNTIME_PAGE_TYPES = [
  'home',
  'marketing_page',
  'category_page',
  'product_page',
  'auth_page',
  'cart',
  'checkout',
  'checkout_success',
  'checkout_cancel',
  'search',
  'login',
  'register',
  'forgot_password',
  'reset_password',
  'verify_email',
  'profile',
  'orders',
  'order',
  'order_track',
  'categories',
  'error_404',
  'error_500',
] as const

export const STOREFRONT_RUNTIME_LAYOUTS = [
  'default',
  'marketing',
  'catalog',
  'product',
  'auth',
  'minimal',
] as const

export const STOREFRONT_RUNTIME_CACHE_ARTIFACTS = [
  'route',
  'page',
  'navigation',
  'theme',
  'seo',
  'template',
] as const

export const STOREFRONT_RUNTIME_LOG_FIELDS = [
  'tenant_id',
  'locale',
  'path',
  'request_id',
] as const
