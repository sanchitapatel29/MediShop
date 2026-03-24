import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth-session'

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { name, description, quantity, urgency } = await request.json()

    const productRequest = await prisma.productRequest.create({
      data: {
        user_id: user.id,
        name,
        description,
        quantity: parseInt(quantity),
        urgency
      }
    })

    return NextResponse.json({ message: 'Request submitted successfully', productRequest })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Admins see all requests, doctors see only their own
    const requests = await prisma.productRequest.findMany({
      where: user.role === 'admin' ? {} : { user_id: user.id },
      include: { user: { select: { name: true, email: true, hospital_name: true } } },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json(requests)
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
