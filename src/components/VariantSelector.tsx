'use client'

import { useState } from 'react'
import AddToCartButton from './AddToCartButton'

interface Variant {
  id: string
  title: string
  availableForSale: boolean
  price: {
    amount: string
    currencyCode: string
  }
}

interface Props {
  variants: Variant[]
  productTitle: string
  productImage: string
}

export default function VariantSelector({ variants, productTitle, productImage }: Props) {
  const [selected, setSelected] = useState(variants[0])

  const price = parseFloat(selected.price.amount)
  const currency = selected.price.currencyCode

  return (
    <div className="space-y-4">
      {variants.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Order Type</label>
          <div className="flex flex-col gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                  selected.id === v.id
                    ? 'border-[#0f2d5a] bg-[#0f2d5a]/5 text-[#0f2d5a]'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span>{v.title}</span>
                <span className={selected.id === v.id ? 'text-[#f97316] font-bold' : 'text-slate-500'}>
                  {currency} {parseFloat(v.price.amount).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-2xl font-bold text-[#0f2d5a]">
        {currency} {price.toFixed(2)}
        {selected.title.toLowerCase().includes('bulk') && (
          <span className="ml-2 text-sm font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Bulk discount
          </span>
        )}
      </div>

      <AddToCartButton
        variantId={selected.id}
        title={`${productTitle} — ${selected.title}`}
        price={price}
        image={productImage}
        availableForSale={selected.availableForSale}
      />
    </div>
  )
}
