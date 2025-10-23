"use client";

import Link from "next/link";
import CartItem from "@/components/CartItem";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, total } =
    useCart();

  return (
    <div className="min-h-screen bg-[#f8f6f4]">
      {/* Header */}
      <header className="bg-white border-b border-[#e6e0db] sticky top-0 z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-3xl text-primary">
                arrow_back
              </span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-primary">
                  bakery_dining
                </span>
                <h1 className="text-xl font-bold text-[#181411]">Mon Panier</h1>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Liste des articles */}
          <div className="flex-1">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#181411]">
                  Mon panier
                  <span className="ml-2 text-base font-normal text-[#897561]">
                    ({items.length} {items.length > 1 ? "articles" : "article"})
                  </span>
                </h2>
                {items.length > 0 && (
                  <button
                    onClick={() => clearCart()}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Vider le panier
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-[#897561] mb-4">
                    shopping_cart
                  </span>
                  <p className="text-lg text-[#897561] mb-6">
                    Votre panier est vide
                  </p>
                  <Link
                    href="/menu"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      storefront
                    </span>
                    Découvrir nos produits
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      {...item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Récapitulatif */}
          {items.length > 0 && (
            <div className="lg:w-96">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold text-[#181411] mb-4">
                  Récapitulatif
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#897561]">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="border-t border-[#e6e0db] pt-3">
                    <div className="flex justify-between text-lg font-bold text-[#181411]">
                      <span>Total</span>
                      <span>{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors mb-3"
                >
                  <span className="material-symbols-outlined">
                    shopping_bag
                  </span>
                  Passer commande
                </Link>

                <Link
                  href="/menu"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-[#e6e0db] text-[#181411] rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  <span className="material-symbols-outlined">add</span>
                  Continuer mes achats
                </Link>

                {/* Avantages */}
                <div className="mt-6 pt-6 border-t border-[#e6e0db] space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary">
                      check_circle
                    </span>
                    <p className="text-sm text-[#897561]">Paiement sécurisé</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary">
                      check_circle
                    </span>
                    <p className="text-sm text-[#897561]">Retrait en magasin</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary">
                      check_circle
                    </span>
                    <p className="text-sm text-[#897561]">
                      Produits frais du jour
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
