import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Helper to ensure DATABASE_URL has proper pool parameters for Supabase
function getDatabaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url) return url
  
  // If using Supabase pooler, ensure proper parameters
  if (url.includes('pooler.supabase.com')) {
    // Add connection pool parameters if not present
    if (!url.includes('connection_limit=') && !url.includes('pool_timeout=')) {
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}connection_limit=20&pool_timeout=30&recycle=300`
    }
  }
  return url
}

// Prisma client with optimized connection pool settings for Render + Supabase
export const db = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: getDatabaseUrl(),
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
