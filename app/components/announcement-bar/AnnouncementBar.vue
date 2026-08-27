<template>
  <div
    v-if="visible"
    class="h-(--topbar-mobile-height) sm:h-(--topbar-height) bg-(--announcement-bg) text-(--announcement-text-color) text-(length:--topbar-text-size) font-bold px-(--site-gutter) z-(--topbar-z)"
    :style="barStyle"
  >
    <div class="h-full flex flex-col sm:flex-row justify-evenly items-center">
      <a
        v-if="phone"
        class="inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
        :href="'tel:' + phone"
      >
        <span aria-hidden="true" class="inline-flex">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.46683 10.5325C0.868173 5.93332 1.52209 3.82727 2.00687 3.14861C2.06915 3.03892 3.60415 0.741091 5.24956 2.08922C9.33372 5.45281 4.16324 4.97725 7.59277 8.40736C11.023 11.8368 10.5474 6.66647 13.9104 10.7498C15.2586 12.3958 12.9607 13.9308 12.8517 13.9923C12.173 14.4778 10.0662 15.1317 5.46683 10.5325Z" stroke="var(--announcement-text-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="sr-only">{{ t('announcement_bar.call_sr') }}</span>
        <span>{{ phone }}</span>
      </a>

      <div class="hidden sm:flex flex-1 justify-center">
        <p class="text-center">{{ offerText }}</p>
        <span v-if="offerText && shopNowText" class="mx-4">|</span>
        <a
          v-if="shopNowText && shopNowLink"
          :href="shopNowLink"
          class="underline underline-offset-2 hover:no-underline"
          :style="{ color: 'var(--announcement-text-color)' }"
        >
          {{ shopNowText }} 
        </a>
      </div>

      <div class="flex">
        <div v-if="languageSwitcher" class="mx-3">
          <TopbarLanguageSwitcher />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  settings?: Record<string, unknown>
  showLanguageSwitcher?: boolean
}>()

const { t, locale } = useI18n()

const merged = computed(() => props.settings ?? {})

const resolveLocalizedString = (value: unknown): string => {
  if (typeof value === 'string') return value

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const localized = value as Record<string, unknown>
    const active = localized[locale.value]
    const fallback = localized.en

    if (typeof active === 'string' && active !== '') return active
    if (typeof fallback === 'string') return fallback
  }

  return ''
}

const visible = computed(() => {
  const v = merged.value.enabled
  return v !== false && v !== 'false'
})

const phone = computed(() => String(merged.value.phone ?? ''))
const offerText = computed(() => resolveLocalizedString(merged.value.offer_text ?? merged.value.text))
const shopNowText = computed(() => resolveLocalizedString(merged.value.shop_now_text))
const shopNowLink = computed(() => {
  const v = merged.value.shop_now_link ?? merged.value.link ?? merged.value.url ?? null
  return v ? String(v) : null
})
const bgColor = computed(() => String(merged.value.background_color ?? merged.value.bg_color ?? '#1F2937'))
const textColor = computed(() => String(merged.value.text_color ?? '#FFFFFF'))
const languageSwitcher = computed(() => {
  if (props.showLanguageSwitcher !== undefined) return props.showLanguageSwitcher
  const v = merged.value.show_language_switcher
  return v !== false && v !== 'false'
})

const barStyle = computed(() => ({
  '--announcement-bg': bgColor.value,
  '--announcement-text-color': textColor.value,
}))
</script>
