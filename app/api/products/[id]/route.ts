import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import {
  addProductReview,
  deleteProductContent,
  deleteProductReviews,
  getProductContent,
  getProductReviews
} from '@/lib/product-content-store'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            hospital_name: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const [content, reviews] = await Promise.all([
      getProductContent(productId),
      getProductReviews(productId)
    ])

    return NextResponse.json({
      ...product,
      detailedDescription: content.detailedDescription,
      imageUrls: content.imageUrls,
      reviews
    })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number, role: string }
    if (decoded.role === 'admin') {
      return NextResponse.json({ error: 'Only customers can post reviews' }, { status: 403 })
    }

    const { id } = await params
    const productId = parseInt(id)
    const body = await request.json()
    const rating = Number(body.rating)
    const comment = typeof body.comment === 'string' ? body.comment.trim() : ''

    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
      return NextResponse.json({ error: 'Valid rating and comment are required' }, { status: 400 })
    }

    const [product, user] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId }, select: { id: true } }),
      prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, hospital_name: true }
      })
    ])

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const review = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productId,
      userId: user.id,
      userName: user.name,
      hospitalName: user.hospital_name,
      rating,
      comment,
      createdAt: new Date().toISOString()
    }

    await addProductReview(review)

    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)

    await prisma.product.delete({
      where: { id: productId }
    })

    await Promise.all([
      deleteProductContent(productId),
      deleteProductReviews(productId)
    ])

    return NextResponse.json({ message: 'Product deleted' })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
