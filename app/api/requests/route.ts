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
  } catch (error) {
    console.error('POST /api/requests failed:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const requests = await prisma.productRequest.findMany({
      where: user.role === 'admin' ? {} : { user_id: user.id },
      include: {
        user: { select: { name: true, email: true, hospital_name: true } },
        assignedAdmin: { select: { id: true, name: true, email: true, hospital_name: true } }
      },
      orderBy: [{ status: 'asc' }, { created_at: 'desc' }]
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('GET /api/requests failed:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { requestId, action } = await request.json()
    const id = Number(requestId)

    if (!Number.isInteger(id) || !action) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const existingRequest = await prisma.productRequest.findUnique({
      where: { id },
      include: {
        assignedAdmin: { select: { id: true, name: true, email: true } }
      }
    })

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (action === 'claim') {
      if (existingRequest.assigned_to && existingRequest.assigned_to !== user.id) {
        return NextResponse.json(
          { error: `Already claimed by ${existingRequest.assignedAdmin?.name || existingRequest.assignedAdmin?.email || 'another supplier'}` },
          { status: 409 }
        )
      }

      const updated = await prisma.productRequest.update({
        where: { id },
        data: {
          assigned_to: user.id,
          status: existingRequest.status === 'fulfilled' ? 'claimed' : 'claimed',
          claimed_at: existingRequest.claimed_at ?? new Date(),
          resolved_at: null
        },
        include: {
          user: { select: { name: true, email: true, hospital_name: true } },
          assignedAdmin: { select: { id: true, name: true, email: true, hospital_name: true } }
        }
      })

      return NextResponse.json(updated)
    }

    if (existingRequest.assigned_to !== user.id) {
      return NextResponse.json({ error: 'Only the assigned supplier can update this request' }, { status: 403 })
    }

    if (action === 'release') {
      const updated = await prisma.productRequest.update({
        where: { id },
        data: {
          assigned_to: null,
          status: 'pending',
          claimed_at: null,
          resolved_at: null
        },
        include: {
          user: { select: { name: true, email: true, hospital_name: true } },
          assignedAdmin: { select: { id: true, name: true, email: true, hospital_name: true } }
        }
      })

      return NextResponse.json(updated)
    }

    if (action === 'fulfill') {
      const updated = await prisma.productRequest.update({
        where: { id },
        data: {
          status: 'fulfilled',
          resolved_at: new Date()
        },
        include: {
          user: { select: { name: true, email: true, hospital_name: true } },
          assignedAdmin: { select: { id: true, name: true, email: true, hospital_name: true } }
        }
      })

      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('PATCH /api/requests failed:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
