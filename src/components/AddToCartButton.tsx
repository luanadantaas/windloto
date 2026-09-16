'use client'

import { useCartStore } from '@/lib/cartStore'
import { useState } from 'react'

interface Props {
  variantId: string
  title: string
  price: number
  image: string
  availableForSale: boolean
  quantity?: number
}

export default function AddToCartButton({ variantId, title, price, image, availableForSale, quantity = 1 }: Props) {
  const addToCart = useCartStore((s) => s.addToCart)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addToCart({ variantId, title, price, image, quantity })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (!availableForSale) {
    return (
      <button disabled className="w-full bg-slate-200 text-slate-400 font-semibold py-3 rounded cursor-not-allowed">
        Out of Stock
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      className="w-full bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold py-3 rounded transition-colors"
    >
      {added ? '✓ Added to Cart' : 'Add to Cart'}
    </button>
  )
}
