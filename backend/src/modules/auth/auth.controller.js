import { createUser, findUserByEmail, validatePassword } from './auth.service.js'
import { db } from '../../config/db.js'

export async function login(request, reply) {
  const { email, password } = request.body
  const user = await findUserByEmail(email)
  if (!user) return reply.status(401).send({ error: 'Invalid credentials' })

  const valid = await validatePassword(password, user.password)
  if (!valid) return reply.status(401).send({ error: 'Invalid credentials' })

  const token = request.server.jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    { expiresIn: '7d' }
  )
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
}

export async function register(request, reply) {
  const { name, email, password, role } = request.body
  try {
    const user = await createUser({ name, email, password, role })
    const token = request.server.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: '7d' }
    )
    return reply.status(201).send({ token, user })
  } catch (err) {
    if (err.code === 'P2002') return reply.status(409).send({ error: 'Email already exists' })
    throw err
  }
}

export async function me(request, reply) {
  const user = await db.user.findUnique({
    where: { id: request.user.id },
    select: { id: true, name: true, email: true, role: true, avatar: true },
  })
  return user
}
