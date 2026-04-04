import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
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

    if (quote.buyerId !== user.id) {
      return NextResponse.json({ error: 'Only the buyer can accept a quote' }, { status: 403 })
    }

    if (isQuoteTerminal(quote.status)) {
      return NextResponse.json({ error: 'This quote is already closed' }, { status: 400 })
    }

    const latestPricedMessage = [...quote.messages]
      .reverse()
      .find((message) => typeof message.price === 'number')
    if (!latestPricedMessage || latestPricedMessage.sender.id !== quote.supplierId || latestPricedMessage.price === null) {
      return NextResponse.json(
        { error: 'You can only accept a price that was offered by the supplier' },
        { status: 400 }
      )
    }

    const finalUnitPrice = latestPricedMessage.price
    const totalPrice = finalUnitPrice * quote.quantity

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedProduct = await tx.product.updateMany({
        where: {
          id: quote.productId,
          stock: { gte: quote.quantity }
        },
        data: {
          stock: { decrement: quote.quantity }
        }
      })

      if (updatedProduct.count === 0) {
        throw new Error('Insufficient stock to accept this quote')
      }

      const createdOrder = await tx.order.create({
        data: {
          user_id: quote.buyerId,
          total_price: totalPrice,
          amount_paid: 0,
          payment_type: 'full',
          status: 'pending',
          items: {
            create: {
              product_id: quote.productId,
              quantity: quote.quantity,
              price: finalUnitPrice
            }
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      await tx.quoteRequest.update({
        where: { id: quote.id },
        data: { status: 'ACCEPTED' }
      })

      await tx.notification.createMany({
        data: [
          {
            user_id: quote.supplierId,
            title: 'Quote Accepted',
            message: `Quote for ${quote.product.name} was accepted and converted to order #${createdOrder.id}`,
            type: 'order'
          },
          {
            user_id: quote.buyerId,
            title: 'Order Created From Quote',
            message: `Your accepted quote for ${quote.product.name} created order #${createdOrder.id}`,
            type: 'order'
          }
        ]
      })

      return createdOrder
    })

    return NextResponse.json({
      message: 'Quote accepted successfully',
      order
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    console.error('POST /api/quotes/[id]/accept failed:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
