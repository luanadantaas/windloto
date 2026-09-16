'use server'

import { shopifyFetch } from '@/lib/shopify'

const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

const VALIDATE_COUPON_MUTATION = `
  mutation cartCreateValidate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        discountCodes {
          applicable
          code
        }
        lines(first: 20) {
          edges {
            node {
              discountAllocations {
                discountedAmount {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

const BULK_VARIANT_MIN = 20
// Variant IDs that require a minimum order quantity
const BULK_VARIANT_IDS = new Set([
  'gid://shopify/ProductVariant/46578637930566', // Rotor Lock — Bulk Order (20+)
])

interface CartLine {
  merchandiseId: string
  quantity: number
}

interface CreateCartResponse {
  cartCreate: {
    cart: {
      id: string
      checkoutUrl: string
    }
    userErrors: Array<{ field: string; message: string }>
  }
}

export type CouponValidationResult =
  | { valid: false; discountAmount: 0; currency: string; discountType: null; errorMessage: string }
  | { valid: true; discountAmount: number; currency: string; discountType: 'amount' | 'free_shipping' }

export async function validateCouponAction(
  lines: CartLine[],
  discountCode: string
): Promise<CouponValidationResult> {
  interface ValidateCartResponse {
    cartCreate: {
      cart: {
        discountCodes: Array<{ applicable: boolean; code: string }>
        lines: {
          edges: Array<{
            node: {
              discountAllocations: Array<{
                discountedAmount: { amount: string; currencyCode: string }
              }>
            }
          }>
        }
      }
      userErrors: Array<{ field: string; message: string }>
    }
  }

  const data = await shopifyFetch<ValidateCartResponse>({
    query: VALIDATE_COUPON_MUTATION,
    variables: { input: { lines, discountCodes: [discountCode] } },
    revalidate: 0,
  })

  const { cart, userErrors } = data.cartCreate

  if (userErrors.length > 0) {
    return { valid: false, discountAmount: 0, currency: 'USD', discountType: null, errorMessage: userErrors[0].message }
  }

  const applicable = cart.discountCodes[0]?.applicable ?? false
  if (!applicable) {
    return { valid: false, discountAmount: 0, currency: 'USD', discountType: null, errorMessage: 'Invalid or expired discount code.' }
  }

  // Sum all line-item discount allocations to get the total discount
  let totalDiscount = 0
  let currency = 'USD'
  for (const { node } of cart.lines.edges) {
    for (const alloc of node.discountAllocations) {
      totalDiscount += parseFloat(alloc.discountedAmount.amount)
      currency = alloc.discountedAmount.currencyCode
    }
  }

  // Free shipping discounts are applicable but produce no line-item allocations
  const discountType = totalDiscount === 0 ? 'free_shipping' : 'amount'
  return { valid: true, discountAmount: totalDiscount, currency, discountType }
}

export async function createShopifyCheckoutAction(
  lines: CartLine[],
  discountCode?: string
): Promise<string> {
  for (const line of lines) {
    if (BULK_VARIANT_IDS.has(line.merchandiseId) && line.quantity < BULK_VARIANT_MIN) {
      throw new Error(`Bulk Order requires a minimum of ${BULK_VARIANT_MIN} units.`)
    }
  }

  const cartInput = discountCode
    ? { lines, discountCodes: [discountCode] }
    : { lines }

  const data = await shopifyFetch<CreateCartResponse>({
    query: CREATE_CART_MUTATION,
    variables: { input: cartInput },
    revalidate: 0,
  })

  const { cart, userErrors } = data.cartCreate

  if (userErrors.length > 0) {
    throw new Error(userErrors[0].message)
  }

  return cart.checkoutUrl
}
