import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, createSessionToken, COOKIE_NAME, SESSION_TTL, ADMIN_EMAIL } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    let body: { email?: string; password?: string }
    try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
    const email = (body.email ?? '').trim()
    const password = body.password ?? ''
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    if (!validateCredentials(email, password)) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    const token = createSessionToken(ADMIN_EMAIL)
    const response = NextResponse.json({ success: true, email: ADMIN_EMAIL, token })
    // Set cookie (works for same-origin)
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_TTL / 1000),
    })
    return response
  } catch (e) {
    return NextResponse.json({ error: `Server error: ${e instanceof Error ? e.message : 'Login failed'}` }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, '', { path: '/', maxAge: 0 })
  return response
}
