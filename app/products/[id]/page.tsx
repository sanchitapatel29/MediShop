"use client";

import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const addToCart = () => {
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
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
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!product || !reviewText.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment: reviewText.trim(),
        }),
      });

      const data = await response.json();
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a1628] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#0a1628] px-4 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-xl font-semibold">Instrument unavailable</p>
          <p className="mt-3 text-white/40">{message || "This item could not be loaded."}</p>
          <button
            onClick={() => router.push("/products")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  const gallery = product.imageUrls.length ? product.imageUrls : [];

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <nav className="border-b border-white/10 bg-[#0d1f3c] px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            onClick={() => router.push("/products")}
            className="text-sm text-white/60 transition hover:text-white"
          >
            Back to Products
          </button>
          <button
            onClick={() => router.push("/cart")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Go to Cart
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        {message && (
          <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              {gallery[selectedImage] ? (
                <img
                  src={gallery[selectedImage]}
                  alt={product.name}
                  className="h-[420px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-5xl text-white/30">
                  No image
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.map((imageUrl, index) => (
                  <button
                    key={imageUrl + index}
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-2xl border ${selectedImage === index ? "border-blue-500" : "border-white/10"} bg-white/5`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="h-24 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div>
              <span className="rounded-full border border-blue-500/20 bg-blue-500/20 px-3 py-1 text-xs text-blue-400">
                {product.category}
              </span>
              <h1 className="mt-4 text-3xl font-bold">{product.name}</h1>
              <p className="mt-3 text-white/60">{product.description}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/40">Price</p>
              <p className="mt-2 text-3xl font-bold text-blue-400">Rs {product.price}</p>
              {product.stock < 4 && (
                <p className="mt-3 text-sm font-medium text-orange-400">
                  Only {product.stock} left
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold">Instrument Details</h2>
              <p className="mt-3 whitespace-pre-line text-white/60">
                {product.detailedDescription || product.description}
              </p>
              <div className="mt-5 space-y-2 text-sm text-white/40">
                {product.certification && <p>Certification: {product.certification}</p>}
                {product.admin && (
                  <p>Supplier: {product.admin.hospital_name || product.admin.name}</p>
                )}
                <p>
                  Added on{" "}
                  {new Date(product.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Customer Rating</h2>
                <span className="text-sm text-white/40">{product.reviews.length} review(s)</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-blue-400">
                {product.reviews.length ? averageRating.toFixed(1) : "New"}
              </p>
            </div>

            <button
              onClick={addToCart}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Add to Cart
            </button>
          </section>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Write a Review</h2>
                <p className="mt-1 text-xs text-white/40">
                  Visible to all customers
                </p>
              </div>
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value} className="bg-[#0a1628]">
                    {value} / 5
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 space-y-3">
              <textarea
                rows={3}
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="Share your experience with this instrument"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={submitReview}
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Customer Reviews</h2>
              <span className="text-sm text-white/40">{product.reviews.length} total</span>
            </div>

            <div className="mt-6 space-y-4">
              {product.reviews.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/40">
                  No reviews yet.
                </div>
              ) : (
                product.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold">{review.userName}</p>
                        <p className="text-xs text-white/40">
                          {review.hospitalName || "Customer"}
                        </p>
                      </div>
                      <div className="text-sm text-white/40">
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
                    <p className="mt-4 whitespace-pre-line text-white/70">{review.comment}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
