<template>
  <header
    class="relative w-full bg-[--header-bg] px-[--site-gutter] shadow-[--header-shadow] z-[--header-z]"
    data-storefront-shell="header"
  >
    <nav
      v-if="shellConfig.showRuntimeNavigation && runtimeHeaderItems.length"
      aria-label="Storefront primary navigation"
      class="border-b border-[--color-border-default] py-2"
    >
      <ul class="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-[--color-text-secondary]">
        <li v-for="item in runtimeHeaderItems" :key="item.id">
          <a
            v-if="item.external"
            :href="item.path"
            target="_blank"
            rel="noreferrer noopener"
            class="transition-colors hover:text-[--color-primary]"
          >
            {{ item.label }}
          </a>
          <NuxtLinkLocale
            v-else
            :to="item.path"
            class="transition-colors hover:text-[--color-primary]"
          >
            {{ item.label }}
          </NuxtLinkLocale>
        </li>
      </ul>
    </nav>

    <HeaderTopRow>
      <template #start>
        <HeaderLogo :logo-settings="logoSettings" />
      </template>

      <template #center>
        <div
          v-if="!isMinimal && shellConfig.variant !== 'auth-template'"
          class="hidden lg:flex flex-1 items-center justify-center gap-[--header-gap-wide]"
        >
          <!-- <HeaderLinks v-if="!runtimeHeaderItems.length" /> -->
          <HeaderSearchInput
            v-if="shellConfig.showSearch"
            class="max-w-md hidden lg:flex"
          />
        </div>
      </template>

      <template #end>
        <HeaderActions
          v-if="shellConfig.showCart || shellConfig.showAccount || (!isMinimal && shellConfig.variant !== 'auth-template')"
        />
      </template>
    </HeaderTopRow>

    <div
      v-if="shellConfig.showSearch && !isMinimal"
      class="mb-2 w-full lg:hidden"
    >
      <HeaderSearchInput />
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Ref } from '#imports'
import { inject, isRef } from '#imports'
import { useStorefrontContext } from '~~/src/core/tenant/composables'
import { useStorefrontShell } from '~/composables/useStorefrontShell'
import type { RuntimeTemplateSectionDetail } from '~~/src/core/runtime/contracts/types'

const props = defineProps<{
  headerSection?: RuntimeTemplateSectionDetail | null
}>()

const { config: shellConfig, isMinimal } = useStorefrontShell()
const context = useStorefrontContext()

interface ThemeHeaderSection {
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
    is_enabled?: boolean
  }[]
}

const themeHeaderSection = inject<Ref<ThemeHeaderSection | null> | ThemeHeaderSection | null>('themeHeaderSection', null)

const logoSettings = computed(() => {
  // Priority: headerSection prop (with blocks) > ThemeTemplate inject > empty
  const source = props.headerSection?.blocks?.length
    ? props.headerSection
    : (isRef(themeHeaderSection) ? themeHeaderSection.value : themeHeaderSection)
  const blocks = source?.blocks ?? []
  const logoBlock = blocks.find(b => b.type === 'logo')
  return logoBlock?.settings as Record<string, unknown> ?? {}
})

const runtimeHeaderItems = computed(() => context.value.navigation?.header ?? [])
</script>

<style>
/* Active state for runtime navigation links - unscoped for SSR compatibility */
nav[aria-label="Storefront primary navigation"] a.router-link-active,
nav[aria-label="Storefront primary navigation"] a.router-link-exact-active {
  color: var(--color-primary) !important;
  font-weight: 600 !important;
}
</style>
