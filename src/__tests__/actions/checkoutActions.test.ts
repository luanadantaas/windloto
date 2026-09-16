import { createShopifyCheckoutAction, validateCouponAction } from '@/app/actions/checkoutActions'
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

  it('passes discountCodes to cartCreate when a discount code is provided', async () => {
    mockShopifyFetch.mockResolvedValueOnce(successResponse as any)
    await createShopifyCheckoutAction([{ merchandiseId: NON_BULK_VARIANT_ID, quantity: 1 }], 'SAVE10')
    expect(mockShopifyFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          input: expect.objectContaining({ discountCodes: ['SAVE10'] }),
        }),
      })
    )
  })
})

describe('validateCouponAction', () => {
  const lines = [{ merchandiseId: NON_BULK_VARIANT_ID, quantity: 2 }]

  it('returns valid=true and total discountAmount when code is applicable', async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: true, code: 'SAVE10' }],
          lines: {
            edges: [
              {
                node: {
                  discountAllocations: [
                    { discountedAmount: { amount: '12.50', currencyCode: 'USD' } },
                  ],
                },
              },
            ],
          },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction(lines, 'SAVE10')
    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBeCloseTo(12.5)
    expect(result.currency).toBe('USD')
  })

  it('returns valid=false with errorMessage when code is not applicable', async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: false, code: 'BADCODE' }],
          lines: { edges: [] },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction(lines, 'BADCODE')
    expect(result.valid).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.errorMessage).toMatch(/invalid or expired/i)
  })

  it('returns valid=false with userError message on Shopify error', async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: { discountCodes: [], lines: { edges: [] } },
        userErrors: [{ field: 'discountCodes', message: 'Discount already used.' }],
      },
    } as any)
    const result = await validateCouponAction(lines, 'USED')
    expect(result.valid).toBe(false)
    expect(result.errorMessage).toBe('Discount already used.')
  })

  it('sums discount allocations across multiple line items', async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: true, code: 'BULK20' }],
          lines: {
            edges: [
              { node: { discountAllocations: [{ discountedAmount: { amount: '5.00', currencyCode: 'USD' } }] } },
              { node: { discountAllocations: [{ discountedAmount: { amount: '3.00', currencyCode: 'USD' } }] } },
            ],
          },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction(lines, 'BULK20')
    expect(result.discountAmount).toBeCloseTo(8)
  })
})
