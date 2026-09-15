const domain = process.env.SHOPIFY_STORE_DOMAIN!
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESSTOKEN!
const endpoint = `https://${domain}/api/2026-07/graphql.json`

export async function shopifyFetch<T>({
  query,
  variables = {},
  revalidate = 3600,
}: {
  query: string
  variables?: Record<string, unknown>
  revalidate?: number
}): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  })

  const json = await res.json()

  if (json.errors) {
    throw new Error(json.errors[0].message)
  }

  return json.data as T
}
