"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface Product {
  id: string;
  name: string;
  image: string | null;
  stock: number;
  price: number;
  isAvailable: boolean;
  category: Category;
}

interface StockAdjustment {
  id: string;
  productId: string;
  quantity: number;
  type: "ADD" | "REMOVE" | "SET";
  reason: string;
  previousStock: number;
  newStock: number;
  createdAt: string;
  product: {
    name: string;
  };
}

export default function StockPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<
    "ADD" | "REMOVE" | "SET"
  >("ADD");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [filterLowStock, setFilterLowStock] = useState(false);

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
      fetchAdjustments();
    }
  }, [status, session]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdjustments = async () => {
    try {
      const response = await fetch("/api/stock/adjustments");
      const data = await response.json();
      setAdjustments(data);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !adjustmentQuantity) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/stock/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: parseInt(adjustmentQuantity),
          type: adjustmentType,
          reason: adjustmentReason || "Ajustement manuel",
        }),
      });

      if (response.ok) {
        await fetchProducts();
        await fetchAdjustments();
        setSelectedProduct(null);
        setAdjustmentQuantity("");
        setAdjustmentReason("");
        setAdjustmentType("ADD");
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de l'ajustement");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ajustement");
    } finally {
      setIsSubmitting(false);
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

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Rupture",
        color: "bg-red-100 text-red-800",
        icon: "error",
      };
    if (stock < 10)
      return {
        label: "Stock faible",
        color: "bg-orange-100 text-orange-800",
        icon: "warning",
      };
    if (stock < 30)
      return {
        label: "Stock moyen",
        color: "bg-yellow-100 text-yellow-800",
        icon: "info",
      };
    return {
      label: "Stock OK",
      color: "bg-green-100 text-green-800",
      icon: "check_circle",
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

  const filteredProducts = filterLowStock
    ? products.filter((p) => p.stock < 10)
    : products;

  const stockStats = {
    total: products.reduce((sum, p) => sum + p.stock, 0),
    lowStock: products.filter((p) => p.stock < 10).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    value: products.reduce((sum, p) => sum + p.stock * p.price, 0),
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
              warehouse
            </span>
            <h1 className="text-xl font-bold text-[#181411]">
              Gestion des stocks
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Snapshot Buttons */}
            <button
              onClick={handleOpeningSnapshot}
              disabled={isCreatingSnapshot}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined">wb_twilight</span>
              <span className="hidden sm:inline">Snapshot Début</span>
            </button>
            <button
              onClick={handleClosingSnapshot}
              disabled={isCreatingSnapshot}
              className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined">nightlight</span>
              <span className="hidden sm:inline">Snapshot Fin</span>
            </button>

            {/* Filter Button */}
            <button
              onClick={() => setFilterLowStock(!filterLowStock)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                filterLowStock
                  ? "bg-orange-50 text-orange-600"
                  : "bg-gray-50 text-[#897561] hover:bg-gray-100"
              }`}
            >
              <span className="material-symbols-outlined">filter_alt</span>
              <span className="hidden lg:inline">
                {filterLowStock
                  ? "Stock faible uniquement"
                  : "Tous les produits"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-blue-600">
                  inventory_2
                </span>
                <p className="text-sm text-[#897561]">Total articles</p>
              </div>
              <p className="text-2xl font-bold text-[#181411]">
                {stockStats.total}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-orange-600">
                  warning
                </span>
                <p className="text-sm text-[#897561]">Stock faible</p>
              </div>
              <p className="text-2xl font-bold text-[#181411]">
                {stockStats.lowStock}
              </p>
              <p className="text-xs text-orange-600">{"<"} 10 unités</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-red-600">
                  error
                </span>
                <p className="text-sm text-[#897561]">Rupture</p>
              </div>
              <p className="text-2xl font-bold text-[#181411]">
                {stockStats.outOfStock}
              </p>
              <p className="text-xs text-red-600">produits</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-green-600">
                  euro
                </span>
                <p className="text-sm text-[#897561]">Valeur du stock</p>
              </div>
              <p className="text-2xl font-bold text-[#181411]">
                €{stockStats.value.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Products Stock List */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-[#f4f2f0]">
                <h2 className="text-lg font-bold text-[#181411]">
                  État des stocks
                </h2>
                <p className="text-sm text-[#897561]">
                  {filteredProducts.length} produit
                  {filteredProducts.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock);
                  return (
                    <div
                      key={product.id}
                      className="p-4 border-b border-[#f4f2f0] hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex items-center gap-4">
                        {product.image ? (
                          <div
                            className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
                            style={{
                              backgroundImage: `url("${product.image}")`,
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-gray-400">
                              image
                            </span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-[#181411] truncate">
                              {product.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                            >
                              <span className="material-symbols-outlined text-xs mr-0.5 align-middle">
                                {status.icon}
                              </span>
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-[#897561]">
                            {product.category.name}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#181411]">
                            {product.stock}
                          </p>
                          <p className="text-xs text-[#897561]">en stock</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Adjustment Form & History */}
            <div className="space-y-6">
              {/* Adjustment Form */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#181411] mb-4">
                  Ajuster le stock
                </h2>

                {selectedProduct ? (
                  <form onSubmit={handleAdjustStock} className="space-y-4">
                    {/* Selected Product */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {selectedProduct.image ? (
                          <div
                            className="w-12 h-12 rounded-lg bg-cover bg-center"
                            style={{
                              backgroundImage: `url("${selectedProduct.image}")`,
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400">
                              image
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-[#181411]">
                            {selectedProduct.name}
                          </p>
                          <p className="text-sm text-[#897561]">
                            Stock actuel: {selectedProduct.stock}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(null)}
                          className="text-[#897561] hover:text-[#181411]"
                        >
                          <span className="material-symbols-outlined">
                            close
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Adjustment Type */}
                    <div>
                      <label className="block text-sm font-medium text-[#181411] mb-2">
                        Type d'ajustement
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setAdjustmentType("ADD")}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            adjustmentType === "ADD"
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-[#897561] hover:bg-gray-200"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            add
                          </span>
                          Ajouter
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustmentType("REMOVE")}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            adjustmentType === "REMOVE"
                              ? "bg-red-600 text-white"
                              : "bg-gray-100 text-[#897561] hover:bg-gray-200"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            remove
                          </span>
                          Retirer
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustmentType("SET")}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            adjustmentType === "SET"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-[#897561] hover:bg-gray-200"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            edit
                          </span>
                          Définir
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-[#181411] mb-2"
                      >
                        Quantité
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        value={adjustmentQuantity}
                        onChange={(e) => setAdjustmentQuantity(e.target.value)}
                        required
                        min="0"
                        className="w-full px-4 py-2 border border-[#e6e0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={
                          adjustmentType === "SET"
                            ? "Nouveau stock"
                            : "Quantité"
                        }
                      />
                      {adjustmentType !== "SET" && adjustmentQuantity && (
                        <p className="mt-1 text-sm text-[#897561]">
                          Nouveau stock:{" "}
                          {adjustmentType === "ADD"
                            ? selectedProduct.stock +
                              parseInt(adjustmentQuantity)
                            : Math.max(
                                0,
                                selectedProduct.stock -
                                  parseInt(adjustmentQuantity)
                              )}
                        </p>
                      )}
                    </div>

                    {/* Reason */}
                    <div>
                      <label
                        htmlFor="reason"
                        className="block text-sm font-medium text-[#181411] mb-2"
                      >
                        Raison (optionnel)
                      </label>
                      <input
                        type="text"
                        id="reason"
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        className="w-full px-4 py-2 border border-[#e6e0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Ex: Inventaire, Casse, Réapprovisionnement..."
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">
                            save
                          </span>
                          Enregistrer l'ajustement
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8 text-[#897561]">
                    <span className="material-symbols-outlined text-6xl mb-2">
                      touch_app
                    </span>
                    <p>Sélectionnez un produit pour ajuster son stock</p>
                  </div>
                )}
              </div>

              {/* Recent Adjustments */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-[#f4f2f0]">
                  <h2 className="text-lg font-bold text-[#181411]">
                    Historique récent
                  </h2>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {adjustments.length === 0 ? (
                    <div className="p-8 text-center text-[#897561]">
                      <span className="material-symbols-outlined text-4xl mb-2">
                        history
                      </span>
                      <p>Aucun ajustement récent</p>
                    </div>
                  ) : (
                    adjustments.slice(0, 10).map((adjustment) => (
                      <div
                        key={adjustment.id}
                        className="p-4 border-b border-[#f4f2f0]"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-[#181411]">
                              {adjustment.product.name}
                            </p>
                            <p className="text-sm text-[#897561]">
                              {adjustment.reason}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              adjustment.type === "ADD"
                                ? "bg-green-100 text-green-800"
                                : adjustment.type === "REMOVE"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {adjustment.type === "ADD" && "+"}
                            {adjustment.type === "REMOVE" && "-"}
                            {adjustment.quantity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#897561]">
                          <span>
                            {adjustment.previousStock} → {adjustment.newStock}
                          </span>
                          <span>{formatDate(adjustment.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
