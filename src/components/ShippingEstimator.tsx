'use client'

import { useState } from 'react'

interface ShippingOption {
  method: string
  time: string
  price: number
  label: string
}

const US_OPTIONS: ShippingOption[] = [
  { method: 'USPS Priority', time: '2–3 days', price: 0, label: 'Free' },
  { method: 'FedEx 2nd Day', time: '2 days', price: 35, label: '$35.00' },
  { method: 'FedEx Next Day', time: '1 day', price: 55, label: '$55.00' },
]

const INTL_OPTIONS: ShippingOption[] = [
  { method: 'International Postal', time: '2–3 weeks', price: 60, label: '$60.00' },
  { method: 'International DHL', time: '3–4 days', price: 125, label: '$125.00' },
]

function isUSZip(value: string) {
  return /^\d{5}(-\d{4})?$/.test(value.trim())
}

interface Props {
  onSelect: (option: ShippingOption | null) => void
  selected: ShippingOption | null
}

export default function ShippingEstimator({ onSelect, selected }: Props) {
  const [zip, setZip] = useState('')
  const [options, setOptions] = useState<ShippingOption[] | null>(null)
  const [error, setError] = useState('')

  function handleEstimate() {
    const val = zip.trim()
    if (!val) {
      setError('Please enter a ZIP or postal code.')
      return
    }
    setError('')
    const opts = isUSZip(val) ? US_OPTIONS : INTL_OPTIONS
    setOptions(opts)
    onSelect(opts[0])
  }

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-sm font-semibold text-[#0f2d5a] mb-3">Estimate Shipping</h3>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="ZIP / Postal code"
          value={zip}
          onChange={(e) => { setZip(e.target.value); setOptions(null); onSelect(null) }}
          onKeyDown={(e) => e.key === 'Enter' && handleEstimate()}
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d5a] focus:border-transparent"
        />
        <button
          onClick={handleEstimate}
          className="bg-[#0f2d5a] hover:bg-[#0a1f3f] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Calculate
        </button>
      </div>

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      {options && (
        <div className="space-y-2 mt-3">
          {options.map((opt) => (
            <label
              key={opt.method}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                selected?.method === opt.method
                  ? 'border-[#0f2d5a] bg-[#0f2d5a]/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="shipping"
                  checked={selected?.method === opt.method}
                  onChange={() => onSelect(opt)}
                  className="accent-[#0f2d5a]"
                />
                <div>
                  <div className="text-sm font-medium text-slate-700">{opt.method}</div>
                  <div className="text-xs text-slate-400">{opt.time}</div>
                </div>
              </div>
              <span className={`text-sm font-bold ${opt.price === 0 ? 'text-green-600' : 'text-[#0f2d5a]'}`}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
