import type { NextAuthConfig } from 'next-auth'

/**
 * Edge-safe auth config (NO Prisma, NO bcrypt — these can't run in middleware/edge runtime).
 *
 * This is shared between:
 *  - the full NextAuth() in lib/auth.ts (node runtime, adds providers + DB callbacks)
 *  - the middleware NextAuth() (edge runtime, only decodes the session cookie)
 *
 * The jwt callback here is a pass-through: `role` / `gymId` are already encoded into the
 * JWT cookie at sign-in time by the node config, so the edge runtime just reads them back.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  // Force explicit cookie names so the SETTER (server) and the READER (middleware)
  // always agree — critical behind an Nginx reverse proxy where the internal request
  // looks like HTTP, which would otherwise make the cookie-name detection disagree.
  cookies: {
    sessionToken: {
      name: '__Secure-authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
    csrfToken: {
      name: '__Secure-authjs.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
    callbackUrl: {
      name: '__Secure-authjs.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },
  callbacks: {
    // Pass-through: role/gymId already encoded in the cookie at sign-in.
    async jwt({ token }) {
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
  providers: [], // added in lib/auth.ts (edge can't run bcrypt/Prisma)
} satisfies NextAuthConfig
