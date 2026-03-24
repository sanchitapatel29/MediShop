import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth-session'
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
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (sessionUser.role === 'admin') {
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

    const [product, reviewAuthor] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId }, select: { id: true } }),
      prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { id: true, name: true, hospital_name: true }
      })
    ])

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!reviewAuthor) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const review = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productId,
      userId: reviewAuthor.id,
      userName: reviewAuthor.name,
      hospitalName: reviewAuthor.hospital_name,
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
    const user = await getSessionUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const productId = parseInt(id)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { added_by: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (product.added_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
