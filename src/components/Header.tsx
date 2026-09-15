'use client'

import Link from 'next/link'
import { useState } from 'react'

const nav = [
  { label: 'Home', href: '/' },
  { label: 'Ram Lock', href: '/products/ram-lock' },
  { label: 'Rotor Lock', href: '/products/rotor-lock' },
  { label: 'Store', href: '/store' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-[#0f2d5a] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#f97316] font-bold text-xl tracking-tight">WIND</span>
          <span className="font-bold text-xl tracking-tight">LOTO</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/80 hover:text-[#f97316] transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/store"
            className="bg-[#f97316] hover:bg-[#ea6c0a] text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
          >
            Shop Now
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white mb-1" />
          <div className="w-5 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden bg-[#0a1f3f] px-4 pb-4 flex flex-col gap-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/80 hover:text-[#f97316] py-1 transition-colors"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
