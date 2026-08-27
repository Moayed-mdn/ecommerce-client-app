<template>
  <section 
    v-if="hasContent" 
    ref="heroSection"
    class="rounded-3xl px-6 py-16 sm:px-10"
    :style="sectionStyle"
  >
    <div class="mx-auto max-w-4xl">
      <p v-if="resolvedEyebrow" class="text-sm font-semibold uppercase tracking-[0.2em] opacity-90" :style="{ color: textColor }">
        {{ resolvedEyebrow }}
      </p>
      <h1 class="mt-3 text-4xl font-bold tracking-tight sm:text-5xl" :style="{ color: textColor }">
        {{ resolvedHeadline }}
      </h1>
      <p v-if="resolvedSubheadline" class="mt-4 max-w-2xl text-base opacity-90 sm:text-lg" :style="{ color: textColor }">
        {{ resolvedSubheadline }}
      </p>
      <div v-if="resolvedCtaText && resolvedCtaUrl" class="mt-8">
        <NuxtLink
          :to="resolvedCtaUrl"
          class="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition"
          :style="ctaButtonStyle"
        >
          {{ resolvedCtaText }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RuntimeSectionComponentProps } from '../types'
import { getContrastingTextColor } from '../utils/colorContrast'
import { applyColorScheme, resolveColorSchemeKey } from '../utils/colorScheme'
import { useCmsLink } from '~/composables/useCmsLink'

const { resolveHref } = useCmsLink()

type HeroBannerItem = {
  headline?: string
  subheadline?: string
  ctaText?: string
  ctaUrl?: string
  visualType?: string
  imageUrl?: string | null
  gradientFrom?: string | null
  gradientTo?: string | null
}

const props = defineProps<RuntimeSectionComponentProps>()

// Template ref for direct DOM manipulation if needed
const heroSection = ref<HTMLElement | null>(null)

// Track client-side hydration state
const isHydrated = ref(false)

// Ensure client-side hydration is complete
onMounted(() => {
  isHydrated.value = true
  
  // Force re-apply styles after hydration to fix any SSR mismatch
  if (heroSection.value && sectionStyle.value) {
    nextTick(() => {
      if (heroSection.value) {
        Object.assign(heroSection.value.style, sectionStyle.value)
      }
    })
  }
})

const heroItems = computed<HeroBannerItem[]>(() => {
  if (!Array.isArray(props.data.items)) {
    return []
  }

  return props.data.items
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      headline: typeof item.headline === 'string' ? item.headline : undefined,
      subheadline: typeof item.subheadline === 'string' ? item.subheadline : undefined,
      ctaText: typeof item.ctaText === 'string' ? item.ctaText : undefined,
      ctaUrl: typeof item.ctaUrl === 'string' ? item.ctaUrl : undefined,
      visualType: typeof item.visualType === 'string' ? item.visualType : 'image',
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : null,
      gradientFrom: typeof item.gradientFrom === 'string' ? item.gradientFrom : null,
      gradientTo: typeof item.gradientTo === 'string' ? item.gradientTo : null,
    }))
})

const primaryHeroItem = computed(() => heroItems.value[0] ?? null)

const content = computed(() => {
  const value = props.data.content
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
})

// Resolve color scheme for this section
const colorScheme = computed(() => {
  const schemeKey = resolveColorSchemeKey(props.data.settings)
  return applyColorScheme(props.theme, schemeKey)
})

// Extract background color from sectionStyle for contrast calculation
// This is used when there's a gradient or image (not using color scheme)
const backgroundColor = computed(() => {
  const item = primaryHeroItem.value
  
  // For gradients, use the "from" color
  if (item?.visualType === 'gradient' && item.gradientFrom) {
    return String(item.gradientFrom).trim()
  }
  
  // For images, default to dark background assumption
  if (item?.visualType === 'image' && item.imageUrl) {
    return '#1F2937' // Dark gray - safe assumption for images
  }
  
  // Otherwise use color scheme background
  return colorScheme.value.backgroundColor
})

// Calculate contrasting text color
const textColor = computed(() => {
  const item = primaryHeroItem.value
  
  // For images, use white text (dark background assumption)
  if (item?.visualType === 'image' && item.imageUrl) {
    return '#FFFFFF'
  }
  
  // For gradients, calculate from gradient start color
  if (item?.visualType === 'gradient' && item.gradientFrom) {
    return getContrastingTextColor(String(item.gradientFrom).trim())
  }
  
  // Use color scheme text color
  return colorScheme.value.color
})

// CTA button style from color scheme
const ctaButtonStyle = computed(() => {
  return {
    backgroundColor: colorScheme.value.buttonBackground,
    color: colorScheme.value.buttonColor,
  }
})

// Memoized and stable style computation
const sectionStyle = computed(() => {
  const item = primaryHeroItem.value
  
  if (!item) {
    return { background: 'var(--color-bg-page)' }
  }

  // Gradient type - ensure values are sanitized and stable
  if (item.visualType === 'gradient' && item.gradientFrom && item.gradientTo) {
    const from = String(item.gradientFrom).trim()
    const to = String(item.gradientTo).trim()
    
    // Return stable object structure
    return {
      background: `linear-gradient(135deg, ${from}, ${to})`,
      backgroundImage: `linear-gradient(135deg, ${from}, ${to})` // Fallback for some browsers
    }
  }

  // Image type
  if (item.visualType === 'image' && item.imageUrl) {
    const url = String(item.imageUrl).trim()
    return {
      backgroundImage: `url(${url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }

  // Fallback: Use color scheme background
  return {
    background: colorScheme.value.backgroundColor
  }
})

const resolvedEyebrow = computed(() => {
  if (typeof props.data.eyebrow === 'string' && props.data.eyebrow.length > 0) {
    return props.data.eyebrow
  }

  const value = content.value.eyebrow
  return typeof value === 'string' ? value : ''
})

const resolvedHeadline = computed(() => {
  if (primaryHeroItem.value?.headline) {
    return primaryHeroItem.value.headline
  }

  if (typeof props.data.headline === 'string' && props.data.headline.length > 0) {
    return props.data.headline
  }

  if (typeof props.data.title === 'string' && props.data.title.length > 0) {
    return props.data.title
  }

  const value = content.value.headline
  return typeof value === 'string' ? value : ''
})

const resolvedSubheadline = computed(() => {
  if (primaryHeroItem.value?.subheadline) {
    return primaryHeroItem.value.subheadline
  }

  if (typeof props.data.subheadline === 'string' && props.data.subheadline.length > 0) {
    return props.data.subheadline
  }

  if (typeof props.data.subtitle === 'string' && props.data.subtitle.length > 0) {
    return props.data.subtitle
  }

  const value = content.value.subheadline
  return typeof value === 'string' ? value : ''
})

const resolvedCtaText = computed(() => {
  if (primaryHeroItem.value?.ctaText) {
    return primaryHeroItem.value.ctaText
  }

  return typeof props.data.ctaText === 'string' ? props.data.ctaText : ''
})

const resolvedCtaUrl = computed(() => {
  const raw = primaryHeroItem.value?.ctaUrl
    || (typeof props.data.ctaUrl === 'string' ? props.data.ctaUrl : '')

  if (!raw) return ''

  return resolveHref(raw)
})

const hasContent = computed(() =>
  Boolean(resolvedEyebrow.value || resolvedHeadline.value || resolvedSubheadline.value)
)
</script>
