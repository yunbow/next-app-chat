import NextAuth, { type NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/shared/lib/db/prisma'
import { env } from '@/shared/config/env'
import { checkRateLimit, RATE_LIMITS, getClientIp } from '@/lib/security/rate-limit'

function generateUserId(): string {
  return crypto.randomBytes(8).toString('hex')
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(env.GITHUB_ID && env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const email = credentials?.email
        const password = credentials?.password
        if (typeof email !== 'string' || typeof password !== 'string') {
          return null
        }

        // IP-based rate limit: 10 attempts/min
        const ip = getClientIp(request as Request)
        const ipLimit = await checkRateLimit(`auth:login:ip:${ip}`, 10, 60_000)
        if (!ipLimit.success) return null

        // Email-based rate limit: 5 attempts/15min (account lockout equivalent)
        const emailLimit = await checkRateLimit(
          `auth:login:email:${email}`,
          RATE_LIMITS.login.limit,
          RATE_LIMITS.login.windowMs,
        )
        if (!emailLimit.success) return null

        const user = await prisma.user.findUnique({
          where: { email },
        })
        if (!user || !user.password) {
          return null
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { userId: true },
      })

      if (!dbUser?.userId) {
        let userId = generateUserId()
        let userIdExists = await prisma.user.findUnique({ where: { userId } })
        while (userIdExists) {
          userId = generateUserId()
          userIdExists = await prisma.user.findUnique({ where: { userId } })
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { userId },
        })
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: env.NEXTAUTH_SECRET,
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)
