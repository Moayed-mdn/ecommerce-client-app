<template>
  <NuxtLinkLocale v-if="isInternal" :to="resolvedHref" v-bind="$attrs">
    <slot />
  </NuxtLinkLocale>
  <a v-else :href="resolvedHref" v-bind="$attrs">
    <slot />
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isExternalOrSpecialHref, toLocaleNeutralPath } from '~/composables/useCmsLink'

// Render any CMS-authored href correctly, whether the merchant typed
// "/shop", "/en/shop", a full external URL, or a "#" placeholder — without
// every call site having to know or check which case it got.
//
// Use this instead of NuxtLinkLocale directly for ANY href that came from
// CMS/merchant-entered content (menu items, CTA buttons, category/product
// link overrides, etc). For hrefs you constructed yourself in code (e.g.
// via useStorefrontRoutes()), NuxtLinkLocale directly is still correct —
// those are already locale-neutral by construction and don't need this.
const props = defineProps<{
  href: string | null | undefined
}>()

defineOptions({ inheritAttrs: false })

const isInternal = computed(() => {
  const href = props.href
  return !!href && href.startsWith('/') && !isExternalOrSpecialHref(href)
})

const resolvedHref = computed(() => {
  const href = props.href
  if (!href) return '#'
  if (isExternalOrSpecialHref(href)) return href
  return toLocaleNeutralPath(href)
})
</script>
