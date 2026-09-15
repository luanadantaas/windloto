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
