import { NextResponse } from 'next/server'
import { USER_COOKIE_NAME } from '@/lib/user-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(USER_COOKIE_NAME, '', { path: '/', maxAge: 0 })
  return response
}
