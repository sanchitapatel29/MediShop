import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllProductContent, saveProductContent } from '@/lib/product-content-store'
import { getSessionUser } from '@/lib/auth-session'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const myProducts = url.searchParams.get('myProducts')
    const user = await getSessionUser()
    const allProductContent = await getAllProductContent()
    
    // If requesting "my products" only (for admin dashboard)
    if (myProducts === 'true' && user?.role === 'admin') {
      const products = await prisma.product.findMany({
        where: { added_by: user.id },
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
  } catch (error) {
    console.error('GET /api/products failed:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        added_by: user.id
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
  } catch (error) {
    console.error('POST /api/products failed:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
