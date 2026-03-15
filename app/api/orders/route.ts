import { NextResponse } from 'next/server'
import { getMultipleOrderDetails, saveOrderDetails } from '@/lib/order-details-store'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
    const { items, totalPrice, paymentType, deliveryDetails } = await request.json()

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

    // Reduce stock and notify admins
    const adminNotifications = new Map<number, { productNames: string[], totalItems: number }>()
    
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
      
      // Get product details to find admin
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { added_by: true, name: true }
      })
      
      if (product?.added_by) {
        if (!adminNotifications.has(product.added_by)) {
          adminNotifications.set(product.added_by, { productNames: [], totalItems: 0 })
        }
        const adminData = adminNotifications.get(product.added_by)!
        adminData.productNames.push(product.name)
        adminData.totalItems += item.quantity
      }
    }

    // Create notifications for each admin who has products in the order
    for (const [adminId, data] of adminNotifications) {
      await prisma.notification.create({
        data: {
          user_id: adminId,
          title: '🛒 New Order Received',
          message: `Order #${order.id} placed for ${data.totalItems} item(s): ${data.productNames.join(', ')}`,
          type: 'order'
        }
      })
    }

    // Also notify ALL admins about the order (for those who didn't add products)
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
            title: '🛒 New Order Received',
            message: `Order #${order.id} placed with ${items.length} item(s)`,
            type: 'order'
          }
        })
      }
    }

    return NextResponse.json({ message: 'Order placed successfully', order })
  } catch {
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

    const orderDetails = await getMultipleOrderDetails(
      orders.map((order: { id: number }) => order.id)
    )

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
