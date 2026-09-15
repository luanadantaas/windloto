import { shopifyFetch } from '@/lib/shopify'
import { GET_PRODUCT_BY_HANDLE_QUERY } from '@/lib/queries/products'
import { ShopifyProduct } from '@/types/shopify'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/AddToCartButton'

interface ProductResponse {
  productByHandle: ShopifyProduct | null
}

async function getProduct(handle: string): Promise<ShopifyProduct> {
  const data = await shopifyFetch<ProductResponse>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  })
  if (!data.productByHandle) notFound()
  return data.productByHandle
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
  const firstVariant = variants[0]
  const price = parseFloat(firstVariant?.price.amount ?? product.priceRange.minVariantPrice.amount)
  const currency = firstVariant?.price.currencyCode ?? product.priceRange.minVariantPrice.currencyCode

  let technicalSpecs: Record<string, string> | null = null
  if (product.technicalSpecs?.value) {
    try {
      technicalSpecs = JSON.parse(product.technicalSpecs.value)
    } catch {}
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Images */}
        <div className="space-y-4">
          {images.length > 0 ? (
            <>
              <div className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden">
                <Image
                  src={images[0].url}
                  alt={images[0].altText ?? product.title}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1).map((img, i) => (
                    <div key={i} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden">
                      <Image src={img.url} alt={img.altText ?? product.title} fill className="object-contain p-2" />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
              No image
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-[#f97316] text-sm font-semibold uppercase tracking-wider mb-2">WindLOTO</p>
          <h1 className="text-3xl font-bold text-[#0f2d5a] mb-4">{product.title}</h1>

          <div className="text-2xl font-bold text-[#0f2d5a] mb-6">
            {currency} {price.toFixed(2)}
          </div>

          <div
            className="text-slate-600 leading-relaxed mb-8 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />

          {firstVariant && (
            <div className="mb-6">
              <AddToCartButton
                variantId={firstVariant.id}
                title={product.title}
                price={price}
                image={images[0]?.url ?? ''}
                availableForSale={firstVariant.availableForSale}
              />
            </div>
          )}

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
                  <div key={key} className="grid grid-cols-2 gap-2 text-sm">
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
