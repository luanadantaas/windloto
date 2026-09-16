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

  it('returns valid=true, discountType="amount", and total discountAmount when code is applicable', async () => {
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
    if (result.valid) expect(result.discountType).toBe('amount')
  })

  it('returns discountType="free_shipping" when code is applicable but no line-item allocations', async () => {
    // Free shipping discounts are applicable but produce zero discountAllocations on line items
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: true, code: 'FREESHIPPING2026' }],
          lines: { edges: [{ node: { discountAllocations: [] } }] },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction(lines, 'FREESHIPPING2026')
    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBe(0)
    if (result.valid) expect(result.discountType).toBe('free_shipping')
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
    if (result.valid) expect(result.discountType).toBe('amount')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Behavior map for all 4 Shopify discount types
//
// The Storefront API does NOT expose the discount TYPE directly. We infer it
// from the line-item discountAllocations:
//   • allocations > $0  →  discountType: 'amount'
//   • allocations empty →  discountType: 'free_shipping'
//
// LIMITATION: a valid code with no applicable cart items (product not in cart,
// or Buy X Get Y minimum not met) also returns empty allocations, so it is
// indistinguishable from a free shipping discount via the Storefront API.
// ─────────────────────────────────────────────────────────────────────────────

describe('validateCouponAction — all Shopify discount types', () => {
  const twoLines = [
    { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 2 },
    { merchandiseId: 'gid://shopify/ProductVariant/2', quantity: 1 },
  ]

  // ─── Type 1: Product discount — Amount off products ──────────────────────

  it('[product discount] returns "amount" when the discounted product is in the cart', async () => {
    // Shopify emits a discountAllocation on the matching line item only.
    // Other line items in the cart receive no allocation.
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: true, code: 'PRODUCT10' }],
          lines: {
            edges: [
              {
                node: {
                  discountAllocations: [
                    { discountedAmount: { amount: '6.25', currencyCode: 'USD' } },
                  ],
                },
              },
              { node: { discountAllocations: [] } },
            ],
          },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction(twoLines, 'PRODUCT10')
    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBeCloseTo(6.25)
    if (result.valid) expect(result.discountType).toBe('amount')
  })

  it('[product discount] returns "free_shipping" when valid but no matching product is in cart', async () => {
    // STOREFRONT API LIMITATION: a valid product discount code whose target product is
    // absent from the cart still returns applicable=true with no allocations.
    // This is indistinguishable from a free shipping discount via the Storefront API.
    // The discount will apply correctly when the matching product is in the cart at checkout.
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: true, code: 'PRODUCT10' }],
          lines: {
            edges: [{ node: { discountAllocations: [] } }],
          },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction([twoLines[1]], 'PRODUCT10')
    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBe(0)
    if (result.valid) expect(result.discountType).toBe('free_shipping')
  })

  // ─── Type 2: Product discount — Buy X Get Y ──────────────────────────────

  it('[buy x get y] returns "amount" equal to the free item price when Buy X conditions are met', async () => {
    // "Buy 2, get 1 free": the free item's full price appears as a discountAllocation.
    // e.g., Ram Lock $62.50 — the 3rd unit is free so allocation = $62.50
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: true, code: 'BUY2GET1' }],
          lines: {
            edges: [
              {
                node: {
                  discountAllocations: [
                    { discountedAmount: { amount: '62.50', currencyCode: 'USD' } },
                  ],
                },
              },
              { node: { discountAllocations: [] } },
            ],
          },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction(twoLines, 'BUY2GET1')
    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBeCloseTo(62.50)
    if (result.valid) expect(result.discountType).toBe('amount')
  })

  it('[buy x get y] returns "free_shipping" when Buy X minimum quantity is not met', async () => {
    // STOREFRONT API LIMITATION: if the cart does not satisfy the "Buy X" minimum,
    // Shopify returns applicable=true but no allocations — same shape as free shipping.
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: true, code: 'BUY2GET1' }],
          lines: {
            edges: [{ node: { discountAllocations: [] } }],
          },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction([twoLines[0]], 'BUY2GET1')
    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBe(0)
    if (result.valid) expect(result.discountType).toBe('free_shipping')
  })

  // ─── Type 3: Order discount — Amount off order ───────────────────────────

  it('[order discount] returns "amount" with the total discount split proportionally across lines', async () => {
    // Shopify distributes the fixed order discount proportionally across all line items.
    // e.g., $20 off an order split as $13.33 on line 1 and $6.67 on line 2
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: true, code: 'ORDER20' }],
          lines: {
            edges: [
              {
                node: {
                  discountAllocations: [
                    { discountedAmount: { amount: '13.33', currencyCode: 'USD' } },
                  ],
                },
              },
              {
                node: {
                  discountAllocations: [
                    { discountedAmount: { amount: '6.67', currencyCode: 'USD' } },
                  ],
                },
              },
            ],
          },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction(twoLines, 'ORDER20')
    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBeCloseTo(20)
    if (result.valid) expect(result.discountType).toBe('amount')
  })

  it('[order discount] returns "amount" for a percentage-off order across all lines', async () => {
    // 15% off: each line gets a proportional allocation regardless of which products are in the cart
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: true, code: 'SAVE15' }],
          lines: {
            edges: [
              { node: { discountAllocations: [{ discountedAmount: { amount: '18.75', currencyCode: 'USD' } }] } },
              { node: { discountAllocations: [{ discountedAmount: { amount: '5.63', currencyCode: 'USD' } }] } },
            ],
          },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction(twoLines, 'SAVE15')
    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBeCloseTo(24.38)
    if (result.valid) expect(result.discountType).toBe('amount')
  })

  // ─── Type 4: Shipping discount — Free shipping ────────────────────────────

  it('[free shipping] returns discountType="free_shipping" and discountAmount=0 on a multi-line cart', async () => {
    // Free shipping discounts produce no line-item allocations regardless of cart size.
    // The shipping cost is waived at checkout but no per-product amount is shown here.
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: true, code: 'FREESHIPPING2026' }],
          lines: {
            edges: [
              { node: { discountAllocations: [] } },
              { node: { discountAllocations: [] } },
            ],
          },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction(twoLines, 'FREESHIPPING2026')
    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBe(0)
    if (result.valid) expect(result.discountType).toBe('free_shipping')
  })

  it('[free shipping] discountAmount stays 0 on a three-line cart', async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: {
          discountCodes: [{ applicable: true, code: 'FREESHIPPING2026' }],
          lines: {
            edges: [
              { node: { discountAllocations: [] } },
              { node: { discountAllocations: [] } },
              { node: { discountAllocations: [] } },
            ],
          },
        },
        userErrors: [],
      },
    } as any)
    const result = await validateCouponAction(
      [...twoLines, { merchandiseId: 'gid://shopify/ProductVariant/3', quantity: 5 }],
      'FREESHIPPING2026'
    )
    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBe(0)
    if (result.valid) expect(result.discountType).toBe('free_shipping')
  })
})
