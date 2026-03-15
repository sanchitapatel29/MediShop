const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUserAndProducts() {
  const email = process.argv[2] || 'test@gmail.com'
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        products: true
      }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('User Details:')
    console.log('  ID:', user.id)
    console.log('  Email:', user.email)
    console.log('  Name:', user.name)
    console.log('  Role:', user.role)
    console.log('')
    console.log('Products owned by this user:', user.products.length)
    user.products.forEach(p => {
      console.log('  -', p.name, '(ID:', p.id + ')')
    })
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserAndProducts()
