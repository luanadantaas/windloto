# WindLOTO Storefront — Development Roadmap

**Last updated:** 2026-09-15  
**Status:** Active

---

## 1. Payment Integration

### 1a. Stripe
- [ ] Confirm whether Stripe is already active in the Shopify admin (Shopify Payments runs on Stripe — likely already available at checkout)
- [ ] If a fully custom checkout is needed (bypassing Shopify's hosted checkout): integrate Stripe Elements using the Shopify Storefront API `cartCreate` → `paymentSessionCreate` flow
- [ ] Add Stripe publishable key as `NEXT_PUBLIC_STRIPE_PK` environment variable
- [ ] Add Stripe secret key as `STRIPE_SECRET_KEY` (server-side only)
- [ ] Research: Shopify Storefront API `Cart.checkoutUrl` already routes through Shopify Payments (which uses Stripe). Custom Stripe integration is only needed if bypassing Shopify checkout entirely.

### 1b. PayPal
- [ ] Enable PayPal in the Shopify admin under Settings → Payments → Alternative payment methods
- [ ] If using Shopify hosted checkout: PayPal will appear automatically once enabled in Shopify admin — no code changes needed
- [ ] If using custom checkout: integrate PayPal JS SDK, use `paypal.Buttons()` with `createOrder` pointing to a server action that creates a Shopify cart and returns the cart total
- [ ] Add `PAYPAL_CLIENT_ID` as `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` as server-side env var

### Notes
> For most B2B customers (wind turbine operators, OEMs), **Shopify's hosted checkout already handles Stripe and PayPal** once enabled in the Shopify admin. Custom payment integration is only needed if a fully embedded checkout experience is required.

---

## 2. Vercel Deployment

> ADR 005 covers the architectural decision. This section tracks implementation tasks.

- [ ] Create `vercel.json` with build output configuration and security headers
- [ ] Set environment variables in Vercel dashboard:
  - `SHOPIFY_STORE_DOMAIN`
  - `SHOPIFY_STOREFRONT_ACCESSTOKEN`
  - `NEXT_PUBLIC_APP_URL` (set to production domain)
  - `REVALIDATE_SECRET`
- [ ] Connect the GitHub repo to Vercel for automatic deploys on push to `main`
- [ ] Configure custom domain in Vercel: point `windloto.com` DNS to Vercel nameservers
- [ ] Set production vs. preview environment variable scopes in Vercel dashboard
- [ ] Configure Shopify webhook for cache revalidation:
  - Shopify Admin → Settings → Notifications → Webhooks
  - Add webhook: `products/update` → `https://windloto.com/api/revalidate`
  - Add webhook: `products/create` → `https://windloto.com/api/revalidate`
  - Set `REVALIDATE_SECRET` to match the deployed secret
- [ ] Verify ISR is working: update a product in Shopify admin, confirm the store page reflects the change within the revalidation window
- [ ] Run `npm run build` locally and confirm zero build errors before first deploy

---

## 3. Contact Form Email Integration

> Currently the contact form has `// TODO: wire to email provider` — messages are swallowed after a 1-second fake delay.

- [ ] Choose an email provider:
  - **Resend** (recommended — generous free tier, great DX, works well with Next.js Server Actions)
  - **Formspree** (simplest — no backend code, just a form action URL)
  - **SendGrid** (enterprise-grade, more setup)
- [ ] Install chosen provider SDK (e.g. `npm install resend`)
- [ ] Add API key as server-side env var (e.g. `RESEND_API_KEY`)
- [ ] Replace the fake delay in `ContactForm.handleSubmit` with a real Server Action that:
  - Receives `{ firstName, lastName, email, message, region }`
  - Sends email to WindLOTO's inbox (US form) and Sister-Soft's inbox (international form)
  - Sends a confirmation reply to the customer
- [ ] Add honeypot field or rate limiting to prevent spam
- [ ] Test with real email addresses before deploying

---

## 4. Make Application Configurable for All Shopify Options

> Several values are currently hardcoded in the codebase. These should be driven by Shopify data or environment config.

### 4a. Product Handle Mapping
- [ ] **Current:** `src/lib/productHandleMap.ts` manually maps URL slugs to Shopify handles
- [ ] **Goal:** Auto-resolve handles. Use Shopify's product `handle` field directly (or store clean handles as a metafield in Shopify admin), eliminating the need for manual mapping
- [ ] Evaluate whether the mapping is still needed or if Shopify handles can be used as-is for all products

### 4b. Shipping Rates
- [ ] **Current:** `ShippingEstimator.tsx` has hardcoded US and international rate arrays
- [ ] **Goal:** Pull live rates from Shopify Carrier Service API or a third-party rates API (EasyPost, ShipStation) at checkout time
- [ ] Short-term: Move the hardcoded rate arrays to a config file or environment-driven JSON so they can be updated without a code deploy

### 4c. Bulk Order Rules
- [ ] **Current:** `checkoutActions.ts` hardcodes the bulk variant ID and 20-unit minimum
- [ ] **Goal:** Store bulk pricing rules as a Shopify metafield on the product/variant (e.g. `custom.bulk_minimum_quantity`). Read them at runtime instead of hardcoding
- [ ] Update `VariantSelector.tsx` to read the minimum quantity from the variant metafield

### 4d. Color Swatches
- [ ] **Current:** `COLOR_MAP` in `VariantSelector.tsx` is a static record of color name → hex
- [ ] **Goal:** Use Shopify's native color swatch metaobject (`swatch`) on product options. Fall back to `COLOR_MAP` when no swatch metaobject is present
- [ ] Research: Shopify's `ProductOption.optionValues[].swatch` field (available in Storefront API 2024-01+)

### 4e. Product Metafields
- [ ] Add Shopify metafields for: technical specifications, PDF data sheet URL, compliance badges — currently these are either hardcoded or missing from the GraphQL query
- [ ] Update `GET_PRODUCT_BY_HANDLE_QUERY` to include all relevant metafields
- [ ] Update the product page to render each metafield dynamically

---

## 5. Shopify Post-Order Processing

> Research needed: understand what Shopify does after a customer completes checkout, and what the storefront needs to handle.

- [ ] **Order webhooks** — subscribe to `orders/paid` and `orders/fulfilled` in Shopify Admin to trigger post-order flows (fulfillment notifications, inventory sync)
- [ ] **Order confirmation emails** — Shopify sends these automatically from the admin email templates. Verify the templates are branded for WindLOTO
- [ ] **Fulfillment workflow** — clarify with the client: does WindLOTO fulfill manually, use a 3PL, or integrate with a fulfillment service? Map the workflow before building automation
- [ ] **Inventory sync after order** — when `orders/paid` fires, Shopify decrements `quantityAvailable`. The storefront's ISR will reflect this on the next revalidation (up to 1 hour). If near-real-time stock accuracy is needed, trigger revalidation from the `orders/paid` webhook at `/api/revalidate`
- [ ] **B2B order tracking** — WindLOTO's customers are likely businesses. Research: does the client need a customer portal for order history? Shopify's Customer Account API (Storefront) can power this
- [ ] **Tax and invoicing** — confirm whether Shopify's tax settings cover the client's sales regions (US, EU, South America). International VAT/GST may require additional Shopify Tax configuration or a third-party app

---

## 6. Missing Images

> Several pages use placeholder divs instead of real images or diagrams.

- [ ] **Product pages** — verify all Shopify products have at least one image uploaded in the admin. The gallery component already handles real images; placeholders only show when `images.edges` is empty
- [ ] **Ram Lock page** (`/ram-lock`) — two placeholder divs: "Problem diagram" and "Ram Lock device". Replace with:
  - Real product photography or technical diagrams from the client
  - Or AI-generated industrial product illustrations as placeholders
- [ ] **Rotor Lock page** (`/rotor-lock`) — two placeholder divs: "Problem diagram" and "Rotor Lock device (safety red)". Same as above
- [ ] **Homepage hero** — the stats grid uses text cards. Consider adding a hero product image or wind turbine photo to the right side of the hero section
- [ ] **Store page** — product cards show the first Shopify product image. Ensure all products have images in the Shopify admin
- [ ] **OG / social share images** — add `opengraph-image.png` to `src/app/` and product-specific OG images for better social sharing preview

---

## Priority Order

| # | Item | Effort | Business Impact |
|---|------|--------|----------------|
| 1 | Vercel deployment | Low | Critical — site is not live yet |
| 2 | Contact form email | Low | High — customer inquiries are lost |
| 3 | Missing images | Medium | High — pages look unfinished |
| 4 | PayPal / Stripe (via Shopify admin) | Low | High — enable in Shopify admin first, no code needed |
| 5 | Shopify post-order research | Low | High — understand before first real order |
| 6 | Configurable Shopify options | Medium–High | Medium — current hardcodes work for now |
| 7 | Custom payment integration | High | Low — only if embedded checkout is required |
