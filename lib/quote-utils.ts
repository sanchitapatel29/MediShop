import type { QuoteStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { SessionUser } from '@/lib/auth-session'

export const QUOTE_TERMINAL_STATUSES: QuoteStatus[] = ['ACCEPTED', 'REJECTED', 'EXPIRED']

export function isQuoteTerminal(status: QuoteStatus) {
  return QUOTE_TERMINAL_STATUSES.includes(status)
}

export function formatQuoteStatus(status: QuoteStatus | string) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

export function getQuoteStatusTone(status: QuoteStatus | string) {
  switch (status) {
    case 'PENDING':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-200'
    case 'NEGOTIATING':
      return 'border-sky-500/20 bg-sky-500/10 text-sky-200'
    case 'ACCEPTED':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
    case 'REJECTED':
      return 'border-red-500/20 bg-red-500/10 text-red-200'
    case 'EXPIRED':
      return 'border-slate-700 bg-slate-800 text-slate-300'
    default:
      return 'border-slate-700 bg-slate-900/70 text-slate-300'
  }
}

export async function getQuoteWithAccess(quoteId: string, user: SessionUser) {
  const quote = await prisma.quoteRequest.findUnique({
    where: { id: quoteId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          price: true,
          stock: true,
          certification: true,
          added_by: true
        }
      },
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
          hospital_name: true
        }
      },
      supplier: {
        select: {
          id: true,
          name: true,
          email: true,
          hospital_name: true
        }
      },
      messages: {
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              hospital_name: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!quote) {
    return null
  }

  const isBuyer = quote.buyerId === user.id
  const isSupplier = quote.supplierId === user.id

  if (!isBuyer && !isSupplier) {
    return null
  }

  return quote
}

export function getLatestQuotedPrice(
  messages: Array<{ price: number | null }>
) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const price = messages[index]?.price
    if (typeof price === 'number') {
      return price
    }
  }

  return null
}

export function getLatestPricedMessage<T extends { price: number | null }>(messages: T[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const entry = messages[index]
    if (typeof entry?.price === 'number') {
      return entry
    }
  }

  return null
}
