import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorizedResponse } from '@/lib/guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/ads/[id]  (admin)  toggle active status: { active: boolean }
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorizedResponse()
    const { id } = await params
    let body: { active?: boolean }
    try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
    const ad = await db.ad.update({ where: { id }, data: { active: body.active ?? true } })
    return NextResponse.json({ ad })
  } catch {
    return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
  }
}

// DELETE /api/ads/[id]  (admin)
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorizedResponse()
    const { id } = await params
    await db.ad.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
  }
}
