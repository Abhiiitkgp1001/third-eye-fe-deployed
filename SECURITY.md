# Security Measures - Schema Name Leakage Prevention

This document outlines measures taken to prevent sensitive schema names and internal implementation details from leaking to end users.

## 1. Zod Validation Errors in Browser Console

**Problem:** When Zod validation fails, error messages include schema names like `EnrichGraphProfileSchema`, revealing:
- That we use EnrichGraph as a data provider
- Internal architecture and naming conventions
- File structure and implementation details

**Solution:**
- ✅ **Renamed all schemas** from `EnrichGraphXxx` to generic names:
  - `EnrichGraphProfileSchema` → `ProfileDataSchema`
  - `EnrichGraphCompanySchema` → `CompanyDataSchema`
  - `EnrichGraphDateSchema` → `DateDataSchema`
  - All nested schemas (e.g., `EnrichGraphEmployeeSchema` → `EmployeeRangeSchema`)

- ✅ **Created validation wrappers** in `lib/utils/validation.ts`:
  ```typescript
  safeParseSchema()  // Throws generic errors in production
  safeParseOrNull()  // Returns null on validation failure
  ```
  - In **development**: Full Zod errors logged to console
  - In **production**: Generic error message only (`"Invalid data format"`)

**Usage:**
```typescript
// Before (leaks schema names in errors)
const data = ProfileDataSchema.parse(unknownData);

// After (safe)
const data = safeParseSchema(ProfileDataSchema, unknownData, "profile");
// Production error: "Invalid profile format" (no schema name leaked)
```

---

## 2. Source Maps in Production

**Problem:** If source maps are enabled in production builds, browser dev tools expose:
- Original TypeScript file paths (e.g., `lib/schemas/external/profile.ts`)
- Internal directory structure
- Comments and original variable names
- All implementation details

**Solution:**
- ✅ **Disabled production source maps** in `next.config.ts`:
  ```typescript
  productionBrowserSourceMaps: false
  ```

**Result:**
- Development builds still have source maps for debugging
- Production builds show minified code only
- File paths and internal structure remain hidden

**Verification:**
```bash
npm run build
# Check .next/static/chunks/ - no .map files should be generated
```

---

## 3. TypeScript Type Names in Errors

**Problem:** TypeScript types are stripped at compile time, but Zod schema objects exist at runtime, and their names can appear in:
- Stack traces
- Error messages
- Object property names (if not minified properly)

**Solution:**
- ✅ **Generic schema names** (as per point #1)
- ✅ **Validation wrappers** suppress detailed errors in production
- ✅ **Minification** via Next.js default build process:
  - Next.js automatically minifies production builds
  - Variable names, including Zod schema constants, are mangled
  - Original names like `ProfileDataSchema` become `a`, `b`, `c`, etc.

**Additional Protection:**
- ✅ **Directory renamed** from `lib/schemas/vendors/` to `lib/schemas/external/`
  - Even if path leaks, it reveals nothing sensitive
  - "vendors" → "external" is more generic

**Runtime Schema Names:**
```typescript
// Schema objects in production are minified:
ProfileDataSchema._def.typeName  // Still accessible
// But error messages use our wrapper, not Zod's raw output
```

---

## 4. Console.log Prevention

**Problem:** Developers accidentally leaving `console.log()` statements can leak:
- Internal data structures
- API responses
- Debug information
- Sensitive field names

**Solution:**
- ✅ **ESLint rule added** in `eslint.config.mjs`:
  ```javascript
  "no-console": ["warn", { allow: ["warn", "error"] }]
  ```

**Result:**
- `console.log()` → ESLint warning (still allowed but flagged)
- `console.warn()` → Allowed (intentional warnings)
- `console.error()` → Allowed (error reporting)

**Recommendation:**
- Use `console.error()` for production error logging
- Remove all `console.log()` before deployment
- Consider integrating error tracking (Sentry, LogRocket) for production

---

## Summary of Changes

| File | Change |
|------|--------|
| `lib/schemas/vendors/` → `lib/schemas/external/` | Directory renamed to generic name |
| `lib/schemas/external/profile.ts` | All schemas renamed (EnrichGraph* → Generic*) |
| `lib/schemas/external/company.ts` | All schemas renamed (EnrichGraph* → Generic*) |
| `lib/schemas/external/shared.ts` | `EnrichGraphDateSchema` → `DateDataSchema` |
| `lib/utils/validation.ts` | Created safe Zod parsing wrappers |
| `next.config.ts` | Disabled `productionBrowserSourceMaps` |
| `eslint.config.mjs` | Added `no-console` rule |
| `lib/trpc/schemas/peopleList-schemas.ts` | Updated imports to use new schema names |
| `lib/trpc/schemas/companyList-schemas.ts` | Updated imports to use new schema names |

---

## Verification Checklist

Before deploying to production, verify:

- [ ] No schema names contain "EnrichGraph" or vendor-specific terms
- [ ] Production build has no `.map` files in `.next/static/chunks/`
- [ ] ESLint shows warnings for any `console.log()` statements
- [ ] All validation errors use `safeParseSchema()` or `safeParseOrNull()`
- [ ] Test validation errors in production mode - should show generic messages only

---

## Best Practices Going Forward

1. **Always use validation wrappers** instead of direct `.parse()`:
   ```typescript
   import { safeParseSchema } from "@/lib/utils/validation";
   const data = safeParseSchema(MySchema, input, "user input");
   ```

2. **Never name schemas after vendors**:
   - ❌ `StripeCustomerSchema`, `TwilioMessageSchema`
   - ✅ `CustomerSchema`, `MessageSchema`

3. **Keep directory names generic**:
   - ❌ `lib/schemas/enrichgraph/`, `lib/clients/openai/`
   - ✅ `lib/schemas/external/`, `lib/clients/ai/`

4. **Verify production builds** before major releases:
   ```bash
   npm run build
   npm run start  # Test in production mode locally
   ```

5. **Monitor for leaks** in browser dev tools periodically
