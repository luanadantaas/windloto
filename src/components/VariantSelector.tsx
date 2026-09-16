'use client'

import { useState, useEffect } from 'react'
import AddToCartButton from './AddToCartButton'
import { ShopifyVariant, ShopifyProductOption } from '@/types/shopify'

const BULK_MIN = 20
const COLOR_OPTION_NAME = 'Color'

const COLOR_MAP: Record<string, string> = {
  // Basics
  red: '#ef4444',
  blue: '#3b82f6',
  black: '#1f2937',
  white: '#f9fafb',
  gray: '#6b7280',
  grey: '#6b7280',
  green: '#22c55e',
  yellow: '#facc15',
  orange: '#f97316',
  // Brand / industrial
  navy: '#0f2d5a',
  silver: '#9ca3af',
  gold: '#f59e0b',
  brown: '#92400e',
  purple: '#7c3aed',
  pink: '#ec4899',
  teal: '#0d9488',
  cyan: '#06b6d4',
  // Safety / high-visibility
  'safety yellow': '#facc15',
  'safety orange': '#f97316',
  'hi-vis yellow': '#facc15',
  'hi-vis orange': '#fb923c',
  'safety red': '#dc2626',
  // Common descriptive names
  'dark blue': '#1e3a8a',
  'light blue': '#93c5fd',
  'dark gray': '#374151',
  'light gray': '#d1d5db',
  'dark green': '#166534',
  'bright yellow': '#fde047',
  'bright orange': '#f97316',
  'bright red': '#ef4444',
  'matte black': '#111827',
  'gloss black': '#000000',
  white: '#ffffff',
  'off-white': '#fafaf9',
  beige: '#d6c5a0',
  tan: '#d4a76a',
}

function getColorHex(value: string): string | null {
  return COLOR_MAP[value.toLowerCase()] ?? null
}

function isBulkVariant(variant: ShopifyVariant): boolean {
  return variant.selectedOptions.some(
    (o) => o.name.toLowerCase().includes('order') && o.value.toLowerCase().includes('bulk')
  )
}

function findVariant(
  variants: ShopifyVariant[],
  selected: Record<string, string>
): ShopifyVariant | undefined {
  return variants.find((v) =>
    v.selectedOptions.every((o) => selected[o.name] === o.value)
  )
}

interface Props {
  options: ShopifyProductOption[]
  variants: ShopifyVariant[]
  productTitle: string
  productImage: string
}

export default function VariantSelector({ options, variants, productTitle, productImage }: Props) {
  const firstVariant = variants[0]

  const initialSelected: Record<string, string> = {}
  firstVariant?.selectedOptions.forEach((o) => { initialSelected[o.name] = o.value })

  const [selected, setSelected] = useState<Record<string, string>>(initialSelected)
  const [quantity, setQuantity] = useState(1)

  const activeVariant = findVariant(variants, selected) ?? firstVariant
  const isBulk = activeVariant ? isBulkVariant(activeVariant) : false
  const minQty = isBulk ? BULK_MIN : 1

  useEffect(() => {
    setQuantity(isBulk ? BULK_MIN : 1)
  }, [isBulk])

  function selectOption(name: string, value: string) {
    setSelected((prev) => ({ ...prev, [name]: value }))
  }

  const price = parseFloat(activeVariant?.price.amount ?? '0')
  const currency = activeVariant?.price.currencyCode ?? 'USD'

  return (
    <div className="space-y-5">
      {options.map((option) => {
        const isColor = option.name === COLOR_OPTION_NAME
        return (
          <div key={option.name}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {option.name}
              {isColor && selected[option.name] && (
                <span className="ml-2 font-normal text-slate-500">{selected[option.name]}</span>
              )}
            </label>

            {isColor ? (
              /* Color swatches */
              <div className="flex flex-wrap gap-3">
                {option.values.map((value) => {
                  const hex = getColorHex(value)
                  const isActive = selected[option.name] === value
                  return hex ? (
                    /* Known color → circular swatch */
                    <button
                      key={value}
                      title={value}
                      aria-label={value}
                      aria-pressed={isActive}
                      onClick={() => selectOption(option.name, value)}
                      className={`w-9 h-9 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#0f2d5a] focus:ring-offset-1 ${
                        isActive
                          ? 'border-[#0f2d5a] scale-110 shadow-md ring-2 ring-[#0f2d5a] ring-offset-1'
                          : 'border-slate-300 hover:border-slate-500 hover:scale-105'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ) : (
                    /* Unknown color → text pill (same style as other options) */
                    <button
                      key={value}
                      onClick={() => selectOption(option.name, value)}
                      className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-[#0f2d5a] bg-[#0f2d5a]/5 text-[#0f2d5a]'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            ) : (
              /* Other options (e.g. Order Type) */
              <div className="flex flex-col gap-2">
                {option.values.map((value) => {
                  const isActive = selected[option.name] === value
                  const testVariant = findVariant(variants, { ...selected, [option.name]: value })
                  const optionPrice = testVariant ? parseFloat(testVariant.price.amount) : null
                  return (
                    <button
                      key={value}
                      onClick={() => selectOption(option.name, value)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-[#0f2d5a] bg-[#0f2d5a]/5 text-[#0f2d5a]'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span>{value}</span>
                      {optionPrice !== null && (
                        <span className={isActive ? 'text-[#f97316] font-bold' : 'text-slate-400'}>
                          {currency} {optionPrice.toFixed(2)} / unit
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Quantity
          {isBulk && <span className="ml-2 text-xs font-normal text-[#f97316]">minimum {BULK_MIN} units</span>}
        </label>
        <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden w-fit">
          <button
            onClick={() => setQuantity((q) => Math.max(minQty, q - 1))}
            disabled={quantity <= minQty}
            className="px-4 py-2 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
          >
            −
          </button>
          <input
            type="number"
            min={minQty}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(minQty, parseInt(e.target.value) || minQty))}
            className="w-16 text-center py-2 text-sm font-medium border-x border-slate-300 focus:outline-none"
          />
          <button
            onClick={() => setQuantity((q) => q + 1)}
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
        <span className="text-slate-400 text-sm">{currency} {price.toFixed(2)} × {quantity}</span>
        {isBulk && (
          <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            Bulk discount
          </span>
        )}
      </div>

      <AddToCartButton
        variantId={activeVariant?.id ?? ''}
        title={`${productTitle}${activeVariant?.title !== 'Default Title' ? ` — ${activeVariant?.title}` : ''}`}
        price={price}
        image={productImage}
        availableForSale={activeVariant?.availableForSale ?? false}
        quantity={quantity}
      />
    </div>
  )
}
