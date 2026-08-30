# Playwright E2E Testing Guide

## Project Overview

**JustShop Frontend** is a multi-tenant e-commerce storefront built with Nuxt 4, serving as the customer-facing application for a Laravel-based e-commerce platform. The application features:

- Complete shopping experience (browse, cart, checkout, orders)
- Multi-language support (English default, Arabic with RTL)
- Dual cart system (guest localStorage + authenticated server-synced)
- Stripe-powered checkout
- GraphQL-powered search via Apollo Client
- Dynamic CMS pages via Storefront Runtime system
- Google OAuth integration

This is a **production-grade, tenant-aware application** with complex state management and requires comprehensive E2E testing coverage.

---

## Tech Stack (As Found in Codebase)

### Core Framework
- **Nuxt 4** (compatibilityVersion: 4) with Vue 3.5.24
- **TypeScript** throughout
- **Pinia 3.0.4** for state management (with persisted state)
- **Vue Router 4.6.3** with i18n routing

### Styling & UI
- **Tailwind CSS 4.2.1** via `@tailwindcss/vite`
- **@nuxt/ui 4.5.1** component library
- **@nuxt/icon 2.2.1** with Heroicons
- Custom CSS variables for theming (`var(--color-*)`)

### Data Layer
- **REST API**: Nitro server routes (`server/api/**`) proxy to Laravel backend
- **GraphQL**: Apollo Client 4.1.6 for search only
- **ofetch**: Underlying fetch wrapper

### State Management
- **Pinia stores**:
  - `app/stores/auth.ts` - Authentication state
  - `app/stores/cart.ts` - Shopping cart state
- **pinia-plugin-persistedstate** - Cookie-based persistence

### Internationalization
- **@nuxtjs/i18n 10.2.1**
- Strategy: `prefix_except_default`
- Locales: English (default), Arabic (`/ar` prefix)

### Testing Tools Available
- **Playwright 1.60.0** (installed, not configured)
- **Vitest 3.2.6** (installed, not used)

---

## Recommended Test Folder Structure

Based on the actual project structure and features found:

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── register.spec.ts
│   │   ├── google-oauth.spec.ts
│   │   ├── email-verification.spec.ts
│   │   ├── forgot-password.spec.ts
│   │   └── reset-password.spec.ts
│   ├── cart/
│   │   ├── guest-cart.spec.ts
│   │   ├── authenticated-cart.spec.ts
│   │   ├── cart-merge-on-login.spec.ts
│   │   ├── cart-operations.spec.ts
│   │   └── cart-persistence.spec.ts
│   ├── checkout/
│   │   ├── guest-checkout.spec.ts
│   │   ├── authenticated-checkout.spec.ts
│   │   ├── checkout-success.spec.ts
│   │   └── checkout-cancel.spec.ts
│   ├── products/
│   │   ├── product-listing.spec.ts
│   │   ├── product-detail.spec.ts
│   │   ├── product-variants.spec.ts
│   │   ├── category-browsing.spec.ts
│   │   └── product-filters.spec.ts
│   ├── search/
│   │   ├── search-results.spec.ts
│   │   └── search-autocomplete.spec.ts
│   ├── orders/
│   │   ├── order-history.spec.ts
│   │   ├── order-detail.spec.ts
│   │   ├── order-cancel.spec.ts
│   │   ├── order-reorder.spec.ts
│   │   └── guest-order-tracking.spec.ts
│   ├── profile/
│   │   ├── profile-update.spec.ts
│   │   ├── avatar-upload.spec.ts
│   │   ├── password-change.spec.ts
│   │   └── account-deletion.spec.ts
│   └── storefront/
│       ├── homepage.spec.ts
│       ├── navigation.spec.ts
│       ├── locale-switching.spec.ts
│       └── theme-toggle.spec.ts
├── fixtures/
│   ├── users.ts
│   ├── products.ts
│   ├── orders.ts
│   └── cart-items.ts
├── page-objects/
│   ├── auth/
│   │   ├── LoginPage.ts
│   │   ├── RegisterPage.ts
│   │   └── ForgotPasswordPage.ts
│   ├── cart/
│   │   └── CartPage.ts
│   ├── products/
│   │   ├── ProductListingPage.ts
│   │   └── ProductDetailPage.ts
│   ├── orders/
│   │   ├── OrdersPage.ts
│   │   └── OrderDetailPage.ts
│   ├── profile/
│   │   └── ProfilePage.ts
│   └── components/
│       ├── Header.ts
│       ├── Footer.ts
│       ├── CartButton.ts
│       └── SearchInput.ts
├── helpers/
│   ├── auth.ts
│   ├── cart.ts
│   ├── api.ts
│   └── storage.ts
└── playwright.config.ts
```

---

## Test Selector Strategy

### Current State: NO DATA-TESTID ATTRIBUTES EXIST

**Finding:** A comprehensive search revealed **zero** `data-testid` attributes in the current codebase.

### Recommended Approach: Add Test Selectors

Since this project has **no existing test infrastructure**, you'll need to add selectors systematically.

#### Naming Convention

Based on the project's component naming patterns found, use this convention:

```
data-testid="{feature}-{component}-{element}"
```

**Examples from actual components:**

```vue
<!-- app/components/auth/AuthFormInput.vue -->
<input data-testid="auth-form-input" />
<span data-testid="auth-form-error">{{ error }}</span>

<!-- app/components/cart/CartPageItem.vue -->
<div data-testid="cart-item">
  <img data-testid="cart-item-image" />
  <button data-testid="cart-item-remove" />
  <button data-testid="cart-item-quantity-increment" />
  <button data-testid="cart-item-quantity-decrement" />
  <span data-testid="cart-item-quantity">{{ quantity }}</span>
</div>

<!-- app/components/header/HeaderSearchInput.vue -->
<input data-testid="header-search-input" />
<div data-testid="header-search-dropdown" />

<!-- app/components/product/ProductCard.vue -->
<div data-testid="product-card">
  <h3 data-testid="product-card-name" />
  <span data-testid="product-card-price" />
  <button data-testid="product-card-add-to-cart" />
</div>

<!-- app/pages/login.vue -->
<form data-testid="login-form">
  <input data-testid="login-email-input" />
  <input data-testid="login-password-input" />
  <button data-testid="login-submit-button" />
</form>

<!-- app/pages/cart.vue -->
<button data-testid="cart-clear-button" />
<button data-testid="cart-checkout-button" />
<div data-testid="cart-total" />

