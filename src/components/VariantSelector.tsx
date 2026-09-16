'use client'

import { useState, useEffect } from 'react'
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

const BULK_MIN = 20

function isBulk(variant: Variant) {
  return variant.title.toLowerCase().includes('bulk')
}

export default function VariantSelector({ variants, productTitle, productImage }: Props) {
  const [selected, setSelected] = useState(variants[0])
  const [quantity, setQuantity] = useState(isBulk(variants[0]) ? BULK_MIN : 1)

  useEffect(() => {
    setQuantity(isBulk(selected) ? BULK_MIN : 1)
  }, [selected])

  const price = parseFloat(selected.price.amount)
  const currency = selected.price.currencyCode
  const minQty = isBulk(selected) ? BULK_MIN : 1

  function handleQtyChange(val: number) {
    setQuantity(Math.max(minQty, val))
  }

  return (
    <div className="space-y-4">
      {/* Variant picker */}
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
                  {currency} {parseFloat(v.price.amount).toFixed(2)} / unit
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Quantity
          {isBulk(selected) && (
            <span className="ml-2 text-xs font-normal text-[#f97316]">minimum {BULK_MIN} units</span>
          )}
        </label>
        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden w-fit">
          <button
            onClick={() => handleQtyChange(quantity - 1)}
            disabled={quantity <= minQty}
            className="px-4 py-2 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
          >
            −
          </button>
          <input
            type="number"
            min={minQty}
            value={quantity}
            onChange={(e) => handleQtyChange(parseInt(e.target.value) || minQty)}
            className="w-16 text-center py-2 text-sm font-medium border-x border-slate-300 focus:outline-none"
          />
          <button
            onClick={() => handleQtyChange(quantity + 1)}
            className="px-4 py-2 hover:bg-slate-100 text-slate-600 transition-colors text-lg"
          >
            +
          </button>
        </div>
      </div>

      {/* Price summary */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-[#0f2d5a]">
          {currency} {(price * quantity).toFixed(2)}
        </span>
        <span className="text-slate-400 text-sm">
          {currency} {price.toFixed(2)} × {quantity}
        </span>
        {isBulk(selected) && (
          <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
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
        quantity={quantity}
      />
    </div>
  )
}
