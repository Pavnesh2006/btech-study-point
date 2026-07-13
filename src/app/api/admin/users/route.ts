import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorizedResponse } from '@/lib/guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return unauthorizedResponse()
  const users = await db.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, branch: true, semester: true, createdAt: true } })
  return NextResponse.json({ users })
}
