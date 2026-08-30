import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2025-07-15',

  // ✅ تعطيل devtools و debug في بيئة الاختبار
  devtools: {
    enabled: process.env.NODE_ENV !== 'test',
    timeline: {
      enabled: false,
    },
  },

  // ✅ تقليل الـ logs المزعجة
  debug: false,

  // ⚠️ PERF FIX: preconnect to the API/image backend origin so the browser
  // starts DNS + TCP + TLS negotiation immediately instead of waiting for
  // the first API/image request to discover the origin. Cheap, safe win on
  // every page load.
  app: {
    head: {
      link: (() => {
        const apiBase = process.env.NUXT_PUBLIC_API_BASE || ''
        const backendOrigin = apiBase.replace(/\/api\/v1.*$/, '')
        if (!backendOrigin) return []
        return [
          { rel: 'preconnect', href: backendOrigin, crossorigin: '' },
          { rel: 'dns-prefetch', href: backendOrigin },
        ]
      })(),
    },
  },

  css: ['@/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      allowedHosts: ['.justshop.test'],
    },
    optimizeDeps: {
      include: ['@apollo/client/core', 'graphql-tag'],
    },
  },
  runtimeConfig: {
    apiBase: process.env.NUXT_API_BASE || process.env.NUXT_PUBLIC_API_BASE,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      graphqlUrl: process.env.NUXT_PUBLIC_GRAPHQL_URL,
      dashboardUrl: process.env.NUXT_PUBLIC_DASHBOARD_URL || '/',
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    },
  },
  modules: [
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    'nuxt-ssr-api-logger',
    '@pinia/nuxt',
    '@nuxt/ui',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxt/icon',
  ],

  components: [
    { path: '~/components/ui', prefix: 'Ui', pathPrefix: false },
    { path: '~/components', pathPrefix: false },
    {
      path: fileURLToPath(new URL('./src/core/rendering', import.meta.url)),
      prefix: 'Runtime',
    },
  ],

  imports: {
    dirs: [
      'shared/utils',
      'src/core/tenant',
      'src/core/api',
      'src/core/cache',
      'src/domains/**',
      'src/platform/**',
    ],
  },

  nitro: {
    imports: {
      dirs: [
        'shared/utils',
        'src/core/tenant',
        'src/core/api',
        'src/core/cache',
      ],
    },
    // ⚠️ PERF FIX: This used to blanket-disable caching on '/**', which also
    // stripped caching from hashed/immutable JS+CSS bundles and every proxied
    // image, forcing a full re-download of the app and all product images on
    // every navigation/reload. Only routes with per-user/session state need
    // to stay uncacheable; everything else should be left to Nitro's sane
    // defaults (and static/image assets should actually be cached).
    routeRules: {
      '/cart/**': {
        cache: false,
        headers: { 'Cache-Control': 'no-store, must-revalidate' },
      },
      '/checkout/**': {
        cache: false,
        headers: { 'Cache-Control': 'no-store, must-revalidate' },
      },
      '/orders/**': {
        cache: false,
        headers: { 'Cache-Control': 'no-store, must-revalidate' },
      },
      '/profile/**': {
        cache: false,
        headers: { 'Cache-Control': 'no-store, must-revalidate' },
      },
      '/storage/**': {
        // Serve storage paths from nitro server, not vue router
        prerender: false,
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      },
    },
  },

  i18n: {
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: true,
    },
    locales: [
      {
        code: 'en',
        language: 'en-US',
        dir: 'ltr',
        name: 'English',
        icon: 'i-circle-flags-gb',
        files: [
          'en/header.json', 'en/cart.json', 'en/best-seller.json',
          'en/product.json', 'en/search.json', 'en/filter.json',
          'en/topbar.json', 'en/footer.json', 'en/checkout.json',
          'en/orders.json', 'en/login.json', 'en/register.json',
          'en/profile.json', 'en/auth.json', 'en/error.json',
          'en/categories.json', 'en/address.json', 'en/announcement_bar.json', 'en/common.json',
        ],
      },
      {
        code: 'ar',
        language: 'ar-SA',
        dir: 'rtl',
        name: 'العربية',
        icon: 'i-circle-flags-sa',
        files: [
          'ar/header.json', 'ar/cart.json', 'ar/best-seller.json',
          'ar/product.json', 'ar/search.json', 'ar/filter.json',
          'ar/topbar.json', 'ar/footer.json', 'ar/checkout.json',
          'ar/orders.json', 'ar/login.json', 'ar/register.json',
          'ar/profile.json', 'ar/auth.json', 'ar/error.json',
          'ar/categories.json', 'ar/address.json', 'ar/announcement_bar.json', 'ar/common.json',
        ],
      },
    ],
  },

  typescript: {
    tsConfig: {
      include: ['../src/**/*', '../types/**/*.d.ts'],
    },
  },
})
