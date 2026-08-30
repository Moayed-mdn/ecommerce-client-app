<template>
  <StorefrontShell variant="runtime-bridge">
    <slot />
  </StorefrontShell>
</template>

<script setup lang="ts">
import StorefrontShell from '../../../app/components/shell/StorefrontShell.vue'

// `layout` used to switch between four separate files
// (runtime.vue / catalog.vue / marketing.vue / product.vue) that were
// byte-for-byte identical — all four just rendered
// <StorefrontShell variant="runtime-bridge"><slot/></StorefrontShell>.
// Collapsed to a single render path since the branch never actually
// changed the output. The prop is kept (and typed) so it's absorbed
// here instead of leaking onto StorefrontShell's root element as a
// stray HTML attribute, and so a real per-type layout can be added
// back later *when an actual visual difference is needed* — branch
// inside this file at that point, don't recreate near-duplicate files.
defineProps<{
  layout?: string
}>()
</script>
