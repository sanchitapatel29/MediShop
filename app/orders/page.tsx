"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
    fetch("/api/orders", {
      cache: "no-store",
    })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const statusColor: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-200 border-amber-500/20",
    shipped: "bg-sky-500/10 text-sky-200 border-sky-500/20",
    delivered: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20",
  };

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <nav className="border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-100 text-sm font-bold text-slate-900">
              M
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Order History</p>
              <span className="text-xl font-semibold tracking-tight">My Orders</span>
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

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <section className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,18,29,0.78))] p-6 shadow-[0_32px_90px_rgba(2,6,23,0.34)] md:p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Procurement History</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Review active and completed purchase activity.</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 md:text-base">
            Track order status, inspect line items, and verify delivery and billing details for previous institutional purchases.
          </p>
        </section>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-16 text-center shadow-[0_24px_70px_rgba(2,6,23,0.2)]">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Orders</p>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-100">No orders yet</p>
            <p className="mt-3 text-slate-400">Place your first institutional order to begin tracking history.</p>
            <button
              onClick={() => router.push("/products")}
              className="mt-6 rounded-xl bg-slate-100 px-6 py-3 font-semibold text-slate-950 transition hover:bg-white"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)]"
              >
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-slate-100">
                      {order.items.length === 1
                        ? order.items[0].product.name
                        : `${order.items[0].product.name} + ${order.items.length - 1} more`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Order #{order.id}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColor[order.status] || statusColor.pending}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="mt-2 text-lg font-semibold text-slate-100">
                      ₹{order.total_price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/8 pt-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="text-slate-100">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {order.deliveryDetails && (
                  <div className="mt-4 grid gap-4 border-t border-white/8 pt-4 text-sm md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-[#09111a] p-4">
                      <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">Delivery</p>
                      <p className="text-slate-100">{order.deliveryDetails.fullName}</p>
                      <p className="text-slate-400">{order.deliveryDetails.phone}</p>
                      <p className="text-slate-400">{order.deliveryDetails.email}</p>
                      <p className="text-slate-400">
                        {order.deliveryDetails.addressLine1}
                        {order.deliveryDetails.addressLine2 ? `, ${order.deliveryDetails.addressLine2}` : ""}
                      </p>
                      <p className="text-slate-400">
                        {order.deliveryDetails.city}, {order.deliveryDetails.state} {order.deliveryDetails.postalCode}
                      </p>
                      <p className="text-slate-400">{order.deliveryDetails.country}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-[#09111a] p-4">
                      <p className="mb-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">Billing</p>
                      <p className="text-slate-100">{order.deliveryDetails.billingName}</p>
                      {order.deliveryDetails.billingGstin && (
                        <p className="text-slate-400">GSTIN: {order.deliveryDetails.billingGstin}</p>
                      )}
                      <p className="whitespace-pre-line text-slate-400">{order.deliveryDetails.billingAddress}</p>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