<!-- app/pages/orders/index.vue -->
<div data-testid="orders-list" />
<button data-testid="order-reorder-button" />
<button data-testid="order-cancel-button" />
```

#### Fallback Strategies (Current Codebase)

Until test selectors are added, use these patterns found in the actual components:

```typescript
// CSS class selectors (use carefully, these may change)
page.locator('.orders-track__submit')
page.locator('.cursor-pointer')

// Component-specific classes
page.locator('[class*="product-"]')
page.locator('[class*="cart-"]')

// SVG icons (use with caution)
page.locator('svg[class*="animate-spin"]') // Loading state

// Form elements (most reliable without data-testid)
page.locator('input[type="email"]')
page.locator('input[type="password"]')
page.locator('input[autocomplete="email"]')
page.locator('button[type="submit"]')

// Nuxt-specific locators
page.locator('a[href*="/cart"]')
page.locator('a[href*="/profile"]')
page.locator('a[href*="/orders"]')

// Text content (i18n-safe with regex)
page.getByRole('button', { name: /log in|sign in/i })
page.getByRole('link', { name: /cart/i })
page.getByRole('heading', { name: /my orders/i })
```

---

## Authentication Testing Approach

### Actual Auth Flow (As Found in Codebase)

#### Session-Based Auth with Laravel Backend

- **Cookies Used:**
  - `ecommerce_session` - Laravel session
  - `XSRF-TOKEN` - CSRF token
  - `js_auth` or `auth` (legacy) - Persisted auth state (contains user + token)

- **Pinia Store:** `app/stores/auth.ts`
  - Persisted to cookies via `pinia-plugin-persistedstate`

- **Plugin Bootstrap:** `app/plugins/01.auth.ts`
  - Runs on every page load
  - Rehydrates user from backend if session cookies exist

#### Auth Test Strategy

```typescript
// tests/helpers/auth.ts

import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  name: string;
}

export const TEST_USERS = {
  customer: {
    email: 'customer@test.com',
    password: 'password123',
    name: 'Test Customer',
  },
  verified: {
    email: 'verified@test.com',
    password: 'password123',
    name: 'Verified User',
  },
  unverified: {
    email: 'unverified@test.com',
    password: 'password123',
    name: 'Unverified User',
  },
};

/**
 * Login via UI (full flow)
 */
export async function loginViaUI(page: Page, user: TestUser) {
  await page.goto('/login');
  
  // Based on actual login.vue structure
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="password"]').fill(user.password);
  await page.locator('button[type="submit"]').click();
  
  // Wait for redirect to home (actual behavior found)
  await page.waitForURL('/');
}

/**
 * Login via API (faster for setup)
 * Uses actual API route structure found in server/api/auth/login.post.ts
 */
export async function loginViaAPI(page: Page, user: TestUser) {
  const response = await page.request.post('/api/auth/login', {
    data: {
      email: user.email,
      password: user.password,
    },
  });

  expect(response.ok()).toBeTruthy();
  
  const data = await response.json();
  
  // Store cookies (actual cookie names found)
  const cookies = await page.context().cookies();
  expect(cookies.some(c => c.name === 'ecommerce_session')).toBeTruthy();
  expect(cookies.some(c => c.name === 'XSRF-TOKEN')).toBeTruthy();
}

/**
 * Setup authenticated state (for beforeEach)
 */
export async function setupAuthState(page: Page, user: TestUser) {
  await loginViaAPI(page, user);
  
  // Verify auth store is hydrated (actual plugin behavior)
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Check that user is logged in (actual header behavior)
  await expect(page.locator('text=/profile|account/i')).toBeVisible();
}

/**
 * Logout
 */
export async function logout(page: Page) {
  // Click profile dropdown and logout (actual UI flow)
  await page.click('[data-testid="header-profile-dropdown"]');
  await page.click('text=/log out|sign out/i');
  
  // Should redirect to login (actual logout behavior)
  await page.waitForURL('/login');
}

/**
 * Check if user is logged in (by checking Pinia store via localStorage)
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for js_auth cookie (actual persistence mechanism)
  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name === 'js_auth' || c.name === 'auth');
  
  if (!authCookie) return false;
  
  try {
    const authData = JSON.parse(authCookie.value);
    return !!authData.user;
  } catch {
    return false;
  }
}
```

---

## Cart Testing Approach

### Actual Cart Implementation (As Found)

- **Guest Cart:** `localStorage` with key `js_cart_{tenantId}`
- **Authenticated Cart:** Server-synced via `/api/cart` endpoints
- **Merge on Login:** Automatic bulk upload of guest items

```typescript
// tests/helpers/cart.ts

import { Page } from '@playwright/test';

export interface CartItem {
  product_id: number;
  product_variant_id: number;
  quantity: number;
  name: string;
  price: number;
}

/**
 * Get guest cart from localStorage (actual storage key pattern)
 */
export async function getGuestCart(page: Page, tenantId: string = 'demo') {
  const storageKey = `js_cart_${tenantId}`;
  const cartData = await page.evaluate((key) => {
    return localStorage.getItem(key);
  }, storageKey);
  
  return cartData ? JSON.parse(cartData) : null;
}

/**
 * Clear guest cart
 */
export async function clearGuestCart(page: Page, tenantId: string = 'demo') {
  const storageKey = `js_cart_${tenantId}`;
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, storageKey);
}

/**
 * Add item to cart via UI
 * Based on actual ProductCommerce flow
 */
export async function addToCartViaUI(page: Page, productSlug: string) {
  await page.goto(`/shop/product/${productSlug}`);
  
  // Select first variant if multiple exist (actual behavior)
  const variantSelector = page.locator('[data-testid="product-variant-selector"]');
  if (await variantSelector.isVisible()) {
    await variantSelector.first().click();
  }
  
  // Click add to cart (actual button behavior)
  await page.click('button:has-text("Add to Cart")');
  
  // Wait for success toast (actual UX pattern)
  await expect(page.locator('text=/added to cart/i')).toBeVisible();
  
  // Wait for cart count to update
  await page.waitForTimeout(500);
}

/**
 * Add item to cart via API (faster for setup)
 */
export async function addToCartViaAPI(page: Page, item: CartItem) {
  const response = await page.request.post('/api/cart/items', {
    data: {
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
    },
  });
  
  expect(response.ok()).toBeTruthy();
}

/**
 * Get cart item count from badge (actual UI element)
 */
export async function getCartCount(page: Page): Promise<number> {
  const badge = page.locator('[data-testid="cart-button-badge"]');
  
  if (!(await badge.isVisible())) return 0;
  
  const text = await badge.textContent();
  return parseInt(text || '0', 10);
}

