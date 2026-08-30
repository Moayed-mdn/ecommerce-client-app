# Storefront Runtime API Contract Specification v1

## Purpose

This specification defines the Phase 1 request and response contracts that the Laravel runtime APIs must implement in Phase 2 and that Nuxt must consume in Phase 3.

## Common Request Rules

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `X-Storefront-Version` | `string` | contract version string | No | `2026-05-28` | Required on all runtime requests |
| `X-Storefront-Locale` | `string` | `en`, `ar` | No | `en` | Locale authority for DTO localization |
| `X-Request-Id` | `string` | opaque request id | No | `req_01jwx4m3r8z7h8v0y7k4p91d3e` | Propagates to logs and error responses |
| `X-Preview-Token` | `string` | opaque signed preview token | Yes | `pvt_...` | Required only for preview validation and preview-authorized runtime fetches |
| `Host` | `string` | active tenant domain | No | `demo.justshop.com` | Laravel resolves tenant authority from domain |

## Endpoints

| Endpoint | Method | Purpose | Success schema | Error schema |
|---|---|---|---|---|
| `/api/v1/storefront/runtime/resolve` | `GET` | Resolve tenant, locale, route type, resource, and redirect behavior | `route-resolution-response.schema.json` | `runtime-error-response.schema.json` |
| `/api/v1/storefront/runtime/page/{id}` | `GET` | Return normalized page payload DTO for the resolved page id | `page-payload-response.schema.json` | `runtime-error-response.schema.json` |
| `/api/v1/storefront/runtime/navigation` | `GET` | Return normalized tenant and locale navigation DTOs | `navigation-payload-response.schema.json` | `runtime-error-response.schema.json` |
| `/api/v1/storefront/runtime/theme` | `GET` | Return normalized tenant theme DTO | `theme-payload-response.schema.json` | `runtime-error-response.schema.json` |
| `/api/v1/storefront/runtime/preview/validate` | `POST` | Validate preview token scope and return preview authorization state | `preview-validation-response.schema.json` | `runtime-error-response.schema.json` |

## Machine-Readable Request Schemas

| Endpoint | Request schema | Positive example | Negative example |
|---|---|---|---|
| `/api/v1/storefront/runtime/resolve` | `route-resolution-request.schema.json` | `route-resolution-request.valid.json` | `invalid/route-resolution-request.missing-path.json` |
| `/api/v1/storefront/runtime/page/{id}` | `page-payload-request.schema.json` | `page-payload-request.valid.json` | documented by request-field rules |
| `/api/v1/storefront/runtime/navigation` | `navigation-payload-request.schema.json` | `navigation-payload-request.valid.json` | documented by request-field rules |
| `/api/v1/storefront/runtime/theme` | `theme-payload-request.schema.json` | `theme-payload-request.valid.json` | documented by request-field rules |
| `/api/v1/storefront/runtime/preview/validate` | `preview-validation-request.schema.json` | `preview-validation-request.valid.json` | `invalid/preview-validation-request.missing-token.json` |

## Shared Response Envelope

### `requestContext`

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `requestContext.requestId` | `string` | opaque request id | No | `req_01jwx4m3r8z7h8v0y7k4p91d3e` | Echo of request correlation id |
| `requestContext.tenantId` | `string` | resolved store identifier | Yes | `store_42` | `null` only before a tenant is resolved or in tenant-not-found errors |
| `requestContext.tenantKey` | `string` | normalized tenant slug/key | Yes | `justshop-demo` | Used by cache keys and logs |
| `requestContext.locale` | `string` | `en`, `ar` | No | `en` | Final resolved locale |
| `requestContext.path` | `string` | normalized storefront path | No | `/about-us` | No trailing slash except `/` |
| `requestContext.runtimeVersion` | `string` | current runtime contract version | No | `2026-05-28` | Must match the backend/runtime serializer version |
| `requestContext.preview` | `boolean` | `true`, `false` | No | `false` | Indicates whether the request is preview-authorized |

