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

      <!-- Pricing Grid -->
      <div v-if="plans.length" class="grid items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(plan, index) in plans"
          :key="index"
          class="relative flex flex-col rounded-2xl p-8 transition-all hover:-translate-y-1 hover:shadow-lg border"
          :style="plan.featured ? featuredCardStyle : cardStyle"
        >
          <!-- Badge for featured plan -->
          <div 
            v-if="plan.featured" 
            class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
            :style="badgeStyle"
          >
            {{ plan.badge || 'Most Popular' }}
          </div>

          <!-- Plan name -->
          <h3 class="mb-2 text-2xl font-bold" :style="{ color: colorScheme.color }">{{ plan.name }}</h3>

          <!-- Plan description -->
          <p v-if="plan.description" class="mb-6 text-sm leading-relaxed" :style="{ color: colorScheme.color, opacity: 0.8 }">
            {{ plan.description }}
          </p>

          <!-- Price -->
          <div class="mb-8 flex items-baseline gap-1 border-b pb-8" :style="{ borderColor: colorScheme.borderColor }">
            <span class="text-2xl font-semibold" :style="{ color: colorScheme.color }">{{ plan.currency || '$' }}</span>
            <span class="text-5xl font-extrabold leading-none" :style="{ color: colorScheme.color }">{{ plan.price }}</span>
            <span v-if="plan.period" class="text-base" :style="{ color: colorScheme.color, opacity: 0.7 }">{{ plan.period }}</span>
          </div>

          <!-- Features list -->
          <ul v-if="plan.features && plan.features.length" class="mb-8 flex-1 space-y-2.5">
            <li
              v-for="(feature, fIndex) in plan.features"
              :key="fIndex"
              class="flex items-start gap-3 text-sm"
              :style="{ color: colorScheme.color }"
            >
              <span class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold" :style="checkmarkStyle">✓</span>
              <span>{{ feature }}</span>
            </li>
          </ul>

          <!-- CTA button -->
          <NuxtLink
            v-if="plan.cta_url"
            :to="plan.cta_url"
            class="block w-full rounded-xl px-6 py-3.5 text-center text-base font-semibold transition-colors"
            :style="plan.featured ? buttonPrimaryStyle : buttonSecondaryStyle"
          >
            {{ plan.cta_label || 'Get Started' }}
          </NuxtLink>
        </article>
      </div>

      <p v-else class="py-12 text-center text-sm" :style="{ color: colorScheme.color, opacity: 0.7 }">
        No pricing plans available.
      </p>
    </div>
  </section>
</template>

<!--
  Data shape: data.content = { plans: [{ name, price, description, features, ... }, ...] }
  
  This nested shape is enforced by the admin panel (PricingSectionContent.tsx), which always
  POSTs content.plans (not a flat array). Backend validation passes it through as-is.
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

const featuredCardStyle = computed(() => ({
  backgroundColor: colorScheme.value.secondaryBackground,
  color: colorScheme.value.color,
  borderColor: colorScheme.value.buttonBackground,
  borderWidth: '2px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}))

const badgeStyle = computed(() => ({
  backgroundColor: colorScheme.value.buttonBackground,
  color: colorScheme.value.buttonColor,
}))

const checkmarkStyle = computed(() => ({
  backgroundColor: `${colorScheme.value.buttonBackground}1A`,
  color: colorScheme.value.buttonBackground,
}))

const buttonPrimaryStyle = computed(() => ({
  backgroundColor: colorScheme.value.buttonBackground,
  color: colorScheme.value.buttonColor,
}))

const buttonSecondaryStyle = computed(() => ({
  backgroundColor: 'transparent',
  color: colorScheme.value.color,
  border: `2px solid ${colorScheme.value.borderColor}`,
}))

const title = computed(() => typeof props.data.title === 'string' ? props.data.title : '')
const subtitle = computed(() => typeof props.data.subtitle === 'string' ? props.data.subtitle : '')

const content = computed(() => {
  const c = props.data.content
  return c && typeof c === 'object' && !Array.isArray(c) ? c as Record<string, unknown> : {}
})

type PricingPlan = {
  name: string
  description?: string
  price: string | number
  currency?: string
  period?: string
  features?: string[]
  cta_label?: string
  cta_url?: string
  featured?: boolean
  badge?: string
}

const plans = computed<PricingPlan[]>(() => {
  const arr = content.value.plans
  if (!Array.isArray(arr)) return []
  return arr.filter((item): item is PricingPlan =>
    item !== null &&
    typeof item === 'object' &&
    'name' in item &&
    'price' in item &&
    typeof item.name === 'string'
  )
})
</script>
