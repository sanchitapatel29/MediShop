'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { QuoteStatusBadge } from '@/app/quote-status-badge'

interface QuoteDetail {
  id: string
  status: string
  quantity: number
  createdAt: string
  updatedAt: string
  lastPrice: number | null
  product: {
    id: number
    name: string
    category: string
    description: string
    price: number
    stock: number
    certification: string | null
  }
  buyer: {
    id: number
    name: string
    email: string
    hospital_name: string | null
  }
  supplier: {
    id: number
    name: string
    email: string
    hospital_name: string | null
  }
  messages: Array<{
    id: string
    message: string | null
    price: number | null
    createdAt: string
    sender: {
      id: number
      name: string | null
      email: string
      hospital_name: string | null
      role: string
    }
  }>
}

const closedStatuses = new Set(['ACCEPTED', 'REJECTED', 'EXPIRED'])

function getLatestPricedMessage(
  messages: QuoteDetail['messages']
) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const entry = messages[index]
    if (typeof entry?.price === 'number') {
      return entry
    }
  }

  return null
}

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [quote, setQuote] = useState<QuoteDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [offerPrice, setOfferPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackTone, setFeedbackTone] = useState<'error' | 'success'>('success')

  const fetchQuote = async (quoteId: string) => {
    const response = await fetch(`/api/quotes/${quoteId}`, { cache: 'no-store' })
    const data = response.ok ? await response.json() : null
    return { response, data }
  }

  useEffect(() => {
    let active = true

    async function run() {
      if (!params?.id) {
        return
      }

      try {
        const { response, data } = await fetchQuote(params.id)

        if (!active) {
          return
        }

        if (response.status === 401) {
          router.push('/login')
          return
        }

        if (!response.ok || !data) {
          setLoading(false)
          setFeedbackTone('error')
          setFeedback('Unable to load this quote.')
          return
        }

        setQuote(data)
        setLoading(false)
      } catch {
        if (!active) {
          return
        }

        setLoading(false)
        setFeedbackTone('error')
        setFeedback('Unable to load this quote.')
      }
    }

    void run()

    return () => {
      active = false
    }
  }, [params?.id, router])

  const currentUserId = Number(session?.user?.id)
  const isBuyer = quote?.buyer.id === currentUserId
  const isSupplier = quote?.supplier.id === currentUserId
  const isClosed = quote ? closedStatuses.has(quote.status) : false
  const latestPricedMessage = quote ? getLatestPricedMessage(quote.messages) : null
  const latestSupplierOffer =
    quote && latestPricedMessage?.sender.id === quote.supplier.id ? latestPricedMessage : null

  const counterpartLabel = isBuyer ? 'Supplier' : 'Buyer'
  const counterpart = isBuyer ? quote?.supplier : quote?.buyer

  const canAccept = Boolean(isBuyer && quote && !isClosed && latestSupplierOffer?.price !== null)

  const quoteSummaryPrice = useMemo(() => {
    if (!quote || latestSupplierOffer?.price === null || typeof latestSupplierOffer?.price !== 'number') {
      return null
    }

    return latestSupplierOffer.price * quote.quantity
  }, [latestSupplierOffer, quote])

  const handleSendMessage = async () => {
    if (!quote) return

    setSubmitting(true)
    setFeedback('')

    const response = await fetch(`/api/quotes/${quote.id}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        price: offerPrice
      })
    })

    const data = await response.json()
    setSubmitting(false)

    if (!response.ok) {
      setFeedbackTone('error')
      setFeedback(data.error || 'Unable to send message')
      return
    }

    setQuote({
      ...data,
      lastPrice: [...data.messages].reverse().find((entry) => typeof entry.price === 'number')?.price ?? null
    })
    setMessage('')
    setOfferPrice('')
    setFeedbackTone('success')
    setFeedback('Offer sent successfully.')
  }

  const handleQuoteAction = async (action: 'accept' | 'reject' | 'expire') => {
    if (!quote) return

    setSubmitting(true)
    setFeedback('')

    const response = await fetch(`/api/quotes/${quote.id}/${action}`, {
      method: 'POST'
    })
    const data = await response.json()
    setSubmitting(false)

    if (!response.ok) {
      setFeedbackTone('error')
      setFeedback(data.error || 'Unable to update quote')
      return
    }

    if (action === 'accept') {
      router.push('/orders')
      return
    }

    const { response: refreshResponse, data: refreshedQuote } = await fetchQuote(quote.id)
    if (!refreshResponse.ok || !refreshedQuote) {
      setFeedbackTone('error')
      setFeedback('Quote was updated, but the latest thread could not be refreshed.')
      return
    }

    setQuote(refreshedQuote)
    setFeedbackTone('success')
    setFeedback(data.message || 'Quote updated.')
  }

  if (loading || sessionStatus === 'loading') {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center text-slate-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-transparent" />
      </main>
    )
  }

  if (!quote) {
    return (
      <main className="app-shell min-h-screen px-4 py-12 text-slate-100">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-800 bg-slate-950/50 p-10 text-center shadow-[0_30px_80px_rgba(2,6,23,0.28)]">
          <p className="text-2xl font-semibold tracking-tight">Quote unavailable</p>
          <p className="mt-3 text-slate-400">{feedback || 'This quote could not be loaded.'}</p>
          <button
            onClick={() => router.push(session?.user?.role === 'admin' ? '/admin/quotes' : '/quotes')}
            className="mt-6 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
          >
            Back to Quotes
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="app-shell min-h-screen text-slate-100">
      <nav className="border-b border-white/10 bg-[#0b1623]/90 px-4 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => router.push(session?.user?.role === 'admin' ? '/admin/quotes' : '/quotes')}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            Back to Quotes
          </button>
          <button
            onClick={() => router.push(`/products/${quote.product.id}`)}
            className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            View Product
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <section className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(9,18,29,0.78))] p-6 shadow-[0_32px_90px_rgba(2,6,23,0.34)] md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Negotiation Thread</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{quote.product.name}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400 md:text-base">{quote.product.description}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
                <span>Quantity: {quote.quantity}</span>
                <span className="h-1 w-1 self-center rounded-full bg-slate-600" />
                <span>{counterpartLabel}: {counterpart?.hospital_name || counterpart?.name || counterpart?.email}</span>
                <span className="h-1 w-1 self-center rounded-full bg-slate-600" />
                <span>Stock left: {quote.product.stock}</span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <QuoteStatusBadge status={quote.status} />
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                Latest offer:{' '}
                <span className="font-semibold text-slate-100">
                  {quote.lastPrice !== null ? `Rs ${quote.lastPrice.toLocaleString()}` : 'Awaiting price'}
                </span>
              </div>
              {isBuyer && latestSupplierOffer?.price === null && !isClosed && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  Waiting for a supplier price before this quote can be accepted.
                </div>
              )}
              {quoteSummaryPrice !== null && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                  Negotiated total: <span className="font-semibold text-slate-100">Rs {quoteSummaryPrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {feedback && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              feedbackTone === 'success'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                : 'border-red-500/20 bg-red-500/10 text-red-200'
            }`}
          >
            {feedback}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <section className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)]">
            <div className="mb-6 border-b border-white/8 pb-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Conversation</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Messages and price offers</h2>
            </div>

            <div className="space-y-4">
              {quote.messages.map((entry) => {
                const isOwnMessage = entry.sender.id === currentUserId

                return (
                  <div key={entry.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xl rounded-[24px] border px-4 py-4 shadow-[0_18px_44px_rgba(2,6,23,0.14)] ${
                        isOwnMessage
                          ? 'border-cyan-500/20 bg-cyan-500/10 text-slate-100'
                          : 'border-slate-800 bg-[#09111a] text-slate-100'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-200">
                          {entry.sender.hospital_name || entry.sender.name || entry.sender.email}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(entry.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {entry.price !== null && (
                        <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Offer Price</p>
                          <p className="mt-1 text-xl font-semibold text-white">Rs {entry.price.toLocaleString()}</p>
                        </div>
                      )}

                      {entry.message && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-200">{entry.message}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)]">
            <div className="mb-6 border-b border-white/8 pb-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Next Step</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{isClosed ? 'Quote Closed' : 'Send a counter-offer'}</h2>
            </div>

            {isClosed ? (
              <div className="rounded-2xl border border-slate-800 bg-[#09111a] p-5 text-sm text-slate-400">
                This negotiation is closed. You can still review the conversation history above.
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write a message or negotiation note"
                  className="w-full rounded-2xl border border-slate-800 bg-[#09111a] px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={offerPrice}
                  onChange={(event) => setOfferPrice(event.target.value)}
                  placeholder="Optional price offer"
                  className="w-full rounded-xl border border-slate-800 bg-[#09111a] px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={submitting || (!message.trim() && !offerPrice)}
                  className="w-full rounded-xl bg-slate-100 py-3 font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Sending...' : isSupplier ? 'Send Offer' : 'Send Counter-Offer'}
                </button>
              </div>
            )}

            <div className="mt-6 space-y-3 rounded-[28px] border border-slate-800 bg-[#09111a] p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Actions</p>
              {canAccept && (
                <button
                  onClick={() => handleQuoteAction('accept')}
                  disabled={submitting}
                  className="w-full rounded-xl bg-emerald-200 py-3 font-semibold text-slate-950 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Accept Quote and Create Order
                </button>
              )}
              {!isClosed && (
                <>
                  <button
                    onClick={() => handleQuoteAction('reject')}
                    disabled={submitting}
                    className="w-full rounded-xl border border-red-500/20 bg-red-500/10 py-3 font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Reject Quote
                  </button>
                  <button
                    onClick={() => handleQuoteAction('expire')}
                    disabled={submitting}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/60 py-3 font-medium text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Mark as Expired
                  </button>
                </>
              )}
              {isBuyer && latestSupplierOffer?.price === null && !isClosed && (
                <p className="text-xs leading-relaxed text-slate-500">
                  The buyer can accept once the supplier sends a price offer in the conversation.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
