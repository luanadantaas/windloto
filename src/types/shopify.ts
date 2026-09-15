export interface ShopifyImage {
  url: string
  altText?: string
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  images: {
    edges: Array<{ node: ShopifyImage }>
  }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        availableForSale: boolean
        price: {
          amount: string
          currencyCode: string
        }
      }
    }>
  }
  technicalSpecs?: {
    value: string
  }
  pdfSheetUrl?: {
    reference?: {
      image?: { url: string }
      file?: { url: string }
    }
  }
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  lines: {
    edges: Array<{
      node: {
        id: string
        quantity: number
        merchandise: {
          id: string
          title: string
          product: {
            title: string
            images: { edges: Array<{ node: ShopifyImage }> }
          }
          price: {
            amount: string
            currencyCode: string
          }
        }
      }
    }>
  }
  cost: {
    totalAmount: {
      amount: string
      currencyCode: string
    }
  }
}
