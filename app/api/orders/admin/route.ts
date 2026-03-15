import { NextResponse } from 'next/server'
import { getMultipleOrderDetails } from '@/lib/order-details-store'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number, role: string }
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Get all products this admin added
    const myProducts = await prisma.product.findMany({
      where: { added_by: decoded.userId },
      select: { id: true }
    })
    const myProductIds = myProducts.map((p: { id: number }) => p.id)

    // Get orders that contain at least one of their products
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product_id: { in: myProductIds }
          }
        }
      },
      include: {
        user: { select: { name: true, email: true, hospital_name: true } },
        items: {
          include: { product: true },
          // Only show items that belong to this admin
          where: { product_id: { in: myProductIds } }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    const orderDetails = await getMultipleOrderDetails(orders.map((order) => order.id))

    return NextResponse.json(
      orders.map((order) => ({
        ...order,
        deliveryDetails: orderDetails[order.id] || null
      }))
    )
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number, role: string }
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { orderId, status } = await request.json()

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    // Notify the doctor
    await prisma.notification.create({
      data: {
        user_id: updated.user_id,
        title: `Order #${orderId} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your order #${orderId} has been updated to: ${status}`,
        type: 'order_update'
      }
    })

    return NextResponse.json({ message: 'Order updated' })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number, role: string }
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { orderId } = await request.json()

    await prisma.orderItem.deleteMany({ where: { order_id: orderId } })
    await prisma.order.delete({ where: { id: orderId } })

    return NextResponse.json({ message: 'Order deleted' })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
