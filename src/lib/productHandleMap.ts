// Maps clean URL handles to actual Shopify product handles.
// Update the right side when a Shopify handle changes.
export const productHandleMap: Record<string, string> = {
  'ram-lock': 'ram-locking-device',
  'rotor-lock': 'rotor-lock',
}

export function resolveShopifyHandle(urlHandle: string): string {
  return productHandleMap[urlHandle] ?? urlHandle
}

// Reverse: maps a Shopify handle back to the clean URL handle
const reverseHandleMap = Object.fromEntries(
  Object.entries(productHandleMap).map(([url, shopify]) => [shopify, url])
)

export function resolveUrlHandle(shopifyHandle: string): string {
  return reverseHandleMap[shopifyHandle] ?? shopifyHandle
}
