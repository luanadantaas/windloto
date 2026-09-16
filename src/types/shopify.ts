export interface ShopifyImage {
  url: string
  altText?: string
}

export interface ShopifyProductOption {
  name: string
  values: string[]
}

export interface ShopifyVariant {
  id: string
  title: string
  availableForSale: boolean
  price: {
    amount: string
    currencyCode: string
  }
  selectedOptions: Array<{
    name: string
    value: string
  }>
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
  options: ShopifyProductOption[]
  images: {
    edges: Array<{ node: ShopifyImage }>
  }
  variants: {
    edges: Array<{ node: ShopifyVariant }>
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
