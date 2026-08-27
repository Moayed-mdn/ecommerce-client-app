<template>
  <section class="rounded-3xl px-6 py-16" :style="sectionStyle">
    <div class="mx-auto max-w-7xl">
      <div v-if="title || subtitle" class="mb-12 text-center">
        <h2 v-if="title" class="text-3xl font-bold tracking-tight sm:text-4xl" :style="{ color: colorScheme.color }">
          {{ title }}
        </h2>
        <p v-if="subtitle" class="mt-3 text-base sm:text-lg" :style="{ color: colorScheme.color, opacity: 0.8 }">
          {{ subtitle }}
        </p>
      </div>

      <!-- Gallery Grid -->
      <div v-if="members.length" class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(member, index) in members"
          :key="index"
          class="flex flex-col items-center rounded-2xl border p-6 text-center transition-all hover:-translate-y-1 hover:shadow-md"
          :style="cardStyle"
        >
          <!-- Image -->
          <div class="mb-5 h-32 w-32 flex-shrink-0 overflow-hidden rounded-full">
            <img
              v-if="member.image"
              :src="member.image"
              :alt="member.name"
              loading="lazy"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br text-white" :style="{ background: colorScheme.buttonBackground }">
              <span class="text-3xl font-bold">{{ getInitials(member.name) }}</span>
            </div>
          </div>

          <!-- Info -->
          <div class="flex flex-col gap-2">
            <h3 class="text-lg font-semibold" :style="{ color: colorScheme.color }">{{ member.name }}</h3>
            <p v-if="member.role" class="text-sm font-medium" :style="{ color: colorScheme.buttonBackground }">{{ member.role }}</p>
            <p v-if="showBio && member.bio" class="text-sm leading-relaxed" :style="{ color: colorScheme.color, opacity: 0.8 }">{{ member.bio }}</p>
          </div>
        </article>
      </div>

      <p v-else class="py-12 text-center text-sm" :style="{ color: colorScheme.color, opacity: 0.7 }">
        No gallery items available.
      </p>
    </div>
  </section>
</template>

<!--
  Data shape: data.content = { members: [{ name, role, bio, image }, ...] }
  
  This nested shape is enforced by the admin panel (GallerySectionContent.tsx), which always
  POSTs content.members (not a flat array). Backend validation passes it through as-is.
  No backward compatibility needed - admin has always used this shape.
  
  Verified: laratenant-commerce section-editors, laratenant-backend StorefrontRuntimeService, Aug 2026 audit
-->

<script setup lang="ts">
import type { RuntimeSectionComponentProps } from '../types'
import { applyColorScheme } from '../utils/colorScheme'

const props = defineProps<RuntimeSectionComponentProps>()

// Color scheme support
const colorScheme = computed(() => {
  const schemeKey = (props.data.settings as any)?.color_scheme
  return applyColorScheme(props.theme, schemeKey)
})

const sectionStyle = computed(() => ({
  backgroundColor: colorScheme.value.backgroundColor,
  color: colorScheme.value.color,
}))

const cardStyle = computed(() => ({
  backgroundColor: colorScheme.value.secondaryBackground,
  color: colorScheme.value.color,
  borderColor: colorScheme.value.borderColor,
}))

const title = computed(() => typeof props.data.title === 'string' ? props.data.title : '')
const subtitle = computed(() => typeof props.data.subtitle === 'string' ? props.data.subtitle : '')

const content = computed(() => {
  const c = props.data.content
  return c && typeof c === 'object' && !Array.isArray(c) ? c as Record<string, unknown> : {}
})

const settings = computed(() => {
  const s = props.data.settings
  return s && typeof s === 'object' && !Array.isArray(s) ? s as Record<string, unknown> : {}
})

const showBio = computed(() => settings.value.show_bio !== false)

type GalleryMember = {
  name: string
  role?: string
  bio?: string
  image?: string | null
}

const members = computed<GalleryMember[]>(() => {
  const arr = content.value.members
  if (!Array.isArray(arr)) return []
  return arr.filter((item): item is GalleryMember =>
    item !== null &&
    typeof item === 'object' &&
    'name' in item &&
    typeof item.name === 'string'
  )
})

const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
</script>
