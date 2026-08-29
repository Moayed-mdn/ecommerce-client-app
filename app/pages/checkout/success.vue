<!-- pages/checkout/success.vue -->
<template>
    <div class="min-h-[60vh] bg-(--color-bg-page)">
      <div class="max-w-lg mx-auto px-4 py-12 sm:py-20">
  
        <!-- ── Loading / Processing ── -->
        <div v-if="status === 'loading'" data-testid="checkout-success-loading" class="text-center space-y-4">
          <div class="flex justify-center">
            <svg class="animate-spin h-12 w-12 text-(--color-primary)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-(--color-text-primary)">{{ $t('checkout.processing_title') }}</h2>
          <p class="text-(--color-text-secondary) text-sm">{{ $t('checkout.processing_description') }}</p>
        </div>
  
        <!-- ── Success ── -->
        <div v-else-if="status === 'success'" data-testid="checkout-success-container" class="text-center space-y-6">
          <!-- Checkmark -->
          <div class="flex justify-center">
            <div class="w-20 h-20 rounded-full bg-(--status-delivered-bg) flex items-center justify-center">
              <svg class="w-10 h-10 text-(--status-delivered-text)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
  
          <div>
            <h1 class="text-2xl font-bold text-(--color-text-primary)">{{ $t('checkout.success_title') }}</h1>
            <p class="text-(--color-text-secondary) mt-2">{{ $t('checkout.success_description') }}</p>
          </div>
  
          <!-- Order Details Card -->
          <div data-testid="checkout-success-order" class="bg-(--color-bg-card) rounded-lg border border-(--color-border-default) p-6 text-left space-y-4">
            <!-- Order Number -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-(--color-text-secondary)">{{ $t('checkout.order_number') }}</span>
              <span data-testid="checkout-order-number" class="text-sm font-bold text-(--color-text-primary) font-mono">{{ orderData?.order_number }}</span>
            </div>
  
            <!-- Payment Status -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-(--color-text-secondary)">{{ $t('checkout.payment_status') }}</span>
              <span
                data-testid="checkout-payment-status"
                class="text-sm font-semibold px-2.5 py-0.5 rounded-full"
                :class="paymentStatusClasses"
              >
                {{ paymentStatusLabel }}
              </span>
            </div>
  
            <!-- Divider -->
            <div class="border-t border-(--color-border-default)"></div>
  
            <!-- Email -->
            <div v-if="orderData?.customer_email" class="text-center">
              <p class="text-sm text-(--color-text-secondary)">
                {{ $t('checkout.confirmation_email') }}
              </p>
              <p class="text-sm font-semibold text-(--color-text-primary) mt-1">
                {{ orderData.customer_email }}
              </p>
            </div>
          </div>
  
          <!-- Guest: Create Account Prompt -->
          <div
            v-if="!isLoggedIn && orderData?.customer_email"
            class="bg-(--color-info-bg) rounded-lg border border-(--color-info-border) p-5 text-left"
          >
            <h3 class="text-sm font-bold text-(--color-info-text)">{{ $t('checkout.create_account_title') }}</h3>
            <p class="text-sm text-(--color-info-text) mt-1">{{ $t('checkout.create_account_description') }}</p>
            <NuxtLinkLocale
              :to="routes.register()"
              :style="{ backgroundColor: primary, color: onPrimary }"
              class="inline-block mt-3 px-4 py-2 text-sm font-medium rounded-md transition-colors hover-primary-link"
            >
              {{ $t('checkout.create_account_button') }}
            </NuxtLinkLocale>
          </div>
  
          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <NuxtLinkLocale
              v-if="isLoggedIn"
              :to="routes.orders()"
              data-testid="checkout-view-orders"
              :style="{ backgroundColor: primary, color: onPrimary }"
              class="flex-1 py-3 px-4 text-center text-sm font-semibold rounded-md transition-colors hover-primary-link"
            >
              {{ $t('checkout.view_orders') }}
            </NuxtLinkLocale>
  
            <NuxtLinkLocale
              :to="routes.home()"
              data-testid="checkout-continue-shopping"
              :style="!isLoggedIn ? { backgroundColor: primary, color: onPrimary } : {}"
              class="flex-1 py-3 px-4 text-center text-sm font-semibold border rounded-md transition-colors"
              :class="isLoggedIn ? 'text-(--color-text-primary) border-(--color-border-default) hover:bg-(--color-bg-hover)' : 'border-transparent hover-primary-link'"
            >
              {{ $t('checkout.continue_shopping') }}
            </NuxtLinkLocale>
          </div>
        </div>
  
        <!-- ── Error ── -->
        <div v-else-if="status === 'error'" data-testid="checkout-error-container" class="text-center space-y-6">
          <div class="flex justify-center">
            <div class="w-20 h-20 rounded-full bg-(--color-error-bg) flex items-center justify-center">
              <svg class="w-10 h-10 text-(--color-error)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
  
          <div>
            <h1 class="text-2xl font-bold text-(--color-text-primary)">{{ $t('checkout.error_title') }}</h1>
            <p class="text-(--color-text-secondary) mt-2">{{ $t('checkout.error_description') }}</p>
          </div>
  
          <NuxtLinkLocale
            :to="routes.home()"
            :style="{ backgroundColor: primary, color: onPrimary }"
            class="inline-block py-3 px-6 text-sm font-semibold rounded-md transition-colors hover-primary-link"
          >
            {{ $t('checkout.continue_shopping') }}
          </NuxtLinkLocale>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // Inline theme colors for SSR compatibility
  const getCSSVar = (varName: string, fallback: string): string => {
    if (!process.client) return fallback
    try {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim()
      return value || fallback
    } catch {
      return fallback
    }
  }

  const primary = computed(() => getCSSVar('--color-primary', '#3b82f6'))
  const onPrimary = computed(() => getCSSVar('--color-on-primary', '#ffffff'))
  
  definePageMeta({
    layout: 'system',
  })

  const routes = useStorefrontRoutes()
  const route = useRoute()
  const { isLoggedIn } = useAuth()
  const { clearCartAfterCheckout } = useCheckout()
  const { fetchOrder } = useOrders()
  const { t } = useI18n()
  const checkoutStore = useCheckoutStore()

  useHead({
    title: t('checkout.success_title'),
    meta: [
      { name: 'description', content: t('checkout.success_description') },
    ],
  })
  
  const status = ref<'loading' | 'success' | 'error'>('loading')
  const orderData = ref<{
    payment_status: string
    order_number: string
    order_status: string
    customer_email: string | null
  } | null>(null)
  
  // Payment status badge
  const paymentStatusClasses = computed(() => {
    switch (orderData.value?.payment_status) {
      case 'paid':
        return 'bg-(--status-success-bg) text-(--status-success-text)'
      case 'unpaid':
        return 'bg-(--status-warning-bg) text-(--status-warning-text)'
      default:
        return 'bg-(--color-bg-tertiary) text-(--color-text-tertiary)'
    }
  })
  
  const paymentStatusLabel = computed(() => {
    switch (orderData.value?.payment_status) {
      case 'paid':
        return t('checkout.status_paid')
      case 'unpaid':
        return t('checkout.status_unpaid')
      default:
        return t('checkout.status_pending')
    }
  })
  
  const loadOrderByNumber = async (orderNumber: string) => {
    const order = await fetchOrder(orderNumber)
    orderData.value = {
      payment_status: order.payment_status,
      order_number: order.order_number,
      order_status: order.status,
      customer_email: null,
    }
  }

  onMounted(async () => {
    const orderNumber = route.query.order as string | undefined

    if (!orderNumber) {
      status.value = 'error'
      return
    }

    try {
      await loadOrderByNumber(orderNumber)
      status.value = 'success'
      clearCartAfterCheckout()
      // Clear the checkout store now that this order is done. This is the
      // one place guaranteed to run for every completed checkout, including
      // Stripe redirect-based flows (e.g. 3D Secure) that land here directly
      // without ever going back through checkout/index.vue's success handler.
      // Without it, the next checkout attempt reuses this order's dead
      // PaymentIntent/client_secret and Stripe rejects it as "terminal state".
      checkoutStore.reset()
    } catch {
      // Retry once after 2 seconds in case the order/webhook state is still settling.
      await new Promise((resolve) => setTimeout(resolve, 2000))

      try {
        await loadOrderByNumber(orderNumber)
        status.value = 'success'
        clearCartAfterCheckout()
        checkoutStore.reset()
      } catch {
        status.value = 'error'
      }
    }
  })
  </script>
  
  <style scoped>
  .hover-primary-link:hover {
    filter: brightness(0.9);
  }
  </style>