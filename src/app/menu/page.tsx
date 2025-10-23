"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function MenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const {
    items,
    addItem,
    removeItem,
    updateQuantity: updateCartQuantity,
    itemsCount,
    subtotal,
  } = useCart();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (
      status === "authenticated" &&
      (session?.user as any)?.role === "ADMIN"
    ) {
      router.push("/dashboard");
      return;
    }
  }, [status, session, router]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
    }
  };

  const addToCart = (product: Product) => {
    if (!product.isAvailable || product.stock === 0) {
      toast.error("Produit non disponible");
      return;
    }
    // Vérifie le stock courant dans le panier
    const existing = items.find((it) => it.id === product.id);
    if (existing && existing.quantity >= product.stock) {
      toast.error("Stock insuffisant");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    toast.success(`${product.name} ajouté au panier`);
  };

  const removeFromCart = (productId: string) => {
    removeItem(productId);
    toast.success("Produit retiré du panier");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock) {
      toast.error("Stock insuffisant");
      return;
    }

    updateCartQuantity(productId, quantity);
  };

  const getTotalPrice = () => subtotal;

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category.id === selectedCategory);

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
            <h1 className="text-xl font-bold text-[#181411]">Boulangerie</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/orders"
              className="flex items-center gap-2 text-[#897561] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              Mes commandes
            </Link>

            <div className="relative">
              <Link
                href="/cart"
                className="flex items-center gap-2 text-[#897561] hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                Panier ({itemsCount})
              </Link>
            </div>

            <button
              onClick={() => signOut()}
              className="text-[#897561] hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Catégories */}
        <aside className="w-64 bg-white border-r border-[#f4f2f0] min-h-screen p-6">
          <h2 className="text-lg font-bold text-[#181411] mb-4">Catégories</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "text-[#897561] hover:bg-gray-50"
              }`}
            >
              Tous les produits
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center ${
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "text-[#897561] hover:bg-gray-50"
                }`}
              >
                <span className="material-symbols-outlined text-sm mr-2 text-center">
                  {category.icon}
                </span>
                {category.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div
                  className="w-full aspect-video bg-cover bg-center"
                  style={{ backgroundImage: `url("${product.image}")` }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#181411] mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#897561] mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-primary">
                      €{product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#897561]">
                      Stock: {product.stock}
                    </span>
                  </div>

                  {product.isAvailable && product.stock > 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Ajouter au panier
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
                    >
                      Non disponible
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Cart Sidebar */}
        {items.length > 0 && (
          <aside className="w-80 bg-white border-l border-[#f4f2f0] min-h-screen p-6">
            <h2 className="text-lg font-bold text-[#181411] mb-4">Panier</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className="w-12 h-12 bg-cover bg-center rounded"
                    style={{ backgroundImage: `url("${item.image}")` }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-[#181411] text-sm">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#897561]">
                      €{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => {
                        const product = products.find((p) => p.id === item.id);
                        if (product && item.quantity + 1 > product.stock) {
                          toast.error("Stock insuffisant");
                          return;
                        }
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-[#181411]">Total</span>
                <span className="text-xl font-bold text-primary">
                  €{getTotalPrice().toFixed(2)}
                </span>
              </div>
              <button className="w-full bg-primary text-white py-3 px-4 rounded-lg font-bold hover:bg-primary/90 transition-colors">
                Commander
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
