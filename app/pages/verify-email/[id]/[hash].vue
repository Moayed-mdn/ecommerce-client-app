<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi';
import { API_ROUTES } from '~~/shared/utils/routes'

const routes = useStorefrontRoutes()
const route = useRoute()
const { t } = useI18n()
const loading = ref(true)
const error = ref<string | null>(null)
const success = ref(false)
const api = useApi()
definePageMeta({
  layout: 'system'
})
onMounted(async () => {
 
  const id = route.params.id
  const hash = route.params.hash
  const expires = route.query.expires
  const signature = route.query.signature

 
  if (!id || !hash || !expires || !signature) {
    error.value = t('auth.email_verification.link_invalid')
    loading.value = false
    return
  }

  try {
    const result = await api(API_ROUTES.auth.emailVerify(id as string, hash as string), {
      query: {
        expires,
        signature,
      },
    })

    if (result?.error) {
      throw result.error
    }

    success.value = true
  } catch (err: any) {
   
    console.error('Verification Error:', err)
    
    if (err?.data?.message) {
      error.value = err.data.message
    } else if (err?.message) {
      error.value = err.message
    } else {
      error.value = t('auth.email_verification.generic_error')
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AuthCard>
    <AuthHeader :title="$t('auth.email_verification.title')" />

    <div v-if="loading" class="text-center">
      <p class="animate-pulse">{{ $t('auth.email_verification.checking') }}</p>
    </div>

    <div v-else-if="error" class="text-center text-(--color-error)">
      <p class="mb-4">{{ error }}</p>
      <NuxtLinkLocale :to="routes.register()" class="text-(--color-info) underline">
        {{ $t('auth.email_verification.resend_link') }}
      </NuxtLinkLocale>
    </div>

    <div v-else-if="success" class="text-center text-(--color-success)">
      <p class="mb-4">{{ $t('auth.email_verification.success_message') }}</p>
      <NuxtLinkLocale :to="routes.login()" class="bg-(--color-primary) text-(--color-on-primary) px-4 py-2 rounded inline-block">
        {{ $t('auth.go_to_login') }}
      </NuxtLinkLocale>
    </div>
  </AuthCard>
</template>
