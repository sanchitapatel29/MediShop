"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "./brand-logo";

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1623]/92 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <div>
              <p className="font-display text-[20px] font-semibold tracking-[-0.04em] text-white">VitalOps</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Healthcare Operations</p>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <button
              onClick={() => router.push("/login")}
              className="rounded-full border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-medium text-slate-200 transition duration-200 hover:border-slate-500 hover:bg-white/5 sm:min-w-[154px]"
            >
              Buyer Sign In
            </button>
            <button
              onClick={() => router.push("/admin/login")}
              className="rounded-full bg-cyan-100 px-5 py-2.5 text-sm font-semibold text-slate-950 transition duration-200 hover:bg-cyan-50 sm:min-w-[154px]"
            >
              Supplier Portal
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
        <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(9,18,29,0.8))] p-8 shadow-[0_40px_100px_rgba(2,6,23,0.38)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-100">
                VitalOps for procurement teams
              </div>
              <div className="mt-6 max-w-4xl">
                <h1 className="font-display text-4xl font-semibold tracking-[-0.06em] text-balance md:text-6xl">
                  Buy medical equipment without chasing suppliers across calls, chats, and spreadsheets.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg">
                  Compare listed products, place structured orders, and handle sourcing requests in one workflow built for hospitals and clinics.
                </p>
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push("/signup")}
                  className="rounded-full bg-slate-100 px-8 py-4 text-base font-semibold text-slate-950 transition hover:bg-white"
                >
                  Create Buyer Account
                </button>
                <button
                  onClick={() => router.push("/products")}
                  className="rounded-full border border-slate-700 bg-slate-950/35 px-8 py-4 text-base font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-900/50"
                >
                  View Product Catalog
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(10,18,30,0.92),rgba(7,12,22,0.96))] p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Recent Orders</p>
                  <p className="mt-2 text-2xl font-semibold text-white">Operations Snapshot</p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  Live
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { name: "Ventilator", meta: "City General Hospital", status: "Delivered", tone: "bg-emerald-400/10 text-emerald-200" },
                  { name: "ECG Machine", meta: "Metro Care Clinic", status: "Pending", tone: "bg-amber-400/10 text-amber-200" },
                  { name: "Syringe Pump", meta: "Apex Health Center", status: "Processing", tone: "bg-cyan-400/10 text-cyan-200" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.tone}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Why it works</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  One catalog, one ordering flow, and one place to handle urgent sourcing requests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 md:px-8 md:pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Centralized equipment catalog",
              body: "Review available products and compare procurement options from one structured workspace.",
            },
            {
              title: "Faster sourcing workflow",
              body: "Place orders and handle unlisted equipment requests without switching between tools.",
            },
            {
              title: "Clear supplier coordination",
              body: "Keep buyers and supplier teams aligned through one operational flow.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[24px] border border-slate-800 bg-slate-950/35 p-6">
              <p className="text-lg font-semibold text-slate-100">{item.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-14 md:px-8 md:pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-100 md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 md:text-base">
            A few quick answers on procurement flow, supplier access, and sourcing.
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
                    : "border-slate-800 bg-slate-950/25"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02] md:px-6"
                >
                  <span className="text-base font-semibold text-slate-100 md:text-lg">
                    {faq.question}
                  </span>
                  <span className="text-xl text-slate-500">{isOpen ? "-" : "+"}</span>
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
      </section>
    </main>
  );
}
