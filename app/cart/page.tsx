"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function Cart() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [paymentType, setPaymentType] = useState<"full" | "split">("full");
  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: "",
    phone: "",
    email: "",
    companyName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    billingName: "",
    billingGstin: "",
    billingAddress: "",
  });

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]") as CartItem[];
      setCart(savedCart);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const updateQuantity = (id: number, quantity: number) => {
    const updated = cart
      .map((item) => {
        if (item.id !== id) return item;
        const nextQuantity = Math.min(Math.max(quantity, 0), item.stock);
        return { ...item, quantity: nextQuantity };
      })
      .filter((item) => item.quantity > 0);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: total,
        paymentType,
        deliveryDetails,
      }),
    });

    setLoading(false);
    const data = await res.json();

    if (res.status === 401) {
      router.push("/login");
    } else if (res.ok) {
      setMessageType("success");
      const amountToPay = paymentType === "split" ? total * 0.6 : total;
      localStorage.setItem(
        "pendingPayment",
        JSON.stringify({
          amount: amountToPay,
          orderId: data.order.id,
        }),
      );
      router.push("/payment");
    } else {
      setMessageType("error");
      setMessage(data.error || "Something went wrong");
    }
  };

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <nav className="border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-100 text-sm font-bold text-slate-900">
              M
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Checkout Workspace</p>
              <span className="text-xl font-semibold tracking-tight">Your Cart</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/products")}
            className="rounded-xl border border-slate-800 bg-slate-950/45 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            Back to Products
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <section className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,18,29,0.78))] p-6 shadow-[0_32px_90px_rgba(2,6,23,0.34)] md:p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Order Review</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Finalize delivery, billing, and payment details.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
                Review your cart, confirm delivery information, and choose the payment structure that matches your procurement process.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
              {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
            </div>
          </div>
        </section>

        {message && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-4 text-sm ${
              messageType === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/20 bg-red-500/10 text-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-16 text-center shadow-[0_24px_70px_rgba(2,6,23,0.2)]">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Cart</p>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-100">Your cart is empty</p>
            <p className="mt-3 text-slate-400">Add products to begin checkout.</p>
            <button
              onClick={() => router.push("/products")}
              className="mt-6 rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-950 transition hover:bg-white"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="space-y-4">
              {cart.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[28px] border border-slate-800 bg-slate-950/42 p-5 shadow-[0_18px_44px_rgba(2,6,23,0.18)]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-slate-100">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-400">₹{item.price.toLocaleString()} each</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.stock > 0 ? `${item.stock} available` : "Out of stock"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                      <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#09111a] px-3 py-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-lg text-slate-300 transition hover:border-slate-700 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-lg text-slate-300 transition hover:border-slate-700 hover:text-white disabled:cursor-not-allowed disabled:text-slate-600"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-lg font-semibold text-slate-100">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <section className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)] md:p-7">
              <div className="space-y-8">
                <div>
                  <div className="mb-4 border-b border-white/8 pb-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Delivery Information</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">Delivery Details</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      ["fullName", "Full Name"],
                      ["phone", "Phone Number"],
                      ["email", "Email Address"],
                      ["companyName", "Hospital / Company Name"],
                      ["addressLine1", "Address Line 1"],
                      ["addressLine2", "Address Line 2"],
                      ["city", "City"],
                      ["state", "State"],
                      ["postalCode", "Postal Code"],
                      ["country", "Country"],
                    ].map(([key, label]) => (
                      <input
                        key={key}
                        type="text"
                        placeholder={label}
                        className={`w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none ${
                          key === "addressLine1" || key === "addressLine2" ? "md:col-span-2" : ""
                        }`}
                        value={deliveryDetails[key as keyof typeof deliveryDetails]}
                        onChange={(e) =>
                          setDeliveryDetails({ ...deliveryDetails, [key]: e.target.value })
                        }
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-4 border-b border-white/8 pb-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Billing</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">Billing Details</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Billing Name"
                      className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                      value={deliveryDetails.billingName}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, billingName: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="GSTIN / Tax ID (optional)"
                      className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none"
                      value={deliveryDetails.billingGstin}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, billingGstin: e.target.value })}
                    />
                    <textarea
                      placeholder="Billing Address"
                      className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 transition focus:border-slate-600 focus:outline-none md:col-span-2"
                      rows={3}
                      value={deliveryDetails.billingAddress}
                      onChange={(e) => setDeliveryDetails({ ...deliveryDetails, billingAddress: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-4 border-b border-white/8 pb-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Payment Structure</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">Payment Option</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      onClick={() => setPaymentType("full")}
                      className={`rounded-2xl border p-4 text-left transition ${
                        paymentType === "full"
                          ? "border-slate-600 bg-slate-100 text-slate-950"
                          : "border-slate-800 bg-[#09111a] text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <p className="text-sm font-semibold">Full Payment</p>
                      <p className={`mt-1 text-xs ${paymentType === "full" ? "text-slate-700" : "text-slate-500"}`}>Pay 100% now</p>
                    </button>
                    <button
                      onClick={() => setPaymentType("split")}
                      className={`rounded-2xl border p-4 text-left transition ${
                        paymentType === "split"
                          ? "border-slate-600 bg-slate-100 text-slate-950"
                          : "border-slate-800 bg-[#09111a] text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <p className="text-sm font-semibold">Split Payment</p>
                      <p className={`mt-1 text-xs ${paymentType === "split" ? "text-slate-700" : "text-slate-500"}`}>60% now, 40% on delivery</p>
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-800 bg-[#09111a] p-5">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Summary</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Order Total</span>
                      <span className="text-slate-100">₹{total.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Shipping</span>
                      <span className="text-emerald-200">Free</span>
                    </div>
                    {paymentType === "split" && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Pay Now (60%)</span>
                          <span className="font-semibold text-emerald-200">₹{(total * 0.6).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Pay on Delivery (40%)</span>
                          <span className="text-amber-200">₹{(total * 0.4).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                    <span className="text-lg font-semibold">Amount Due Now</span>
                    <span className="text-2xl font-semibold tracking-tight text-slate-100">
                      ₹{paymentType === "split" ? (total * 0.6).toLocaleString() : total.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="mt-5 w-full rounded-xl bg-slate-100 py-4 text-base font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
