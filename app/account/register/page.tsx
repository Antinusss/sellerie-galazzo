'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { register } = useAuthStore()
  const router = useRouter()

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sand transition-colors"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register(nome, cognome, email, password)
    router.push('/account')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-3xl font-black mb-8 text-center">
        Crea il tuo <em className="text-red">account</em>
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <input required autoComplete="given-name" placeholder="Nome *" value={nome} onChange={e => setNome(e.target.value)} className={inputClass} />
          <input required autoComplete="family-name" placeholder="Cognome *" value={cognome} onChange={e => setCognome(e.target.value)} className={inputClass} />
        </div>
        <input type="email" required autoComplete="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        <input type="password" required autoComplete="new-password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
        <button type="submit" className="w-full bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors">
          Crea account
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-6">
        Hai già un account? <Link href="/account/login" className="text-red font-semibold hover:text-red-dark">Accedi</Link>
      </p>
    </div>
  )
}
