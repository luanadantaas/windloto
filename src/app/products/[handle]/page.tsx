import { shopifyFetch } from '@/lib/shopify'
import { GET_PRODUCT_BY_HANDLE_QUERY } from '@/lib/queries/products'
import { ShopifyProduct } from '@/types/shopify'
import { notFound } from 'next/navigation'
import VariantSelector from '@/components/VariantSelector'
import ProductImageGallery from '@/components/ProductImageGallery'
import { resolveShopifyHandle } from '@/lib/productHandleMap'

interface ProductResponse {
  product: ShopifyProduct | null
}

async function getProduct(handle: string): Promise<ShopifyProduct> {
  const shopifyHandle = resolveShopifyHandle(handle)
  const data = await shopifyFetch<ProductResponse>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle: shopifyHandle },
  })
  if (!data.product) notFound()
  return data.product
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProduct(handle)
  return {
    title: `${product.title} — WindLOTO`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProduct(handle)

  const images = product.images.edges.map((e) => e.node)
  const variants = product.variants.edges.map((e) => e.node)
  let technicalSpecs: Record<string, string> | null = null
  if (product.technicalSpecs?.value) {
    try {
      technicalSpecs = JSON.parse(product.technicalSpecs.value)
    } catch {}
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

        {/* Images */}
        <ProductImageGallery images={images} title={product.title} />

        {/* Info */}
        <div>
          <p className="text-[#f97316] text-sm font-semibold uppercase tracking-wider mb-2">WindLOTO</p>
          <h1 className="text-3xl font-bold text-[#0f2d5a] mb-4">{product.title}</h1>

          <div
            className="text-slate-600 leading-relaxed mb-8 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />

          <div className="mb-6">
            <VariantSelector
              options={product.options}
              variants={variants}
              productTitle={product.title}
              productImage={images[0]?.url ?? ''}
            />
          </div>

          <div className="text-slate-500 text-sm space-y-1">
            <p>✓ Free USPS Priority shipping (US orders)</p>
            <p>✓ Manufactured in the USA</p>
            <p>✓ Expedited shipping available</p>
          </div>

          {/* Technical specs metafield */}
          {technicalSpecs && (
            <div className="mt-8 border-t pt-6">
              <h2 className="font-bold text-[#0f2d5a] mb-3">Technical Specifications</h2>
              <dl className="space-y-2">
                {Object.entries(technicalSpecs).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-sm">
                    <dt className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                    <dd className="font-medium text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* PDF download */}
          {product.pdfSheetUrl?.reference && (
            <div className="mt-6">
              <a
                href={(product.pdfSheetUrl.reference as any).url ?? (product.pdfSheetUrl.reference as any).image?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0f2d5a] border border-[#0f2d5a] px-4 py-2 rounded hover:bg-[#0f2d5a] hover:text-white transition-colors text-sm font-medium"
              >
                📄 Download Technical Sheet (PDF)
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
