import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllProductContent, saveProductContent } from '@/lib/product-content-store'
import jwt from 'jsonwebtoken'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const myProducts = url.searchParams.get('myProducts')
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const allProductContent = await getAllProductContent()
    
    // If requesting "my products" only (for admin dashboard)
    if (myProducts === 'true' && token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number, role: string }
        if (decoded.role === 'admin') {
          const products = await prisma.product.findMany({
            where: { added_by: decoded.userId },
            orderBy: { created_at: 'desc' }
          })
          return NextResponse.json(
            products.map((product: { id: number } & Record<string, unknown>) => ({
              ...product,
              detailedDescription: allProductContent[String(product.id)]?.detailedDescription || '',
              imageUrls: allProductContent[String(product.id)]?.imageUrls || []
            }))
          )
        }
      } catch {
        // Token invalid, fall through to return all products
      }
    }
    
    // Default: return all products (for store view)
    const products = await prisma.product.findMany({
      orderBy: { created_at: 'desc' }
    })
    return NextResponse.json(
      products.map((product: { id: number } & Record<string, unknown>) => ({
        ...product,
        detailedDescription: allProductContent[String(product.id)]?.detailedDescription || '',
        imageUrls: allProductContent[String(product.id)]?.imageUrls || []
      }))
    )
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    let addedBy = null
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number }
        addedBy = decoded.userId
      } catch {
        // Token invalid, continue without admin tracking
      }
    }

    const body = await request.json()
    const { name, category, description, detailedDescription, imageUrls, price, stock, certification } = body

    const product = await prisma.product.create({
      data: {
        name,
        category,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        certification,
        added_by: addedBy
      }
    })

    const parsedImageUrls = Array.isArray(imageUrls)
      ? imageUrls
          .map((url: unknown) => (typeof url === 'string' ? url.trim() : ''))
          .filter(Boolean)
      : []

    await saveProductContent(product.id, {
      detailedDescription: typeof detailedDescription === 'string' ? detailedDescription.trim() : '',
      imageUrls: parsedImageUrls
    })

    return NextResponse.json({
      ...product,
      detailedDescription: typeof detailedDescription === 'string' ? detailedDescription.trim() : '',
      imageUrls: parsedImageUrls
    })
  } catch {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
