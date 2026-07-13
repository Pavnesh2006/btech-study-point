import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from './auth'

/** Returns admin email if authenticated, or null. Must be awaited. */
export async function requireAdmin(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  return verifySessionToken(token)
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
