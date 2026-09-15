import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rotor Lock Comparison — WindLOTO',
  description: 'See how the WindLOTO Rotor Lock compares to competitor devices. Smaller, easier to use, and OSHA compliant.',
}

export default function RotorLockComparisonPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">

      {/* Hero */}
      <div className="text-center">
        <span className="inline-block bg-[#f97316]/10 text-[#f97316] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded mb-4">
          Rotor Lock Comparison
        </span>
        <h1 className="text-4xl font-bold text-[#0f2d5a] mb-4">
          No other device comes close
        </h1>
        <p className="text-slate-500 text-lg max-w-3xl mx-auto">
          No other device on the market is as small, easy to use, and — most importantly — provides a lockout solution that can securely lock the selector valve in the 45° position, maintaining a safe OSHA-compliant work area.
        </p>
      </div>

      {/* Comparison table */}
      <section>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[#0f2d5a]">
                <th className="text-left py-3 pr-6 text-slate-500 font-medium">Feature</th>
                <th className="py-3 px-6 text-center">
                  <div className="text-[#0f2d5a] font-bold text-base">WindLOTO</div>
                  <div className="text-[#f97316] text-xs font-semibold">Rotor Lock</div>
                </th>
                <th className="py-3 px-6 text-center text-slate-400 font-medium">Competitor Devices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { feature: 'Size', windloto: 'Compact & lightweight', competitor: 'Bulky' },
                { feature: 'Ease of installation', windloto: 'Quick and simple', competitor: 'Difficult or time-consuming' },
                { feature: 'Locks valve at 45°', windloto: '✓ Securely locks', competitor: 'Does not effectively lockout' },
                { feature: 'OSHA compliant', windloto: '✓ 1910.269(d) and 1910.147', competitor: 'Varies' },
                { feature: 'Technician adoption', windloto: 'High — comfortable to use', competitor: 'Low — often skipped' },
                { feature: 'US Patented', windloto: '✓ Patent #8720479', competitor: '—' },
                { feature: 'Made in USA', windloto: '✓', competitor: 'Varies' },
              ].map((row) => (
                <tr key={row.feature}>
                  <td className="py-3 pr-6 text-slate-600 font-medium">{row.feature}</td>
                  <td className="py-3 px-6 text-center">
                    <span className="inline-block bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                      {row.windloto}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center text-slate-400 text-xs">{row.competitor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* For technicians */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0f2d5a] text-white rounded-2xl p-8">
          <div className="text-2xl mb-3">👷</div>
          <h3 className="text-xl font-bold mb-3">For Technicians</h3>
          <p className="text-white/70 leading-relaxed">
            As a technician, you'll feel comfortable with the protection the WindLOTO Rotor Lock provides. It's small enough to carry, fast to install, and gives you confidence that the valve is locked in position while you're in the hub.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
          <div className="text-2xl mb-3">📋</div>
          <h3 className="text-xl font-bold text-[#0f2d5a] mb-3">For Managers</h3>
          <p className="text-slate-600 leading-relaxed">
            Competitor devices are bulky, difficult or time-consuming to install, or do not effectively lockout the valve — which means technicians often skip using them. The WindLOTO Rotor Lock gets used because it's easy to use. Higher adoption means a safer team.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f97316] rounded-2xl p-10 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Made in the USA</h2>
        <p className="text-white/80 mb-6">The WindLOTO Rotor Lock. Trusted by wind turbine operators across the country.</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/products/rotor-lock"
            className="bg-white text-[#f97316] font-semibold px-6 py-3 rounded hover:bg-orange-50 transition-colors"
          >
            Order Rotor Lock
          </Link>
          <Link
            href="/rotor-lock"
            className="border border-white text-white font-semibold px-6 py-3 rounded hover:bg-white/10 transition-colors"
          >
            Product Details
          </Link>
        </div>
      </section>

    </div>
  )
}
