"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardStats {
  todayOrders: number;
  yesterdayOrders: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  topProduct: string;
  lowStockProducts: number;
  weekOrders: number;
  activeProducts: number;
  totalCustomers: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

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
      fetchStats();
    }
  }, [status, session]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  const createSnapshot = async (type: "OPENING" | "CLOSING") => {
    setIsCreatingSnapshot(true);
    try {
      const response = await fetch("/api/stock/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message}\n${data.count} produits enregistrés`);
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("❌ Erreur lors de la création du snapshot");
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleOpeningSnapshot = () => createSnapshot("OPENING");
  const handleClosingSnapshot = () => createSnapshot("CLOSING");

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

  const ordersDiff = (stats?.todayOrders || 0) - (stats?.yesterdayOrders || 0);
  const revenueDiff =
    (stats?.todayRevenue || 0) - (stats?.yesterdayRevenue || 0);

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="bg-white border-b border-[#f4f2f0] sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-3xl text-primary">
              dashboard
            </span>
            <h1 className="text-xl font-bold text-[#181411]">
              Tableau de bord
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/products"
              className="flex items-center gap-2 text-[#897561] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">inventory</span>
              Produits
            </Link>

            <Link
              href="/dashboard/orders"
              className="flex items-center gap-2 text-[#897561] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              Commandes
            </Link>

            <Link
              href="/dashboard/stock"
              className="flex items-center gap-2 text-[#897561] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">warehouse</span>
              Stock
            </Link>

            <button
              onClick={() => signOut()}
              className="text-[#897561] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-[#181411] mb-6">
            Vue d'ensemble
          </h2>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#897561] mb-1">
                    Commandes aujourd'hui
                  </p>
                  <p className="text-2xl font-bold text-[#181411]">
                    {stats?.todayOrders || 0}
                  </p>
                  <p
                    className={`text-xs ${
                      ordersDiff >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {ordersDiff >= 0 ? "+" : ""}
                    {ordersDiff} vs hier
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">
                    shopping_cart
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#897561] mb-1">
                    Chiffre d'affaires
                  </p>
                  <p className="text-2xl font-bold text-[#181411]">
                    €{(stats?.todayRevenue || 0).toFixed(2)}
                  </p>
                  <p
                    className={`text-xs ${
                      revenueDiff >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {revenueDiff >= 0 ? "+" : ""}€{revenueDiff.toFixed(2)} vs
                    hier
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600">
                    euro
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#897561] mb-1">
                    Produit populaire
                  </p>
                  <p className="text-lg font-bold text-[#181411] truncate">
                    {stats?.topProduct || "N/A"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-yellow-600">
                    star
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#897561] mb-1">Stock faible</p>
                  <p className="text-2xl font-bold text-[#181411]">
                    {stats?.lowStockProducts || 0}
                  </p>
                  <p className="text-xs text-red-600">produits</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-600">
                    warning
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#181411] mb-4">
                Actions rapides
              </h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard/products"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">
                    inventory
                  </span>
                  <span>Gérer les produits</span>
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">
                    receipt_long
                  </span>
                  <span>Voir les commandes</span>
                </Link>
                <Link
                  href="/dashboard/stock"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">
                    warehouse
                  </span>
                  <span>Gérer le stock</span>
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">
                    trending_up
                  </span>
                  <span>Analytics des stocks</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#181411] mb-4">
                Statistiques récentes
              </h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#897561]">
                    Commandes cette semaine
                  </span>
                  <span className="font-bold text-[#181411]">
                    {stats?.weekOrders || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#897561]">Produits actifs</span>
                  <span className="font-bold text-[#181411]">
                    {stats?.activeProducts || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#897561]">Clients inscrits</span>
                  <span className="font-bold text-[#181411]">
                    {stats?.totalCustomers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#897561]">Stock faible</span>
                  <span
                    className={`font-bold ${
                      (stats?.lowStockProducts || 0) > 0
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {stats?.lowStockProducts || 0}
                  </span>
                </div>
              </div>

              {/* Snapshot Buttons */}
              <div className="pt-4 border-t border-[#f4f2f0]">
                <p className="text-sm font-medium text-[#897561] mb-3">
                  Enregistrement du stock
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleOpeningSnapshot}
                    disabled={isCreatingSnapshot}
                    className="flex flex-col items-center gap-1 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">
                      wb_twilight
                    </span>
                    <span className="text-xs font-medium">Début journée</span>
                  </button>
                  <button
                    onClick={handleClosingSnapshot}
                    disabled={isCreatingSnapshot}
                    className="flex flex-col items-center gap-1 p-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">
                      nightlight
                    </span>
                    <span className="text-xs font-medium">Fin journée</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
