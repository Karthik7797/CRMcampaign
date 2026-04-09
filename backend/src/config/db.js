import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const db = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Test database connection on startup
export async function testDatabaseConnection() {
  try {
    await db.$connect()
    await db.$queryRaw`SELECT 1`
    console.log('✅ Database connection verified')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect()
})

// Handle connection errors
process.on('uncaughtException', async (error) => {
  if (error.message.includes('Prisma')) {
    console.error('Prisma error:', error.message)
    await db.$disconnect()
  }
})
