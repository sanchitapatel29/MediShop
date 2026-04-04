"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  productId: number;
  userId: number;
  userName: string;
  hospitalName: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductDetail {
  id: number;
  name: string;
  category: string;
  description: string;
  certification: string | null;
  price: number;
  stock: number;
  created_at: string;
  is_quote_enabled: boolean;
  min_quote_quantity: number | null;
  starting_quote_price: number | null;
  detailedDescription: string;
  imageUrls: string[];
  admin: {
    id: number;
    name: string;
    hospital_name: string | null;
  } | null;
  reviews: Review[];
}

interface CartItem {
  id: number;
  name: string;
  category: string;
  description: string;
  certification: string | null;
  price: number;
  stock: number;
  quantity: number;
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteQuantity, setQuoteQuantity] = useState("1");
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  useEffect(() => {
    if (!params?.id) return;

    fetch(`/api/products/${params.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load product");
        }
        return response.json();
      })
      .then((data) => setProduct(data))
      .catch(() => setMessage("Unable to load this instrument"))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const averageRating = useMemo(() => {
    if (!product?.reviews.length) return 0;
    return (
      product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length
    );
  }, [product]);

  const canRequestQuote = session?.user?.role !== "admin";
  const minimumQuoteQuantity = product?.min_quote_quantity ?? 1;
  const quoteAvailable = Boolean(product?.is_quote_enabled && canRequestQuote);

  const addToCart = () => {
    if (!product) return;
    if (product.stock <= 0) {
      setMessage(`${product.name} is out of stock`);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        setMessage(`Only ${product.stock} unit(s) left`);
        return;
      }
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        certification: product.certification,
        price: product.price,
        stock: product.stock,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setMessage(`${product.name} added to cart`);
    window.setTimeout(() => setMessage(""), 2500);
  };

  const submitReview = async () => {
    if (!product || !reviewText.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: reviewText.trim(),
        }),
      });

      const data = await response.json();
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) {
        throw new Error(data.error || "Failed to add review");
      }

      setProduct((current) =>
        current
          ? {
              ...current,
              reviews: [data, ...current.reviews],
            }
          : current,
      );
      setReviewText("");
      setRating(5);
      setMessage("Review added");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  const submitQuoteRequest = async () => {
    if (!product) return;

    const numericQuantity = Number(quoteQuantity);
    if (!Number.isInteger(numericQuantity) || numericQuantity < minimumQuoteQuantity) {
      setMessage(`Minimum quote quantity for this product is ${minimumQuoteQuantity}`);
      return;
    }

    setQuoteSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quoteQuantity,
          price: quotePrice,
          message: quoteMessage,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to request quote");
      }

      setQuoteModalOpen(false);
      setQuoteQuantity("1");
      setQuotePrice("");
      setQuoteMessage("");
      router.push(`/quotes/${data.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to request quote");
    } finally {
      setQuoteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center text-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-transparent" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="app-shell min-h-screen px-4 py-12 text-slate-100">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-800 bg-slate-950/50 p-10 text-center shadow-[0_30px_80px_rgba(2,6,23,0.28)]">
          <p className="text-2xl font-semibold tracking-tight">Instrument unavailable</p>
          <p className="mt-3 text-slate-400">{message || "This item could not be loaded."}</p>
          <button
            onClick={() => router.push("/products")}
            className="mt-6 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
          >
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  const gallery = product.imageUrls.length ? product.imageUrls : [];
  const supplierName = product.admin?.hospital_name || product.admin?.name || "Verified supplier";

  return (
    <main className="app-shell min-h-screen text-slate-100">
      {quoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[32px] border border-slate-800 bg-[#08111b] p-6 shadow-[0_28px_90px_rgba(2,6,23,0.38)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Quote Request</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Request pricing for {product?.name}</h2>
              </div>
              <button
                onClick={() => setQuoteModalOpen(false)}
                className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <input
                type="number"
                min={minimumQuoteQuantity}
                value={quoteQuantity}
                onChange={(event) => setQuoteQuantity(event.target.value)}
                placeholder={`Quantity (min ${minimumQuoteQuantity})`}
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={quotePrice}
                onChange={(event) => setQuotePrice(event.target.value)}
                placeholder={
                  typeof product?.starting_quote_price === "number"
                    ? `Optional target unit price (supplier starts near Rs ${product.starting_quote_price.toLocaleString()})`
                    : "Optional target unit price"
                }
                className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
              />
              <textarea
                rows={5}
                value={quoteMessage}
                onChange={(event) => setQuoteMessage(event.target.value)}
                placeholder="Share procurement notes, timelines, or price expectations"
                className="w-full rounded-2xl border border-slate-800 bg-[#09111a] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
              />
              <button
                onClick={submitQuoteRequest}
                disabled={quoteSubmitting}
                className="w-full rounded-xl bg-slate-100 py-3 font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {quoteSubmitting ? "Submitting..." : "Send Quote Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => router.push("/products")}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            Back to Products
          </button>
          <button
            onClick={() => router.push("/cart")}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white"
          >
            Go to Cart
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {message && (
          <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <section className="rounded-[32px] border border-slate-800 bg-slate-950/36 p-5 shadow-[0_24px_60px_rgba(2,6,23,0.18)] sm:p-6">
            <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-[#09111a]">
              {gallery[selectedImage] ? (
                <img
                  src={gallery[selectedImage]}
                  alt={product.name}
                  className="h-72 w-full object-cover sm:h-96 lg:h-[480px]"
                />
              ) : (
                <div className="flex h-72 items-center justify-center text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 sm:h-96 lg:h-[480px]">
                  No image
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {gallery.map((imageUrl, index) => (
                  <button
                    key={imageUrl + index}
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-2xl border bg-[#09111a] ${
                      selectedImage === index ? "border-slate-500" : "border-slate-800"
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="h-20 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[32px] border border-slate-800 bg-slate-950/36 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.18)]">
            <div className="border-b border-white/8 pb-6">
              <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
                {product.category}
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
              <p className="mt-3 text-base leading-relaxed text-slate-400">{product.description}</p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <p>
                  Rating:{" "}
                  <span className="font-semibold text-slate-100">
                    {product.reviews.length ? averageRating.toFixed(1) : "New"}
                  </span>
                  <span className="text-slate-500"> / 5</span>
                </p>
                <span className="h-1 w-1 rounded-full bg-slate-600" />
                <p>{product.reviews.length} review(s)</p>
              </div>
            </div>

            <div className="py-6">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Price</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-100">Rs {product.price}</p>

                {product.stock <= 0 ? (
                  <p className="mt-3 text-sm font-medium text-red-300">Out of stock</p>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">
                    {product.stock < 3 ? `Only ${product.stock} unit(s) left` : `${product.stock} unit(s) available`}
                  </p>
                )}

                <div className="mt-6 space-y-4 border-t border-white/8 pt-5 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                    <span className="w-28 text-slate-500">Supplier</span>
                    <span className="text-slate-200">{supplierName}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                    <span className="w-28 text-slate-500">Certification</span>
                    <span className="text-slate-200">{product.certification || "Standard verified supply"}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                    <span className="w-28 text-slate-500">Listed On</span>
                    <span className="text-slate-200">
                      {new Date(product.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/8 pt-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Purchase</p>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                    Add this instrument to your cart, or request a quote first if you need negotiated pricing.
                  </p>
                  {quoteAvailable ? (
                    <div className="mt-4 rounded-2xl border border-cyan-500/15 bg-cyan-500/8 px-4 py-4 text-sm text-cyan-100">
                      Quote requests are enabled for bulk buying from quantity {minimumQuoteQuantity}.
                      {typeof product.starting_quote_price === "number"
                        ? ` Supplier starting quote: Rs ${product.starting_quote_price.toLocaleString()}.`
                        : ""}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-slate-800 bg-[#09111a] px-4 py-4 text-sm text-slate-400">
                      This product is currently sold at the listed price only. Quote negotiation is not enabled.
                    </div>
                  )}
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                      onClick={addToCart}
                      disabled={product.stock <= 0}
                      className="rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                    >
                      {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    {quoteAvailable && (
                      <button
                        onClick={() => {
                          setQuoteQuantity(String(minimumQuoteQuantity));
                          setQuoteModalOpen(true);
                        }}
                        className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                      >
                        Request Quote
                      </button>
                    )}
                    <button
                      onClick={() => router.push("/cart")}
                      className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900/60"
                    >
                      View Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/8 pt-6">
              <h2 className="text-xl font-semibold">Instrument Details</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-400">
                {product.detailedDescription || product.description}
              </p>
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-[32px] border border-slate-800 bg-slate-950/36 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.18)] sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="border-b border-white/8 pb-8 lg:border-b-0 lg:border-r lg:border-white/8 lg:pb-0 lg:pr-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Write a Review</h2>
                  <p className="mt-1 text-sm text-slate-500">Visible to all customers</p>
                </div>
                <select
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  className="rounded-lg border border-slate-800 bg-[#09111a] px-3 py-2 text-sm text-slate-100 focus:border-slate-600 focus:outline-none"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value} className="bg-[#09111a]">
                      {value} / 5
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 space-y-3">
                <textarea
                  rows={5}
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  placeholder="Share your experience with this instrument"
                  className="w-full rounded-2xl border border-slate-800 bg-[#09111a] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
                />
                <button
                  onClick={submitReview}
                  disabled={submitting}
                  className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>

            <div>
              <div>
                <h2 className="text-xl font-semibold">Customer Reviews</h2>
                <p className="mt-1 text-sm text-slate-500">{product.reviews.length} total review(s)</p>
              </div>

              <div className="mt-6 space-y-4">
                {product.reviews.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-[#09111a] p-5 text-sm text-slate-500">
                    No reviews yet.
                  </div>
                ) : (
                  product.reviews.map((review) => (
                    <article key={review.id} className="border-b border-white/8 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-100">{review.userName}</p>
                          <p className="text-xs text-slate-500">{review.hospitalName || "Customer"}</p>
                        </div>
                        <div className="text-sm text-slate-500">
                          <p>{review.rating} / 5</p>
                          <p>
                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">{review.comment}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
