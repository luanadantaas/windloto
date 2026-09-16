'use client'

import { useCartStore } from '@/lib/cartStore'
import { createShopifyCheckoutAction } from '@/app/actions/checkoutActions'
import ShippingEstimator from '@/components/ShippingEstimator'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shipping, setShipping] = useState<{ method: string; time: string; price: number; label: string } | null>(null)

  async function handleCheckout() {
    if (cart.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const lines = cart.map((item) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      }))
      const checkoutUrl = await createShopifyCheckoutAction(lines)
      window.location.href = checkoutUrl
    } catch (e: any) {
      setError('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-[#0f2d5a] mb-3">Your cart is empty</h1>
        <p className="text-slate-500 mb-8">Add some products to get started.</p>
        <Link
          href="/store"
          className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold px-6 py-3 rounded transition-colors inline-block"
        >
          Browse Store
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#0f2d5a] mb-8">
        Your Cart <span className="text-slate-400 font-normal text-lg">({totalItems()} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.variantId} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start">
              <div className="relative w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                {item.image ? (
                  <Image src={item.image} alt={item.title} fill className="object-contain p-1" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No img</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#0f2d5a] truncate">{item.title}</h3>
                <p className="text-[#f97316] font-bold mt-1">${item.price.toFixed(2)}</p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-3 py-1 hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm font-medium border-x border-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="text-slate-400 hover:text-red-500 text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="text-right flex-shrink-0 font-bold text-[#0f2d5a]">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-20">
            <h2 className="font-bold text-[#0f2d5a] text-lg mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm text-slate-600 mb-4">
              {cart.map((item) => (
                <div key={item.variantId} className="flex justify-between">
                  <span className="truncate pr-2">{item.title} × {item.quantity}</span>
                  <span className="flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 flex justify-between font-bold text-[#0f2d5a]">
              <span>Subtotal</span>
              <span>${totalPrice().toFixed(2)}</span>
            </div>

            {shipping && (
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>{shipping.method}</span>
                <span className={shipping.price === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping.label}
                </span>
              </div>
            )}

            {shipping && (
              <div className="flex justify-between font-bold text-[#0f2d5a] text-lg mt-2 border-t pt-2">
                <span>Total</span>
                <span>${(totalPrice() + shipping.price).toFixed(2)}</span>
              </div>
            )}

            <ShippingEstimator onSelect={setShipping} selected={shipping} />

            <div className="mt-4">
              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#f97316] hover:bg-[#ea6c0a] disabled:opacity-60 text-white font-semibold py-3 rounded transition-colors"
              >
                {loading ? 'Redirecting...' : 'Checkout'}
              </button>

              <Link
                href="/store"
                className="block text-center text-[#0f2d5a] text-sm mt-3 hover:underline"
              >
                ← Continue shopping
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
