import { PAYMENT_METHODS } from '@/lib/payment-methods'

const STYLES: Record<string, string> = {
  visa: 'bg-[#1A1F71] text-white',
  mastercard: 'bg-black text-white',
  paypal: 'bg-[#003087] text-white',
  amex: 'bg-[#006FCF] text-white',
  maestro: 'bg-[#0099DF] text-white',
  klarna: 'bg-[#FFB3C7] text-black',
  applepay: 'bg-zinc-800 text-white',
  googlepay: 'bg-white text-black border border-gray-200',
}

interface PaymentBadgesProps { methods: string[] }

export default function PaymentBadges({ methods }: PaymentBadgesProps) {
  const items = PAYMENT_METHODS.filter(m => methods.includes(m.id))
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(m => (
        <span key={m.id} className={`${STYLES[m.id]} text-xs font-bold px-3 py-1.5 rounded-md`}>
          {m.label}
        </span>
      ))}
    </div>
  )
}
