import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as never,
  secret: process.env.AUTH_SECRET ?? process.env.JWT_SECRET,
  session: {
    strategy: 'jwt'
  },
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            allowDangerousEmailAccountLinking: true
          })
        ]
      : []),
    Credentials({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        portal: { label: 'Portal', type: 'text' }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim().toLowerCase()
        const password = credentials?.password?.toString()
        const portal = credentials?.portal?.toString() === 'admin' ? 'admin' : 'doctor'

        if (!email || !password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user?.password) {
          throw new Error('Use Google sign-in for this account')
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
          throw new Error('Invalid email or password')
        }

        if (user.role !== portal) {
          throw new Error(
            portal === 'admin'
              ? 'This account does not have admin access'
              : 'Use the admin portal to sign in with an admin account'
          )
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          hospital_name: user.hospital_name
        }
      }
    })
  ],
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role ?? token.role
        token.hospital_name = user.hospital_name ?? token.hospital_name
      }

      if (trigger === 'update' && session?.user) {
        token.name = session.user.name
        token.role = session.user.role
        token.hospital_name = session.user.hospital_name
      }

      if ((!token.id || !token.role) && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, hospital_name: true }
        })

        if (dbUser) {
          token.id = String(dbUser.id)
          token.role = dbUser.role
          token.hospital_name = dbUser.hospital_name
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string | undefined) ?? 'doctor'
        session.user.hospital_name = (token.hospital_name as string | null | undefined) ?? null
      }

      return session
    }
  }
})
