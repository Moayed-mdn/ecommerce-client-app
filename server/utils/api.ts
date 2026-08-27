// server/utils/api.ts
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import type { H3Event } from 'h3'
import { STOREFRONT_RUNTIME_CONTRACT_VERSION } from '../../src/core/runtime/contracts/constants'
import { getEventLocale } from './locale'

export const getNormalizedRequestHost = (event: H3Event) => {
  const hostHeader = String(getHeader(event, 'host') || getHeader(event, 'x-forwarded-host') || 'localhost')
  return hostHeader.split(',')[0]?.trim().split(':')[0] || 'localhost'
}

// Laravel Sanctum's cookie/session ("stateful") auth is gated on the request's
// Origin/Referer matching SANCTUM_STATEFUL_DOMAINS. Browsers only attach Origin/Referer
// to same-origin XHR/fetch calls — never to a plain top-level navigation (a fresh SSR
// page load, a hard refresh, a typed URL). Forwarding the incoming Origin/Referer
// "if present" therefore makes the backend's view of the SAME visitor differ depending on
// how the request arrived: a client-side fetch looks stateful, an SSR-issued request does
// not, and Sanctum silently falls back to token auth and returns 401 for a perfectly valid
// session. This server is a first-party proxy for its own frontend, so it should always
// assert its own origin rather than depend on what happened to be forwarded.
export const getRequestOrigin = (event: H3Event) => {
  const forwardedProto = getHeader(event, 'x-forwarded-proto')
  const protocol = (forwardedProto ? forwardedProto.split(',')[0]?.trim() : getRequestProtocol(event)) || 'http'
  const hostHeader = String(getHeader(event, 'host') || getHeader(event, 'x-forwarded-host') || 'localhost')
  const host = hostHeader.split(',')[0]?.trim() || 'localhost'
  return `${protocol}://${host}`
}

export const normalizeProxySetCookie = (setCookieHeader: string) => setCookieHeader
  .split(/;\s*/)
  .filter(part => !/^domain=/i.test(part))
  .join('; ')

const mergeCookieHeaders = (...cookieHeaders: Array<string | undefined>) => {
  const cookieMap = new Map<string, string>()

  for (const cookieHeader of cookieHeaders) {
    if (!cookieHeader) {
      continue
    }

    for (const cookiePart of cookieHeader.split(/;\s*/)) {
      const separatorIndex = cookiePart.indexOf('=')
      if (separatorIndex <= 0) {
        continue
      }

      const name = cookiePart.slice(0, separatorIndex).trim()
      const value = cookiePart.slice(separatorIndex + 1).trim()

      if (!name) {
        continue
      }

      cookieMap.set(name, value)
    }
  }

  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
}

