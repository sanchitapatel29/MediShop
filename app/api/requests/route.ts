import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
    const { name, description, quantity, urgency } = await request.json()

    const productRequest = await prisma.productRequest.create({
      data: {
        user_id: decoded.userId,
        name,
        description,
        quantity: parseInt(quantity),
        urgency
      }
    })

    return NextResponse.json({ message: 'Request submitted successfully', productRequest })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number, role: string }

    // Admins see all requests, doctors see only their own
    const requests = await prisma.productRequest.findMany({
      where: decoded.role === 'admin' ? {} : { user_id: decoded.userId },
      include: { user: { select: { name: true, email: true, hospital_name: true } } },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}