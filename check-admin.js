// Run this to check and update admin status
// Usage: node check-admin.js youremail@example.com

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAndSetAdmin() {
  const email = process.argv[2]
  
  if (!email) {
    console.log('Usage: node check-admin.js youremail@example.com')
    process.exit(1)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ User not found with email:', email)
      process.exit(1)
    }

    console.log('Current user details:')
    console.log('  Email:', user.email)
    console.log('  Name:', user.name)
    console.log('  Role:', user.role)
    console.log('')

    if (user.role !== 'admin') {
      console.log('Updating role to admin...')
      await prisma.user.update({
        where: { email },
        data: { role: 'admin' }
      })
      console.log('✅ User role updated to admin')
      console.log('⚠️  Please LOG OUT and LOG BACK IN to get a new token with admin role')
    } else {
      console.log('✅ User is already an admin')
      console.log('⚠️  If you still get 403 error, please LOG OUT and LOG BACK IN')
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndSetAdmin()
