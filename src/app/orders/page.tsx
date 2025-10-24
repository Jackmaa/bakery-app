"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  tax: number;
  pickupTime: string | null;
  qrCode: string | null;
  qrCodeScanned: boolean;
  qrCodeScannedAt: string | null;
  createdAt: string;
  items: OrderItem[];
  user: {
    name: string | null;
    email: string;
  };
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  PENDING: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: "schedule",
  },
  PREPARING: {
    label: "En préparation",
    color: "bg-blue-100 text-blue-800",
    icon: "cooking",
  },
  READY: {
    label: "Prêt",
    color: "bg-green-100 text-green-800",
    icon: "check_circle",
  },
  COMPLETED: {
    label: "Récupéré",
    color: "bg-gray-100 text-gray-800",
    icon: "done_all",
  },
  CANCELLED: {
    label: "Annulé",
    color: "bg-red-100 text-red-800",
    icon: "cancel",
  },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (status === "loading" || isLoading) {
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
      <header className="bg-white border-b border-[#f4f2f0]">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/menu" className="text-[#897561] hover:text-primary">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <span className="material-symbols-outlined text-3xl text-primary">
              receipt_long
            </span>
            <h1 className="text-xl font-bold text-[#181411]">Mes commandes</h1>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <span className="material-symbols-outlined text-6xl text-[#897561] mb-4">
                shopping_bag
              </span>
              <h2 className="text-xl font-bold text-[#181411] mb-2">
                Aucune commande
              </h2>
              <p className="text-[#897561] mb-6">
                Vous n'avez pas encore passé de commande
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
            <div className="space-y-4">
              {orders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status];
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[#181411]">
                          Commande #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-[#897561]">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
                      >
                        <span className="material-symbols-outlined text-sm mr-1 align-middle">
                          {statusConfig.icon}
                        </span>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-[#897561]">Articles</p>
                          <p className="font-medium text-[#181411]">
                            {order.items.length} produit
                            {order.items.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#897561]">Total</p>
                          <p className="font-bold text-primary">
                            €{order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[#897561]">
                        chevron_right
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