/**
 * Clear cart via API
 */
export async function clearCartViaAPI(page: Page) {
  await page.request.delete('/api/cart/clear');
}

/**
 * Navigate to cart page
 */
export async function goToCart(page: Page) {
  // Actual cart route
  await page.goto('/cart');
  await page.waitForLoadState('networkidle');
}
```

---

## Page Object Model Examples

### Based on Actual Pages Found

```typescript
// tests/page-objects/auth/LoginPage.ts

import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  
  // Actual form structure from app/pages/login.vue
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly emailVerificationNotice: Locator;
  readonly errorAlert: Locator;
  readonly successAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Based on actual login.vue structure
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot")');
    this.registerLink = page.locator('a:has-text("Sign up")');
    this.emailVerificationNotice = page.locator('text=/verify.*email/i');
    this.errorAlert = page.locator('[class*="error"]');
    this.successAlert = page.locator('[class*="success"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoginSuccess() {
    // Actual behavior: redirects to home
    await this.page.waitForURL('/');
  }

  async expectEmailNotVerified() {
    // Actual AUTH_002 error handling
    await expect(this.emailVerificationNotice).toBeVisible();
  }

  async resendVerification() {
    // Actual resend button in login.vue
    await this.page.click('button:has-text("Resend")');
  }
}
```

```typescript
// tests/page-objects/cart/CartPage.ts

import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  
  // Based on actual app/pages/cart.vue structure
  readonly cartItems: Locator;
  readonly emptyState: Locator;
  readonly cartTotal: Locator;
  readonly checkoutButton: Locator;
  readonly clearCartButton: Locator;
  readonly clearConfirmModal: Locator;
  readonly mobileCheckoutBar: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Actual component structure found
    this.cartItems = page.locator('[data-testid="cart-item"]');
    this.emptyState = page.locator('text=/your cart is empty/i');
    this.cartTotal = page.locator('[data-testid="cart-total"]');
    this.checkoutButton = page.locator('button:has-text("Checkout")');
    this.clearCartButton = page.locator('button:has-text("Clear")');
    this.clearConfirmModal = page.locator('[data-testid="cart-clear-modal"]');
    this.mobileCheckoutBar = page.locator('[data-testid="cart-mobile-checkout"]');
  }

  async goto() {
    await this.page.goto('/cart');
  }

  async getItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  async removeItem(index: number = 0) {
    // Actual remove button in CartPageItem.vue
    await this.cartItems.nth(index).locator('[data-testid="cart-item-remove"]').click();
  }

  async updateQuantity(index: number, quantity: number) {
    const item = this.cartItems.nth(index);
    const currentQty = await item.locator('[data-testid="cart-item-quantity"]').textContent();
    const current = parseInt(currentQty || '1', 10);
    
    const incrementButton = item.locator('[data-testid="cart-item-quantity-increment"]');
    const decrementButton = item.locator('[data-testid="cart-item-quantity-decrement"]');
    
    const diff = quantity - current;
    
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        await incrementButton.click();
        await this.page.waitForTimeout(300); // Debounce
      }
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) {
        await decrementButton.click();
        await this.page.waitForTimeout(300);
      }
    }
  }

  async clearCart() {
    await this.clearCartButton.click();
    // Actual confirmation modal from cart.vue
    await this.page.locator('button:has-text("Confirm")').click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
    // Actual behavior: redirects to Stripe or shows error
  }

  async getTotalPrice(): Promise<string> {
    return await this.cartTotal.textContent() || '0';
  }
}
```

---

```typescript
// tests/page-objects/products/ProductDetailPage.ts

import { Page, Locator } from '@playwright/test';

export class ProductDetailPage {
  readonly page: Page;
  
  // Based on actual product detail page structure
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productImage: Locator;
  readonly variantSelector: Locator;
  readonly quantitySelector: Locator;
  readonly addToCartButton: Locator;
  readonly buyNowButton: Locator;
  readonly stockStatus: Locator;
  readonly relatedProducts: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Actual component structure
    this.productName = page.locator('[data-testid="product-header"]');
    this.productPrice = page.locator('[data-testid="product-price"]');
    this.productImage = page.locator('[data-testid="product-image-gallery"]');
    this.variantSelector = page.locator('[data-testid="product-variant-selector"]');
    this.quantitySelector = page.locator('[data-testid="product-quantity-selector"]');
    this.addToCartButton = page.locator('button:has-text("Add to Cart")');
    this.buyNowButton = page.locator('button:has-text("Buy Now")');
    this.stockStatus = page.locator('[data-testid="product-stock-status"]');
    this.relatedProducts = page.locator('[data-testid="product-related"]');
    this.breadcrumb = page.locator('[data-testid="product-breadcrumb"]');
  }

  async goto(slug: string) {
    // Actual canonical route pattern
    await this.page.goto(`/shop/product/${slug}`);
  }

  async selectVariant(variantName: string) {
    // Based on ProductVariantSelector.vue behavior
    await this.variantSelector.locator(`button:has-text("${variantName}")`).click();
  }

  async setQuantity(quantity: number) {
    // Based on ProductQuantitySelector.vue
    const input = this.quantitySelector.locator('input[type="number"]');
    await input.fill(quantity.toString());
  }

  async addToCart() {
    await this.addToCartButton.click();
    // Wait for toast (actual UX)
    await expect(this.page.locator('text=/added to cart/i')).toBeVisible();
  }

  async buyNow() {
    await this.buyNowButton.click();
    // Actual behavior: adds to cart then redirects to checkout
    await this.page.waitForURL(/\/cart|\/checkout/);
  }

  async isInStock(): Promise<boolean> {
    const status = await this.stockStatus.textContent();
    return !status?.toLowerCase().includes('out of stock');
  }
}
```

```typescript
// tests/page-objects/orders/OrdersPage.ts

import { Page, Locator } from '@playwright/test';

export class OrdersPage {
  readonly page: Page;
  
