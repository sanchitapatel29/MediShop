import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { getMultipleOrderDetails, saveOrderDetails } from '@/lib/order-details-store'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

type OrderProduct = {
  id: number
  name: string
  stock: number
  added_by: number | null
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
    const { items, totalPrice, paymentType, deliveryDetails } = await request.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
    }

    const requiredFields = [
      'fullName',
      'phone',
      'email',
      'addressLine1',
      'city',
      'state',
      'postalCode',
      'country',
      'billingName',
      'billingAddress'
    ] as const

    const missingField = requiredFields.find((field) => !deliveryDetails?.[field]?.toString().trim())
    if (missingField) {
      return NextResponse.json({ error: 'Delivery and billing details are required' }, { status: 400 })
    }

    const amountPaid = paymentType === 'split' ? totalPrice * 0.6 : totalPrice
    const typedItems = items as { productId: number, quantity: number, price: number }[]
    const productIds = typedItems.map((item) => item.productId)

    const products: OrderProduct[] = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true, added_by: true }
    })
    const productMap = new Map<number, OrderProduct>(
      products.map((product: OrderProduct) => [product.id, product])
    )

    for (const item of typedItems) {
      const product = productMap.get(item.productId)

      if (!product) {
        return NextResponse.json({ error: 'One or more products were not found' }, { status: 404 })
      }

      if (item.quantity <= 0) {
        return NextResponse.json({ error: `Invalid quantity for ${product.name}` }, { status: 400 })
      }

      if (product.stock <= 0) {
        return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 })
      }

      if (item.quantity > product.stock) {
        return NextResponse.json(
          { error: `Only ${product.stock} unit(s) left for ${product.name}` },
          { status: 400 }
        )
      }
    }

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const item of typedItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity }
          },
          data: {
            stock: { decrement: item.quantity }
          }
        })

        if (updated.count === 0) {
          const product = productMap.get(item.productId)
          throw new Error(product ? `${product.name} is no longer available in that quantity` : 'Stock update failed')
        }
      }

      return tx.order.create({
        data: {
          user_id: decoded.userId,
          total_price: totalPrice,
          amount_paid: amountPaid,
          payment_type: paymentType || 'full',
          status: 'pending',
          items: {
            create: typedItems.map((item) => ({
              product_id: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      })
    })

    let deliveryDetailsSaved = true
    try {
      await saveOrderDetails(order.id, {
        fullName: deliveryDetails.fullName.trim(),
        phone: deliveryDetails.phone.trim(),
        email: deliveryDetails.email.trim(),
        companyName: deliveryDetails.companyName?.trim() || '',
        addressLine1: deliveryDetails.addressLine1.trim(),
        addressLine2: deliveryDetails.addressLine2?.trim() || '',
        city: deliveryDetails.city.trim(),
        state: deliveryDetails.state.trim(),
        postalCode: deliveryDetails.postalCode.trim(),
        country: deliveryDetails.country.trim(),
        billingName: deliveryDetails.billingName.trim(),
        billingGstin: deliveryDetails.billingGstin?.trim() || '',
        billingAddress: deliveryDetails.billingAddress.trim()
      })
    } catch {
      deliveryDetailsSaved = false
    }

    const adminNotifications = new Map<number, { productNames: string[], totalItems: number }>()

    for (const item of typedItems) {
      const product = productMap.get(item.productId)

      if (product?.added_by) {
        if (!adminNotifications.has(product.added_by)) {
          adminNotifications.set(product.added_by, { productNames: [], totalItems: 0 })
        }

        const adminData = adminNotifications.get(product.added_by)!
        adminData.productNames.push(product.name)
        adminData.totalItems += item.quantity
      }
    }

    for (const [adminId, data] of adminNotifications) {
      await prisma.notification.create({
        data: {
          user_id: adminId,
          title: 'New Order Received',
          message: `Order #${order.id} placed for ${data.totalItems} item(s): ${data.productNames.join(', ')}`,
          type: 'order'
        }
      })
    }

    const allAdmins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true }
    })

    const notifiedAdminIds = new Set(adminNotifications.keys())
    for (const admin of allAdmins) {
      if (!notifiedAdminIds.has(admin.id)) {
        await prisma.notification.create({
          data: {
            user_id: admin.id,
            title: 'New Order Received',
            message: `Order #${order.id} placed with ${typedItems.length} item(s)`,
            type: 'order'
          }
        })
      }
    }

    return NextResponse.json({
      message: 'Order placed successfully',
      order,
      deliveryDetailsSaved
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 500 })
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

    let orderDetails: Record<number, unknown> = {}
    try {
      orderDetails = await getMultipleOrderDetails(
        orders.map((order: { id: number }) => order.id)
      ) as Record<number, unknown>
    } catch {
      orderDetails = {}
    }

    return NextResponse.json(
      orders.map((order: { id: number } & Record<string, unknown>) => ({
        ...order,
        deliveryDetails: orderDetails[order.id] || null
      }))
    )
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
