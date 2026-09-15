import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rotor Lock — WindLOTO',
  description: 'US patented rotor locking device for wind turbines. OSHA compliant, small, lightweight, powder coated safety red. Made in the USA.',
}

export default function RotorLockPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">

      {/* Hero */}
      <div className="text-center">
        <span className="inline-block bg-[#f97316]/10 text-[#f97316] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded mb-4">
          WindLOTO Product · US Patent #8720479
        </span>
        <h1 className="text-4xl font-bold text-[#0f2d5a] mb-4">Rotor Lock</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Maintains the hydraulic selector valve in the 45° position while personnel are in the hub — ensuring a safe, OSHA-compliant work area.
        </p>
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Link
            href="/products/rotor-lock"
            className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold px-6 py-3 rounded transition-colors"
          >
            Buy Now — from $55.00
          </Link>
          <Link
            href="/rotor-lock-comparison"
            className="border border-[#0f2d5a] text-[#0f2d5a] hover:bg-[#0f2d5a] hover:text-white font-semibold px-6 py-3 rounded transition-colors"
          >
            See Comparison
          </Link>
        </div>
      </div>

      {/* Problem */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block bg-red-100 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-4">
            The Problem
          </span>
          <h2 className="text-2xl font-bold text-[#0f2d5a] mb-4">
            Keeping the Selector Valve at 45°
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Wind turbine rotor locking mechanisms require the hydraulic pumping assembly's selector valve to be maintained in the 45° position at all times while personnel are inside the hub. Without a reliable locking device, this critical safety requirement is difficult to enforce consistently.
          </p>
        </div>
        <div className="bg-slate-100 rounded-xl h-64 flex items-center justify-center text-slate-400 text-sm">
          Problem diagram
        </div>
      </section>

      {/* Solution */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl h-64 flex items-center justify-center text-slate-400 text-sm md:order-first">
          Rotor Lock device (safety red)
        </div>
        <div>
          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-4">
            The Solution
          </span>
          <h2 className="text-2xl font-bold text-[#0f2d5a] mb-4">
            The WindLOTO Rotor Lock
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Small, lightweight, and powder coated in safety red. The WindLOTO Rotor Lock securely locks the selector valve in the 45° position, maintaining a safe OSHA-compliant work area for all personnel working in the hub. Compatible with multiple wind turbine manufacturers.
          </p>
        </div>
      </section>

      {/* Compliance badges */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {[
          { icon: '🛡️', title: 'US Patented', desc: 'Patent #8720479' },
          { icon: '✅', title: 'OSHA Compliant', desc: '1910.269(d) and 1910.147' },
          { icon: '🇺🇸', title: 'Made in the USA', desc: 'Domestic manufacturing' },
        ].map((item) => (
          <div key={item.title} className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="font-bold text-[#0f2d5a]">{item.title}</div>
            <div className="text-slate-500 text-sm mt-1">{item.desc}</div>
          </div>
        ))}
      </section>

      {/* Specs */}
      <section className="bg-[#0f2d5a] text-white rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Specifications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Material', value: '1/8" steel' },
            { label: 'Manufacturing', value: 'Laser cut, hydraulically bent, powder coated' },
            { label: 'Color', value: 'Safety red' },
            { label: 'OSHA Standards', value: '1910.269(d) and 1910.147' },
            { label: 'Patent', value: 'US Patent #8720479' },
            { label: 'Origin', value: 'Proudly made in the USA' },
          ].map((spec) => (
            <div key={spec.label} className="bg-white/10 rounded-lg p-4">
              <div className="text-white/60 text-xs uppercase tracking-wider mb-1">{spec.label}</div>
              <div className="font-semibold">{spec.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 text-center">
          <div className="text-slate-500 text-sm mb-1">Under 20 units</div>
          <div className="text-3xl font-bold text-[#0f2d5a]">$62.50</div>
          <div className="text-slate-400 text-xs mt-1">per unit</div>
        </div>
        <div className="bg-[#0f2d5a] text-white rounded-xl p-6 text-center">
          <div className="text-white/70 text-sm mb-1">20+ units</div>
          <div className="text-3xl font-bold">$55.00</div>
          <div className="text-white/60 text-xs mt-1">per unit · bulk discount</div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-[#0f2d5a] mb-3">Keep your team safe in the hub</h2>
        <p className="text-slate-500 mb-6">Free USPS Priority shipping on all US orders. Bulk pricing available for 20+ units.</p>
        <Link
          href="/products/rotor-lock"
          className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold px-8 py-3 rounded transition-colors inline-block"
        >
          Order Rotor Lock
        </Link>
      </section>

    </div>
  )
}
