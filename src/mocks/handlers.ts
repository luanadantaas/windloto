import { graphql, HttpResponse } from 'msw'

const mockVariant = (id: string, title: string, price: string, bulk = false) => ({
  id: `gid://shopify/ProductVariant/${id}`,
  title,
  availableForSale: true,
  price: { amount: price, currencyCode: 'USD' },
  selectedOptions: bulk
    ? [{ name: 'Order Type', value: title }]
    : [{ name: 'Order Type', value: title }],
})

export const mockRamLockProduct = {
  id: 'gid://shopify/Product/1',
  title: 'Ram Lock',
  handle: 'ram-locking-device',
  description: 'Ram locking device for wind turbines',
  descriptionHtml: '<p>Ram locking device for wind turbines</p>',
  priceRange: { minVariantPrice: { amount: '62.50', currencyCode: 'USD' } },
  options: [{ name: 'Order Type', values: ['Single Unit', 'Bulk Order (20+)'] }],
  images: {
    edges: [
      { node: { url: 'https://cdn.shopify.com/img1.jpg', altText: 'Ram Lock front' } },
    ],
  },
  variants: {
    edges: [
      { node: mockVariant('100', 'Single Unit', '62.50') },
      { node: mockVariant('101', 'Bulk Order (20+)', '55.00', true) },
    ],
  },
  technicalSpecs: null,
  pdfSheetUrl: null,
}

export const handlers = [
  graphql.query('getProductByHandle', ({ variables }) => {
    if (variables.handle === 'ram-locking-device' || variables.handle === 'ram-lock') {
      return HttpResponse.json({ data: { product: mockRamLockProduct } })
    }
    return HttpResponse.json({ data: { product: null } })
  }),

  graphql.query('getProducts', () => {
    return HttpResponse.json({
      data: {
        products: {
          edges: [{ node: mockRamLockProduct }],
        },
      },
    })
  }),
]
