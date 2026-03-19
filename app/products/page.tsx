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
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const frameId = window.requestAnimationFrame(() => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const filtered = products.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category ? product.category === category : true;
    return matchSearch && matchCategory;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      setToast(`${product.name} is out of stock`);
      window.setTimeout(() => setToast(""), 3000);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        setToast(`Only ${product.stock} unit(s) left for ${product.name}`);
        window.setTimeout(() => setToast(""), 3000);
        return;
      }
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
    <main className="app-shell min-h-screen text-slate-100">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-slate-700 bg-slate-950/95 px-6 py-4 text-slate-100 shadow-2xl">
          <span className="font-medium">{toast}</span>
        </div>
      )}

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-100 text-sm font-bold text-slate-900">
              M
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Buyer Workspace</p>
              <span className="text-lg font-semibold tracking-tight md:text-xl">MediShop Catalog</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => router.push("/orders")}
              className="hidden rounded-xl border border-slate-800 bg-slate-950/55 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white md:block"
            >
              My Orders
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/55 text-[11px] font-semibold tracking-[0.18em] text-slate-300 transition hover:border-slate-700 hover:text-white md:flex"
              title="Profile"
            >
              PF
            </button>
            <button
              onClick={() => router.push("/cart")}
              className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white"
            >
              Cart
              {cartCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <section className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,18,29,0.78))] p-6 shadow-[0_32px_90px_rgba(2,6,23,0.34)] md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Procurement Catalog</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Source certified medical equipment with clearer buying signals.</h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-400 md:text-base">
                Browse institutional equipment categories, review stock availability, and place orders from a more structured B2B catalog.
              </p>
            </div>
            <button
              onClick={() => router.push("/request")}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/35 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/60 lg:w-auto"
            >
              Request a Product
            </button>
          </div>
        </section>

        <section className="mb-8 rounded-[28px] border border-slate-800 bg-slate-950/40 p-5 md:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              placeholder="Search products, instruments, and equipment..."
              className="flex-1 rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 transition focus:border-slate-600 focus:outline-none"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="" className="bg-[#09111a]">
                All Categories
              </option>
              {categories.map((item) => (
                <option key={item} value={item} className="bg-[#09111a]">
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory("")}
              className={`rounded-full px-4 py-2 text-sm transition ${category === "" ? "bg-slate-100 text-slate-950" : "border border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"}`}
            >
              All
            </button>
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm transition ${category === item ? "bg-slate-100 text-slate-950" : "border border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-slate-800 bg-slate-950/40 py-20 text-center text-slate-500">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <article
                key={product.id}
                onClick={() => router.push(`/products/${product.id}`)}
                className="group cursor-pointer rounded-[28px] border border-slate-800 bg-slate-950/42 p-5 shadow-[0_18px_44px_rgba(2,6,23,0.18)] transition hover:border-slate-700 hover:bg-slate-950/60"
              >
                {product.imageUrls?.[0] ? (
                  <div className="mb-5 overflow-hidden rounded-2xl border border-slate-800 bg-[#09111a]">
                    <img
                      src={product.imageUrls[0]}
                      alt={product.name}
                      className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div className="mb-5 flex h-52 items-center justify-center rounded-2xl border border-slate-800 bg-[#09111a] text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    No Image
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                    {product.category}
                  </span>
                  <span className="text-right text-xs text-slate-500">
                    {product.stock <= 0 ? "Out of stock" : product.stock < 3 ? `Only ${product.stock} left` : ""}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-100">{product.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{product.description}</p>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Price</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">₹{product.price}</p>
                  </div>
                  {product.certification && (
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
                      Certified
                    </span>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(`/products/${product.id}`);
                    }}
                    className="rounded-xl border border-slate-800 bg-[#09111a] py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:text-white"
                  >
                    Details
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      addToCart(product);
                    }}
                    disabled={product.stock <= 0}
                    className="rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
