import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ram Lock — WindLOTO',
  description: 'A two-piece device designed to prevent rotation of the pitch ram rod in wind turbines. Laser cut, hydraulically bent, powder coated. Made in the USA.',
}

export default function RamLockPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10 md:space-y-16">

      {/* Hero */}
      <div className="text-center">
        <span className="inline-block bg-[#f97316]/10 text-[#f97316] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded mb-4">
          WindLOTO Product
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0f2d5a] mb-4">Ram Lock</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          A two-piece device designed to prevent rotation of the pitch ram rod during wind turbine operation.
        </p>
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Link
            href="/products/ram-lock"
            className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold px-6 py-3 rounded transition-colors"
          >
            Buy Now — $85.00
          </Link>
          <Link
            href="/store"
            className="border border-[#0f2d5a] text-[#0f2d5a] hover:bg-[#0f2d5a] hover:text-white font-semibold px-6 py-3 rounded transition-colors"
          >
            View Store
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
            Insufficient Clamping on the Pitch Ram Knuckle
          </h2>
          <p className="text-slate-600 leading-relaxed">
            The four bolts on the pitch ram knuckle lack sufficient clamping capability to hold the hydraulic rod from rotating during turbine operation. When the rod backs out, it causes vibration. Complete disengagement leads to uncontrollable blade behavior and serious damage to the turbine.
          </p>
        </div>
        <div className="bg-slate-100 rounded-xl h-64 flex items-center justify-center text-slate-400 text-sm">
          Problem diagram
        </div>
      </section>

      {/* Solution */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="bg-slate-100 rounded-xl h-64 flex items-center justify-center text-slate-400 text-sm md:order-first">
          Ram Lock device
        </div>
        <div>
          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-4">
            The Solution
          </span>
          <h2 className="text-2xl font-bold text-[#0f2d5a] mb-4">
            The WindLOTO Ram Lock
          </h2>
          <p className="text-slate-600 leading-relaxed">
            The Ram Lock's slotted holes allow easy adjustment across an extended travel range. It fits the 70mm slotted portion of the rod, requiring a maximum of only a quarter turn for installation.
          </p>
        </div>
      </section>

      {/* Specs */}
      <section className="bg-[#0f2d5a] text-white rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Specifications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Material', value: '3/16" steel' },
            { label: 'Manufacturing', value: 'Laser cut, hydraulically bent, powder coated' },
            { label: 'Compatibility', value: '70mm slotted rod portion' },
            { label: 'Max Installation Rotation', value: '1/4 turn' },
            { label: 'Blade T/C Change (90°)', value: '~0.1°' },
            { label: 'Blade T/C Change (0°)', value: '~0.05°' },
            { label: 'Origin', value: 'Proudly made in the USA' },
          ].map((spec) => (
            <div key={spec.label} className="bg-white/10 rounded-lg p-4">
              <div className="text-white/60 text-xs uppercase tracking-wider mb-1">{spec.label}</div>
              <div className="font-semibold">{spec.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-[#0f2d5a] mb-3">Ready to protect your turbine?</h2>
        <p className="text-slate-500 mb-6">Free USPS Priority shipping on all US orders. Expedited options available.</p>
        <Link
          href="/products/ram-lock"
          className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold px-8 py-3 rounded transition-colors inline-block"
        >
          Order Ram Lock — $85.00
        </Link>
      </section>

    </div>
  )
}
