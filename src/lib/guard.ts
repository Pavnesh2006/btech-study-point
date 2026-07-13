import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from './auth'

/**
 * Returns admin email if authenticated, or null.
 * Checks BOTH the cookie AND the X-Admin-Token header (for Netlify compatibility).
 */
export async function requireAdmin(): Promise<string | null> {
  // Check cookie first
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (token) {
    const email = verifySessionToken(token)
    if (email) return email
  }
  // Fallback: check X-Admin-Token header (sent from localStorage)
  const headerStore = await headers()
  const headerToken = headerStore.get('x-admin-token')
  if (headerToken) {
    const email = verifySessionToken(headerToken)
    if (email) return email
  }
  return null
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