### `cache`

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `cache.key` | `string` | contract-compliant key string | No | `storefront_runtime:2026-05-28:tenant:justshop-demo:locale:en:artifact:route:path:/about-us` | Present on cacheable responses |
| `cache.artifact` | `string` | `route`, `page`, `navigation`, `theme`, `seo` | No | `route` | Artifact family for invalidation and observability |
| `cache.ttlSeconds` | `integer` | non-negative integer | No | `300` | `0` only for bypassed/private artifacts |
| `cache.tags` | `string[]` | tenant, locale, artifact, route/page tags | No | `['tenant:justshop-demo']` | Phase 5 invalidation anchors |
| `cache.bypassed` | `boolean` | `true`, `false` | No | `false` | `true` for preview and non-cacheable paths |

## Route Resolution Contract

### Request

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `path` query param | `string` | normalized storefront path | No | `/about-us` | Required |
| `locale` query param | `string` | `en`, `ar` | Yes | `en` | Optional if locale is inferable from route prefix or headers |

### Response `data`

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `data.status` | `string` | `matched`, `redirect`, `not_found` | No | `matched` | Primary route outcome |
| `data.routeType` | `string` | `home`, `marketing_page`, `category_page`, `product_page`, `redirect` | No | `marketing_page` | Drives downstream payload loading and SSR layout selection |
| `data.pageId` | `string` | page identifier | Yes | `mkt_about_us` | Required for `matched` page-like outcomes; `null` for redirects and misses |
| `data.resourceType` | `string` | `page`, `product`, `category`, `none` | No | `page` | Backend resource family |
| `data.resourceId` | `string` | normalized resource identifier | Yes | `mkt_about_us` | `null` when no resource is resolved |
| `data.path` | `string` | normalized path | No | `/about-us` | Echo of the resolved path |
| `data.locale` | `string` | `en`, `ar` | No | `en` | Resolved locale used for slug matching |
| `data.layout` | `string` | `default`, `marketing`, `catalog`, `product` | Yes | `marketing` | `null` for redirect and not-found outcomes |
| `data.redirectTo` | `string` | path or absolute URL | Yes | `/about-us` | Required only when `status = redirect` |
| `data.redirectStatus` | `integer` | `301`, `302` | Yes | `301` | Required only when `status = redirect` |

## Page Payload Contract

### Request

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `id` path param | `string` | page identifier from resolver response | No | `mkt_about_us` | Required |
| `preview` query param | `boolean` | `true`, `false` | Yes | `false` | Allowed only after preview validation |

### Response `data.page`

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `data.page.id` | `string` | stable page id | No | `mkt_about_us` | Primary DTO identity |
| `data.page.pageType` | `string` | `home`, `marketing_page`, `category_page`, `product_page` | No | `marketing_page` | Page rendering family |
| `data.page.title` | `string` | localized string | No | `About JustShop` | Human-readable title |
| `data.page.slug` | `string` | localized slug without leading slash | No | `about-us` | Locale-specific slug |
| `data.page.locale` | `string` | `en`, `ar` | No | `en` | Locale used to serialize payload |
| `data.page.layout` | `string` | `default`, `marketing`, `catalog`, `product` | No | `marketing` | SSR layout selector |
| `data.page.status` | `string` | `published`, `draft` | No | `published` | `draft` only with preview authorization |
| `data.page.sections` | `array` | normalized section DTOs | No | see example payload | Presentational section list |
| `data.page.seo` | `object` | SEO DTO | No | see example payload | Laravel-owned SEO output |
| `data.page.publishedAt` | `string` | ISO 8601 timestamp | Yes | `2026-05-12T10:30:00Z` | `null` for draft-only pages |
| `data.page.updatedAt` | `string` | ISO 8601 timestamp | No | `2026-05-28T09:15:00Z` | Latest content mutation time |

