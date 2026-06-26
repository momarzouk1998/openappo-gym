import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const profile = await prisma.profile.findUnique({
          where: { id: user.id },
        })
        if (profile) {
          token.role = profile.role
          token.gymId = profile.gymId
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.gymId = token.gymId as string | null
      }
      return session
    },
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email' },
        password: { label: 'كلمة المرور', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password || ''
        )

        if (!isPasswordValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
