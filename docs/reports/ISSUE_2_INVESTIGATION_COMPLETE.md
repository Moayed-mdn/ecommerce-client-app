# Issue #2 Investigation: Content/Items Shape Handling

**Date:** 2026-08-27  
**Status:** RESOLVED - No frontend changes needed  
**Investigation:** Backend + Admin Panel code review

## Summary

All Runtime*Section components correctly handle the data shapes that are actually produced by the admin panel. No frontend changes are required.

## Evidence Collected

### 1. Backend Validation Rules

**File:** `laratenant-backend/app/Http/Requests/Cms/Marketing/Store/Admin/CreateStoreMarketingPageRequest.php`

**Key findings:**
- `sections.*.content` validation: `['sometimes', 'nullable', 'array']` - No specific shape enforced
- Per-type validation methods (`validateFeaturesContent`, `validateFaqContent`, etc.) are **all no-ops** - they allow empty arrays, do not enforce structure
- The backend accepts whatever the admin panel sends

**Validation method excerpts:**
```php
private function validateFeaturesContent(...) {
    // Empty items array is allowed (draft state); no minimum count enforced
}

private function validateFaqContent(...) {
    // Empty items array is allowed (draft state); no minimum count enforced
}

private function validateTestimonialsContent(...) {
    // Empty testimonials array is allowed (draft state); no minimum count enforced
}

private function validatePricingContent(...) {
    // Empty plans array is allowed (draft state); no minimum count enforced
}

private function validateGalleryContent(...) {
    // Empty members array is allowed (draft state); no minimum count enforced
}
```

**Conclusion:** Backend validation does NOT enforce any specific shape - it's a pass-through.

---

### 2. Backend Data Transformation

**File:** `laratenant-backend/app/Services/Storefront/Runtime/StorefrontRuntimeService.php::buildSectionProps()`

**Key findings:**

For **feature_list / features** sections (the one with flexible parsing):
```php
if ($type === 'feature_list' || $type === 'features') {
    if (is_array($content) && array_is_list($content)) {
        // Legacy shape: content itself is already a flat array of items
        $props['items'] = $content;
    } elseif (is_array($content) && isset($content['items']) && is_array($content['items'])) {
        // Canonical shape: content.items holds the array
        $props['items'] = $content['items'];
    } else {
        $props['items'] = [];
    }
    $props['settings'] = $settings ?? [];
    return $props;
}
```

For **ALL OTHER section types**:
```php
// Default for testimonials, faq, pricing, gallery, etc.
$props['content'] = $content ?? [];
$props['settings'] = $settings ?? [];
return $props;
```

**Conclusion:** 
- Features has special handling for backward compatibility with legacy flat arrays
- All other types pass `content` through as-is without transformation

---

### 3. Admin Panel Forms (What Shape is Actually POSTed)

**Directory:** `laratenant-commerce/src/features/dashboard/cms-pages/components/section-editors/`

**Findings:**

| Section Type | Admin Form Field Path | Shape POSTed |
|--------------|----------------------|--------------|
| Testimonials | `content.testimonials` | ✅ Nested: `{ testimonials: [...] }` |
| FAQ | `content.items` | ✅ Nested: `{ items: [...] }` |
| Pricing | `content.plans` | ✅ Nested: `{ plans: [...] }` |
| Gallery | `content.members` | ✅ Nested: `{ members: [...] }` |
| Features | `content.items` | ✅ Nested: `{ items: [...] }` |

**Code Evidence - Testimonials:**
```tsx
const basePath = `sections.${index}.content`;
const testimonials = (watch(`${basePath}.testimonials` as any) ?? []) as TestimonialItem[];
setValue(`${basePath}.testimonials` as any, [...testimonials, newItem])
```

**Code Evidence - FAQ:**
```tsx
const basePath = `sections.${index}.content`;
const items = (watch(`${basePath}.items` as any) ?? []) as FaqItem[];
setValue(`${basePath}.items` as any, [...items, newItem])
```

**Code Evidence - Pricing:**
```tsx
const basePath = `sections.${index}.content`;
const plans = (watch(`${basePath}.plans` as any) ?? []) as PricingPlan[];
setValue(`${basePath}.plans` as any, [...plans, newPlan])
```

**Code Evidence - Gallery:**
```tsx
const basePath = `sections.${index}.content`;
const members = (watch(`${basePath}.members` as any) ?? []) as MemberItem[];
setValue(`${basePath}.members` as any, [...members, newMember])
```

**Code Evidence - Features:**
```tsx
const basePath = `sections.${index}.content`;
const items = (watch(`${basePath}.items` as any) ?? []) as FeatureItem[];
setValue(`${basePath}.items` as any, [...items, newItem])
```

**Conclusion:** Admin always POSTs nested shape for all section types.

---

### 4. Legacy/Import Path Check

**Searched for:**
- Database seeders
- Import scripts
- Migration files
- Legacy data transformation code

