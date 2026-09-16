import { createShopifyCheckoutAction } from '@/app/actions/checkoutActions'
import { shopifyFetch } from '@/lib/shopify'

jest.mock('@/lib/shopify', () => ({
  shopifyFetch: jest.fn(),
}))

const mockShopifyFetch = shopifyFetch as jest.MockedFunction<typeof shopifyFetch>

const BULK_VARIANT_ID = 'gid://shopify/ProductVariant/46578637930566'
const NON_BULK_VARIANT_ID = 'gid://shopify/ProductVariant/100'

const successResponse = {
  cartCreate: {
    cart: { id: 'cart1', checkoutUrl: 'https://checkout.shopify.com/test' },
    userErrors: [],
  },
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('createShopifyCheckoutAction — bulk minimum enforcement', () => {
  it('throws when bulk variant has quantity < 20', async () => {
    await expect(
      createShopifyCheckoutAction([{ merchandiseId: BULK_VARIANT_ID, quantity: 19 }])
    ).rejects.toThrow('Bulk Order requires a minimum of 20 units.')
  })

  it('does NOT throw when bulk variant has quantity === 20', async () => {
    mockShopifyFetch.mockResolvedValueOnce(successResponse as any)
    await expect(
      createShopifyCheckoutAction([{ merchandiseId: BULK_VARIANT_ID, quantity: 20 }])
    ).resolves.not.toThrow()
  })

  it('does NOT throw when bulk variant has quantity > 20', async () => {
    mockShopifyFetch.mockResolvedValueOnce(successResponse as any)
    await expect(
      createShopifyCheckoutAction([{ merchandiseId: BULK_VARIANT_ID, quantity: 50 }])
    ).resolves.not.toThrow()
  })

  it('does NOT throw for non-bulk variant regardless of quantity', async () => {
    mockShopifyFetch.mockResolvedValueOnce(successResponse as any)
    await expect(
      createShopifyCheckoutAction([{ merchandiseId: NON_BULK_VARIANT_ID, quantity: 1 }])
    ).resolves.not.toThrow()
  })
})

describe('createShopifyCheckoutAction — return value and errors', () => {
  it('returns checkoutUrl on success', async () => {
    mockShopifyFetch.mockResolvedValueOnce(successResponse as any)
    const url = await createShopifyCheckoutAction([
      { merchandiseId: NON_BULK_VARIANT_ID, quantity: 1 },
    ])
    expect(url).toBe('https://checkout.shopify.com/test')
  })

  it('throws the userError message when Shopify returns userErrors', async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: null,
        userErrors: [{ field: 'quantity', message: 'Quantity is too high.' }],
      },
    } as any)
    await expect(
      createShopifyCheckoutAction([{ merchandiseId: NON_BULK_VARIANT_ID, quantity: 1 }])
    ).rejects.toThrow('Quantity is too high.')
  })
})
