<template>
  <section 
    class="rounded-3xl border px-6 py-10 shadow-sm"
    :style="sectionStyle"
  >
    <div class="mx-auto max-w-5xl">
      <h2 v-if="title" class="text-2xl font-semibold" :style="{ color: colorScheme.color }">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-3 text-base" :style="{ color: colorScheme.color, opacity: 0.8 }">
        {{ subtitle }}
      </p>

      <!-- Rich card items: { icon, title, body } -->
      <ul
        v-if="cardItems.length"
        class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <li
          v-for="(item, index) in cardItems"
          :key="index"
          class="rounded-2xl p-5 border"
          :style="cardStyle"
        >
          <img
            v-if="item.icon"
            :src="item.icon"
            :alt="item.title || ''"
            loading="lazy"
            class="mb-3 h-10 w-10 object-contain"
          >
          <p v-if="item.title" class="text-sm font-bold" :style="{ color: colorScheme.color }">{{ item.title }}</p>
          <p v-if="item.body" class="mt-1 text-sm leading-relaxed" :style="{ color: colorScheme.color, opacity: 0.8 }">{{ item.body }}</p>
        </li>
      </ul>

      <!-- Simple string list items -->
      <ul
        v-else-if="featureItems.length"
        class="mt-6 grid gap-4 sm:grid-cols-2"
      >
        <li
          v-for="(item, index) in featureItems"
          :key="`${index}-${item}`"
          class="rounded-2xl p-4"
          :style="cardStyle"
        >
          {{ item }}
        </li>
      </ul>

      <pre v-else-if="content" class="mt-6 overflow-x-auto rounded-2xl p-4 text-sm" :style="cardStyle">{{ content }}</pre>
    </div>
  </section>
</template>

<!--
  Data shapes this component supports for `data.items`:
    1. data.items = [{ icon, title, body }, ...]                (flat array, preferred shape)
    2. data.content = [{ icon, title, body }, ...]               (array stored under `content`)
    3. data.content = { items: [{ icon, title, body }, ...] }    (nested shape some CMS records use)
  Items may have icon-only, title-only, body-only, or any combination of the three.
-->

<script setup lang="ts">
import type { RuntimeSectionComponentProps } from '../types'
import { applyColorScheme } from '../utils/colorScheme'
import { useMediaUrl } from '~/composables/useMediaUrl'

const props = defineProps<RuntimeSectionComponentProps>()
const { resolveMediaUrl } = useMediaUrl()

// Color scheme support
const colorScheme = computed(() => {
  const schemeKey = (props.data.settings as any)?.color_scheme
  return applyColorScheme(props.theme, schemeKey)
})

const sectionStyle = computed(() => ({
  backgroundColor: colorScheme.value.backgroundColor,
  color: colorScheme.value.color,
  borderColor: colorScheme.value.borderColor,
}))

const cardStyle = computed(() => ({
  backgroundColor: colorScheme.value.secondaryBackground,
  color: colorScheme.value.color,
  borderColor: colorScheme.value.borderColor,
}))

type CardItem = { title: string; body: string; icon?: string }

const rawItems = computed<unknown[]>(() => {
  const data = props.data

  // Shape 1: data.items = [...]
  if (Array.isArray(data.items)) return data.items

  // Shape 2: data.content = [...]
  if (Array.isArray(data.content)) return data.content

  // Shape 3: data.content = { items: [...] }  (nested shape some CMS records use)
  const content = data.content
  if (content && typeof content === 'object' && !Array.isArray(content)) {
    const nestedItems = (content as Record<string, unknown>).items
    if (Array.isArray(nestedItems)) return nestedItems
  }

  return []
})

// Rich card items: objects with an icon, a title, and/or a body — any combination.
// Items with only an icon (no title/body) are still valid cards, e.g. a logo grid.
const cardItems = computed<CardItem[]>(() => {
  return rawItems.value
    .filter((item): item is Record<string, unknown> =>
      item !== null && typeof item === 'object' && !Array.isArray(item) &&
      (typeof (item as Record<string, unknown>).icon === 'string' ||
       typeof (item as Record<string, unknown>).title === 'string' ||
       typeof (item as Record<string, unknown>).body === 'string'))
    .map((item) => ({
      icon:  typeof item.icon  === 'string' && item.icon ? resolveMediaUrl(item.icon) : undefined,
      title: typeof item.title === 'string' ? item.title : '',
      body:  typeof item.body  === 'string' ? item.body  : '',
    }))
})

// Plain string items (original behaviour)
const featureItems = computed<string[]>(() => {
  if (cardItems.value.length) return []
  return rawItems.value
    .map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        if ('label' in item && typeof (item as Record<string, unknown>).label === 'string') return (item as Record<string, unknown>).label as string
        if ('title' in item && typeof (item as Record<string, unknown>).title === 'string') return (item as Record<string, unknown>).title as string
      }
      return null
    })
    .filter((item): item is string => Boolean(item))
})

const title    = computed(() => typeof props.data.title    === 'string' ? props.data.title    : '')
const subtitle = computed(() => typeof props.data.subtitle === 'string' ? props.data.subtitle : '')

// Last-resort debug fallback: only reached when there are no card items and no
// string items. Stringify objects/arrays so this never prints "[object Object]".
const content = computed<string | null>(() => {
  const raw = props.data.content
  if (raw === null || raw === undefined || raw === '') return null
  if (typeof raw === 'string') return raw
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw)
  try {
    return JSON.stringify(raw, null, 2)
  } catch {
    return null
  }
})
</script>