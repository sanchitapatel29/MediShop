'use client'

function formatQuoteStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

function getQuoteStatusTone(status: string) {
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

export function QuoteStatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getQuoteStatusTone(status)}`}>
      {formatQuoteStatus(status)}
    </span>
  )
}
