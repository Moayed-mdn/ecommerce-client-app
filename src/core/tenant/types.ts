import type {
  RuntimeNavigationResponse,
  RuntimeThemeResponse,
} from '../runtime/contracts/types'

export interface Tenant {
  id: string | number
  name: string
  slug: string
  domain: string
  status: 'active' | 'suspended' | 'maintenance'
  settings: Record<string, any>
}

export interface StorefrontContext {
  tenant: Tenant | null
  locale: string
  currency: string
  theme: string
  preview: boolean
  previewToken?: string | null
  route: string
  requestId: string
  navigation: RuntimeNavigationResponse['data'] | null
  themePayload: RuntimeThemeResponse['data'] | null
}
