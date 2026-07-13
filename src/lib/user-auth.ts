import crypto, { scrypt as scryptCb, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>

const SECRET = process.env.USER_SESSION_SECRET || 'btech-study-point-user-session-secret-2024'
export const USER_COOKIE_NAME = 'bsp_user_session'
const TTL = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, 64)
  return `${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [salt, hash] = stored.split(':')
    if (!salt || !hash) return false
    const derived = await scrypt(password, salt, 64)
    const buf = Buffer.from(hash, 'hex')
    if (derived.length !== buf.length) return false
    return timingSafeEqual(derived, buf)
  } catch {
    return false
  }
}

export function createUserSessionToken(userId: string): string {
  const expiry = Date.now() + TTL
  const payload = `${userId}:${expiry}`
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`, 'utf8').toString('base64')
}

export function verifyUserSessionToken(token: string | undefined | null): string | null {
  if (!token) return null
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const parts = decoded.split(':')
    if (parts.length !== 3) return null
    const [userId, expiryStr, sig] = parts
    const expiry = parseInt(expiryStr, 10)
    if (Number.isNaN(expiry) || Date.now() > expiry) return null
    const payload = `${userId}:${expiry}`
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
    if (sig !== expected) return null
    return userId
  } catch {
    return null
  }
}

export { TTL as USER_SESSION_TTL }
