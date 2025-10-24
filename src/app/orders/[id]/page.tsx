"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";

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

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && orderId) {
      fetchOrder();
    }
  }, [status, orderId]);

  useEffect(() => {
    if (order?.orderNumber) {
      generateQRCode(order.orderNumber);
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        router.push("/orders");
      }
    } catch (error) {
      console.error("Erreur:", error);
      router.push("/orders");
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async (orderNumber: string) => {
    try {
      const url = await QRCode.toDataURL(orderNumber, {
        width: 300,
        margin: 2,
        color: {
          dark: "#181411",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Erreur génération QR Code:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
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

  if (!order) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-[#f4f2f0]">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/orders" className="text-[#897561] hover:text-primary">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#181411]">
                Commande #{order.orderNumber}
              </h1>
              <p className="text-sm text-[#897561]">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${statusConfig.color}`}
          >
            <span className="material-symbols-outlined text-sm mr-1 align-middle">
              {statusConfig.icon}
            </span>
            {statusConfig.label}
          </span>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* QR Code Section */}
          {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <h2 className="text-lg font-bold text-[#181411] mb-2">
                Code de retrait
              </h2>
              <p className="text-sm text-[#897561] mb-4">
                Présentez ce QR code lors du retrait de votre commande
              </p>

              {qrCodeUrl && (
                <div className="inline-block p-4 bg-white border-2 border-[#e6e0db] rounded-xl">
                  <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                </div>
              )}

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-[#897561]">Numéro de commande</p>
                <p className="text-2xl font-bold text-[#181411] font-mono tracking-wider">
                  {order.orderNumber}
                </p>
              </div>
            </div>
          )}

          {/* Order Status Info */}
          {order.status === "COMPLETED" && order.qrCodeScannedAt && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600 text-3xl">
                  check_circle
                </span>
                <div>
                  <p className="font-medium text-green-900">
                    Commande récupérée
                  </p>
                  <p className="text-sm text-green-700">
                    Le {formatDate(order.qrCodeScannedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {order.status === "READY" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600 text-3xl">
                  notifications_active
                </span>
                <div>
                  <p className="font-medium text-green-900">
                    Votre commande est prête !
                  </p>
                  <p className="text-sm text-green-700">
                    Vous pouvez venir la récupérer
                  </p>
                </div>
              </div>
            </div>
          )}

          {order.status === "PREPARING" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 text-3xl">
                  cooking
                </span>
                <div>
                  <p className="font-medium text-blue-900">
                    Commande en préparation
                  </p>
                  <p className="text-sm text-blue-700">
                    Nous préparons votre commande avec soin
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pickup Time */}
          {order.pickupTime && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  schedule
                </span>
                <div>
                  <p className="text-sm text-[#897561]">
                    Heure de retrait souhaitée
                  </p>
                  <p className="font-medium text-[#181411]">
                    {formatTime(order.pickupTime)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#181411] mb-4">
              Articles commandés
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-[#f4f2f0] last:border-0"
                >
                  {item.product.image ? (
                    <div
                      className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                      style={{
                        backgroundImage: `url("${item.product.image}")`,
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-gray-400">
                        image
                      </span>
                    </div>
                  )}

                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#181411]">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-[#897561]">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-primary">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#181411] mb-4">
              Récapitulatif
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between text-[#897561]">
                <span>Sous-total</span>
                <span>€{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#897561]">
                <span>TVA (10%)</span>
                <span>€{order.tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#f4f2f0]">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#181411]">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    €{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-[#897561]">
                💳 Paiement sur place lors du retrait
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/orders"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-[#181411] rounded-lg hover:bg-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              Mes commandes
            </Link>
            <Link
              href="/menu"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined">storefront</span>
              Nouvelle commande
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
