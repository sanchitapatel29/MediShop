"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  detailedDescription?: string;
  price: number;
  stock: number;
  certification: string | null;
  imageUrls?: string[];
}

interface CartItem extends Product {
  quantity: number;
}

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [cartCount, setCartCount] = useState(() => {
    if (typeof window === "undefined") return 0;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  });
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category ? product.category === category : true;
    return matchSearch && matchCategory;
  });

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    setToast(`${product.name} added to cart`);
    window.setTimeout(() => setToast(""), 3000);
  };

  const categories = [
    "Surgical Instruments",
    "Diagnostic Equipment",
    "Orthopedic Implants",
    "ICU Equipment",
  ];

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-green-500 px-6 py-4 text-white shadow-lg">
          <span className="font-medium">{toast}</span>
        </div>
      )}

      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0d1f3c] px-4 py-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="text-lg font-bold md:text-xl">MediShop</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => router.push("/orders")}
            className="hidden text-sm text-white/60 transition hover:text-white md:block"
          >
            My Orders
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10 md:flex"
            title="Profile"
          >
            <span aria-hidden="true">P</span>
            <span className="sr-only">Profile</span>
          </button>
          <button
            onClick={() => router.push("/cart")}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500 md:px-4"
          >
            Cart
            {cartCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold md:text-3xl">Product Catalog</h1>
            <p className="text-sm text-white/40">Browse certified medical equipment</p>
          </div>
          <button
            onClick={() => router.push("/request")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-blue-500/50 md:w-auto"
          >
            Request a Product
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition focus:border-blue-500 focus:outline-none"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="" className="bg-[#0a1628]">
              All Categories
            </option>
            {categories.map((item) => (
              <option key={item} value={item} className="bg-[#0a1628]">
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("")}
            className={`rounded-full px-4 py-2 text-sm transition ${category === "" ? "bg-blue-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
          >
            All
          </button>
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-4 py-2 text-sm transition ${category === item ? "bg-blue-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-white/40">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-white/40">No products found</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/${product.id}`)}
                className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-blue-500/50 hover:bg-white/8"
              >
                {product.imageUrls?.[0] ? (
                  <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-6 text-center">
                    <span className="text-4xl">IMG</span>
                  </div>
                )}

                <span className="rounded-full border border-blue-500/20 bg-blue-500/20 px-3 py-1 text-xs text-blue-400">
                  {product.category}
                </span>
                <h3 className="mt-3 mb-1 font-semibold text-white transition group-hover:text-blue-400">
                  {product.name}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-white/40">{product.description}</p>

                {product.certification && (
                  <p className="mb-3 text-xs text-green-400/70">{product.certification}</p>
                )}

                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-400">Rs {product.price}</span>
                  {product.stock < 4 ? (
                    <span className="text-sm font-medium text-orange-400">
                      Only {product.stock} left
                    </span>
                  ) : (
                    <span className="text-sm text-white/40">Available</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(`/products/${product.id}`);
                    }}
                    className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition hover:border-blue-500/40"
                  >
                    Details
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      addToCart(product);
                    }}
                    className="rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
