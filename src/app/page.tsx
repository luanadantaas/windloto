import { shopifyFetch } from '@/lib/shopify'
import { GET_ALL_PRODUCTS_QUERY } from '@/lib/queries/products'
import { ShopifyProduct } from '@/types/shopify'
import Hero from '@/components/Hero'
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

export default async function Home() {
  const products = await getProducts()

  return (
    <>
      <Hero />

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#0f2d5a]">Featured Products</h2>
          <a href="/store" className="text-[#f97316] text-sm font-medium hover:underline">
            View all →
          </a>
        </div>

        {products.length === 0 ? (
          <p className="text-slate-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(({ node }) => (
              <ProductCard key={node.id} product={node} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#0f2d5a] text-white py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: '⚙️', title: 'Engineered for the Field', desc: 'Designed for real-world turbine maintenance conditions.' },
            { icon: '🔒', title: 'Prevents Costly Damage', desc: 'Stops pitch ram rod back-out before it causes downtime.' },
            { icon: '📦', title: 'Ready to Ship', desc: 'Order directly from our store and get back to work.' },
          ].map((item) => (
            <div key={item.title}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-base mb-1">{item.title}</h3>
              <p className="text-white/60 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
