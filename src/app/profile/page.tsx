'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated') {
      setName(session?.user?.name || '')
      setEmail(session?.user?.email || '')
    }
  }, [status, session, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Erreur lors de la mise à jour')
        return
      }

      toast.success('Profil mis à jour avec succès !')
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-[#897561]">Chargement...</p>
        </div>
      </div>
    )
  }

  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-[#f4f2f0] sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={isAdmin ? "/dashboard" : "/menu"} 
              className="text-primary hover:text-primary/80"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </Link>
            <span className="material-symbols-outlined text-3xl text-primary">person</span>
            <h1 className="text-xl font-bold text-[#181411]">Mon profil</h1>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#f4f2f0]">
              <h2 className="text-lg font-bold text-[#181411]">Informations personnelles</h2>
              <p className="text-sm text-[#897561] mt-1">Gérez vos informations de profil</p>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
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
                <label className="block text-sm font-medium text-[#181411] mb-2">
                  Rôle
                </label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg">
                  <span className="material-symbols-outlined text-primary">
                    {isAdmin ? 'admin_panel_settings' : 'person'}
                  </span>
                  <span className="text-[#181411] font-medium">
                    {isAdmin ? 'Administrateur' : 'Client'}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary text-white rounded-lg py-3 font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Actions */}
          <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#f4f2f0]">
              <h2 className="text-lg font-bold text-[#181411]">Actions du compte</h2>
              <p className="text-sm text-[#897561] mt-1">Gérez votre compte</p>
            </div>

            <div className="p-6 space-y-4">
              <Link
                href={isAdmin ? "/dashboard" : "/orders"}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="material-symbols-outlined text-primary">
                  {isAdmin ? 'dashboard' : 'receipt_long'}
                </span>
                <div>
                  <p className="font-medium text-[#181411]">
                    {isAdmin ? 'Tableau de bord' : 'Mes commandes'}
                  </p>
                  <p className="text-sm text-[#897561]">
                    {isAdmin ? 'Gérer la boulangerie' : 'Voir l\'historique des commandes'}
                  </p>
                </div>
              </Link>

              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-red-50 transition-colors text-red-600"
              >
                <span className="material-symbols-outlined">logout</span>
                <div className="text-left">
                  <p className="font-medium">Se déconnecter</p>
                  <p className="text-sm opacity-75">Fermer votre session</p>
                </div>
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="mt-6 text-center text-sm text-[#897561]">
            <p>Boulangerie App v1.0.0</p>
            <p>© 2024 Boulangerie. Tous droits réservés.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
