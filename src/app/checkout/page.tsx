"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, clearCart, subtotal, total } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f8f6f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-[#897561]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la commande");
      }

      const order = await response.json();
      clearCart();
      router.push(`/orders?success=${order.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f4]">
      {/* Header */}
      <header className="bg-white border-b border-[#e6e0db] sticky top-0 z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/cart"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined text-3xl text-primary">
                arrow_back
              </span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-primary">
                  shopping_bag
                </span>
                <h1 className="text-xl font-bold text-[#181411]">Finaliser la commande</h1>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations de retrait */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#181411] mb-6">
              Informations de retrait
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">
                  storefront
                </span>
                <div>
                  <h3 className="font-semibold text-[#181411]">Retrait en magasin</h3>
                  <p className="text-sm text-[#897561]">
                    Votre commande sera prête dans environ 25 minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">
                  qr_code
                </span>
                <div>
                  <h3 className="font-semibold text-[#181411]">QR Code de retrait</h3>
                  <p className="text-sm text-[#897561]">
                    Vous recevrez un QR code par email à présenter lors du retrait
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">
                  schedule
                </span>
                <div>
                  <h3 className="font-semibold text-[#181411]">Horaires d'ouverture</h3>
                  <p className="text-sm text-[#897561]">
                    Lundi - Vendredi: 7h00 - 19h00<br />
                    Samedi: 7h00 - 18h00<br />
                    Dimanche: 8h00 - 17h00
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Récapitulatif */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-[#181411] mb-6">
              Récapitulatif
            </h2>

            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 bg-cover bg-center rounded-lg"
                      style={{ backgroundImage: `url("${item.image}")` }}
                    />
                    <div>
                      <p className="font-medium text-[#181411]">{item.name}</p>
                      <p className="text-sm text-[#897561]">
                        {item.quantity} × {item.price.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-[#181411]">
                    {(item.price * item.quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#e6e0db] pt-4">
              <div className="flex justify-between text-lg font-bold text-[#181411]">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Traitement...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  Confirmer la commande
                </>
              )}
            </button>

            <Link
              href="/cart"
              className="w-full mt-3 flex items-center justify-center gap-2 px-6 py-3 border border-[#e6e0db] text-[#181411] rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Retour au panier
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
