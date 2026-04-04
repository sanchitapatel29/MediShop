'use client'

import { useRouter } from 'next/navigation'
import { QuoteStatusBadge } from '@/app/quote-status-badge'

export interface QuoteListItem {
  id: string
  status: string
  quantity: number
  updatedAt: string
  createdAt: string
  lastPrice: number | null
  product: {
    id: number
    name: string
    category: string
    price: number
    stock: number
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
}

interface QuoteListProps {
  quotes: QuoteListItem[]
  emptyTitle: string
  emptyBody: string
  counterpartLabel: 'Buyer' | 'Supplier'
}

export function QuoteList({ quotes, emptyTitle, emptyBody, counterpartLabel }: QuoteListProps) {
  const router = useRouter()

  if (quotes.length === 0) {
    return (
      <div className="rounded-[32px] border border-slate-800 bg-slate-950/45 p-16 text-center shadow-[0_24px_70px_rgba(2,6,23,0.2)]">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Quotes</p>
        <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-100">{emptyTitle}</p>
        <p className="mt-3 text-slate-400">{emptyBody}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {quotes.map((quote) => {
        const counterpart = counterpartLabel === 'Buyer' ? quote.buyer : quote.supplier

        return (
          <article
            key={quote.id}
            onClick={() => router.push(`/quotes/${quote.id}`)}
            className="cursor-pointer rounded-[32px] border border-slate-800 bg-slate-950/45 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)] transition hover:border-slate-700 hover:bg-slate-950/60"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-lg font-semibold tracking-tight text-slate-100">{quote.product.name}</p>
                <p className="mt-1 text-sm text-slate-400">{quote.product.category}</p>
                <p className="mt-3 text-sm text-slate-400">
                  {counterpartLabel}: <span className="text-slate-100">{counterpart.hospital_name || counterpart.name}</span>
                </p>
                <p className="mt-1 text-sm text-slate-500">Quantity: {quote.quantity}</p>
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <QuoteStatusBadge status={quote.status} />
                <div className="text-left md:text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Latest Price</p>
                  <p className="mt-1 text-lg font-semibold text-slate-100">
                    {quote.lastPrice !== null ? `Rs ${quote.lastPrice.toLocaleString()}` : 'Awaiting offer'}
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Updated{' '}
                  {new Date(quote.updatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