  // Based on actual app/pages/orders/index.vue
  readonly ordersList: Locator;
  readonly emptyState: Locator;
  readonly statusFilter: Locator;
  readonly dateFromFilter: Locator;
  readonly dateToFilter: Locator;
  readonly clearFiltersButton: Locator;
  readonly paginationControls: Locator;
  readonly cancelModal: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Actual orders page structure
    this.ordersList = page.locator('[data-testid="orders-list"]');
    this.emptyState = page.locator('text=/no orders/i');
    this.statusFilter = page.locator('[data-testid="orders-status-filter"]');
    this.dateFromFilter = page.locator('[data-testid="orders-from-date"]');
    this.dateToFilter = page.locator('[data-testid="orders-to-date"]');
    this.clearFiltersButton = page.locator('button:has-text("Clear")');
    this.paginationControls = page.locator('[data-testid="orders-pagination"]');
    this.cancelModal = page.locator('[data-testid="orders-cancel-modal"]');
  }

  async goto() {
    // Actual route (protected by auth middleware)
    await this.page.goto('/orders');
  }

  async getOrderCount(): Promise<number> {
    return await this.ordersList.locator('[data-testid="order-card"]').count();
  }

  async filterByStatus(status: string) {
    // Actual filter implementation from orders/index.vue
    await this.statusFilter.selectOption(status);
  }

  async filterByDateRange(from: string, to: string) {
    await this.dateFromFilter.fill(from);
    await this.dateToFilter.fill(to);
  }

  async clickOrder(orderNumber: string) {
    await this.page.click(`[data-order-number="${orderNumber}"]`);
    // Actual navigation pattern
    await this.page.waitForURL(`/orders/${orderNumber}`);
  }

  async reorderOrder(orderNumber: string) {
    await this.page.click(`[data-order="${orderNumber}"] [data-testid="order-reorder-button"]`);
    // Actual behavior: redirects to cart
    await this.page.waitForURL('/cart');
  }

  async cancelOrder(orderNumber: string) {
    // Actual cancel flow from orders/index.vue
    await this.page.click(`[data-order="${orderNumber}"] [data-testid="order-cancel-button"]`);
    await this.cancelModal.locator('button:has-text("Confirm")').click();
    // Wait for success toast
    await expect(this.page.locator('text=/cancelled/i')).toBeVisible();
  }
}
```

---

## Environment Variables for Tests

Based on the actual `.env.example` and runtime config found:

```bash
# tests/.env.test

# Backend API (actual env var from nuxt.config.ts)
NUXT_PUBLIC_API_BASE=http://localhost:8000/api/v1

# GraphQL endpoint for search (actual usage found)
NUXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql

# Site URL (actual i18n config)
NUXT_PUBLIC_SITE_URL=http://localhost:3000

# Test user credentials (for test database)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123

# Stripe test keys (for checkout tests)
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
STRIPE_TEST_SECRET_KEY=sk_test_...

# Tenant ID for multi-tenant tests (actual header usage)
TEST_TENANT_ID=demo
```

### Loading in Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: 'tests/.env.test' });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    
    // Actual tenant header pattern found in server/utils/api.ts
    extraHTTPHeaders: {
      'X-Tenant-Id': process.env.TEST_TENANT_ID || 'demo',
      'Accept-Language': 'en',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile tests (actual responsive breakpoints found)
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    
    // Arabic locale tests (actual i18n support)
    {
      name: 'Arabic RTL',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ar-SA',
        extraHTTPHeaders: {
          'X-Tenant-Id': process.env.TEST_TENANT_ID || 'demo',
          'Accept-Language': 'ar',
        },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## Test Conventions (Based on Project Code Style)

### File Naming
- **Pattern:** `{feature}.spec.ts`
- **Examples:** `login.spec.ts`, `guest-cart.spec.ts`, `order-reorder.spec.ts`

### Test Structure

```typescript
// Follow the project's TypeScript style (strict mode, explicit types)

import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../page-objects/auth/LoginPage';
import { loginViaAPI, TEST_USERS } from '../helpers/auth';

test.describe('User Login', () => {
  let page: Page;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login with valid credentials', async () => {
    await loginPage.login(TEST_USERS.customer.email, TEST_USERS.customer.password);
    await loginPage.expectLoginSuccess();
    
    // Verify auth state (actual behavior)
    expect(await page.url()).toBe('/');
  });

  test('should show error for invalid credentials', async () => {
    await loginPage.login('wrong@email.com', 'wrongpassword');
    await expect(loginPage.errorAlert).toBeVisible();
  });

  test('should handle unverified email (AUTH_002)', async () => {
    // Actual error code found in login.vue
    await loginPage.login(TEST_USERS.unverified.email, TEST_USERS.unverified.password);
    await loginPage.expectEmailNotVerified();
  });
});
```

### Naming Conventions

Match the project's naming style found in codebase:

- **Variables:** camelCase (`cartItems`, `userEmail`)
- **Functions:** camelCase with verb prefixes (`loginViaUI`, `getCartCount`)
- **Classes:** PascalCase (`LoginPage`, `CartPage`)
- **Constants:** UPPER_SNAKE_CASE (`TEST_USERS`, `API_ROUTES`)
- **Types/Interfaces:** PascalCase (`TestUser`, `CartItem`)

### Assertions Style

Use the patterns consistent with the project's error handling:

```typescript
// Check for actual error patterns found in code
await expect(page.locator('text=/failed to/i')).toBeVisible();
await expect(page.locator('[class*="error"]')).toContainText('Invalid');

// Check for actual success patterns
await expect(page.locator('text=/success/i')).toBeVisible();
await expect(page.locator('[class*="toast"]')).toContainText('Added');

