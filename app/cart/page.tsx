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
        paymentType: paymentType,
        deliveryDetails,
      }),
    });

    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      const amountToPay = paymentType === "split" ? total * 0.6 : total;
      // Save payment info for payment page
      localStorage.setItem(
        "pendingPayment",
        JSON.stringify({
          amount: amountToPay,
          orderId: data.order.id,
        }),
      );
      router.push("/payment");
    } else {
      const data = await res.json();
      setMessage(data.error || "Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <nav className="bg-[#0d1f3c] border-b border-white/10 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold">MediShop</span>
        </div>
        <button
          onClick={() => router.push("/products")}
          className="text-white/60 hover:text-white text-sm transition"
        >
          ← Back to Products
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Your Cart</h1>
          <p className="text-white/40">
            {cart.length} item{cart.length !== 1 ? "s" : ""}
          </p>
        </div>

        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl mb-6">
            ✓ {message}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-white/40 mb-6">Your cart is empty</p>
            <button
              onClick={() => router.push("/products")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.name}</h3>
                  <p className="text-blue-400 text-sm">₹{item.price} each</p>
                </div>
                <div className="flex items-center justify-between md:gap-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-white">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Payment Type Selector
            <div className="mb-6">
              <h3 className="font-semibold text-white/60 text-sm uppercase tracking-wider mb-3">
                Payment Option
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentType("full")}
                  className={`p-4 rounded-xl border text-left transition ${
                    paymentType === "full"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-white text-sm">
                    Full Payment
                  </p>
                  <p className="text-white/40 text-xs mt-1">Pay 100% now</p>
                </button>
                <button
                  onClick={() => setPaymentType("split")}
                  className={`p-4 rounded-xl border text-left transition ${
                    paymentType === "split"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-white text-sm">
                    Split Payment
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    60% now, 40% on delivery
                  </p>
                </button>
              </div>
            </div> */}

            {/* Order Summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6">
              <h3 className="font-semibold text-white/60 text-sm uppercase tracking-wider mb-4">
                Delivery Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.fullName}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, fullName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.phone}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.email}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, email: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Hospital / Company Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.companyName}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, companyName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Address Line 1"
                  className="md:col-span-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.addressLine1}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, addressLine1: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Address Line 2"
                  className="md:col-span-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.addressLine2}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, addressLine2: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="City"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.city}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="State"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.state}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, state: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.postalCode}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, postalCode: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Country"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.country}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, country: e.target.value })}
                />
              </div>

              <h3 className="font-semibold text-white/60 text-sm uppercase tracking-wider mb-4">
                Billing Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Billing Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.billingName}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, billingName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="GSTIN / Tax ID (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  value={deliveryDetails.billingGstin}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, billingGstin: e.target.value })}
                />
                <textarea
                  placeholder="Billing Address"
                  className="md:col-span-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition"
                  rows={3}
                  value={deliveryDetails.billingAddress}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, billingAddress: e.target.value })}
                />
              </div>

              <h3 className="font-semibold text-white/60 text-sm uppercase tracking-wider mb-4">
                Payment Option
              </h3>

              {/* Payment Type Selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setPaymentType("full")}
                  className={`p-4 rounded-xl border text-left transition ${
                    paymentType === "full"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-white text-sm">
                    Full Payment
                  </p>
                  <p className="text-white/40 text-xs mt-1">Pay 100% now</p>
                </button>
                <button
                  onClick={() => setPaymentType("split")}
                  className={`p-4 rounded-xl border text-left transition ${
                    paymentType === "split"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <p className="font-semibold text-white text-sm">
                    Split Payment
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    60% now, 40% on delivery
                  </p>
                </button>
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60">Order Total</span>
                  <span className="text-white">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60">Shipping</span>
                  <span className="text-green-400 text-sm">Free</span>
                </div>
                {paymentType === "split" && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/60">Pay Now (60%)</span>
                      <span className="text-green-400 font-semibold">
                        ₹{(total * 0.6).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">
                        Pay on Delivery (40%)
                      </span>
                      <span className="text-yellow-400">
                        ₹{(total * 0.4).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold">Amount Due Now</span>
                  <span className="text-2xl font-bold text-blue-400">
                    ₹
                    {paymentType === "split"
                      ? (total * 0.6).toLocaleString()
                      : total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-semibold text-lg transition shadow-lg shadow-blue-500/25"
              >
                {loading ? "Placing Order..." : "Place Order →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
