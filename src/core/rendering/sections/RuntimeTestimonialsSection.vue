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

      <!-- Testimonials Grid -->
      <div v-if="testimonials.length" class="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(testimonial, index) in testimonials"
          :key="index"
          class="rounded-2xl border p-4 transition-all hover:-translate-y-1 hover:shadow-md"
          :style="cardStyle"
        >
          <!-- Rating stars -->
          <div v-if="showRating && testimonial.rating" class="mb-4 flex gap-1">
            <span
              v-for="star in 5"
              :key="star"
              class="text-lg"
              :class="star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'"
            >
              ★
            </span>
          </div>

          <!-- Quote -->
          <blockquote class="mb-6 text-sm leading-relaxed" :style="{ color: colorScheme.color }">
            "{{ testimonial.quote }}"
          </blockquote>

          <!-- Author info -->
          <div class="flex items-center gap-3.5">
            <div v-if="testimonial.avatar" class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full" :style="{ backgroundColor: colorScheme.backgroundColor }">
              <img :src="testimonial.avatar" :alt="testimonial.author" class="h-full w-full object-cover" />
            </div>
            <div class="flex flex-col gap-0.5">
              <cite class="text-sm font-semibold not-italic" :style="{ color: colorScheme.color }">{{ testimonial.author }}</cite>
              <span v-if="testimonial.role" class="text-xs" :style="{ color: colorScheme.color, opacity: 0.7 }">
                {{ testimonial.role }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- Aggregate stats -->
      <div v-if="aggregate" class="flex flex-col items-center gap-2 rounded-2xl border px-6 py-8" :style="cardStyle">
        <div class="flex items-center gap-3">
          <span class="text-5xl font-bold" :style="{ color: colorScheme.color }">{{ aggregate.average_rating }}</span>
          <span class="text-2xl text-yellow-400">★★★★★</span>
        </div>
        <p class="text-sm" :style="{ color: colorScheme.color, opacity: 0.7 }">
          Based on {{ aggregate.total_reviews?.toLocaleString() }} reviews
        </p>
      </div>

      <p v-if="!testimonials.length" class="py-12 text-center text-sm" :style="{ color: colorScheme.color, opacity: 0.7 }">
        No testimonials available.
      </p>
    </div>
  </section>
</template>

<!--
  Data shape: data.content = { testimonials: [...], aggregate: { average_rating, total_reviews } }
  
  This nested shape is enforced by the admin panel (TestimonialsSectionContent.tsx), which always
  POSTs content.testimonials (not a flat array). Backend validation passes it through as-is.
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

const showRating = computed(() => settings.value.show_rating !== false)

type Testimonial = {
  quote: string
  author: string
  role?: string
  rating?: number
  avatar?: string | null
}

type Aggregate = {
  average_rating: number
  total_reviews: number
}

const testimonials = computed<Testimonial[]>(() => {
  const arr = content.value.testimonials
  if (!Array.isArray(arr)) return []
  return arr.filter((item): item is Testimonial =>
    item !== null &&
    typeof item === 'object' &&
    'quote' in item &&
    'author' in item &&
    typeof item.quote === 'string' &&
    typeof item.author === 'string'
  )
})

const aggregate = computed<Aggregate | null>(() => {
  const agg = content.value.aggregate
  if (!agg || typeof agg !== 'object' || Array.isArray(agg)) return null
  
  const data = agg as Record<string, unknown>
  if (typeof data.average_rating === 'number' && typeof data.total_reviews === 'number') {
    return {
      average_rating: data.average_rating,
      total_reviews: data.total_reviews
    }
  }
  return null
})
</script>