// Check actual route patterns
await page.waitForURL('/cart');
await expect(page).toHaveURL(/\/shop\/product\//);

// Check actual state (Pinia store verification)
const isLoggedIn = await page.evaluate(() => {
  const cookies = document.cookie;
  return cookies.includes('js_auth') || cookies.includes('ecommerce_session');
});
expect(isLoggedIn).toBeTruthy();
```

---

## Known Flows to Test (From Actual Features Found)

### 1. Authentication Flows

#### A. **Registration → Email Verification → Login**
```typescript
test('complete registration flow', async ({ page }) => {
  // Register
  await page.goto('/register');
  await page.fill('input[type="email"]', 'newuser@test.com');
  await page.fill('input[id="name"]', 'New User');
  await page.fill('input[id="password"]', 'password123');
  await page.fill('input[id="password_confirmation"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Should redirect to login with success message
  await page.waitForURL(/login\?registered=true/);
  
  // Attempt login (will fail - email not verified)
  await page.fill('input[type="email"]', 'newuser@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Should show AUTH_002 error
  await expect(page.locator('text=/verify.*email/i')).toBeVisible();
});
```

#### B. **Forgot Password → Reset Password**
```typescript
test('password reset flow', async ({ page }) => {
  // Request reset
  await page.goto('/forgot-password');
  await page.fill('input[type="email"]', TEST_USERS.customer.email);
  await page.click('button[type="submit"]');
  
  // Should show success message
  await expect(page.locator('text=/email sent/i')).toBeVisible();
  
  // Simulate clicking reset link (with token from backend)
  const resetToken = 'test_token_from_email';
  await page.goto(`/reset-password?token=${resetToken}&email=${TEST_USERS.customer.email}`);
  
  // Enter new password
  await page.fill('input[id="password"]', 'newpassword123');
  await page.fill('input[id="password_confirmation"]', 'newpassword123');
  await page.click('button[type="submit"]');
  
  // Should show success and redirect to login
  await expect(page.locator('text=/password.*reset/i')).toBeVisible();
});
```

---

### 2. Cart Flows

#### A. **Guest Cart → Login → Cart Merge**
```typescript
test('guest cart merges on login', async ({ page }) => {
  // Add items as guest
  await addToCartViaUI(page, 'product-1');
  await addToCartViaUI(page, 'product-2');
  
  // Verify guest cart in localStorage
  const guestCart = await getGuestCart(page);
  expect(guestCart.items).toHaveLength(2);
  
  // Login
  await loginViaUI(page, TEST_USERS.customer);
  
  // Cart should still have 2 items (merged)
  await goToCart(page);
  const itemCount = await page.locator('[data-testid="cart-item"]').count();
  expect(itemCount).toBe(2);
  
  // Guest cart should be cleared from localStorage
  const clearedCart = await getGuestCart(page);
  expect(clearedCart).toBeNull();
});
```

#### B. **Persistent Guest Cart (Refresh)**
```typescript
test('guest cart persists across page refresh', async ({ page }) => {
  // Add items
  await addToCartViaUI(page, 'product-1');
  
  // Refresh page
  await page.reload();
  
  // Cart badge should still show 1
  const count = await getCartCount(page);
  expect(count).toBe(1);
  
  // Navigate to cart
  await goToCart(page);
  const itemCount = await page.locator('[data-testid="cart-item"]').count();
  expect(itemCount).toBe(1);
});
```

---

### 3. Product Browsing Flows

#### A. **Filter Products by Price**
```typescript
test('filter products by price range', async ({ page }) => {
  await page.goto('/shop');
  
  // Open filter sidebar
  await page.click('[data-testid="filter-sidebar-toggle"]');
  
  // Set price range (actual DoubleRangeSlider component)
  await page.locator('[data-testid="price-filter-min"]').fill('10');
  await page.locator('[data-testid="price-filter-max"]').fill('50');
  
  // Apply filters (actual behavior: syncs to URL)
  await page.waitForURL(/\?min_price=10&max_price=50/);
  
  // Verify products are filtered
  const products = page.locator('[data-testid="product-card"]');
  const count = await products.count();
  expect(count).toBeGreaterThan(0);
  
  // Check that all visible prices are in range
  for (let i = 0; i < count; i++) {
    const priceText = await products.nth(i).locator('[data-testid="product-card-price"]').textContent();
    const price = parseFloat(priceText!.replace(/[^0-9.]/g, ''));
    expect(price).toBeGreaterThanOrEqual(10);
    expect(price).toBeLessThanOrEqual(50);
  }
});
```

#### B. **Product Variant Selection**
```typescript
test('select product variant and add to cart', async ({ page }) => {
  const productPage = new ProductDetailPage(page);
  await productPage.goto('running-shoes');
  
  // Select size variant (actual ProductVariantSelector behavior)
  await productPage.selectVariant('Size: 42');
  
  // Verify price updates
  const price = await productPage.productPrice.textContent();
  expect(price).toBeTruthy();
  
  // Add to cart
  await productPage.addToCart();
  
  // Verify cart count updated
  const cartCount = await getCartCount(page);
  expect(cartCount).toBeGreaterThan(0);
});
```

---

### 4. Checkout Flows

#### A. **Guest Checkout with Stripe**
```typescript
test('guest checkout flow', async ({ page }) => {
  // Add items to cart
  await addToCartViaUI(page, 'product-1');
  
  // Go to cart
  await goToCart(page);
  
  // Proceed to checkout
  await page.click('button:has-text("Checkout")');
  
  // Should redirect to Stripe (actual behavior)
  await page.waitForURL(/checkout\.stripe\.com/);
  
  // Note: Stripe test mode would need to be completed here
  // or mocked with Playwright's route interception
});
```

#### B. **Authenticated Checkout**
```typescript
test('authenticated user checkout', async ({ page }) => {
  // Login first
  await loginViaAPI(page, TEST_USERS.customer);
  
  // Add items
  await addToCartViaUI(page, 'product-1');
  
  // Checkout (uses session auth endpoint)
  await goToCart(page);
  await page.click('button:has-text("Checkout")');
  
  // Should redirect to Stripe
  await page.waitForURL(/checkout\.stripe\.com/);
});
```

#### C. **Checkout Success Flow**
```typescript
test('checkout success page', async ({ page, context }) => {
  const orderNumber = 'ORD-12345';
  
  // Intercept order lookup API
  await page.route(`/api/orders/${orderNumber}`, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        data: {
          order_number: orderNumber,
          payment_status: 'paid',
          status: 'processing',
          customer_email: 'test@example.com',
        },
      }),
    });
  });
  
  // Navigate to success page
  await page.goto(`/checkout/success?order=${orderNumber}`);
  
  // Should show success state
  await expect(page.locator('text=/success/i')).toBeVisible();
  await expect(page.locator('text=/ORD-12345/i')).toBeVisible();
  
  // Cart should be cleared (actual clearCartAfterCheckout behavior)
  const cartCount = await getCartCount(page);
  expect(cartCount).toBe(0);
});
```

---

### 5. Order Management Flows

#### A. **View Order History with Filters**
```typescript
test('filter orders by status', async ({ page }) => {
  await loginViaAPI(page, TEST_USERS.customer);
  
  const ordersPage = new OrdersPage(page);
  await ordersPage.goto();
  
  // Get initial count
  const allCount = await ordersPage.getOrderCount();
  
  // Filter by status (actual filters found in orders/index.vue)
  await ordersPage.filterByStatus('delivered');
  
  // Wait for filtered results
  await page.waitForTimeout(1000);
  
  // Count should change
  const filteredCount = await ordersPage.getOrderCount();
  expect(filteredCount).toBeLessThanOrEqual(allCount);
  
  // URL should reflect filter
  await expect(page).toHaveURL(/status=delivered/);
});
```

#### B. **Reorder Flow**
```typescript
test('reorder from order history', async ({ page }) => {
  await loginViaAPI(page, TEST_USERS.customer);
  
  // Clear cart first
  await clearCartViaAPI(page);
  
  // Go to orders
  await page.goto('/orders');
  
  // Click reorder on first order
  await page.click('[data-testid="order-reorder-button"]').first();
  
  // Should redirect to cart (actual behavior)
  await page.waitForURL('/cart');
  
  // Cart should have items
  const itemCount = await page.locator('[data-testid="cart-item"]').count();
  expect(itemCount).toBeGreaterThan(0);
  
  // Should show success toast
  await expect(page.locator('text=/added to cart/i')).toBeVisible();
});
```

#### C. **Cancel Order**
```typescript
test('cancel order if cancellable', async ({ page }) => {
  await loginViaAPI(page, TEST_USERS.customer);
  
  // Navigate to a cancellable order
  await page.goto('/orders/ORD-12345');
  
  // Check if cancel button exists (actual can_cancel flag)
  const cancelButton = page.locator('[data-testid="order-cancel-button"]');
  
  if (await cancelButton.isVisible()) {
    await cancelButton.click();
    
    // Confirm in modal (actual OrdersCancelModal)
    await page.locator('[data-testid="orders-cancel-modal"] button:has-text("Confirm")').click();
    
    // Should show success toast
    await expect(page.locator('text=/cancelled/i')).toBeVisible();
    
    // Status badge should update
    await expect(page.locator('text=/cancelled/i')).toBeVisible();
  }
});
```

#### D. **Guest Order Tracking**
```typescript
test('guest order tracking', async ({ page }) => {
  await page.goto('/orders/track');
  
  // Fill form (actual track.vue form)
  await page.fill('input[id="order_number"]', 'ORD-12345');
  await page.fill('input[id="email"]', 'guest@example.com');
  await page.click('button[type="submit"]');
  
  // Should show order details
  await expect(page.locator('text=/ORD-12345/i')).toBeVisible();
  await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
});
```

---

### 6. Search Flows

#### A. **GraphQL Search with Results**
```typescript
test('search returns products, categories, and brands', async ({ page }) => {
  await page.goto('/');
  
  // Type in search box (actual HeaderSearchInput)
  await page.fill('[data-testid="header-search-input"]', 'shoes');
  
  // Wait for autocomplete (actual SearchDropdown)
  await expect(page.locator('[data-testid="header-search-dropdown"]')).toBeVisible();
  
  // Press Enter or click result
  await page.keyboard.press('Enter');
  
  // Should navigate to search page
  await page.waitForURL('/search?q=shoes');
  
  // Should show results (actual search.vue structure)
  await expect(page.locator('text=/results for/i')).toBeVisible();
  
  // Check sections exist (actual GraphQL response structure)
  const productsSection = page.locator('text=/products/i');
  const categoriesSection = page.locator('text=/categories/i');
  const brandsSection = page.locator('text=/brands/i');
  
  // At least products should be visible
  await expect(productsSection).toBeVisible();
});
```

#### B. **Search No Results**
```typescript
test('search with no results shows empty state', async ({ page }) => {
  await page.goto('/search?q=nonexistentproduct12345');
  
  // Should show no results message
  await expect(page.locator('text=/no results/i')).toBeVisible();
  await expect(page.locator('text=/try different/i')).toBeVisible();
});
```

---

### 7. Profile Flows

#### A. **Update Profile Information**
```typescript
test('update user profile', async ({ page }) => {
  await loginViaAPI(page, TEST_USERS.customer);
  
  await page.goto('/profile');
  
  // Update name (actual ProfilePersonalInfoSection)
  await page.fill('input[id="name"]', 'Updated Name');
  await page.fill('input[id="phone"]', '+1234567890');
  
  // Submit (actual form submission)
  await page.click('button:has-text("Save")');
  
  // Should show success toast
  await expect(page.locator('text=/updated/i')).toBeVisible();
  
  // Refresh and verify
  await page.reload();
  await expect(page.locator('input[id="name"]')).toHaveValue('Updated Name');
});
```

#### B. **Change Password**
```typescript
test('change password', async ({ page }) => {
  await loginViaAPI(page, TEST_USERS.customer);
  
  await page.goto('/profile');
  
  // Fill password form (actual ProfilePasswordSection)
  await page.fill('input[id="current_password"]', 'password123');
  await page.fill('input[id="password"]', 'newpassword123');
  await page.fill('input[id="password_confirmation"]', 'newpassword123');
  
  // Submit
  await page.click('text=/update password/i');
  
  // Should show success
  await expect(page.locator('text=/password.*updated/i')).toBeVisible();
});
```

#### C. **Upload Avatar**
```typescript
test('upload profile avatar', async ({ page }) => {
  await loginViaAPI(page, TEST_USERS.customer);
  
  await page.goto('/profile');
  
  // Click change avatar button (actual ProfileAvatarSection)
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.click('button:has-text("Change")');
  const fileChooser = await fileChooserPromise;
  
  // Upload test image
  await fileChooser.setFiles('tests/fixtures/avatar.jpg');
  
  // Should show success
  await expect(page.locator('text=/avatar.*updated/i')).toBeVisible();
});
```

---

### 8. Localization Flows

#### A. **Switch to Arabic (RTL)**
```typescript
test('switch to Arabic locale', async ({ page }) => {
  await page.goto('/');
  
  // Click language switcher (actual i18n setup)
  await page.click('[data-testid="language-switcher"]');
  await page.click('text=/العربية|Arabic/i');
  
  // URL should change to /ar prefix
  await expect(page).toHaveURL(/^\/ar\//);
  
  // HTML should have RTL direction
  const htmlDir = await page.locator('html').getAttribute('dir');
  expect(htmlDir).toBe('rtl');
  
  // Content should be in Arabic
  await expect(page.locator('text=/الرئيسية/i')).toBeVisible(); // "Home" in Arabic
});
```

---

### 9. Theme Flows

#### A. **Toggle Dark Mode**
```typescript
test('toggle dark theme', async ({ page }) => {
  await page.goto('/');
  
  // Click theme toggle (actual useTheme composable)
  await page.click('[data-testid="theme-toggle"]');
  
  // HTML should have dark theme attribute
  const theme = await page.locator('html').getAttribute('data-theme');
  expect(theme).toBe('dark');
  
  // Theme should persist in localStorage
  const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
  expect(storedTheme).toBe('dark');
  
  // Refresh and verify persistence
  await page.reload();
  const reloadedTheme = await page.locator('html').getAttribute('data-theme');
  expect(reloadedTheme).toBe('dark');
});
```

---

## Test Data Fixtures

### Creating Test Fixtures (Based on Actual Types)

```typescript
// tests/fixtures/users.ts

import type { AuthUser } from '../../types/auth';

export const FIXTURE_USERS: Record<string, AuthUser & { password: string }> = {
  customer: {
    id: 1,
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'password123',
    phone: '+1234567890',
    avatar: null,
    has_password: true,
    has_google_linked: false,
  },
  googleUser: {
    id: 2,
    name: 'Google User',
    email: 'google@test.com',
    password: '',
    phone: null,
    avatar: 'https://example.com/avatar.jpg',
    has_password: false,
    has_google_linked: true,
  },
};
```

```typescript
// tests/fixtures/products.ts

import type { ProductDto } from '../../src/core/api/dto/storefront';

export const FIXTURE_PRODUCTS: ProductDto[] = [
  {
    id: 1,
    variantId: 101,
    name: 'Running Shoes',
    slug: 'running-shoes',
    price: 89.99,
    currency: 'USD',
    image: 'https://example.com/shoes.jpg',
    description: 'Comfortable running shoes',
  },
  {
    id: 2,
    variantId: 201,
    name: 'Wireless Headphones',
    slug: 'wireless-headphones',
    price: 149.99,
    currency: 'USD',
    image: 'https://example.com/headphones.jpg',
    description: 'High-quality wireless headphones',
  },
];
```

```typescript
// tests/fixtures/cart-items.ts

import type { AddToCartPayload } from '../../types/cart';

export const FIXTURE_CART_ITEMS: AddToCartPayload[] = [
  {
    product_id: 1,
    product_variant_id: 101,
    name: 'Running Shoes',
    image: 'https://example.com/shoes.jpg',
    price: 89.99,
    quantity: 2,
    max_quantity: 10,
  },
  {
    product_id: 2,
    product_variant_id: 201,
    name: 'Wireless Headphones',
    image: 'https://example.com/headphones.jpg',
    price: 149.99,
    quantity: 1,
    max_quantity: 5,
  },
];
```

---

## API Mocking Strategies

### Mocking Backend Responses

Based on the actual API structure found (`server/api/**` proxying to Laravel):

```typescript
// tests/helpers/api-mocks.ts

import { Page, Route } from '@playwright/test';

/**
 * Mock cart API responses (actual endpoints from server/api/cart/)
 */
export async function mockCartAPI(page: Page) {
  // Mock GET /api/cart
  await page.route('/api/cart', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          items: [],
          total_price: 0,
          total_items: 0,
        },
      }),
    });
  });

  // Mock POST /api/cart/items
  await page.route('/api/cart/items', async (route: Route) => {
    const request = route.request();
    const postData = request.postDataJSON();
    
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        data: {
          items: [{
            id: Date.now(),
            product: { id: postData.product_id },
            variant: { id: postData.product_variant_id },
            quantity: postData.quantity,
            price: 99.99,
          }],
          total_price: 99.99,
          total_items: 1,
        },
      }),
    });
  });
}

