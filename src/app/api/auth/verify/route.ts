import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyUserSessionToken, USER_COOKIE_NAME } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const token = (await cookies()).get(USER_COOKIE_NAME)?.value
    const userId = verifyUserSessionToken(token)
    if (!userId) return NextResponse.json({ authenticated: false }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, branch: true, semester: true } })
    if (!user) return NextResponse.json({ authenticated: false }, { status: 401 })
    return NextResponse.json({ authenticated: true, user })
  } catch (e) {
    console.error('Verify error:', e)
    return NextResponse.json({ authenticated: false, error: 'Server error' }, { status: 500 })
  }
}
