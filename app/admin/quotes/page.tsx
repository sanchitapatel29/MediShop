'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuoteList, type QuoteListItem } from '@/app/quote-list'

export default function AdminQuotesPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<QuoteListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/quotes', { cache: 'no-store' })
      .then(async (response) => {
        if (response.status === 401) {
          router.push('/admin/login')
          return []
        }

        if (response.status === 403) {
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
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Supplier Negotiation Desk</p>
            <span className="text-xl font-semibold tracking-tight">Incoming Quotes</span>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="rounded-xl border border-slate-800 bg-slate-950/45 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <section className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,18,29,0.78))] p-6 shadow-[0_32px_90px_rgba(2,6,23,0.34)] md:p-8">
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Supplier Quotes</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Respond to quote requests before they become orders.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400 md:text-base">
            Review buyer demand, send offers or counter-offers, and close negotiations with a cleaner supplier workflow.
          </p>
        </section>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading quotes...</div>
        ) : (
          <QuoteList
            quotes={quotes}
            counterpartLabel="Buyer"
            emptyTitle="No incoming quotes yet"
            emptyBody="Quote requests from buyers will appear here as soon as they request pricing on one of your products."
          />
        )}
      </div>
    </main>
  )
}