/**
 * Mock auth API responses (actual endpoints from server/api/auth/)
 */
export async function mockAuthAPI(page: Page) {
  // Mock POST /api/auth/login
  await page.route('/api/auth/login', async (route: Route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        data: {
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            has_password: true,
            has_google_linked: false,
          },
        },
      }),
    });
  });

  // Mock GET /api/auth/me
  await page.route('/api/auth/me', async (route: Route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        data: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
      }),
    });
  });
}

/**
 * Mock product API responses
 */
export async function mockProductAPI(page: Page) {
  // Mock GET /api/products
  await page.route('/api/products', async (route: Route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        data: [
          {
            id: 1,
            name: 'Test Product',
            slug: 'test-product',
            price: 99.99,
            image: 'https://via.placeholder.com/300',
          },
        ],
        meta: {
          pagination: {
            total: 1,
            per_page: 10,
            current_page: 1,
            last_page: 1,
          },
        },
      }),
    });
  });
}
```

---

## Running Tests

### Installation

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Install test dependencies
npm install -D dotenv
```

### Test Commands

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/auth/login.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests with UI mode
npx playwright test --ui

# Generate test report
npx playwright show-report

# Run tests with specific tag
npx playwright test --grep @smoke
npx playwright test --grep @cart

# Run tests in parallel (default)
npx playwright test --workers=4

