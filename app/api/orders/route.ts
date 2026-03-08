import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
    const { items, totalPrice, paymentType } = await request.json()

    const amountPaid = paymentType === 'split' ? totalPrice * 0.6 : totalPrice

    const order = await prisma.order.create({
      data: {
        user_id: decoded.userId,
        total_price: totalPrice,
        amount_paid: amountPaid,
        payment_type: paymentType || 'full',
        status: 'pending',
        items: {
          create: items.map((item: { productId: number, quantity: number, price: number }) => ({
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    })

    // Reduce stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }

    return NextResponse.json({ message: 'Order placed successfully', order })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }

    const orders = await prisma.order.findMany({
      where: { user_id: decoded.userId },
      include: {
        items: { include: { product: true } }
      },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}