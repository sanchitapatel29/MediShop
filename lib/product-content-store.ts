import { promises as fs } from 'fs'
import path from 'path'

export interface ProductContent {
  detailedDescription: string
  imageUrls: string[]
}

export interface ProductReview {
  id: string
  productId: number
  userId: number
  userName: string
  hospitalName: string | null
  rating: number
  comment: string
  createdAt: string
}

type ProductContentMap = Record<string, ProductContent>
type ProductReviewMap = Record<string, ProductReview[]>

const dataDir = path.join(process.cwd(), 'data')
const contentPath = path.join(dataDir, 'product-content.json')
const reviewsPath = path.join(dataDir, 'product-reviews.json')

async function ensureFile(filePath: string, fallback: object) {
  try {
    await fs.access(filePath)
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8')
  }
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  await ensureFile(filePath, fallback as object)
  const content = await fs.readFile(filePath, 'utf8')
  return JSON.parse(content) as T
}

async function writeJsonFile(filePath: string, value: object) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8')
}

export async function getAllProductContent() {
  return readJsonFile<ProductContentMap>(contentPath, {})
}

export async function getProductContent(productId: number) {
  const allContent = await getAllProductContent()
  return allContent[String(productId)] || { detailedDescription: '', imageUrls: [] }
}

export async function saveProductContent(productId: number, content: ProductContent) {
  const allContent = await getAllProductContent()
  allContent[String(productId)] = content
  await writeJsonFile(contentPath, allContent)
}

export async function deleteProductContent(productId: number) {
  const allContent = await getAllProductContent()
  delete allContent[String(productId)]
  await writeJsonFile(contentPath, allContent)
}

export async function getAllReviews() {
  return readJsonFile<ProductReviewMap>(reviewsPath, {})
}

export async function getProductReviews(productId: number) {
  const allReviews = await getAllReviews()
  return allReviews[String(productId)] || []
}

export async function addProductReview(review: ProductReview) {
  const allReviews = await getAllReviews()
  const key = String(review.productId)
  allReviews[key] = [review, ...(allReviews[key] || [])]
  await writeJsonFile(reviewsPath, allReviews)
}

export async function deleteProductReviews(productId: number) {
  const allReviews = await getAllReviews()
  delete allReviews[String(productId)]
  await writeJsonFile(reviewsPath, allReviews)
}

export async function deleteReviewsByUser(userId: number) {
  const allReviews = await getAllReviews()
  const nextReviews = Object.fromEntries(
    Object.entries(allReviews)
      .map(([productId, reviews]) => [
        productId,
        reviews.filter((review) => review.userId !== userId)
      ])
      .filter(([, reviews]) => reviews.length > 0)
  )

  await writeJsonFile(reviewsPath, nextReviews)
}
