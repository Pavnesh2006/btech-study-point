import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createUserSessionToken, USER_COOKIE_NAME, USER_SESSION_TTL } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    let body: { email?: string; password?: string }
    try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

    const email = (body.email ?? '').trim().toLowerCase()
    const password = body.password ?? ''
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

    const user = await db.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'No account found with this email. Please register first.' }, { status: 401 })

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })

    const token = createUserSessionToken(user.id)
    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, branch: user.branch, semester: user.semester } })
    response.cookies.set(USER_COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: Math.floor(USER_SESSION_TTL / 1000) })
    return response
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: `Server error: ${e instanceof Error ? e.message : 'Login failed'}. Check DATABASE_URL.` }, { status: 500 })
  }
}
