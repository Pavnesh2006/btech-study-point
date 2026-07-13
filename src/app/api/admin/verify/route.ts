import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value
    const email = verifySessionToken(token)
    if (!email) return NextResponse.json({ authenticated: false }, { status: 401 })
    return NextResponse.json({ authenticated: true, email })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
