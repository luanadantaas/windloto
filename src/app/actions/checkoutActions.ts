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

export async function createShopifyCheckoutAction(lines: CartLine[]): Promise<string> {
  for (const line of lines) {
    if (BULK_VARIANT_IDS.has(line.merchandiseId) && line.quantity < BULK_VARIANT_MIN) {
      throw new Error(`Bulk Order requires a minimum of ${BULK_VARIANT_MIN} units.`)
    }
  }

  const data = await shopifyFetch<CreateCartResponse>({
    query: CREATE_CART_MUTATION,
    variables: { input: { lines } },
    revalidate: 0,
  })

  const { cart, userErrors } = data.cartCreate

  if (userErrors.length > 0) {
    throw new Error(userErrors[0].message)
  }

  return cart.checkoutUrl
}
