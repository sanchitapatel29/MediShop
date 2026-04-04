'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuoteList, type QuoteListItem } from '@/app/quote-list'

export default function QuotesPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<QuoteListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/quotes', { cache: 'no-store' })
      .then(async (response) => {
        if (response.status === 401) {
          router.push('/login')
          return []
        }

        return response.ok ? response.json() : []
      })
      .then((data) => {
        setQuotes(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <nav className="border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Negotiation Desk</p>
            <span className="text-xl font-semibold tracking-tight">My Quotes</span>
          </div>
          <button
            onClick={() => router.push('/products')}
            className="rounded-xl border border-slate-800 bg-slate-950/45 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            Back to Products
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <section className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,18,29,0.78))] p-6 shadow-[0_32px_90px_rgba(2,6,23,0.34)] md:p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Buyer Quotes</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Track quote requests and active negotiations.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400 md:text-base">
            Review supplier responses, compare latest offers, and accept or reject negotiated pricing before it turns into an order.
          </p>
        </section>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading quotes...</div>
        ) : (
          <QuoteList
            quotes={quotes}
            counterpartLabel="Supplier"
            emptyTitle="No quote requests yet"
            emptyBody="Open a product and request a quote to start negotiating with a supplier."
          />
        )}
      </div>
    </main>
  )
}
