import bcrypt from 'bcryptjs'
import { db } from '../../config/db.js'

export async function createUser({ name, email, password, role }) {
  const hashed = await bcrypt.hash(password, 10)
  return db.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true },
  })
}

export async function findUserByEmail(email) {
  return db.user.findUnique({ where: { email } })
}

export async function validatePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed)
}
