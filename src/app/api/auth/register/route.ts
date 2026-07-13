import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createUserSessionToken, USER_COOKIE_NAME, USER_SESSION_TTL } from '@/lib/user-auth'
import { BRANCHES, SEMESTERS } from '@/lib/constants'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    let body: { email?: string; password?: string; name?: string; branch?: string; semester?: number }
    try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

    const email = (body.email ?? '').trim().toLowerCase()
    const password = body.password ?? ''
    const name = (body.name ?? '').trim()
    const branch = (body.branch ?? '').trim()
    const semester = Number(body.semester)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    if (!password || password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    if (!name) return NextResponse.json({ error: 'Please enter your name' }, { status: 400 })
    if (!BRANCHES.some((b) => b.code === branch)) return NextResponse.json({ error: 'Please select a valid branch' }, { status: 400 })
    if (!SEMESTERS.includes(semester as 1|2|3|4|5|6|7|8)) return NextResponse.json({ error: 'Please select a valid semester' }, { status: 400 })

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'This email is already registered. Please login instead.' }, { status: 409 })

    const passwordHash = await hashPassword(password)
    const user = await db.user.create({ data: { email, passwordHash, name, branch, semester } })

    const token = createUserSessionToken(user.id)
    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, branch: user.branch, semester: user.semester } })
    response.cookies.set(USER_COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: Math.floor(USER_SESSION_TTL / 1000) })
    return response
  } catch (e) {
    console.error('Register error:', e)
    return NextResponse.json({ error: `Server error: ${e instanceof Error ? e.message : 'Registration failed'}. Check DATABASE_URL.` }, { status: 500 })
  }
}
