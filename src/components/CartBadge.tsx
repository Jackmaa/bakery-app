'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function CartBadge() {
  const { itemsCount } = useCart()

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
      title="Voir mon panier"
    >
      <span className="material-symbols-outlined text-2xl text-[#181411]">shopping_cart</span>
      {itemsCount > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 bg-primary text-white text-xs font-bold rounded-full">
          {itemsCount > 99 ? '99+' : itemsCount}
        </span>
      )}
    </Link>
  )
}
