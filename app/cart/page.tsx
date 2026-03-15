"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

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
      .map((item) => (item.id === id ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setMessage("");
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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

    if (res.ok) {
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
    <main className="min-h-screen bg-[#0a1628] text-white">
      <nav className="flex flex-col gap-3 border-b border-white/10 bg-[#0d1f3c] px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <span className="text-sm font-bold text-white">M</span>
          </div>
          <span className="text-xl font-bold">MediShop</span>
        </div>
        <button
          onClick={() => router.push("/products")}
          className="text-sm text-white/60 transition hover:text-white"
        >
          Back to Products
        </button>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-8">
          <h1 className="mb-1 text-2xl font-bold md:text-3xl">Your Cart</h1>
          <p className="text-white/40">
            {cart.length} item{cart.length !== 1 ? "s" : ""}
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-xl p-4 ${
              messageType === "success"
                ? "border border-green-500/20 bg-green-500/10 text-green-400"
                : "border border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {messageType === "success" ? "Success:" : "Error:"} {message}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-16 text-center">
            <p className="mb-4 text-5xl">Cart</p>
            <p className="mb-6 text-white/40">Your cart is empty</p>
            <button
              onClick={() => router.push("/products")}
              className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:justify-between md:p-6"
              >
                <div>
                  <h3 className="mb-1 font-semibold text-white">{item.name}</h3>
                  <p className="text-sm text-blue-400">Rs {item.price} each</p>
                </div>
                <div className="flex items-center justify-between md:gap-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 font-bold transition hover:bg-white/20"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 font-bold transition hover:bg-white/20"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-white">
                    Rs {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">
                Delivery Details
              </h3>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none"
                  value={deliveryDetails.fullName}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, fullName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none"
                  value={deliveryDetails.phone}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none"
                  value={deliveryDetails.email}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, email: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Hospital / Company Name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none"
                  value={deliveryDetails.companyName}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, companyName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Address Line 1"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none md:col-span-2"
                  value={deliveryDetails.addressLine1}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, addressLine1: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Address Line 2"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none md:col-span-2"
                  value={deliveryDetails.addressLine2}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, addressLine2: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="City"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none"
                  value={deliveryDetails.city}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="State"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none"
                  value={deliveryDetails.state}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, state: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none"
                  value={deliveryDetails.postalCode}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, postalCode: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Country"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none"
                  value={deliveryDetails.country}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, country: e.target.value })}
                />
              </div>

              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">
                Billing Details
              </h3>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Billing Name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none"
                  value={deliveryDetails.billingName}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, billingName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="GSTIN / Tax ID (optional)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none"
                  value={deliveryDetails.billingGstin}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, billingGstin: e.target.value })}
                />
                <textarea
                  placeholder="Billing Address"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/20 transition focus:border-blue-500 focus:outline-none md:col-span-2"
                  rows={3}
                  value={deliveryDetails.billingAddress}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, billingAddress: e.target.value })}
                />
              </div>

              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/60">
                Payment Option
              </h3>

              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setPaymentType("full")}
                  className={`rounded-xl border p-4 text-left transition ${
                    paymentType === "full"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">Full Payment</p>
                  <p className="mt-1 text-xs text-white/40">Pay 100% now</p>
                </button>
                <button
                  onClick={() => setPaymentType("split")}
                  className={`rounded-xl border p-4 text-left transition ${
                    paymentType === "split"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">Split Payment</p>
                  <p className="mt-1 text-xs text-white/40">60% now, 40% on delivery</p>
                </button>
              </div>

              <div className="mb-6 border-t border-white/10 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-white/60">Order Total</span>
                  <span className="text-white">Rs {total.toLocaleString()}</span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-white/60">Shipping</span>
                  <span className="text-sm text-green-400">Free</span>
                </div>
                {paymentType === "split" && (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-white/60">Pay Now (60%)</span>
                      <span className="font-semibold text-green-400">
                        Rs {(total * 0.6).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Pay on Delivery (40%)</span>
                      <span className="text-yellow-400">
                        Rs {(total * 0.4).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold">Amount Due Now</span>
                  <span className="text-2xl font-bold text-blue-400">
                    Rs{" "}
                    {paymentType === "split"
                      ? (total * 0.6).toLocaleString()
                      : total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
