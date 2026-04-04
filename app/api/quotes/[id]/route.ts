import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-session'
import { getLatestQuotedPrice, getQuoteWithAccess } from '@/lib/quote-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const quote = await getQuoteWithAccess(id, user)

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...quote,
      lastPrice: getLatestQuotedPrice(quote.messages)
    })
  } catch (error) {
    console.error('GET /api/quotes/[id] failed:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
