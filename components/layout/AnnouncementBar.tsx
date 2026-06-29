'use client'

export default function AnnouncementBar() {
  const items = [
    '🚚 Spedizione gratuita su ordini superiori a €80',
    '↩️ Reso garantito al 100%',
    '🕐 Supporto clienti 24/7',
    '⭐ Oltre 10.000 cavalieri soddisfatti',
  ]
  const repeated = [...items, ...items]
  return (
    <div className="bg-black text-white text-xs py-2 overflow-hidden">
      <div className="flex whitespace-nowrap marquee">
        {repeated.map((item, i) => (
          <span key={i} className="mx-8">{item}</span>
        ))}
      </div>
    </div>
  )
}