### Response `data.page.sections[]`

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `id` | `string` | stable section id | No | `hero_about` | Required for hydration stability |
| `type` | `string` | registered section type key | No | `hero_banner` | Maps to renderer registry |
| `component` | `string` | registered component name | No | `HeroSection` | Nuxt component lookup key |
| `props` | `object` | normalized presentational props | No | `{ "headline": "Built for modern merchants" }` | Section components must not fetch data directly |
| `version` | `string` | serializer version | No | `1` | Supports additive evolution |
| `dataState` | `string` | `ready`, `empty`, `error` | No | `ready` | Safe rendering state for malformed or partial content |

### Response `data.page.seo`

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `title` | `string` | localized string | No | `About JustShop` | Final page title |
| `description` | `string` | localized string | No | `Learn how JustShop delivers tenant-aware storefront experiences.` | Final meta description |
| `canonicalUrl` | `string` | absolute URL | No | `https://demo.justshop.com/about-us` | Tenant and locale aware canonical |
| `robots` | `string` | `index,follow`, `noindex,nofollow`, `noindex,follow` | No | `index,follow` | Search index rule |
| `hreflang[]` | `array` | alternate locale/url pairs | No | see example payload | One entry per supported locale |
| `openGraph.title` | `string` | localized string | No | `About JustShop` | OG title |
| `openGraph.description` | `string` | localized string | No | `Learn how JustShop delivers tenant-aware storefront experiences.` | OG description |
| `openGraph.type` | `string` | `website`, `product` | No | `website` | Page-type dependent |
| `openGraph.imageUrl` | `string` | absolute URL | Yes | `https://cdn.justshop.com/og/about-us.png` | `null` allowed when unavailable |
| `twitter.card` | `string` | `summary`, `summary_large_image` | No | `summary_large_image` | Twitter card type |
| `twitter.title` | `string` | localized string | No | `About JustShop` | Twitter title |
| `twitter.description` | `string` | localized string | No | `Learn how JustShop delivers tenant-aware storefront experiences.` | Twitter description |
| `twitter.imageUrl` | `string` | absolute URL | Yes | `https://cdn.justshop.com/og/about-us.png` | `null` allowed when unavailable |
| `jsonLd[]` | `array` | JSON-LD objects | No | `[{ "@type": "WebPage" }]` | Search- and page-type-specific structured data |

## Navigation Payload Contract

### Request

No endpoint-specific query or path parameters are allowed. The request is defined entirely by the common request rules and the `navigation-payload-request.schema.json` header contract.

### Response `data`

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `data.header` | `array` | navigation items | No | see example payload | Header menu tree |
| `data.footer` | `array` | navigation items | No | see example payload | Footer menu tree |

### Navigation Item Fields

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `id` | `string` | stable menu item id | No | `nav_home` | Stable SSR key |
| `label` | `string` | localized string | No | `Home` | Merchant-facing label |
| `path` | `string` | internal path or absolute URL | No | `/products` | Internal relative path unless `external = true` |
| `external` | `boolean` | `true`, `false` | No | `false` | Controls client navigation vs anchor behavior |
| `children[]` | `array` | nested navigation items | No | `[]` | Recursive tree |

## Theme Payload Contract

### Request

No endpoint-specific query or path parameters are allowed. The request is defined entirely by the common request rules and the `theme-payload-request.schema.json` header contract.

