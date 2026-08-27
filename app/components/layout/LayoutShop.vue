<!-- components/layout/LayoutShop.vue -->
<template>
  <div>
    <!-- Optional header slot (used by category page) -->
    <slot name="header" />

    <div class="grid grid-cols-1 grid-rows-[auto_1fr_auto] md:grid-cols-12 container mx-auto md:gap-(--layout-container-gap)">
      <aside class="md:col-span-3">
        <FilterSidebar
          v-if="backendFilters"
          :backend-filters="backendFilters"
          :filter-config="filterConfig"
        />
      </aside>

      <section class="md:col-span-9">
        <ProductGrid 
          v-if="products"
          :products="products"
        />
      </section>

      <div class="md:col-span-12">
        <ProductPagination
          v-if="pagination"
          :total-pages="pagination?.total_pages ?? 1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaginationMeta } from '~~/types/api';
import type { ProductListFilters, ProductListResponse } from '~~/types/product'
import type { ProductFilterConfig } from '~~/app/composables/useFilterConfig'
import { transformProduct } from '~~/src/core/api/dto/storefront'
import { STOREFRONT_RUNTIME_SUPPORTED_LOCALES_LIST } from '~~/src/core/runtime/contracts/constants'

const props = defineProps<{
  data: ProductListResponse | null
}>()

const { filterConfig: systemFilterConfig, fetchFilterConfig } = useFilterConfig()
const route = useRoute()
const { locale } = useI18n()

const filterConfig = ref<ProductFilterConfig | null>(null)

const resolveFilterConfigType = () => {
  const path = route.path.replace(/\/$/, '')
  const segments = path.split('/').filter(Boolean)
  const localePrefix = new Set(STOREFRONT_RUNTIME_SUPPORTED_LOCALES_LIST)
  const relevant = segments.filter(s => !localePrefix.has(s))
  const last = relevant[relevant.length - 1]
  return last === 'search' ? 'search' : 'shop'
}

const loadFilterConfig = async () => {
  await fetchFilterConfig(resolveFilterConfigType())
  filterConfig.value = systemFilterConfig.value
}

onMounted(loadFilterConfig)
// The CMS-driven filter section (which filter widgets to show) is locale-scoped
// like everything else in the runtime template; without this, switching language
// left the sidebar showing whatever config was fetched on the very first mount.
watch(locale, loadFilterConfig)

const products = computed(() => {
  const rawProducts = props.data?.data
  if (!rawProducts || !Array.isArray(rawProducts)) return []
  return rawProducts.map(transformProduct)
})
const pagination = computed<PaginationMeta | null>(() => props.data?.meta?.pagination ?? null)
const backendFilters = computed<ProductListFilters | null>(
  () => props.data?.meta?.filters ?? null
)
</script>