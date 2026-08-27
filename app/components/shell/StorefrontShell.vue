<template>
  <div
    class="relative flex min-h-screen flex-col bg-[--color-bg-page] text-[--color-text-primary]"
    data-storefront-shell="root"
  >
    <template v-for="section in layoutOrder" :key="section">
      <StorefrontShellHeader v-if="section === 'header'" />
      <AnnouncementBar
        v-else-if="section === 'announcement_bar'"
        :settings="chromeSections?.announcement_bar"
        :show-language-switcher="showLanguageSwitcher"
      />
      <main v-else-if="section === 'content'" class="flex-1">
        <slot />
      </main>
      <StorefrontShellFooter v-else-if="section === 'footer'" />
      <div
        v-else-if="section === 'copyright_bar'"
        v-show="copyrightVisible"
        class="w-full border-t px-6 py-4 text-center text-xs"
        :style="copyrightBarStyle"
      >
        <span :style="{ color: copyrightTextColor }">{{ copyrightText }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, isRef } from 'vue'
import type { Ref } from 'vue'
import {
  defaultStorefrontShellConfig,
  provideStorefrontShell,
  type StorefrontShellVariant,
} from '~/composables/useStorefrontShell'
const { locale, t } = useI18n()

const props = withDefaults(defineProps<{
  variant?: StorefrontShellVariant
}>(), {
  variant: 'full',
})

const shellConfig = computed(() => defaultStorefrontShellConfig(props.variant))

provideStorefrontShell(shellConfig)

const layoutOrderInjected = inject<Readonly<Ref<string[]>> | string[]>('layoutOrder', ['header', 'content', 'footer'])
const layoutOrder = computed(() => {
  if (isRef(layoutOrderInjected)) {
    return layoutOrderInjected.value
  }
  return layoutOrderInjected
})

const chromeSectionsInjected = inject<Readonly<Ref<Record<string, Record<string, unknown>>>> | Record<string, Record<string, unknown>>>('chromeSections', {})

interface HeaderBlock {
  id: string
  type: string
  settings: Record<string, unknown>
  is_enabled?: boolean
}
interface HeaderSectionData {
  id: string
  type: string
  settings: Record<string, unknown>
  blocks?: HeaderBlock[]
}
const themeHeaderSectionInjected = inject<Readonly<Ref<HeaderSectionData | null>> | HeaderSectionData | null>('themeHeaderSection', null)
const themeHeaderSection = computed(() => {
  const v = isRef(themeHeaderSectionInjected) ? themeHeaderSectionInjected.value : themeHeaderSectionInjected
  return v ?? undefined
})
const showLanguageSwitcher = computed(() => {
  const blocks = themeHeaderSection.value?.blocks ?? []
  const langBlock = blocks.find(b => b.type === 'language_selector')
  return langBlock ? (langBlock.is_enabled ?? true) : true
})
const chromeSections = computed(() => {
  if (isRef(chromeSectionsInjected)) {
    return chromeSectionsInjected.value
  }
  return chromeSectionsInjected
})

// ── Copyright bar ───────────────────────────────────────────
const copyrightSettings = computed(() => chromeSections.value?.copyright_bar ?? {})
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
const copyrightVisible = computed(() => {
  const v = copyrightSettings.value.enabled
  return v !== false && v !== 'false'
})
const copyrightText = computed(() => {
  const year = new Date().getFullYear()
  const raw = resolveLocalizedString(copyrightSettings.value.text ?? copyrightSettings.value.copyright_text)
  const template = raw || t('footer.copyright_default')
  return template.replace(/\{year\}/g, String(year))
})
const copyrightBgColor = computed(() => String(copyrightSettings.value.background_color ?? copyrightSettings.value.bg_color ?? 'transparent'))
const copyrightTextColor = computed(() => String(copyrightSettings.value.text_color ?? '#6b7280'))
const copyrightBarStyle = computed(() => ({ backgroundColor: copyrightBgColor.value }))
</script>
