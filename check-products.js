const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { added_by: { not: null } }
    })
    
    console.log('Products with owner:', products.length)
    products.forEach(p => {
      console.log('  -', p.name, '(owner ID:', p.added_by + ')')
    })
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()
