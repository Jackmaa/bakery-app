"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductModal from "@/components/ProductModal";

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  image: string | null;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
      fetchCategories();
      fetchProducts();
    }
  }, [status, session]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.categoryId === selectedCategory
      );
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id));
        setDeleteConfirm(null);
      } else {
        alert("Erreur lors de la suppression du produit");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la suppression du produit");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleModalClose = (refresh?: boolean) => {
    setIsModalOpen(false);
    setEditingProduct(null);
    if (refresh) {
      fetchProducts();
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !product.isAvailable }),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(
          products.map((p) => (p.id === product.id ? updatedProduct : p))
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
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
              inventory
            </span>
            <h1 className="text-xl font-bold text-[#181411]">
              Gestion des produits
            </h1>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Nouveau produit
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
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
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#e6e0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-[#897561] hover:bg-gray-200"
                  }`}
                >
                  Tous
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-[#897561] hover:bg-gray-200"
                    }`}
                  >
                    {category.icon && (
                      <span className="mr-1">{category.icon}</span>
                    )}
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-sm text-[#897561]">
              {filteredProducts.length} produit
              {filteredProducts.length > 1 ? "s" : ""} trouvé
              {filteredProducts.length > 1 ? "s" : ""}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-[#897561] mb-4">
                inventory_2
              </span>
              <p className="text-lg text-[#897561]">Aucun produit trouvé</p>
              <button
                onClick={handleCreate}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Créer le premier produit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  {/* Product Image */}
                  <div
                    className="w-full aspect-square bg-cover bg-center relative"
                    style={{
                      backgroundImage: `url("${
                        product.image ||
                        "https://via.placeholder.com/400x400?text=Pas+d'image"
                      }")`,
                    }}
                  >
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => toggleAvailability(product)}
                        className={`rounded ${
                          product.isAvailable
                            ? "bg-transparant text-white"
                            : "bg-transparent text-red-600"
                        }`}
                        title={
                          product.isAvailable ? "Disponible" : "Indisponible"
                        }
                      >
                        <span className="material-symbols-outlined text-sm">
                          {product.isAvailable
                            ? "visibility"
                            : "visibility_off"}
                        </span>
                      </button>
                    </div>

                    {product.stock < 10 && (
                      <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        Stock faible: {product.stock}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#181411] truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[#897561] capitalize">
                          {product.category.name}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary ml-2">
                        €{product.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-sm text-[#897561] line-clamp-2 mb-4">
                      {product.description || "Aucune description"}
                    </p>

                    <div className="flex items-center justify-between text-xs text-[#897561] mb-4">
                      <span>Stock: {product.stock}</span>
                      <span
                        className={
                          product.isAvailable
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {product.isAvailable ? "Disponible" : "Indisponible"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">
                          edit
                        </span>
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                          deleteConfirm === product.id
                            ? "bg-red-600 text-white"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          delete
                        </span>
                        {deleteConfirm === product.id
                          ? "Confirmer"
                          : "Supprimer"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
