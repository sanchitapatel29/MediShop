import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth-session'
import { getLatestQuotedPrice } from '@/lib/quote-utils'

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Only buyers can request quotes' }, { status: 403 })
    }

    const body = await request.json()
    const productId = Number(body.productId)
    const quantity = Number(body.quantity)
    const rawMessage = typeof body.message === 'string' ? body.message.trim() : ''
    const price =
      body.price === '' || body.price === null || typeof body.price === 'undefined'
        ? null
        : Number(body.price)

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: 'A valid product is required' }, { status: 400 })
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 })
    }

    if (price !== null && (!Number.isFinite(price) || price <= 0)) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        stock: true,
        added_by: true,
        is_quote_enabled: true,
        min_quote_quantity: true,
        starting_quote_price: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.added_by) {
      return NextResponse.json({ error: 'This product does not have an active supplier' }, { status: 400 })
    }

    if (!product.is_quote_enabled) {
      return NextResponse.json({ error: 'Quotes are not enabled for this product' }, { status: 400 })
    }

    if (product.min_quote_quantity && quantity < product.min_quote_quantity) {
      return NextResponse.json(
        { error: `Minimum quote quantity for this product is ${product.min_quote_quantity}` },
        { status: 400 }
      )
    }

    if (product.stock <= 0) {
      return NextResponse.json({ error: 'This product is currently out of stock' }, { status: 400 })
    }

    const initialMessage = rawMessage || 'Requested a quote.'

    const quote = await prisma.quoteRequest.create({
      data: {
        productId: product.id,
        buyerId: user.id,
        supplierId: product.added_by,
        quantity,
        messages: {
          create: {
            senderId: user.id,
            message: initialMessage,
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
            price: true,
            stock: true
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

    await prisma.notification.create({
      data: {
        user_id: product.added_by,
        title: 'New Quote Request',
        message: `${user.name || user.email} requested a quote for ${product.name} (Qty: ${quantity})`,
        type: 'request'
      }
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('POST /api/quotes failed:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quotes = await prisma.quoteRequest.findMany({
      where: user.role === 'admin' ? { supplierId: user.id } : { buyerId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            stock: true
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
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(
      quotes.map((quote: (typeof quotes)[number]) => ({
        ...quote,
        lastPrice: getLatestQuotedPrice(quote.messages),
        lastMessage: quote.messages[quote.messages.length - 1] ?? null
      }))
    )
  } catch (error) {
    console.error('GET /api/quotes failed:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
