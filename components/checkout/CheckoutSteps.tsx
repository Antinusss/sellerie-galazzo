interface CheckoutStepsProps { currentStep: 1 | 2 | 3 }

const STEPS = ['Contatti', 'Spedizione', 'Pagamento'] as const

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const n = (i + 1) as 1 | 2 | 3
        const done = currentStep > n
        const active = currentStep === n
        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                done ? 'bg-green-600 text-white' : active ? 'bg-red text-white' : 'bg-gray-light text-gray-400'
              }`}>
                {done ? '✓' : n}
              </div>
              <span className={`text-sm font-semibold hidden sm:block ${active ? 'text-black' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-3 ${currentStep > n ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
