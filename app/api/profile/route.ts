import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { deleteReviewsByUser } from '@/lib/product-content-store'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth-session'

export async function GET() {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        hospital_name: true,
        role: true,
        created_at: true,
        orders: {
          select: {
            id: true,
            total_price: true,
            status: true,
            created_at: true
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            stock: true,
            created_at: true
          }
        }
      }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // For admins, also get orders containing their products
    let adminOrders: {
      id: number
      total_price: number
      status: string
      created_at: Date
    }[] = []
    if (user.role === 'admin') {
      const productIds = user.products.map((p: { id: number }) => p.id)
      adminOrders = await prisma.order.findMany({
        where: {
          items: {
            some: {
              product_id: { in: productIds }
            }
          }
        },
        select: {
          id: true,
          total_price: true,
          status: true,
          created_at: true
        }
      })
    }

    return NextResponse.json({ ...user, adminOrders })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const userOrders = await prisma.order.findMany({
      where: { user_id: user.id },
      select: { id: true }
    })

    const orderIds = userOrders.map((order: { id: number }) => order.id)

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (orderIds.length > 0) {
        await tx.orderItem.deleteMany({
          where: { order_id: { in: orderIds } }
        })
      }

      await tx.notification.deleteMany({
        where: { user_id: user.id }
      })

      await tx.productRequest.deleteMany({
        where: { user_id: user.id }
      })

      await tx.product.updateMany({
        where: { added_by: user.id },
        data: { added_by: null }
      })

      if (orderIds.length > 0) {
        await tx.order.deleteMany({
          where: { id: { in: orderIds } }
        })
      }

      await tx.user.delete({
        where: { id: user.id }
      })
    })

    await deleteReviewsByUser(user.id)

    return NextResponse.json({ message: 'Profile deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
