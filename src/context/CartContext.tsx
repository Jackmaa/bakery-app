'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemsCount: number
  subtotal: number
  deliveryFee: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem('bakery-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error)
      }
    }
  }, [])

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('bakery-cart', JSON.stringify(items))
  }, [items])

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === newItem.id)
      
      if (existingItem) {
        // Si l'article existe déjà, augmenter la quantité
        return currentItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Sinon, ajouter le nouvel article avec quantité 1
        return [...currentItems, { ...newItem, quantity: 1 }]
      }
    })
  }

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  // Calculs
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= 20 ? 0 : 2.50
  const total = subtotal + deliveryFee

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemsCount,
        subtotal,
        deliveryFee,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart doit être utilisé dans un CartProvider')
  }
  return context
}
