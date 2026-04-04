import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth-session'
import { getQuoteWithAccess, isQuoteTerminal } from '@/lib/quote-utils'

export async function POST(
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

    if (isQuoteTerminal(quote.status)) {
      return NextResponse.json({ error: 'This quote is already closed' }, { status: 400 })
    }

    await prisma.quoteRequest.update({
      where: { id: quote.id },
      data: { status: 'EXPIRED' }
    })

    const recipientId = user.id === quote.buyerId ? quote.supplierId : quote.buyerId
    await prisma.notification.create({
      data: {
        user_id: recipientId,
        title: 'Quote Expired',
        message: `The quote for ${quote.product.name} was marked as expired`,
        type: 'info'
      }
    })

    return NextResponse.json({ message: 'Quote expired' })
  } catch (error) {
    console.error('POST /api/quotes/[id]/expire failed:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