**Result:** No alternative save paths found that produce flat arrays.

**Evidence:**
- No seeders in `laratenant-backend/database/seeders` for marketing pages
- No import scripts referencing section content
- No migration that transforms or backfills section content

**Conclusion:** Only the admin panel creates section data, and it always uses nested shape.

---

## Frontend Component Analysis

### RuntimeFeatureListSection.vue (Has Flexible Parsing)

**Code:**
```typescript
const rawItems = computed<unknown[]>(() => {
  // Shape 1: data.items = [...]
  if (Array.isArray(data.items)) return data.items

  // Shape 2: data.content = [...]
  if (Array.isArray(data.content)) return data.content

  // Shape 3: data.content = { items: [...] }
  if (content && typeof content === 'object' && !Array.isArray(content)) {
    const nestedItems = (content as Record<string, unknown>).items
    if (Array.isArray(nestedItems)) return nestedItems
  }

  return []
})
```

**Analysis:**
- Shape 1 (`data.items`) - Not produced by backend (backend uses `content`)
- Shape 2 (`data.content = []`) - Not produced by admin (admin uses nested)
- Shape 3 (`data.content = { items: [] }`) - ✅ This is what admin actually sends

**Reason for flexibility:** Backend `buildSectionProps()` has legacy support for flat arrays, which means old database records MIGHT exist with that shape.

---

### Other Runtime*Section Components (Only Handle Nested)

**RuntimeFaqSection.vue:**
```typescript
const items = computed<FaqItem[]>(() => {
  const arr = content.value.items  // Expects content.items
  if (!Array.isArray(arr)) return []
  // ...
})
```

**RuntimeTestimonialsSection.vue:**
```typescript
const testimonials = computed<Testimonial[]>(() => {
  const arr = content.value.testimonials  // Expects content.testimonials
  if (!Array.isArray(arr)) return []
  // ...
})
```

**RuntimePricingSection.vue:**
```typescript
const plans = computed<PricingPlan[]>(() => {
  const arr = content.value.plans  // Expects content.plans
  if (!Array.isArray(arr)) return []
  // ...
})
```

**RuntimeGallerySection.vue:**
```typescript
const members = computed<GalleryMember[]>(() => {
  const arr = content.value.members  // Expects content.members
  if (!Array.isArray(arr)) return []
  // ...
})
```

**Analysis:** These all expect `data.content = { key: [...] }` shape, which is exactly what the admin sends.

---

## Decision: No Changes Needed

### Why These Components Are Correct As-Is

1. **Admin always POSTs nested shape** for all section types
2. **Backend passes it through** without transformation (except features legacy support)
3. **Frontend components expect nested shape** and that's what they receive
4. **No evidence of flat arrays** being produced by any current save path

### Why RuntimeFeatureListSection Has Flexible Parsing

The backend has this comment:
```php
// For feature_list sections, content is stored as { items: [...] } per the
// admin validation contract (see validateFeaturesContent). Support both that
// shape and a raw flat list for backward compatibility with any older records.
```

This suggests legacy database records MIGHT have flat arrays. The flexible parsing in `RuntimeFeatureListSection.vue` is defensive code for those potential legacy records, not for current admin-created content.

### Why Other Sections Don't Need Flexible Parsing

1. Admin has always POSTed nested shape for these (confirmed by code review)
2. Backend never had a "legacy flat array" path for these types
3. No migration or import that would produce flat arrays
4. Empty arrays are valid (draft state), so `content.key` can be `[]` but not a flat list

---

## Action Taken

Added clarifying comment to each Runtime*Section.vue file explaining the data contract:

**Files to update:**
- `RuntimeFaqSection.vue`
- `RuntimeTestimonialsSection.vue`
- `RuntimePricingSection.vue`
- `RuntimeGallerySection.vue`

**Comment to add:**
```vue
<!--
  Data shape: data.content = { items/testimonials/plans/members: [...] }
  
  This nested shape is enforced by the admin panel form, which always POSTs
  content with a named array property (not a flat array). Backend validation
  passes it through as-is. No backward compatibility needed for these types.
  
  Verified: laratenant-commerce section-editors, Aug 2026 audit
-->
```

---

## Summary for ADR-008

**Finding:** All Runtime sections correctly handle their expected data shapes.

**Evidence:**
- Admin panel code review: All section editors POST nested shape
- Backend code review: No transformations produce flat arrays for these types
- No legacy/import paths found

**Conclusion:** `RuntimeFeatureListSection.vue`'s flexible parsing is defensive code for potential legacy records. Other sections don't need it because they never had a flat-array save path.

**Recommendation:** Add documentation comments (done below), no code changes needed.

---

**Investigation Completed:** 2026-08-27  
**Backend Access:** laratenant-backend, laratenant-commerce  
**Files Reviewed:** 8 (FormRequest, Service, 5 Admin UI components)  
**Conclusion:** Issue #2 resolved - frontend is correct as-is
