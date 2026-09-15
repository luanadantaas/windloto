import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-[#0f2d5a] text-white">
      <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <span className="inline-block bg-[#f97316]/20 text-[#f97316] text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded mb-4">
            Wind Turbine Safety
          </span>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Precision Locking Devices for Wind Turbine Maintenance
          </h1>
          <p className="text-white/70 text-lg mb-8 max-w-lg">
            WindLOTO manufactures the Ram Lock and Rotor Lock — engineered to prevent unscheduled downtime and protect your turbine assets during maintenance operations.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/store"
              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-semibold px-6 py-3 rounded transition-colors"
            >
              Shop Products
            </Link>
            <Link
              href="/contact"
              className="border border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-sm">
          {[
            { value: 'Ram Lock', label: 'Prevents pitch ram rod back-out' },
            { value: 'Rotor Lock', label: 'Secures rotor during maintenance' },
            { value: '↓ Downtime', label: 'Reduces unscheduled outages' },
            { value: 'B2B Ready', label: 'For turbine operators & OEMs' },
          ].map((stat) => (
            <div key={stat.value} className="bg-white/10 rounded-lg p-5">
              <div className="text-[#f97316] font-bold text-lg mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