### Response `data`

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `data.themeKey` | `string` | theme identifier | No | `default-light` | Used for cache invalidation and observability |
| `data.tokens.colorPrimary` | `string` | CSS color token | No | `#2563eb` | Theme token |
| `data.tokens.colorSurface` | `string` | CSS color token | No | `#ffffff` | Theme token |
| `data.tokens.colorText` | `string` | CSS color token | No | `#111827` | Theme token |
| `data.tokens.fontBody` | `string` | CSS font stack | No | `Inter, sans-serif` | Theme token |
| `data.tokens.fontHeading` | `string` | CSS font stack | No | `Inter, sans-serif` | Theme token |
| `data.assets.logoUrl` | `string` | absolute URL | Yes | `https://cdn.justshop.com/assets/logo.png` | `null` if default asset is implied |
| `data.assets.faviconUrl` | `string` | absolute URL | Yes | `https://cdn.justshop.com/assets/favicon.ico` | `null` if default asset is implied |
| `data.settings.radius` | `string` | `none`, `sm`, `md`, `lg` | No | `md` | Design system token |
| `data.settings.direction` | `string` | `ltr`, `rtl` | No | `ltr` | Must match locale direction |

## Preview Validation Contract

### Request Body

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `token` | `string` | signed preview token | No | `pvt_...` | Required |
| `pageId` | `string` | page identifier | No | `mkt_about_us` | Token must be page-scoped |
| `path` | `string` | normalized storefront path | No | `/about-us` | Used for cache bypass and logs |
| `locale` | `string` | `en`, `ar` | No | `en` | Scope check |

### Response `data`

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `data.valid` | `boolean` | `true`, `false` | No | `true` | Final authorization decision |
| `data.previewState` | `string` | `authorized`, `denied`, `expired` | No | `authorized` | Final preview state |
| `data.pageId` | `string` | authorized page id | Yes | `mkt_about_us` | `null` when denied or expired |
| `data.expiresAt` | `string` | ISO 8601 timestamp | Yes | `2026-05-28T10:15:00Z` | `null` for denied preview |
| `data.cacheBypass` | `boolean` | `true`, `false` | No | `true` | Must be `true` for authorized preview responses |

### Negative-Path Expectations

| Request or condition | Expected normalized error |
|---|---|
| unknown tenant domain | `runtime.tenant_not_found` |
| inactive or suspended tenant | `runtime.tenant_inactive` |
| unsupported locale | `runtime.invalid_locale` |
| unresolved route | `runtime.route_not_found` |
| resolved route with missing payload | `runtime.page_not_found` |
| missing or malformed preview token | `runtime.preview_invalid` |
| expired preview token | `runtime.preview_expired` |
| invalid request shape | `runtime.validation_failed` |

## Runtime Error Contract

### Error Fields

| Field | Type | Allowed values | Nullable | Example | Notes |
|---|---|---|---|---|---|
| `error.code` | `string` | see catalog below | No | `runtime.preview_invalid` | Stable machine-readable error code |
| `error.message` | `string` | human-readable message | No | `The preview token is invalid for the requested tenant and page.` | Safe for logs and client display |
| `error.httpStatus` | `integer` | `400`, `401`, `403`, `404`, `409`, `422`, `500`, `503` | No | `403` | HTTP response status |
| `error.retryable` | `boolean` | `true`, `false` | No | `false` | Operational retry hint |
| `error.details` | `object` | structured error metadata | No | `{ "reason": "tenant_page_scope_mismatch" }` | No secrets or raw stack traces |

### Error Code Catalog

| Code | HTTP status | Meaning |
|---|---|---|
| `runtime.tenant_not_found` | `404` | Domain does not resolve to a storefront tenant |
| `runtime.tenant_inactive` | `403` | Tenant is suspended, inactive, or not operational |
| `runtime.invalid_locale` | `422` | Locale is not supported for the resolved tenant |
| `runtime.route_not_found` | `404` | Route could not be resolved |
| `runtime.page_not_found` | `404` | Route resolved but page payload cannot be loaded |
| `runtime.preview_invalid` | `403` | Preview token is invalid or page/tenant scoped incorrectly |
| `runtime.preview_expired` | `403` | Preview token is expired |
| `runtime.validation_failed` | `400` | Request shape is invalid |
| `runtime.internal_error` | `500` | Unhandled runtime failure |
