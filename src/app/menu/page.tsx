"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  stock: number;
  isAvailable: boolean;
  category: Category;
}

export default function MenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, addItem, updateQuantity, itemsCount, total } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories();
      fetchProducts();
    }
  }, [status]);

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
      // Filtrer uniquement les produits disponibles avec du stock
      const availableProducts = data.filter(
        (p: Product) => p.isAvailable && p.stock > 0
      );
      setProducts(availableProducts);
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const cartItem = items.find((item) => item.id === product.id);

    // Vérifier le stock
    if (cartItem && cartItem.quantity >= product.stock) {
      alert("Stock insuffisant");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "",
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);

    if (product && quantity > product.stock) {
      alert("Stock insuffisant");
      return;
    }

    updateQuantity(productId, quantity);
  };

  const getItemQuantity = (productId: string): number => {
    const item = items.find((item) => item.id === productId);
    return item?.quantity || 0;
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category.id === selectedCategory)
    : products;

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
            <span className="material-symbols-outlined text-3xl text-primary">
              bakery_dining
            </span>
            <h1 className="text-xl font-bold text-[#181411]">Notre Menu</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/orders"
              className="flex items-center gap-2 text-[#897561] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              <span className="hidden sm:inline">Mes commandes</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => router.push("/cart")}
              className="relative flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="hidden sm:inline">Panier</span>
              {itemsCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {itemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-6 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === null
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-[#897561] hover:bg-gray-200"
              }`}
            >
              Tout
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-[#897561] hover:bg-gray-200"
                }`}
              >
                {category.icon && (
                  <span className="material-symbols-outlined text-sm">
                    {category.icon}
                  </span>
                )}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-6 pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-[#897561] mb-4">
                inventory_2
              </span>
              <p className="text-xl text-[#897561]">Aucun produit disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const quantityInCart = getItemQuantity(product.id);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    {product.image ? (
                      <div
                        className="w-full h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url("${product.image}")` }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-gray-400">
                          image
                        </span>
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-[#181411]">
                          {product.name}
                        </h3>
                        <span className="text-lg font-bold text-primary">
                          €{product.price.toFixed(2)}
                        </span>
                      </div>

                      {product.description && (
                        <p className="text-sm text-[#897561] mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Stock Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-[#897561]">
                          {product.stock} en stock
                        </span>
                        {product.stock < 10 && (
                          <span className="text-xs text-orange-600 font-medium">
                            Stock limité !
                          </span>
                        )}
                      </div>

                      {/* Add to Cart */}
                      {quantityInCart > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                product.id,
                                quantityInCart - 1
                              )
                            }
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <span className="material-symbols-outlined">
                              remove
                            </span>
                          </button>
                          <div className="flex-1 text-center font-bold text-[#181411]">
                            {quantityInCart}
                          </div>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                product.id,
                                quantityInCart + 1
                              )
                            }
                            disabled={quantityInCart >= product.stock}
                            className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined">
                              add
                            </span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <span className="material-symbols-outlined">
                            add_shopping_cart
                          </span>
                          Ajouter
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Summary */}
      {itemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#f4f2f0] p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-[#897561]">
                {itemsCount} article{itemsCount > 1 ? "s" : ""}
              </p>
              <p className="text-xl font-bold text-[#181411]">
                €{total.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => router.push("/cart")}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Voir le panier
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
