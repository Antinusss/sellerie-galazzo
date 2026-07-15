'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuthStore()
  const router = useRouter()

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sand transition-colors"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email, password)
    router.push('/account')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-3xl font-black mb-8 text-center">
        Accedi al tuo <em className="text-red">account</em>
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input type="email" required autoComplete="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
        <input type="password" required autoComplete="current-password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
        <button type="submit" className="w-full bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors">
          Accedi
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-6">
        Non hai un account? <Link href="/account/register" className="text-red font-semibold hover:text-red-dark">Registrati</Link>
      </p>
    </div>
  )
}