# Run tests serially
npx playwright test --workers=1
```

### Watch Mode (during development)

```bash
# Run in watch mode (re-runs on file changes)
npx playwright test --watch
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/playwright.yml

name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '22.12.0'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Start application
        run: npm run preview &
        env:
          NUXT_PUBLIC_API_BASE: ${{ secrets.TEST_API_BASE }}
          NUXT_PUBLIC_GRAPHQL_URL: ${{ secrets.TEST_GRAPHQL_URL }}
      
      - name: Wait for app to be ready
        run: npx wait-on http://localhost:3000
      
      - name: Run Playwright tests
        run: npx playwright test
        env:
          CI: true
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Known Challenges & Solutions

### 1. **Multi-Tenant Testing**

**Challenge:** Application requires `X-Tenant-Id` header for all requests.

**Solution:**
```typescript
// playwright.config.ts
use: {
  extraHTTPHeaders: {
    'X-Tenant-Id': process.env.TEST_TENANT_ID || 'demo',
  },
}
```

### 2. **Pinia State Persistence**

**Challenge:** Auth state persisted in cookies, cart state in localStorage.

**Solution:**
```typescript
// Clear state between tests
test.afterEach(async ({ page }) => {
  // Clear cookies (auth state)
  await page.context().clearCookies();
  
  // Clear localStorage (guest cart)
  await page.evaluate(() => localStorage.clear());
});
```

### 3. **i18n Route Prefixes**

**Challenge:** Arabic routes have `/ar` prefix, English routes don't.

**Solution:**
```typescript
// Use dynamic route helpers
const routes = useStorefrontRoutes();
await page.goto(routes.cart()); // Handles locale automatically

// Or test both locales
test('cart page (English)', async ({ page }) => {
  await page.goto('/cart');
});

test('cart page (Arabic)', async ({ page }) => {
  await page.goto('/ar/cart');
});
```

### 4. **Enhanced Checkout Completion**

**Challenge:** The active storefront flow completes payment inside the merchant checkout and redirects to `/checkout/success?order=...`.

