import crypto from 'crypto'

// Admin credentials
export const ADMIN_EMAIL = 'neveralone20040@gmail.com'
export const ADMIN_PASSWORD = 'Pathak@2011'

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || 'btech-study-point-admin-session-secret-2024'

const COOKIE_NAME = 'bsp_admin_session'
const SESSION_TTL = 365 * 24 * 60 * 60 * 1000 // 365 days

export function createSessionToken(email: string): string {
  const expiry = Date.now() + SESSION_TTL
  const payload = `${email}:${expiry}`
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${signature}`, 'utf8').toString('base64')
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const parts = decoded.split(':')
    if (parts.length !== 3) return null
    const [email, expiryStr, signature] = parts
    const expiry = parseInt(expiryStr, 10)
    if (Number.isNaN(expiry) || Date.now() > expiry) return null
    const payload = `${email}:${expiry}`
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
    if (signature !== expected) return null
    return email
  } catch {
    return null
  }
}

export function validateCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD
}

export { COOKIE_NAME, SESSION_TTL }
