import Link from 'next/link'
import Image from 'next/image'
import { ShopifyProduct } from '@/types/shopify'
import { resolveUrlHandle } from '@/lib/productHandleMap'

export default function ProductCard({ product }: { product: ShopifyProduct }) {
  const urlHandle = resolveUrlHandle(product.handle)
  const price = parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)
  const currency = product.priceRange.minVariantPrice.currencyCode
  const featuredImage = product.images.edges[0]?.node

  return (
    <Link href={`/products/${urlHandle}`} className="group">
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-[#f97316] hover:shadow-lg transition-all duration-200">
        <div className="relative h-52 bg-slate-100 overflow-hidden">
          {featuredImage ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.altText ?? product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              No image
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-[#0f2d5a] text-base mb-1 group-hover:text-[#f97316] transition-colors">
            {product.title}
          </h3>
          <p className="text-slate-500 text-sm">
            {currency} {price}
          </p>
          <div className="mt-3">
            <span className="inline-block bg-[#0f2d5a] text-white text-xs font-medium px-3 py-1.5 rounded group-hover:bg-[#f97316] transition-colors">
              View Product
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
