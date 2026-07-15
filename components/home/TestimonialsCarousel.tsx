'use client'
import { useEffect, useState } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import products from '@/data/products.json'
import type { Product } from '@/lib/types'
import { getReviewSummary } from '@/lib/reviews'

const testimonials = [...(products as Product[])]
  .sort((a, b) => getReviewSummary(b.id).count - getReviewSummary(a.id).count)
  .slice(0, 8)
  .map(p => getReviewSummary(p.id).reviews[0])

export default function TestimonialsCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const testimonial = testimonials[index]

  const prev = () => setIndex(i => (i - 1 + testimonials.length) % testimonials.length)
  const next = () => setIndex(i => (i + 1) % testimonials.length)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-black mb-10">
          Cosa dicono i nostri <em className="text-red">cavalieri</em>
        </h2>
        <div className="flex items-center justify-between gap-4">
          <button onClick={prev} className="p-2 rounded-full border-2 border-gray-200 hover:border-red hover:text-red transition-colors shrink-0">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-center gap-0.5 mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={18} className={i < Math.round(testimonial.rating) ? 'fill-sand text-sand' : 'text-gray-200'} />
              ))}
            </div>
            <p className="text-lg text-gray-700 mb-4">&ldquo;{testimonial.text}&rdquo;</p>
            <p className="font-bold">{testimonial.author}</p>
            <p className="text-sm text-gray-400">{testimonial.date}</p>
          </div>
          <button onClick={next} className="p-2 rounded-full border-2 border-gray-200 hover:border-red hover:text-red transition-colors shrink-0">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
