'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  subtotal: number
  tax: number
  qrCodeScanned: boolean
  qrCodeScannedAt: string | null
  pickupTime: string | null
  createdAt: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated' && (session?.user as any)?.role === 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role !== 'ADMIN') {
      fetchOrders()
    }
  }, [status, session])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Erreur lors du chargement des commandes')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PREPARING':
        return 'bg-orange-100 text-orange-800'
      case 'READY':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente'
      case 'CONFIRMED':
        return 'Confirmée'
      case 'PREPARING':
        return 'En préparation'
      case 'READY':
        return 'Prête'
      case 'COMPLETED':
        return 'Terminée'
      case 'CANCELLED':
        return 'Annulée'
      default:
        return status
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-[#897561]">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-[#f4f2f0] sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/menu" className="text-primary hover:text-primary/80">
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </Link>
            <span className="material-symbols-outlined text-3xl text-primary">receipt_long</span>
            <h1 className="text-xl font-bold text-[#181411]">Mes commandes</h1>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-[#897561] mb-4">receipt_long</span>
              <h2 className="text-xl font-bold text-[#181411] mb-2">Aucune commande</h2>
              <p className="text-[#897561] mb-6">Vous n'avez pas encore passé de commande.</p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                Commander maintenant
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-[#f4f2f0]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#181411]">Commande #{order.orderNumber}</h3>
                        <p className="text-sm text-[#897561]">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-lg font-bold text-primary mt-1">€{order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    {order.pickupTime && (
                      <div className="flex items-center gap-2 text-sm text-[#897561] mb-4">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>Retrait prévu : {new Date(order.pickupTime).toLocaleDateString('fr-FR')} à {new Date(order.pickupTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}

                    {order.qrCodeScanned && (
                      <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>QR Code scanné le {new Date(order.qrCodeScannedAt!).toLocaleDateString('fr-FR')} à {new Date(order.qrCodeScannedAt!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h4 className="font-medium text-[#181411] mb-3">Articles commandés</h4>
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 bg-cover bg-center rounded"
                            style={{ backgroundImage: `url("${item.product.image}")` }}
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-[#181411]">{item.product.name}</h5>
                            <p className="text-sm text-[#897561]">Quantité: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#181411]">€{item.price.toFixed(2)}</p>
                            <p className="text-sm text-[#897561]">× {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#f4f2f0]">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#897561]">Sous-total</span>
                        <span>€{order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#897561]">TVA</span>
                        <span>€{order.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">€{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
