<template>
  <StorefrontShell variant="full">
    <slot />
  </StorefrontShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// useSystemPageTemplate() fetches the backend template for this system
// page (cart/checkout/login/...) purely to read its chrome sections
// (header, announcement_bar, footer, copyright_bar) and their settings.
// The actual page body is NOT rendered from this template — every
// system page (cart.vue, login.vue, etc.) hardcodes its own content in
// its <template>. Do not add "content" section rendering here without
// also wiring the page components to consume it.
const {
  sectionOrder,
  sectionMap,
} = useSystemPageTemplate()

const CHROME_SECTION_TYPES = new Set(['header', 'announcement_bar', 'footer', 'copyright_bar'])

// Provide layout_order and chrome_sections for StorefrontShell
const layoutOrder = computed(() => {
  const order: string[] = []
  for (const id of sectionOrder.value) {
    const section = sectionMap.value[id]
    if (section && CHROME_SECTION_TYPES.has(section.type)) {
      order.push(section.type)
    }
  }
  if (!order.includes('content')) {
    const footerIdx = order.findIndex(t => t === 'footer' || t === 'copyright_bar')
    if (footerIdx === -1) {
      order.push('content')
    } else {
      order.splice(footerIdx, 0, 'content')
    }
  }
  if (!order.includes('header')) {
    order.unshift('header')
  }
  if (!order.includes('footer')) {
    order.push('footer')
  }
  return order
})
provide('layoutOrder', layoutOrder)

const chromeSections = computed(() => {
  const result: Record<string, Record<string, unknown>> = {}
  for (const id of sectionOrder.value) {
    const section = sectionMap.value[id]
    if (section && CHROME_SECTION_TYPES.has(section.type)) {
      result[section.type] = section.settings ?? {}
    }
  }
  return result
})
provide('chromeSections', chromeSections)
</script>
