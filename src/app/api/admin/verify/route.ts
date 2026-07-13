import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check cookie
    const cookieStore = await cookies()
    let token = cookieStore.get(COOKIE_NAME)?.value
    // Fallback: check header
    if (!token) {
      const headerStore = await headers()
      token = headerStore.get('x-admin-token') ?? undefined
    }
    const email = verifySessionToken(token)
    if (!email) return NextResponse.json({ authenticated: false }, { status: 401 })
    return NextResponse.json({ authenticated: true, email })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
