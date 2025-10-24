"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OrderModal from "@/components/OrderModal";

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

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statuses = [
    "all",
    "PENDING",
    "PREPARING",
    "READY",
    "COMPLETED",
    "CANCELLED",
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (
      status === "authenticated" &&
      (session?.user as any)?.role !== "ADMIN"
    ) {
      router.push("/menu");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    if (
      status === "authenticated" &&
      (session?.user as any)?.role === "ADMIN"
    ) {
      fetchOrders();
    }
  }, [status, session]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, selectedStatus, orders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Sort by date (most recent first)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));
      } else {
        alert("Erreur lors de la mise à jour du statut");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour du statut");
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getStatusStats = () => {
    return {
      pending: orders.filter((o) => o.status === "PENDING").length,
      preparing: orders.filter((o) => o.status === "PREPARING").length,
      ready: orders.filter((o) => o.status === "READY").length,
      completed: orders.filter((o) => o.status === "COMPLETED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    };
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

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-[#f4f2f0] sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-[#897561] hover:text-primary"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <span className="material-symbols-outlined text-3xl text-primary">
              receipt_long
            </span>
            <h1 className="text-xl font-bold text-[#181411]">
              Gestion des commandes
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#897561]">
              {filteredOrders.length} commande
              {filteredOrders.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-yellow-600">
                  schedule
                </span>
                <p className="text-xs text-[#897561]">En attente</p>
              </div>
              <p className="text-2xl font-bold text-[#181411]">
                {stats.pending}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-blue-600">
                  restaurant
                </span>
                <p className="text-xs text-[#897561]">En préparation</p>
              </div>
              <p className="text-2xl font-bold text-[#181411]">
                {stats.preparing}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-green-600">
                  check_circle
                </span>
                <p className="text-xs text-[#897561]">Prêt</p>
              </div>
              <p className="text-2xl font-bold text-[#181411]">{stats.ready}</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-gray-600">
                  done_all
                </span>
                <p className="text-xs text-[#897561]">Récupéré</p>
              </div>
              <p className="text-2xl font-bold text-[#181411]">
                {stats.completed}
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-red-600">
                  cancel
                </span>
                <p className="text-xs text-[#897561]">Annulé</p>
              </div>
              <p className="text-2xl font-bold text-[#181411]">
                {stats.cancelled}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#897561]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher par n° de commande, nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#e6e0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap">
                {statuses.map((statusKey) => (
                  <button
                    key={statusKey}
                    onClick={() => setSelectedStatus(statusKey)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                      selectedStatus === statusKey
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-[#897561] hover:bg-gray-200"
                    }`}
                  >
                    {statusKey === "all"
                      ? "Tous"
                      : STATUS_CONFIG[statusKey as keyof typeof STATUS_CONFIG]
                          .label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-[#897561] mb-4">
                receipt_long
              </span>
              <p className="text-lg text-[#897561]">Aucune commande trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-[#181411]">
                            #{order.orderNumber}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              STATUS_CONFIG[
                                order.status as keyof typeof STATUS_CONFIG
                              ].color
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs mr-1 align-middle">
                              {
                                STATUS_CONFIG[
                                  order.status as keyof typeof STATUS_CONFIG
                                ].icon
                              }
                            </span>
                            {
                              STATUS_CONFIG[
                                order.status as keyof typeof STATUS_CONFIG
                              ].label
                            }
                          </span>
                          {order.qrCodeScanned && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                              <span className="material-symbols-outlined text-xs mr-1 align-middle">
                                qr_code
                              </span>
                              Scanné
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#897561]">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              person
                            </span>
                            {order.user.name || order.user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              schedule
                            </span>
                            {formatDate(order.createdAt)}
                          </span>
                          {order.pickupTime && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                alarm
                              </span>
                              Retrait: {formatTime(order.pickupTime)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          €{order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-[#897561]">
                          {order.items.length} article
                          {order.items.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm"
                          >
                            {item.product.image && (
                              <div
                                className="w-8 h-8 rounded bg-cover bg-center"
                                style={{
                                  backgroundImage: `url("${item.product.image}")`,
                                }}
                              />
                            )}
                            <span className="text-[#181411]">
                              {item.quantity}x {item.product.name}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex items-center px-3 py-2 text-sm text-[#897561]">
                            +{order.items.length - 3} autre
                            {order.items.length - 3 > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-[#f4f2f0]">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-[#181411] rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          visibility
                        </span>
                        Voir détails
                      </button>

                      {order.status === "PENDING" && (
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, "PREPARING")
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            restaurant
                          </span>
                          Commencer
                        </button>
                      )}

                      {order.status === "PREPARING" && (
                        <button
                          onClick={() => handleStatusChange(order.id, "READY")}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            check_circle
                          </span>
                          Marquer prêt
                        </button>
                      )}

                      {order.status === "READY" && (
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, "COMPLETED")
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            done_all
                          </span>
                          Récupéré
                        </button>
                      )}

                      {(order.status === "PENDING" ||
                        order.status === "PREPARING") && (
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, "CANCELLED")
                          }
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">
                            cancel
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={handleModalClose}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
