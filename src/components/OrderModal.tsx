"use client";

import { useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Product {
  id: string;
  name: string;
  image: string | null;
  price: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  tax: number;
  qrCode: string | null;
  qrCodeScanned: boolean;
  qrCodeScannedAt: string | null;
  pickupTime: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
  items: OrderItem[];
}

interface OrderModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: "schedule",
  },
  PREPARING: {
    label: "En préparation",
    color: "bg-blue-100 text-blue-800",
    icon: "restaurant",
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

export default function OrderModal({
  order,
  onClose,
  onStatusChange,
}: OrderModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

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

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 500);
  };

  const handleStatusChangeInternal = async (newStatus: string) => {
    await onStatusChange(order.id, newStatus);
    onClose();
  };

  const getNextStatusAction = () => {
    switch (order.status) {
      case "PENDING":
        return {
          status: "PREPARING",
          label: "Commencer la préparation",
          color: "bg-blue-600",
        };
      case "PREPARING":
        return {
          status: "READY",
          label: "Marquer comme prêt",
          color: "bg-green-600",
        };
      case "READY":
        return {
          status: "COMPLETED",
          label: "Marquer comme récupéré",
          color: "bg-gray-600",
        };
      default:
        return null;
    }
  };

  const nextAction = getNextStatusAction();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#f4f2f0] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#181411]">
              Commande #{order.orderNumber}
            </h2>
            <p className="text-sm text-[#897561]">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#897561] hover:text-[#181411] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-[#897561] mb-1">Statut actuel</p>
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]
                    .color
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {
                    STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]
                      .icon
                  }
                </span>
                {
                  STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]
                    .label
                }
              </span>
            </div>

            {order.qrCodeScanned && order.qrCodeScannedAt && (
              <div className="text-right">
                <p className="text-sm text-[#897561] mb-1">QR Code scanné</p>
                <p className="text-sm font-medium text-purple-600">
                  {formatDate(order.qrCodeScannedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-bold text-[#181411] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                person
              </span>
              Informations client
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#897561]">Nom</span>
                <span className="text-sm font-medium text-[#181411]">
                  {order.user.name || "Non renseigné"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#897561]">Email</span>
                <span className="text-sm font-medium text-[#181411]">
                  {order.user.email}
                </span>
              </div>
              {order.pickupTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#897561]">
                    Heure de retrait souhaitée
                  </span>
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      alarm
                    </span>
                    {formatDate(order.pickupTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-bold text-[#181411] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                shopping_bag
              </span>
              Articles commandés
            </h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
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

                  <div className="flex-1">
                    <h4 className="font-medium text-[#181411]">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-[#897561]">
                      Quantité: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-[#897561]">
                      {item.quantity} × €{item.price.toFixed(2)}
                    </p>
                    <p className="font-bold text-[#181411]">
                      €{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <h3 className="text-sm font-bold text-[#181411] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                euro
              </span>
              Résumé du paiement
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#897561]">Sous-total</span>
                <span className="font-medium text-[#181411]">
                  €{order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#897561]">TVA</span>
                <span className="font-medium text-[#181411]">
                  €{order.tax.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#e6e0db]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#181411]">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    €{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {order.qrCode && (
            <div>
              <h3 className="text-sm font-bold text-[#181411] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  qr_code
                </span>
                QR Code de retrait
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                <img src={order.qrCode} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#f4f2f0]">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[#e6e0db] text-[#897561] rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined">print</span>
              Imprimer
            </button>

            {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
              <>
                {nextAction && (
                  <button
                    onClick={() =>
                      handleStatusChangeInternal(nextAction.status)
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 ${nextAction.color} text-white rounded-lg hover:opacity-90 transition-opacity`}
                  >
                    <span className="material-symbols-outlined">
                      {
                        STATUS_CONFIG[
                          nextAction.status as keyof typeof STATUS_CONFIG
                        ].icon
                      }
                    </span>
                    {nextAction.label}
                  </button>
                )}

                {(order.status === "PENDING" ||
                  order.status === "PREPARING") && (
                  <button
                    onClick={() => handleStatusChangeInternal("CANCELLED")}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