**Solution:**
```typescript
// Option 1: Mock the order lookup used by the success page
await page.route('/api/orders/ORD-TEST-001', async (route) => {
  await route.fulfill({
    body: JSON.stringify({
      data: {
        order_number: 'ORD-TEST-001',
        payment_status: 'paid',
        status: 'processing',
      },
    }),
  });
});

// Option 2: Navigate directly to the enhanced success URL
await page.goto('/checkout/success?order=ORD-TEST-001');

// Option 3: Test up to redirect, verify redirect occurs
await page.click('button:has-text("Checkout")');
await expect(page).toHaveURL(/checkout\.stripe\.com/);
```

### 5. **GraphQL Search Testing**

**Challenge:** Search uses Apollo Client directly to GraphQL endpoint.

**Solution:**
```typescript
// Mock GraphQL responses
await page.route('/graphql', async (route) => {
  const request = route.request();
  const postData = request.postDataJSON();
  
  if (postData.operationName === 'Search') {
    await route.fulfill({
      body: JSON.stringify({
        data: {
          search: {
            total_count: 2,
            products: [/* mock products */],
            categories: [],
            brands: [],
          },
        },
      }),
    });
  }
});
```

### 6. **SSR Hydration**

**Challenge:** Some components use `ClientOnly` for browser-only features.

**Solution:**
```typescript
// Wait for hydration before interacting
await page.waitForLoadState('networkidle');
await page.waitForFunction(() => document.readyState === 'complete');

// Or wait for specific client-only elements
await page.waitForSelector('[data-client-hydrated]');
```

### 7. **Dynamic Runtime Pages**

**Challenge:** Homepage and some pages are rendered by Storefront Runtime system.

**Solution:**
```typescript
// Mock runtime API responses
await page.route('/api/storefront/runtime/resolve*', async (route) => {
  await route.fulfill({
    body: JSON.stringify({
      status: 'found',
      pageId: 'home',
      layout: 'default',
    }),
  });
});

await page.route('/api/storefront/runtime/page/*', async (route) => {
  await route.fulfill({
    body: JSON.stringify({
      sections: [/* mock sections */],
      seo: {/* mock SEO */},
    }),
  });
});
```

---

## Best Practices for This Project

### 1. **Use API Helpers for Setup**

✅ **Do:**
```typescript
test('user can view orders', async ({ page }) => {
  await loginViaAPI(page, TEST_USERS.customer);
  await addOrdersViaAPI(page, 3);
  
  await page.goto('/orders');
  // Test actual UI behavior
});
```

❌ **Don't:**
```typescript
test('user can view orders', async ({ page }) => {
  // Don't repeat full login flow in every test
  await page.goto('/login');
  await page.fill('input[type="email"]', '...');
  // ...
});
```

### 2. **Test Real User Flows**

✅ **Do:**
```typescript
test('complete purchase flow', async ({ page }) => {
  // Browse product
  await page.goto('/shop');
  await page.click('[data-testid="product-card"]').first();
  
  // Add to cart
  await page.click('button:has-text("Add to Cart")');
  
  // View cart
  await page.click('[data-testid="cart-button"]');
  
  // Checkout
  await page.click('button:has-text("Checkout")');
  
  // Verify each step
});
```

❌ **Don't:**
```typescript
test('cart API works', async ({ page }) => {
  // Don't test internal APIs directly unless necessary
  const response = await page.request.post('/api/cart/items', {...});
});
```

### 3. **Use Page Objects for Complex Pages**

✅ **Do:**
```typescript
const cartPage = new CartPage(page);
await cartPage.goto();
await cartPage.removeItem(0);
await cartPage.updateQuantity(1, 3);
```

❌ **Don't:**
```typescript
// Don't repeat complex selectors
await page.goto('/cart');
await page.locator('div > div > button[data-testid="cart-item-remove"]').nth(0).click();
```

### 4. **Test Localization**

```typescript
// Test both locales for critical flows
test.describe('Checkout Flow', () => {
  test('English', async ({ page }) => {
    await page.goto('/cart');
    await page.click('button:has-text("Checkout")');
  });

  test('Arabic (RTL)', async ({ page }) => {
    await page.goto('/ar/cart');
    await page.click('button:has-text("الدفع")'); // "Checkout" in Arabic
    
    // Verify RTL layout
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });
});
```

### 5. **Handle Async Operations**

```typescript
// Wait for network requests to complete
await page.waitForResponse(response => 
  response.url().includes('/api/cart') && response.status() === 200
);

// Wait for loading states to disappear
await page.waitForSelector('[class*="loading"]', { state: 'hidden' });

// Wait for toast messages
await expect(page.locator('text=/success/i')).toBeVisible();
await page.waitForTimeout(300); // Brief pause for toast animation
```

### 6. **Clean Up After Tests**

```typescript
test.afterEach(async ({ page }) => {
  // Clear auth
  await page.context().clearCookies();
  
  // Clear localStorage (guest cart, theme)
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // Reset state via API if needed
  if (await isLoggedIn(page)) {
    await clearCartViaAPI(page);
  }
});
```

---

## Troubleshooting

### Tests Fail with "Element not found"

**Cause:** Elements may be hidden or not yet rendered.

**Solution:**
```typescript
// Wait for element
await page.waitForSelector('[data-testid="product-card"]');

// Or use auto-waiting assertions
await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
```

### Tests Fail with "Timeout"

**Cause:** Network requests taking too long or infinite loading.

**Solution:**
```typescript
// Increase timeout for slow operations
test('slow checkout', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  
  await page.goto('/cart');
  await page.click('button:has-text("Checkout")');
  await page.waitForURL(/stripe/, { timeout: 60000 });
});
```

### Tests Pass Locally but Fail in CI

**Cause:** Different environment, slower execution, or missing dependencies.

**Solution:**
```typescript
// Use CI-specific config
if (process.env.CI) {
  test.setTimeout(60000);
  test.slow(); // Mark test as slow
}

// Add explicit waits
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1000); // Give extra time in CI
```

---

## Additional Resources

### Project-Specific Docs
- `README.md` - Setup and running locally
- `AGENTS.md` - Project conventions and rules
- `CONTRIBUTING.md` - Contributor workflow
- `docs/architecture/` - Architecture documentation
- `docs/development/testing.md` - Current testing reality

### External Resources
- [Playwright Documentation](https://playwright.dev/)
- [Nuxt 4 Testing Guide](https://nuxt.com/docs/getting-started/testing)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)

---

**Last Updated:** Based on codebase investigation as of project state

**Maintainer:** Update this file when adding new features or changing auth/cart/routing patterns.
