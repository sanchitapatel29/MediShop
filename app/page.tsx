"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [listedProducts, setListedProducts] = useState(0);

  const faqs = [
    {
      question: "How are suppliers approved?",
      answer:
        "Supplier access is handled separately from buyer signup, so seller accounts remain controlled and marketplace operations stay structured.",
    },
    {
      question: "Can we place bulk orders?",
      answer:
        "Yes. The platform is designed for hospitals, clinics, and procurement teams placing multi-item institutional orders.",
    },
    {
      question: "What payment options are available?",
      answer:
        "Orders support both full payment and split payment, depending on how your team prefers to process procurement.",
    },
    {
      question: "What if a product is not listed?",
      answer:
        "You can submit a sourcing request and suppliers can review the requirement from the admin side.",
    },
  ];

  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        setListedProducts(data.filter((product) => product.stock > 0).length);
      })
      .catch(() => undefined);
  }, []);

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <nav className="border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-100 text-sm font-bold text-slate-900">
              M
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Medical Procurement</p>
              <span className="text-xl font-semibold tracking-tight">MediShop</span>
            </div>
          </div>
          <div className="flex w-full gap-3 sm:w-auto">
            <button
              onClick={() => router.push("/login")}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950/45 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white sm:flex-none"
            >
              Customer Login
            </button>
            <button
              onClick={() => router.push("/admin/login")}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950/45 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white sm:flex-none"
            >
              Admin Portal
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white sm:flex-none"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
        <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(9,18,29,0.8))] p-8 shadow-[0_40px_100px_rgba(2,6,23,0.38)] md:p-12">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Healthcare Procurement Platform</p>
          <div className="mt-5 max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Medical equipment procurement for hospitals and clinics.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
              Browse certified products, place structured orders, and manage sourcing through a cleaner B2B workflow.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/signup")}
              className="rounded-xl bg-slate-100 px-7 py-4 text-base font-semibold text-slate-950 transition hover:bg-white"
            >
              Create Buyer Account
            </button>
            <button
              onClick={() => router.push("/products")}
              className="rounded-xl border border-slate-700 bg-slate-950/35 px-7 py-4 text-base font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/50"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 md:px-8 md:pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { number: String(listedProducts), label: "Products In Stock" },
            { number: "500+", label: "Hospitals Served" },
            { number: "99.8%", label: "Order Accuracy" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[28px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_18px_44px_rgba(2,6,23,0.18)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">{stat.number}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 md:px-8 md:pb-16">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-800 bg-slate-950/45 p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">For Buyers</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Place orders and manage sourcing requests.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Buyer access is built for procurement teams that need a clearer order flow without retail-style clutter.
            </p>
          </div>
          <div className="rounded-[28px] border border-slate-800 bg-slate-950/45 p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">For Suppliers</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Manage inventory and fulfill incoming demand.</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Admin access gives suppliers a dedicated workspace for product management, requests, and order operations.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 md:px-8 md:pb-16">
        <div className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)] md:p-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Frequently Asked Questions</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Quick answers before you place an order.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 md:text-base">
              Review the basics around supplier access, procurement flow, sourcing, and payments.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className={`rounded-2xl border transition ${
                    isOpen
                      ? "border-slate-700 bg-[#09111a]"
                      : "border-slate-800 bg-slate-950/35"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6"
                  >
                    <span className="text-base font-semibold text-slate-100 md:text-lg">
                      {faq.question}
                    </span>
                    <span className="text-xl text-slate-500">{isOpen ? "−" : "+"}</span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-sm leading-relaxed text-slate-400 md:px-6 md:pb-6 md:text-base">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
