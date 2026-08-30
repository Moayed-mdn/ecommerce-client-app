<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-white dark:bg-neutral-950"
    :dir="dir"
  >
    <!-- Top bar -->
    <div class="w-full max-w-xl text-start mb-12">
      <a href="/" class="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
        <span class="text-xl">🛍️</span> JustShop
      </a>
    </div>

    <!-- Card -->
    <div class="w-full max-w-xl">

      <!-- Store not found variant -->
      <template v-if="variant === 'store_not_found'">
        <div class="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
          <span class="text-3xl select-none" aria-hidden="true">🏪</span>
        </div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
          {{ t('store_not_found.headline') }}
        </h1>
        <p class="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          {{ t('store_not_found.description') }}
        </p>

        <div class="flex flex-col sm:flex-row gap-3">
          <a
            href="/"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold px-5 py-3 text-sm transition hover:opacity-80"
          >
            {{ t('store_not_found.cta_home') }}
          </a>
          <a
            :href="createStoreUrl"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold px-5 py-3 text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            {{ t('store_not_found.cta_create') }}
            <Icon name="i-heroicons-arrow-right-16-solid" class="w-4 h-4" />
          </a>
        </div>

        <p class="mt-8 text-xs text-neutral-400">
          {{ t('store_not_found.hint') }}
        </p>
      </template>

      <!-- Store inactive variant -->
      <template v-else-if="variant === 'store_inactive'">
        <div class="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20">
          <span class="text-3xl select-none" aria-hidden="true">🔒</span>
        </div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
          {{ t('store_inactive.headline') }}
        </h1>
        <p class="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          {{ t('store_inactive.description') }}
        </p>
        <a
          href="/"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold px-5 py-3 text-sm transition hover:opacity-80"
        >
          {{ t('store_inactive.cta_home') }}
        </a>
      </template>

      <!-- Generic 404 variant -->
      <template v-else-if="variant === 'not_found'">
        <div class="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
          <span class="text-3xl font-bold text-neutral-400 select-none" aria-hidden="true">404</span>
        </div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
          {{ t('not_found.headline') }}
        </h1>
        <p class="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          {{ t('not_found.description') }}
        </p>
        <a
          href="/"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold px-5 py-3 text-sm transition hover:opacity-80"
        >
          {{ t('not_found.cta_home') }}
        </a>
      </template>

      <!-- Generic error variant -->
      <template v-else>
        <div class="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20">
          <span class="text-3xl select-none" aria-hidden="true">⚠️</span>
        </div>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
          {{ t('generic.headline') }}
        </h1>
        <p class="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          {{ t('generic.description') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold px-5 py-3 text-sm transition hover:opacity-80"
            @click="handleError"
          >
            {{ t('generic.cta_retry') }}
          </button>
          <a
            href="/"
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold px-5 py-3 text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            {{ t('generic.cta_home') }}
          </a>
        </div>
      </template>

      <!-- Status code badge -->
      <div class="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
        <span class="font-mono">{{ props.error?.statusCode ?? 'Error' }}</span>
        <span v-if="runtimeCode" class="font-mono opacity-60">· {{ runtimeCode }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t, locale } = useI18n({ useScope: 'global' })

// Determine text direction from locale
const dir = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr')

// Extract runtime code from error data payload
const runtimeCode = computed<string | undefined>(() => {
  const data = props.error?.data as Record<string, unknown> | undefined
  return typeof data?.runtimeCode === 'string' ? data.runtimeCode : undefined
})

// Map to one of four visual variants
const variant = computed<'store_not_found' | 'store_inactive' | 'not_found' | 'generic'>(() => {
  const code = runtimeCode.value
  const status = props.error?.statusCode

  if (code === 'runtime.tenant_not_found') return 'store_not_found'
  if (code === 'runtime.tenant_inactive') return 'store_inactive'
  if (status === 404) return 'not_found'
  return 'generic'
})

// Where "Create store" links to — merchant dashboard signup
const createStoreUrl = computed(() => {
  // Use explicitly configured dashboard URL, or fall back to the root
  const config = useRuntimeConfig()
  return (config.public as Record<string, unknown>).dashboardUrl as string | undefined ?? '/'
})

const handleError = () => clearError({ redirect: '/' })
</script>
