"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Product {
  id: string;
  name: string;
  image: string | null;
}

interface ChartDataPoint {
  date: string;
  type: string;
  stock: number;
  label: string;
}

interface ProductAnalytics {
  product: Product;
  chartData: ChartDataPoint[];
  stats: {
    avgOpening: number;
    avgClosing: number;
    maxStock: number;
    minStock: number;
    avgDailyConsumption: number;
  };
  period: {
    start: string;
    end: string;
    days: number;
  };
}

export default function StockAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

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
      fetchProducts();
    }
  }, [status, session]);

  useEffect(() => {
    if (selectedProductId) {
      fetchAnalytics();
    }
  }, [selectedProductId, days]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
      if (data.length > 0) {
        setSelectedProductId(data[0].id);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedProductId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/stock/analytics?productId=${selectedProductId}&days=${days}`
      );
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Erreur lors du chargement des analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Préparer les données pour le graphique combiné
  const prepareChartData = () => {
    if (!analytics) return [];

    const dataByDate = new Map<string, any>();

    analytics.chartData.forEach((point) => {
      if (!dataByDate.has(point.date)) {
        dataByDate.set(point.date, { date: point.date });
      }
      const key = point.type === "OPENING" ? "opening" : "closing";
      dataByDate.get(point.date)[key] = point.stock;
    });

    return Array.from(dataByDate.values());
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

  const chartData = prepareChartData();

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
              trending_up
            </span>
            <h1 className="text-xl font-bold text-[#181411]">
              Analytics des stocks
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#897561]">
            <span className="material-symbols-outlined text-sm">info</span>
            <span className="hidden sm:inline">
              Créez des snapshots depuis le dashboard ou la page stocks
            </span>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Product Selector */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#181411] mb-2">
                  Produit
                </label>
                <select
                  value={selectedProductId || ""}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-2 border border-[#e6e0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Period Selector */}
              <div>
                <label className="block text-sm font-medium text-[#181411] mb-2">
                  Période
                </label>
                <div className="flex gap-2">
                  {[7, 14, 30, 60, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDays(d)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        days === d
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-[#897561] hover:bg-gray-200"
                      }`}
                    >
                      {d}j
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {analytics && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-[#897561] mb-1">Moy. Ouverture</p>
                  <p className="text-2xl font-bold text-[#181411]">
                    {analytics.stats.avgOpening}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-[#897561] mb-1">Moy. Fermeture</p>
                  <p className="text-2xl font-bold text-[#181411]">
                    {analytics.stats.avgClosing}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-[#897561] mb-1">Conso. Moyenne</p>
                  <p className="text-2xl font-bold text-primary">
                    {analytics.stats.avgDailyConsumption}
                  </p>
                  <p className="text-xs text-[#897561]">par jour</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-[#897561] mb-1">Stock Max</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.stats.maxStock}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-[#897561] mb-1">Stock Min</p>
                  <p className="text-2xl font-bold text-red-600">
                    {analytics.stats.minStock}
                  </p>
                </div>
              </div>

              {/* Line Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <h2 className="text-lg font-bold text-[#181411] mb-4">
                  Évolution du stock - {analytics.product.name}
                </h2>

                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="opening"
                        stroke="#3b82f6"
                        name="Début de journée"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="closing"
                        stroke="#f97316"
                        name="Fin de journée"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-[#897561]">
                    <span className="material-symbols-outlined text-6xl mb-2">
                      show_chart
                    </span>
                    <p>Aucune donnée disponible pour cette période</p>
                    <p className="text-sm mt-2">
                      Créez des snapshots pour commencer à suivre l'évolution
                    </p>
                  </div>
                )}
              </div>

              {/* Bar Chart - Consommation quotidienne */}
              {chartData.length > 1 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-[#181411] mb-4">
                    Consommation quotidienne
                  </h2>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={chartData.map((d) => ({
                        ...d,
                        consumption: (d.opening || 0) - (d.closing || 0),
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="consumption"
                        fill="#10b981"
                        name="Consommation"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
