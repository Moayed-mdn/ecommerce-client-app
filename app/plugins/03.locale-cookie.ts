// @nuxtjs/i18n's `i18n_redirected` cookie is only written by its browser-language
// detection, which this app configures with `redirectOn: 'root'` (nuxt.config.ts).
// That means the cookie is only ever set/updated when a visitor lands on `/` — it is
// NOT updated when the user switches language via the in-app switcher (which
// navigates straight to /ar/... or back to the default, unprefixed path). Left alone,
// the cookie can report a locale the user hasn't been on for the entire rest of the
// session, and several server-side utilities read it as if it were live (see
// server/utils/locale.ts, now fixed to prefer the URL path instead).
//
// This plugin keeps the cookie itself honest too, so it's correct the next time the
// user lands on `/`, and for anything else that may read it.
//
// NOTE: we intentionally do NOT call the useI18n() composable here. It requires an
// active component `setup()` context (via getCurrentInstance()), which a Nuxt plugin
// does not have — calling it here throws "Must be called at the top of a `setup`
// function". nuxtApp.$i18n is the global i18n instance the module exposes precisely
// for use outside components, and its `.locale` is the same reactive ref.
export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n

  const syncCookie = (value: string) => {
    const cookie = useCookie('i18n_redirected', { path: '/', sameSite: 'lax' })
    cookie.value = value
  }

  watch(i18n.locale, (value) => syncCookie(value), { immediate: true })
})