import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0a1f3f] text-white/60 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-1 mb-3">
            <span className="text-[#f97316] font-bold text-lg">WIND</span>
            <span className="font-bold text-lg text-white">LOTO</span>
          </div>
          <p className="text-sm leading-relaxed">
            Precision locking devices for wind turbine maintenance. Reducing downtime, protecting assets.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Products</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products/ram-lock" className="hover:text-[#f97316] transition-colors">Ram Lock</Link></li>
            <li><Link href="/products/rotor-lock" className="hover:text-[#f97316] transition-colors">Rotor Lock</Link></li>
            <li><Link href="/store" className="hover:text-[#f97316] transition-colors">All Products</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact" className="hover:text-[#f97316] transition-colors">Contact Us</Link></li>
            <li>
              <a
                href="https://windloto.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#f97316] transition-colors"
              >
                windloto.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs py-4">
        © {new Date().getFullYear()} WindLOTO. All rights reserved.
      </div>
    </footer>
  )
}
