import { db } from '../../config/db.js'
import bcrypt from 'bcryptjs'

/**
 * List all users (ADMIN only)
 */
export async function getUsers(request, reply) {
  const { role, search, isActive } = request.query

  const where = {}
  if (role) where.role = role
  if (isActive !== undefined) where.isActive = isActive === 'true'
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const users = await db.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { leads: true, tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return { users, total: users.length }
}

/**
 * Get single user by ID
 */
export async function getUser(request, reply) {
  const user = await db.user.findUnique({
    where: { id: request.params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { leads: true, tasks: true } },
    },
  })

  if (!user) return reply.status(404).send({ error: 'User not found' })
  return user
}

/**
 * Create a new user (ADMIN only)
 */
export async function createUser(request, reply) {
  const { name, email, password, role } = request.body

  if (!name || !email || !password) {
    return reply.status(400).send({ error: 'Name, email, and password are required' })
  }

  const validRoles = ['ADMIN', 'MANAGER', 'MARKETING', 'COUNSELLOR', 'INFLUENCER']
  if (role && !validRoles.includes(role)) {
    return reply.status(400).send({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` })
  }

  try {
    const hashed = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role || 'COUNSELLOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    })
    return reply.status(201).send(user)
  } catch (err) {
    if (err.code === 'P2002') {
      return reply.status(409).send({ error: 'A user with this email already exists' })
    }
    throw err
  }
}

/**
 * Update user details (ADMIN only)
 */
export async function updateUser(request, reply) {
  const { name, email, role, isActive } = request.body
  const data = {}

  if (name !== undefined) data.name = name
  if (email !== undefined) data.email = email
  if (role !== undefined) {
    const validRoles = ['ADMIN', 'MANAGER', 'MARKETING', 'COUNSELLOR', 'INFLUENCER']
    if (!validRoles.includes(role)) {
      return reply.status(400).send({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` })
    }
    data.role = role
  }
  if (isActive !== undefined) data.isActive = isActive

  try {
    const user = await db.user.update({
      where: { id: request.params.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return user
  } catch (err) {
    if (err.code === 'P2025') {
      return reply.status(404).send({ error: 'User not found' })
    }
    if (err.code === 'P2002') {
      return reply.status(409).send({ error: 'A user with this email already exists' })
    }
    throw err
  }
}

/**
 * Reset user password (ADMIN only)
 */
export async function resetPassword(request, reply) {
  const { password } = request.body
  if (!password || password.length < 6) {
    return reply.status(400).send({ error: 'Password must be at least 6 characters' })
  }

  const hashed = await bcrypt.hash(password, 10)

  try {
    await db.user.update({
      where: { id: request.params.id },
      data: { password: hashed },
    })
    return { success: true, message: 'Password reset successfully' }
  } catch (err) {
    if (err.code === 'P2025') {
      return reply.status(404).send({ error: 'User not found' })
    }
    throw err
  }
}

/**
 * Deactivate user (soft delete) — ADMIN only
 */
export async function deactivateUser(request, reply) {
  // Prevent self-deactivation
  if (request.params.id === request.user.id) {
    return reply.status(400).send({ error: 'You cannot deactivate your own account' })
  }

  try {
    const user = await db.user.update({
      where: { id: request.params.id },
      data: { isActive: false },
      select: { id: true, name: true, email: true, isActive: true },
    })
    return user
  } catch (err) {
    if (err.code === 'P2025') {
      return reply.status(404).send({ error: 'User not found' })
    }
    throw err
  }
}
