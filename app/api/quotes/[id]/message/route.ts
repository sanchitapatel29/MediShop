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

    const body = await request.json()
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const price =
      body.price === '' || body.price === null || typeof body.price === 'undefined'
        ? null
        : Number(body.price)

    if (!message && price === null) {
      return NextResponse.json({ error: 'Message or price is required' }, { status: 400 })
    }

    if (price !== null && (!Number.isFinite(price) || price <= 0)) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 })
    }

    const updatedQuote = await prisma.quoteRequest.update({
      where: { id: quote.id },
      data: {
        status: 'NEGOTIATING',
        messages: {
          create: {
            senderId: user.id,
            message: message || null,
            price
          }
        }
      },
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

    const recipientId = user.id === quote.buyerId ? quote.supplierId : quote.buyerId
    await prisma.notification.create({
      data: {
        user_id: recipientId,
        title: 'Quote Updated',
        message:
          price !== null
            ? `${user.name || user.email} sent a new quote offer of Rs ${price.toLocaleString()}`
            : `${user.name || user.email} replied in quote negotiation`,
        type: 'info'
      }
    })

    return NextResponse.json(updatedQuote)
  } catch (error) {
    console.error('POST /api/quotes/[id]/message failed:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
