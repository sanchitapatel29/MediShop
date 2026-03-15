// Assign existing products without an owner to a specific admin
// Usage: node assign-products-to-admin.js admin@email.com

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function assignProducts() {
  const adminEmail = process.argv[2]
  
  if (!adminEmail) {
    console.log('Usage: node assign-products-to-admin.js admin@email.com')
    process.exit(1)
  }

  try {
    // Find the admin user
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!admin) {
      console.log('❌ Admin not found with email:', adminEmail)
      process.exit(1)
    }

    if (admin.role !== 'admin') {
      console.log('❌ User is not an admin. Current role:', admin.role)
      console.log('Run: node check-admin.js', adminEmail)
      process.exit(1)
    }

    // Find products without an owner
    const unassignedProducts = await prisma.product.findMany({
      where: { added_by: null }
    })

    if (unassignedProducts.length === 0) {
      console.log('✅ All products are already assigned to admins')
      process.exit(0)
    }

    console.log(`Found ${unassignedProducts.length} unassigned products:`)
    unassignedProducts.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p.id})`)
    })
    console.log('')
    console.log(`Assigning all to admin: ${admin.name} (${admin.email})`)

    // Assign all unassigned products to this admin
    const result = await prisma.product.updateMany({
      where: { added_by: null },
      data: { added_by: admin.id }
    })

    console.log(`✅ Successfully assigned ${result.count} products to ${admin.name}`)
    console.log('')
    console.log('These products will now appear in their admin dashboard!')

  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

assignProducts()
