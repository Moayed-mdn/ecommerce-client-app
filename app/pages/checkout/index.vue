<template>
  <div class="checkout-page">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">{{ $t('checkout.title') }}</h1>
        <p class="text-gray-600">{{ $t('checkout.secure_checkout') }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{{ error }}</p>
        <button @click="retryInitialize" class="mt-2 text-red-600 hover:text-red-800 underline">
          {{ $t('common.try_again') }}
        </button>
      </div>

      <!-- Empty Cart -->
      <div v-else-if="!checkoutStore.cart || checkoutStore.cart.items_count === 0" class="text-center py-20">
        <div class="mb-4">
          <svg class="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-semibold mb-2">{{ $t('cart.empty') }}</h2>
        <p class="text-gray-600 mb-6">{{ $t('cart.empty_message') }}</p>
        <NuxtLink :to="localePath('/shop')" class="btn btn-primary">
          {{ $t('cart.continue_shopping') }}
        </NuxtLink>
      </div>

      <!-- Checkout Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Step: Shipping Address -->
          <CheckoutShippingAddress 
            v-if="currentStep === 'shipping'"
            :addresses="checkoutStore.addresses"
            :selected-address="checkoutStore.shipping_address"
            :address-settings="checkoutStore.address_settings"
            @select="handleAddressSelect"
            @continue="handleShippingContinue"
          />

          <!-- Step: Shipping Method -->
          <CheckoutShippingMethod
            v-else-if="currentStep === 'shipping-method'"
            :methods="checkoutStore.available_shipping_methods"
            :selected-method="checkoutStore.shipping_method"
            :loading="loadingShippingMethods"
            @select="handleShippingMethodSelect"
            @back="checkoutStore.previousStep()"
            @continue="handleShippingMethodContinue"
          />

          <!-- Step: Payment -->
          <CheckoutPayment
            v-else-if="currentStep === 'payment'"
            :client-secret="checkoutStore.client_secret"
            :payment-intent-id="checkoutStore.payment_intent_id"
            :order-number="checkoutStore.order_number"
            @back="checkoutStore.previousStep()"
            @success="handlePaymentSuccess"
          />
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <CheckoutOrderSummary
            :cart="checkoutStore.cart"
            :shipping-method="checkoutStore.shipping_method"
            :total="checkoutStore.total"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({
  middleware: 'auth',
  layout: 'system',
})

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const { showErrorToast } = useAppToast()

const checkoutStore = useCheckoutStore()
const { current_step: currentStep, loading: storeLoading } = storeToRefs(checkoutStore)

const { initiateEnhancedCheckout, getShippingMethods, createPaymentIntent } = useCheckout()

const loading = ref(true)
const error = ref<string | null>(null)
const loadingShippingMethods = ref(false)

/**
 * Initialize checkout on mount
 */
onMounted(async () => {
  await initialize()
})

/**
 * Initialize checkout session
 */
async function initialize() {
  try {
    loading.value = true
    error.value = null

    // Always start a checkout visit from a clean slate. Without this, a
    // stale payment_intent_id / client_secret / current_step left over from
    // a previous attempt (abandoned, failed, or already completed) stays in
    // the store for the rest of the browser session and gets reused here,
    // which is what caused "Proceed to Checkout" to jump straight to a dead
    // Payment step (Stripe 400: PaymentIntent in a terminal state).
    checkoutStore.reset()

    const data = await initiateEnhancedCheckout()
    checkoutStore.initializeSession(data)
    
    // If shipping address is pre-selected, load shipping methods
    if (checkoutStore.shipping_address) {
      await loadShippingMethods()
    }
  } catch (err: any) {
    error.value = err.message || t('checkout.initialization_failed')
    showErrorToast(error.value)
  } finally {
    loading.value = false
  }
}

/**
 * Retry initialization
 */
async function retryInitialize() {
  await initialize()
}

/**
 * Handle address selection
 */
function handleAddressSelect(address: any) {
  checkoutStore.setShippingAddress(address)
}

/**
 * Handle shipping address continue
 */
async function handleShippingContinue() {
  if (!checkoutStore.shipping_address) {
    showErrorToast(t('checkout.select_shipping_address'))
    return
  }

  await loadShippingMethods()
  checkoutStore.setStep('shipping-method')
}

/**
 * Load available shipping methods for selected address
 */
async function loadShippingMethods() {
  if (!checkoutStore.shipping_address || !checkoutStore.cart) return

  try {
    loadingShippingMethods.value = true
    const methods = await getShippingMethods(
      checkoutStore.shipping_address,
      checkoutStore.cart.subtotal
    )
    checkoutStore.setAvailableShippingMethods(methods)
  } catch (err: any) {
    showErrorToast(err.message || t('checkout.failed_to_load_shipping_methods'))
  } finally {
    loadingShippingMethods.value = false
  }
}

/**
 * Handle shipping method selection
 */
function handleShippingMethodSelect(method: any) {
  checkoutStore.selectShippingMethod(method)
}

/**
 * Handle shipping method continue
 */
async function handleShippingMethodContinue() {
  if (!checkoutStore.shipping_method) {
    showErrorToast(t('checkout.select_shipping_method'))
    return
  }

  // Create payment intent
  try {
    checkoutStore.setLoading(true)
    
    const paymentData = await createPaymentIntent(
      checkoutStore.shipping_address!,
      checkoutStore.billing_address || checkoutStore.shipping_address!,
      checkoutStore.shipping_method.id
    )

    checkoutStore.setPaymentIntent({
      client_secret: paymentData.client_secret,
      payment_intent_id: paymentData.payment_intent_id,
      order_id: paymentData.order_id,
      order_number: paymentData.order_number,
    })

    checkoutStore.setStep('payment')
  } catch (err: any) {
    showErrorToast(err.message || t('checkout.failed_to_create_payment'))
  } finally {
    checkoutStore.setLoading(false)
  }
}

/**
 * Handle successful payment
 */
function handlePaymentSuccess(orderNumber: string) {
  // Redirect to success page
  router.push(localePath(`/checkout/success?order=${orderNumber}`))
}

// Set page title
useHead({
  title: t('checkout.title'),
})
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background-color: var(--color-background-secondary, #f9fafb);
}
</style>