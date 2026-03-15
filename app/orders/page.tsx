"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  deliveryDetails: {
    fullName: string;
    phone: string;
    email: string;
    companyName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    billingName: string;
    billingGstin: string;
    billingAddress: string;
  } | null;
}

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      });
  }, [router]);

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
    shipped: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    delivered: "bg-green-500/20 text-green-400 border-green-500/20",
  };

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <nav className="bg-[#0d1f3c] border-b border-white/10 px-4 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center md:px-8">
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

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">My Orders</h1>
          <p className="text-white/40">Track your procurement history</p>
        </div>

        {loading ? (
          <div className="text-center text-white/40 py-20">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-white/40 mb-6">No orders yet</p>
            <button
              onClick={() => router.push("/products")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-4">
                  <div>
                    <p className="font-bold text-white text-lg">
                      {order.items.length === 1
                        ? order.items[0].product.name
                        : `${order.items[0].product.name} + ${order.items.length - 1} more`}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">
                      Order #{order.id}
                    </p>
                    <p className="text-white/40 text-sm">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor[order.status] || statusColor.pending}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    <p className="font-bold text-blue-400 text-lg mt-2">
                      ₹{order.total_price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-white/60">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="text-white">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                {order.deliveryDetails && (
                  <div className="border-t border-white/10 pt-4 mt-4 grid gap-4 md:grid-cols-2 text-sm">
                    <div>
                      <p className="text-white/40 uppercase tracking-wider text-xs mb-2">Delivery</p>
                      <p className="text-white">{order.deliveryDetails.fullName}</p>
                      <p className="text-white/60">{order.deliveryDetails.phone}</p>
                      <p className="text-white/60">{order.deliveryDetails.email}</p>
                      <p className="text-white/60">
                        {order.deliveryDetails.addressLine1}
                        {order.deliveryDetails.addressLine2 ? `, ${order.deliveryDetails.addressLine2}` : ""}
                      </p>
                      <p className="text-white/60">
                        {order.deliveryDetails.city}, {order.deliveryDetails.state} {order.deliveryDetails.postalCode}
                      </p>
                      <p className="text-white/60">{order.deliveryDetails.country}</p>
                    </div>
                    <div>
                      <p className="text-white/40 uppercase tracking-wider text-xs mb-2">Billing</p>
                      <p className="text-white">{order.deliveryDetails.billingName}</p>
                      {order.deliveryDetails.billingGstin && (
                        <p className="text-white/60">GSTIN: {order.deliveryDetails.billingGstin}</p>
                      )}
                      <p className="text-white/60 whitespace-pre-line">{order.deliveryDetails.billingAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
