import { promises as fs } from 'fs'
import path from 'path'

export interface OrderDetails {
  fullName: string
  phone: string
  email: string
  companyName: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  billingName: string
  billingGstin: string
  billingAddress: string
}

type OrderDetailsMap = Record<string, OrderDetails>

const dataDir = path.join(process.cwd(), 'data')
const detailsPath = path.join(dataDir, 'order-details.json')

async function ensureFile() {
  try {
    await fs.access(detailsPath)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(detailsPath, JSON.stringify({}, null, 2), 'utf8')
  }
}

async function readDetails() {
  await ensureFile()
  const content = await fs.readFile(detailsPath, 'utf8')
  return JSON.parse(content) as OrderDetailsMap
}

async function writeDetails(details: OrderDetailsMap) {
  await fs.mkdir(dataDir, { recursive: true })
  await fs.writeFile(detailsPath, JSON.stringify(details, null, 2), 'utf8')
}

export async function saveOrderDetails(orderId: number, details: OrderDetails) {
  const allDetails = await readDetails()
  allDetails[String(orderId)] = details
  await writeDetails(allDetails)
}

export async function getOrderDetails(orderId: number) {
  const allDetails = await readDetails()
  return allDetails[String(orderId)] || null
}

export async function getMultipleOrderDetails(orderIds: number[]) {
  const allDetails = await readDetails()
  return Object.fromEntries(orderIds.map((id) => [id, allDetails[String(id)] || null]))
}