const readCookieValue = (cookieHeader: string, name: string) => {
  const pattern = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`)
  return cookieHeader.match(pattern)?.[1] || null
}

const buildApiRoot = (apiBase: string) => apiBase.replace(/\/api\/?(v1|users)?\/?$/, '')

const parseProxyResponse = (raw: Buffer, contentType: string | undefined) => {
  const responseText = raw.toString('utf-8')

  if (!responseText.length) {
    return null
  }

  if (contentType?.includes('application/json')) {
    try {
      return JSON.parse(responseText)
    } catch {
      return responseText
    }
  }

  return responseText
}

export const requestWithForwardedHost = async (
  target: string,
  options: {
    method: string
    headers: Headers
    body?: string | Buffer | Uint8Array
  },
) => {
  const url = new URL(target)
  const request = url.protocol === 'https:' ? httpsRequest : httpRequest
  let payload: string | Buffer | undefined

  if (typeof options.body === 'string' || Buffer.isBuffer(options.body)) {
    payload = options.body
  } else if (options.body instanceof Uint8Array) {
    payload = Buffer.from(options.body)
  }

  if (payload !== undefined && !options.headers.has('Content-Length')) {
    options.headers.set('Content-Length', String(Buffer.byteLength(payload)))
  }

  const response = await new Promise<{
    statusCode: number
    contentType?: string
    body: Buffer
    setCookie: string[]
    location?: string
  }>((resolve, reject) => {
    const req = request(url, {
      method: options.method,
      headers: Object.fromEntries(options.headers.entries()),
    }, (res) => {
      const chunks: Buffer[] = []

      res.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
      res.on('end', () => {
        const setCookieHeader = res.headers['set-cookie']

        resolve({
          statusCode: res.statusCode || 500,
          contentType: typeof res.headers['content-type'] === 'string' ? res.headers['content-type'] : undefined,
          body: Buffer.concat(chunks),
          setCookie: Array.isArray(setCookieHeader)
            ? setCookieHeader
            : typeof setCookieHeader === 'string'
              ? [setCookieHeader]
              : [],
          location: typeof res.headers.location === 'string' ? res.headers.location : undefined,
        })
      })
    })

    req.on('error', reject)

    if (payload !== undefined) {
      req.write(payload)
    }

    req.end()
  })

  return {
    statusCode: response.statusCode,
    contentType: response.contentType,
    data: parseProxyResponse(response.body, response.contentType),
    setCookie: response.setCookie,
    location: response.location,
  }
}

export const useServerApi = (event: H3Event) => {
  const config = useRuntimeConfig(event)
  const apiBase = String(config.apiBase || '').replace(/\/+$/, '')
  const locale = getEventLocale(event)
  const tenantId = event.context.tenantId || ''
  const tenantSlug = event.context.tenantSlug || ''
  const normalizedHost = getNormalizedRequestHost(event)

  // Token from auth cookie (try new namespaced key then legacy key)
  let token: string | null = null
  try {
    const authCookie = getCookie(event, 'js_auth') || getCookie(event, 'auth')
    if (authCookie) {
      const parsed = JSON.parse(authCookie)
      token = parsed?.token ?? null
    }
  } catch {}

  const appendQuery = (url: string, query?: Record<string, unknown>) => {
    if (!query) {
      return url
    }

    const separator = url.includes('?') ? '&' : '?'
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        continue
      }

      if (Array.isArray(value)) {
        for (const entry of value) {
          if (entry !== undefined && entry !== null) {
            params.append(`${key}[]`, String(entry))
          }
        }
        continue
      }

      params.append(key, String(value))
    }

    const paramString = params.toString()
    return paramString ? `${url}${separator}${paramString}` : url
  }

  return async <T>(path: string, options?: { method?: string; body?: unknown; headers?: HeadersInit; query?: Record<string, unknown> }) => {
    const method = String(options?.method || 'GET').toUpperCase()
    const headers = new Headers(options?.headers)

    headers.set('Accept', 'application/json')
    headers.set('Host', normalizedHost)
    headers.set('X-Tenant-Id', String(tenantId))
    headers.set('X-Tenant-Slug', String(tenantSlug))
    headers.set('X-Storefront-Locale', locale)
    headers.set('X-Storefront-Version', '1.0.0')

    if (locale) {
      headers.set('Accept-Language', locale)
    }

    // Always assert our own origin (see getRequestOrigin() above) — do not conditionally
    // forward the browser's Origin/Referer, since SSR-issued requests legitimately have
    // none and that asymmetry is what broke Sanctum's stateful (cookie) auth on SSR.
    const requestOrigin = getRequestOrigin(event)
    headers.set('Origin', requestOrigin)
    headers.set('Referer', `${requestOrigin}/`)

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const incomingCookieHeader = String(getHeader(event, 'cookie') || '')
    if (incomingCookieHeader) {
      headers.set('Cookie', incomingCookieHeader)
    }

    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      const xsrfToken = getCookie(event, 'XSRF-TOKEN')
      if (xsrfToken) {
        headers.set('X-XSRF-TOKEN', decodeURIComponent(String(xsrfToken)))
      }
    }

    let payload: BodyInit | undefined
    if (options?.body !== undefined && !['GET', 'HEAD'].includes(method)) {
      if (typeof options.body === 'string' || options.body instanceof Buffer || options.body instanceof Uint8Array || options.body instanceof Blob || options.body instanceof FormData) {
        payload = options.body as BodyInit
      } else {
        payload = JSON.stringify(options.body)
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json')
        }
      }
    }

    const url = appendQuery(`${apiBase}/${path.replace(/^\/+/, '')}`, options?.query as Record<string, unknown> | undefined)

    // Use a low-level Node request so the tenant Host header reaches Laravel unchanged.
    const response = await requestWithForwardedHost(url, {
      method,
      headers,
      body: typeof payload === 'string' || Buffer.isBuffer(payload) || payload instanceof Uint8Array
        ? payload
        : undefined,
    })
    const responseData = response.data

    if (response.statusCode >= 400) {
      const message = typeof responseData === 'object' && responseData !== null
        ? String((responseData as { error?: { message?: string }, message?: string }).error?.message
          || (responseData as { message?: string }).message
          || `Server API request failed with status ${response.statusCode}`)
        : String(responseData || `Server API request failed with status ${response.statusCode}`)

      throw createError({
        statusCode: response.statusCode,
        statusMessage: message,
        data: responseData,
      })
    }

    return responseData as T
  }
}

export const proxySessionAuthRequest = async (event: H3Event, path: string, options?: {
  method?: string
  body?: unknown
  headers?: HeadersInit
}) => {
  const config = useRuntimeConfig(event)
  const apiBase = String(config.apiBase || '').replace(/\/+$/, '')
  const apiRoot = buildApiRoot(apiBase)
  const locale = getEventLocale(event)
  const tenantId = String(event.context.tenantId || '')
  const tenantSlug = String(event.context.tenantSlug || '')
  const normalizedHost = getNormalizedRequestHost(event)
  const incomingCookieHeader = String(getHeader(event, 'cookie') || '')

  const method = String(options?.method || 'GET').toUpperCase()
  const headers = new Headers(options?.headers)

  headers.set('Accept', 'application/json')
  headers.set('Host', normalizedHost)
  headers.set('X-Tenant-Id', tenantId)
  headers.set('X-Tenant-Slug', tenantSlug)
  headers.set('X-Storefront-Locale', locale)
  headers.set('X-Storefront-Version', STOREFRONT_RUNTIME_CONTRACT_VERSION)

  // Always assert our own origin (see getRequestOrigin() above) — do not conditionally
  // forward the browser's Origin/Referer, since SSR-issued requests legitimately have
  // none and that asymmetry is what broke Sanctum's stateful (cookie) auth on SSR.
  const requestOrigin = getRequestOrigin(event)
  headers.set('Origin', requestOrigin)
  headers.set('Referer', `${requestOrigin}/`)

  if (locale) {
    headers.set('Accept-Language', locale)
  }

  // For storefront routes, send the token if available (for authenticated users like merchants testing their store)
  // Session-based auth (ecommerce_session) will work for guest users
  // Sanctum will try token auth first, then fall back to session auth
  let token: string | null = null
  try {
    const authCookie = getCookie(event, 'js_auth') || getCookie(event, 'auth')
    if (authCookie) {
      const parsed = JSON.parse(authCookie)
      token = parsed?.token ?? null
    }
  } catch {}
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }


  // Start with incoming cookies, but we'll replace the session cookie if we bootstrap
  let forwardedCookieHeader = incomingCookieHeader
  const requiresCsrf = !['GET', 'HEAD', 'OPTIONS'].includes(method)

  if (requiresCsrf && !getCookie(event, 'XSRF-TOKEN')) {
    // Build bootstrap request headers with the current session cookie
    const bootstrapHeaders = new Headers(headers)
    if (forwardedCookieHeader) {
      bootstrapHeaders.set('Cookie', forwardedCookieHeader)
    }

    const csrfUrl = `${apiRoot}/sanctum/csrf-cookie`
    const csrfResponse = await requestWithForwardedHost(csrfUrl, {
      method: 'GET',
      headers: bootstrapHeaders,
    })

    if (csrfResponse.statusCode >= 400) {
      throw createError({
        statusCode: csrfResponse.statusCode,
        statusMessage: `Failed to bootstrap CSRF cookie for ${method} ${path} (URL: ${csrfUrl}, Status: ${csrfResponse.statusCode})`,
      })
    }

    const csrfSetCookies = csrfResponse.setCookie
    const bootstrapCookieHeader = csrfSetCookies
      .map(setCookieHeader => setCookieHeader.split(';', 1)[0] || '')
      .filter(Boolean)
      .join('; ')

    // CRITICAL: Use the NEW session cookie from bootstrap response for subsequent requests
    // This ensures we use the same session that Laravel just created/updated
    forwardedCookieHeader = mergeCookieHeaders(forwardedCookieHeader, bootstrapCookieHeader)

    // Send the new session cookie back to the browser
    for (const setCookieHeader of csrfSetCookies) {
      appendResponseHeader(event, 'set-cookie', normalizeProxySetCookie(setCookieHeader))
    }
  }

  if (forwardedCookieHeader) {
    headers.set('Cookie', forwardedCookieHeader)
  }

  const xsrfToken = getCookie(event, 'XSRF-TOKEN') || readCookieValue(forwardedCookieHeader, 'XSRF-TOKEN')

  if (requiresCsrf && xsrfToken) {
    headers.set('X-XSRF-TOKEN', decodeURIComponent(String(xsrfToken)))
  }

  let payload: BodyInit | undefined
  if (options?.body !== undefined && requiresCsrf) {
    payload = typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
  }

  const response = await requestWithForwardedHost(`${apiBase}/${path.replace(/^\/+/, '')}`, {
    method,
    headers,
    body: typeof payload === 'string' || Buffer.isBuffer(payload) || payload instanceof Uint8Array
      ? payload
      : undefined,
  })

  for (const setCookieHeader of response.setCookie) {
    appendResponseHeader(event, 'set-cookie', normalizeProxySetCookie(setCookieHeader))
  }

  const responseData = response.data

  if (response.statusCode >= 400) {
    const message = typeof responseData === 'object' && responseData !== null
      ? String((responseData as { error?: { message?: string }, message?: string }).error?.message
        || (responseData as { message?: string }).message
        || `Runtime request failed with status ${response.statusCode}`)
      : String(responseData || `Runtime request failed with status ${response.statusCode}`)

    throw createError({
      statusCode: response.statusCode,
      statusMessage: message,
      data: responseData,
    })
  }

  return responseData
}

export const useRuntimeServerApi = (event: H3Event) => {
  const config = useRuntimeConfig(event)
  const locale = getEventLocale(event)
  const requestId = String(getHeader(event, 'x-request-id') || crypto.randomUUID())
  const previewToken = getHeader(event, 'x-preview-token')
  const hostHeader = String(getHeader(event, 'host') || getHeader(event, 'x-forwarded-host') || 'localhost')
  const normalizedHost = hostHeader.split(',')[0]?.trim().split(':')[0] || 'localhost'
  const runtimeApiBase = String(config.apiBase || '')
    .replace(/\/+$/, '')
    .replace(/\/users$/, '')

  const appendQuery = (url: URL, query?: Record<string, unknown>) => {
    if (!query) {
      return
    }

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        continue
      }

      if (Array.isArray(value)) {
        for (const entry of value) {
          if (entry !== undefined && entry !== null) {
            url.searchParams.append(`${key}[]`, String(entry))
          }
        }
        continue
      }

      url.searchParams.append(key, String(value))
    }
  }

  const parsePayload = (raw: Buffer, contentType: string | undefined) => {
    const text = raw.toString('utf-8')

    if (!text.length) {
      return null
    }

    if (contentType?.includes('application/json')) {
      try {
        return JSON.parse(text)
      } catch {
        return text
      }
    }

    return text
  }

  // Use a low-level Node request so the tenant Host header reaches Laravel unchanged.
  return async (path: string, options?: {
    method?: string
    query?: Record<string, unknown>
    body?: unknown
    headers?: HeadersInit
  }) => {
    const url = new URL(`${runtimeApiBase}/${path.replace(/^\/+/, '')}`)
    const method = String(options?.method || 'GET').toUpperCase()
    appendQuery(url, options?.query)

    const headers = new Headers(options?.headers)
    headers.set('Accept', 'application/json')
    headers.set('Host', normalizedHost)
    headers.set('X-Storefront-Locale', locale)
    headers.set('X-Storefront-Version', STOREFRONT_RUNTIME_CONTRACT_VERSION)
    headers.set('X-Request-Id', requestId)

    if (previewToken) {
      headers.set('X-Preview-Token', previewToken)
    }

    let payload: string | Buffer | undefined

    if (options?.body !== undefined && method !== 'GET' && method !== 'HEAD') {
      if (typeof options.body === 'string' || Buffer.isBuffer(options.body)) {
        payload = options.body
      } else if (options.body instanceof Uint8Array) {
        payload = Buffer.from(options.body)
      } else {
        payload = JSON.stringify(options.body)
        if (!headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json')
        }
      }

      headers.set('Content-Length', String(Buffer.byteLength(payload)))
    }

    const request = url.protocol === 'https:' ? httpsRequest : httpRequest

    const response = await new Promise<{
      statusCode: number
      contentType?: string
      body: Buffer
    }>((resolve, reject) => {
      const req = request(url, {
        method,
        headers: Object.fromEntries(headers.entries()),
      }, (res) => {
        const chunks: Buffer[] = []

        res.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 500,
            contentType: typeof res.headers['content-type'] === 'string' ? res.headers['content-type'] : undefined,
            body: Buffer.concat(chunks),
          })
        })
      })

      req.on('error', reject)

      if (payload) {
        req.write(payload)
      }

      req.end()
    })

    const parsedBody = parsePayload(response.body, response.contentType)

    if (response.statusCode >= 400) {
      const message = typeof parsedBody === 'object' && parsedBody !== null
        ? String((parsedBody as { error?: { message?: string }, message?: string }).error?.message
            || (parsedBody as { message?: string }).message
            || `Runtime request failed with status ${response.statusCode}`)
        : String(parsedBody || `Runtime request failed with status ${response.statusCode}`)

      throw createError({
        statusCode: response.statusCode,
        statusMessage: message,
        data: parsedBody,
      })
    }

    return parsedBody
  }
}

export const buildExternalApiUrl = (event: H3Event, path: string) => {
  const config = useRuntimeConfig(event)
  const base = String(config.apiBase || '').replace(/\/+$/, '')
  const normalizedPath = path.replace(/^\/+/, '')

  return `${base}/${normalizedPath}`
}
