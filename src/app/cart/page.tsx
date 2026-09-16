'use client'

import { useCartStore } from '@/lib/cartStore'
import { createShopifyCheckoutAction, validateCouponAction } from '@/app/actions/checkoutActions'
import ShippingEstimator from '@/components/ShippingEstimator'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface CouponState {
  applied: boolean
  code: string
  discountAmount: number
  currency: string
  error: string | null
  loading: boolean
}

const INITIAL_COUPON: CouponState = {
  applied: false, code: '', discountAmount: 0, currency: 'USD', error: null, loading: false,
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shipping, setShipping] = useState<{ method: string; time: string; price: number; label: string } | null>(null)
  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<CouponState>(INITIAL_COUPON)

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCoupon((prev) => ({ ...prev, loading: true, error: null }))
    const lines = cart.map((item) => ({ merchandiseId: item.variantId, quantity: item.quantity }))
    const result = await validateCouponAction(lines, code)
    if (result.valid) {
      setCoupon({
        applied: true,
        code,
        discountAmount: result.discountAmount,
        currency: result.currency,
        error: null,
        loading: false,
      })
    } else {
      setCoupon((prev) => ({ ...prev, applied: false, error: result.errorMessage ?? 'Invalid code.', loading: false }))
    }
  }

  function handleRemoveCoupon() {
    setCouponInput('')
    setCoupon(INITIAL_COUPON)
  }

  async function handleCheckout() {
    if (cart.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const lines = cart.map((item) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      }))
      const checkoutUrl = await createShopifyCheckoutAction(lines, coupon.applied ? coupon.code : undefined)
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

                {(() => {
                  const isBulk = item.title.toLowerCase().includes('bulk')
                  const minQty = isBulk ? 20 : 1
                  const maxQty = item.stockLimit !== null && item.stockLimit !== undefined
                    ? item.stockLimit
                    : Infinity
                  const isLowStock = item.stockLimit !== null && item.stockLimit !== undefined
                    && item.stockLimit <= 10 && item.stockLimit > 0
                  return (
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      disabled={item.quantity <= minQty}
                      className="px-3 py-1 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm font-medium border-x border-slate-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= maxQty}
                      className="px-3 py-1 hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {isBulk && (
                    <span className="text-xs text-slate-400">min. 20</span>
                  )}
                  {isLowStock && (
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Only {item.stockLimit} left
                    </span>
                  )}
                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="text-slate-400 hover:text-red-500 text-sm transition-colors"
                  >
                    Remove
                  </button>
                </div>
                  )
                })()}
              </div>

              <div className="text-right flex-shrink-0 font-bold text-[#0f2d5a]">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="font-bold text-[#0f2d5a] text-lg mb-4">Order Summary</h2>

            {/* Line items */}
            <div className="space-y-2 text-sm text-slate-600 mb-4">
              {cart.map((item) => (
                <div key={item.variantId} className="flex justify-between">
                  <span className="truncate pr-2">{item.title} × {item.quantity}</span>
                  <span className="flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Subtotal */}
            <div className="border-t pt-3 flex justify-between font-semibold text-[#0f2d5a]">
              <span>Subtotal</span>
              <span>${totalPrice().toFixed(2)}</span>
            </div>

            {/* Discount line */}
            {coupon.applied && coupon.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600 mt-2">
                <span>Discount <span className="font-mono text-xs">({coupon.code})</span></span>
                <span className="font-semibold">-${coupon.discountAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Shipping line */}
            {shipping && (
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>{shipping.method}</span>
                <span className={shipping.price === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping.label}
                </span>
              </div>
            )}

            {/* Total */}
            {(shipping || coupon.applied) && (
              <div className="flex justify-between font-bold text-[#0f2d5a] text-lg mt-2 pt-2 border-t">
                <span>Total</span>
                <span>
                  ${Math.max(0, totalPrice() - (coupon.applied ? coupon.discountAmount : 0) + (shipping?.price ?? 0)).toFixed(2)}
                </span>
              </div>
            )}

            {/* Coupon code */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold text-[#0f2d5a] mb-2">Discount Code</h3>
              {coupon.applied ? (
                <div className="flex items-center justify-between text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <span className="text-green-700 flex items-center gap-1.5">
                    <span className="font-bold">✓</span>
                    <span className="font-mono font-semibold">{coupon.code}</span>
                    <span className="text-green-600 font-normal">applied</span>
                  </span>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-slate-400 hover:text-red-500 text-xs transition-colors ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#0f2d5a] focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={coupon.loading || !couponInput.trim()}
                    className="bg-[#0f2d5a] hover:bg-[#0a1f3f] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    {coupon.loading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {coupon.error && (
                <p className="text-red-500 text-xs mt-1.5">{coupon.error}</p>
              )}
            </div>

            {/* Shipping estimator */}
            <ShippingEstimator onSelect={setShipping} selected={shipping} />

            {/* Checkout */}
            <div className="mt-4 space-y-3">
              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#f97316] hover:bg-[#ea6c0a] disabled:opacity-60 text-white font-semibold py-3 rounded transition-colors"
              >
                {loading ? 'Redirecting...' : 'Checkout'}
              </button>

              <Link
                href="/store"
                className="block text-center text-[#0f2d5a] text-sm hover:underline"
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
