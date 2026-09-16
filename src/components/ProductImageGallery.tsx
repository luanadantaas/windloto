'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ShopifyImage {
  url: string
  altText?: string
}

export default function ProductImageGallery({ images, title }: { images: ShopifyImage[]; title: string }) {
  const [selected, setSelected] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
        No image
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden">
        <Image
          src={images[selected].url}
          alt={images[selected].altText ?? title}
          fill
          className="object-contain p-2 sm:p-4 transition-opacity duration-200"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelected((selected - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white hover:bg-[#0f2d5a] hover:text-white text-[#0f2d5a] rounded-full w-11 h-11 flex items-center justify-center shadow-md transition-colors text-xl font-bold"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              onClick={() => setSelected((selected + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-[#0f2d5a] hover:text-white text-[#0f2d5a] rounded-full w-11 h-11 flex items-center justify-center shadow-md transition-colors text-xl font-bold"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnails — only shown if more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${
                selected === i
                  ? 'border-[#f97316]'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `${title} ${i + 1}`}
                fill
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
