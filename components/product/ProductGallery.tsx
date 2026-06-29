'use client'
import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps { images: string[]; name: string }

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-light">
        <Image src={images[selected] ?? ''} alt={name} fill className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                selected === i ? 'border-red' : 'border-transparent hover:border-sand'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
