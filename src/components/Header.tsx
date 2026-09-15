'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/lib/cartStore'

const nav = [
  { label: 'Home', href: '/' },
  { label: 'Ram Lock', href: '/ram-lock' },
  { label: 'Rotor Lock', href: '/rotor-lock' },
  { label: 'Rotor Lock Comparison', href: '/rotor-lock-comparison' },
  { label: 'Store', href: '/store' },
  { label: 'Contact Us', href: '/contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const totalItems = useCartStore((s) => s.totalItems())

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
          <Link href="/cart" className="relative p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
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
