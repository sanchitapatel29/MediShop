"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "./brand-logo";

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [listedProducts, setListedProducts] = useState(0);
  const [animatedProducts, setAnimatedProducts] = useState(0);
  const [animatedHospitals, setAnimatedHospitals] = useState(0);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    const section = statsRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;

    const duration = 1200;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedProducts(Math.round(listedProducts * eased));
      setAnimatedHospitals(Math.round(500 * eased));
      setAnimatedAccuracy(Number((99.8 * eased).toFixed(1)));

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      }
    };

    const frameId = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frameId);
  }, [listedProducts, statsVisible]);

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <nav className="border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <p className="font-display text-[22px] font-semibold tracking-[-0.04em] text-white">MedEquip</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              onClick={() => router.push("/login")}
              className="rounded-full border border-slate-600 bg-slate-950/45 px-6 py-3 text-base font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-slate-900/75 sm:min-w-[168px]"
            >
              Buyer Sign In
            </button>
            <button
              onClick={() => router.push("/admin/login")}
              className="rounded-full bg-[linear-gradient(135deg,#dbeafe,#a5f3fc)] px-6 py-3 text-base font-semibold text-slate-950 shadow-[0_18px_36px_rgba(34,211,238,0.18)] transition hover:brightness-105 sm:min-w-[168px]"
            >
              Supplier Portal
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
        <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(9,18,29,0.8))] p-8 shadow-[0_40px_100px_rgba(2,6,23,0.38)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-100">
                MedEquip for procurement teams
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

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(10,18,30,0.92),rgba(7,12,22,0.96))] p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Why teams use it</p>
                <div className="mt-5 space-y-4">
                  {[
                    "Centralized equipment catalog with live stock visibility",
                    "Buyer and supplier portals with separate workflows",
                    "Request handling for items not yet listed",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.55)]" />
                      <p className="text-sm leading-relaxed text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { label: "Institutional Orders", value: "B2B Flow" },
                  { label: "Supplier Access", value: "Controlled" },
                  { label: "Request Tracking", value: "Built In" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-slate-800 bg-slate-950/35 p-5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                    <p className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-slate-100">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="mx-auto max-w-6xl px-4 pb-8 md:px-8 md:pb-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Products In Stock", value: animatedProducts, suffix: "" },
            { label: "Hospitals Served", value: animatedHospitals, suffix: "+" },
            { label: "Order Accuracy", value: animatedAccuracy, suffix: "%" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[28px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_18px_44px_rgba(2,6,23,0.18)]">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
              <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-slate-100">
                {stat.value}
                {stat.suffix}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 md:px-8 md:pb-16">
        <div className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)] md:p-8">
          <div className="mb-8 max-w-2xl">
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-gradient-to-r from-cyan-300/40 to-transparent" />
              <p className="text-xs uppercase tracking-[0.34em] text-cyan-200/75">Frequently Asked Questions</p>
            </div>
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
