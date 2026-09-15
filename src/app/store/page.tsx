import { shopifyFetch } from '@/lib/shopify'
import { GET_ALL_PRODUCTS_QUERY } from '@/lib/queries/products'
import { ShopifyProduct } from '@/types/shopify'
import ProductCard from '@/components/ProductCard'

interface ProductsResponse {
  products: {
    edges: Array<{ node: ShopifyProduct }>
  }
}

async function getProducts() {
  const data = await shopifyFetch<ProductsResponse>({
    query: GET_ALL_PRODUCTS_QUERY,
  })
  return data.products.edges
}

export const metadata = {
  title: 'Store — WindLOTO',
  description: 'Shop Ram Lock and Rotor Lock devices for wind turbine maintenance.',
}

export default async function StorePage() {
  const products = await getProducts()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#0f2d5a] mb-2">Store</h1>
        <p className="text-slate-500">
          All products ship from the USA. Free USPS Priority shipping on US orders.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-slate-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(({ node }) => (
            <ProductCard key={node.id} product={node} />
          ))}
        </div>
      )}

      {/* Shipping info */}
      <div className="mt-16 border-t pt-10">
        <h2 className="text-xl font-bold text-[#0f2d5a] mb-6">Shipping Options</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { method: 'USPS Priority', region: 'United States', time: '2–3 days', price: 'Free' },
            { method: 'FedEx 2nd Day', region: 'United States', time: '2 days', price: '$35.00' },
            { method: 'FedEx Next Day', region: 'United States', time: '1 day', price: '$55.00' },
            { method: 'International Postal', region: 'Worldwide', time: '2–3 weeks', price: '$60.00' },
            { method: 'International DHL', region: 'Worldwide', time: '3–4 days', price: '$125.00' },
          ].map((s) => (
            <div key={s.method} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="font-semibold text-[#0f2d5a] text-sm">{s.method}</div>
              <div className="text-slate-500 text-xs mt-1">{s.region} · {s.time}</div>
              <div className="text-[#f97316] font-bold mt-2">{s.price}</div>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-sm mt-4">
          European and South American customers: order through our distributor{' '}
          <a href="https://windloto.com" className="text-[#f97316] hover:underline" target="_blank" rel="noopener noreferrer">
            Sister-Soft
          </a>.
        </p>
      </div>
    </div>
  )
}
