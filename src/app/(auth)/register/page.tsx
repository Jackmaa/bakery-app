'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de l\'inscription')
        return
      }

      toast.success('Compte créé avec succès !')
      router.push('/login')
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-4xl">bakery_dining</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#181411]">Créer un compte</h1>
          <p className="text-[#897561] mt-2">Rejoignez-nous dès aujourd'hui</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#181411] mb-2">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e6e0db] bg-white px-4 py-3 text-[#181411] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#181411] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e6e0db] bg-white px-4 py-3 text-[#181411] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#181411] mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-[#e6e0db] bg-white px-4 py-3 text-[#181411] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
            <p className="text-xs text-[#897561] mt-1">Minimum 6 caractères</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white rounded-lg py-3 font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#897561]">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
