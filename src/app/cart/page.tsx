"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, itemsCount, subtotal } =
    useCart();

  const [pickupTime, setPickupTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Votre panier est vide");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          pickupTime: pickupTime || null,
          notes: notes || null,
        }),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        router.push(`/orders/${order.id}`);
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la commande");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tax = subtotal * 0.1; // TVA 10%
  const total = subtotal + tax;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-[#897561]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-[#f4f2f0] sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/menu" className="text-[#897561] hover:text-primary">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <span className="material-symbols-outlined text-3xl text-primary">
              shopping_cart
            </span>
            <h1 className="text-xl font-bold text-[#181411]">Mon Panier</h1>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-[#897561] mb-4">
                shopping_cart
              </span>
              <p className="text-xl text-[#897561] mb-4">
                Votre panier est vide
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined">storefront</span>
                Voir le menu
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[#181411]">
                      Articles ({items.length})
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Vider le panier
                    </button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 pb-4 border-b border-[#f4f2f0] last:border-0"
                      >
                        {/* Product Image */}
                        {item.image ? (
                          <div
                            className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url("${item.image}")` }}
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-gray-400">
                              image
                            </span>
                          </div>
                        )}

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-medium text-[#181411] mb-1">
                            {item.name}
                          </h3>
                          <p className="text-lg font-bold text-primary">
                            €{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-xs text-[#897561]">
                            €{item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#897561] hover:text-red-600"
                          >
                            <span className="material-symbols-outlined">
                              close
                            </span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200"
                            >
                              <span className="material-symbols-outlined text-sm">
                                remove
                              </span>
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded hover:bg-primary/90"
                            >
                              <span className="material-symbols-outlined text-sm">
                                add
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary & Form */}
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#181411] mb-4">
                    Récapitulatif
                  </h2>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-[#897561]">
                      <span>Sous-total</span>
                      <span>€{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[#897561]">
                      <span>TVA (10%)</span>
                      <span>€{tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#f4f2f0]">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#181411]">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        €{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Form */}
                <form
                  onSubmit={handleSubmitOrder}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <h2 className="text-lg font-bold text-[#181411] mb-4">
                    Informations de retrait
                  </h2>

                  {/* Pickup Time */}
                  <div className="mb-4">
                    <label
                      htmlFor="pickupTime"
                      className="block text-sm font-medium text-[#181411] mb-2"
                    >
                      Heure de retrait souhaitée (optionnel)
                    </label>
                    <input
                      type="time"
                      id="pickupTime"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-4 py-2 border border-[#e6e0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-[#897561] mt-1">
                      Laissez vide pour "Dès que possible"
                    </p>
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-[#181411] mb-2"
                    >
                      Remarques (optionnel)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-[#e6e0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Allergies, demandes spéciales..."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Commande en cours...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">
                          check_circle
                        </span>
                        Valider la commande
                      </>
                    )}
                  </button>

                  <p className="text-xs text-[#897561] text-center mt-4">
                    💳 Paiement à effectuer sur place lors du retrait
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
