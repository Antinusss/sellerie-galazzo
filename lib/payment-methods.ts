export interface PaymentMethod {
  id: string
  label: string
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'visa', label: 'VISA' },
  { id: 'mastercard', label: 'Mastercard' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'amex', label: 'Amex' },
  { id: 'maestro', label: 'Maestro' },
  { id: 'klarna', label: 'Klarna' },
  { id: 'applepay', label: 'Apple Pay' },
  { id: 'googlepay', label: 'Google Pay' },
]
