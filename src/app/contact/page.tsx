'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

function ContactForm({ region }: { region: 'us' | 'international' }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    // TODO: wire to email provider (e.g. Resend, Formspree, or Shopify contact API)
    await new Promise((r) => setTimeout(r, 1000))
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="font-bold text-[#0f2d5a] text-lg mb-2">Message sent!</h3>
        <p className="text-slate-500 text-sm">We'll get back to you as soon as possible.</p>
        <button onClick={() => setStatus('idle')} className="mt-4 text-[#f97316] text-sm hover:underline">
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
          <input
            name="firstName"
            required
            value={form.firstName}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d5a] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
          <input
            name="lastName"
            required
            value={form.lastName}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d5a] focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d5a] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
        <textarea
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d5a] focus:border-transparent resize-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-[#0f2d5a] hover:bg-[#0a1f3f] disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#0f2d5a] mb-3">Contact Us</h1>
        <p className="text-slate-500">
          Questions about our products or orders? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* US & Canada */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🇺🇸</span>
            <div>
              <h2 className="font-bold text-[#0f2d5a] text-lg">U.S. and Canada Orders</h2>
              <p className="text-slate-500 text-sm">Contact WindLOTO directly</p>
            </div>
          </div>
          <ContactForm region="us" />
        </div>

        {/* Europe & South America */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🌍</span>
            <div>
              <h2 className="font-bold text-[#0f2d5a] text-lg">European & South American Orders</h2>
              <p className="text-slate-500 text-sm">Handled by our distributor Sister-Soft</p>
            </div>
          </div>
          <ContactForm region="international" />
        </div>

      </div>

      {/* Info bar */}
      <div className="mt-12 bg-[#0f2d5a] text-white rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-2xl mb-2">📦</div>
          <div className="font-semibold text-sm">Free US Shipping</div>
          <div className="text-white/60 text-xs mt-1">USPS Priority on all US orders</div>
        </div>
        <div>
          <div className="text-2xl mb-2">🇺🇸</div>
          <div className="font-semibold text-sm">Made in the USA</div>
          <div className="text-white/60 text-xs mt-1">All products manufactured domestically</div>
        </div>
        <div>
          <div className="text-2xl mb-2">🌎</div>
          <div className="font-semibold text-sm">International Distribution</div>
          <div className="text-white/60 text-xs mt-1">Europe & South America via Sister-Soft</div>
        </div>
      </div>
    </div>
  )
}
