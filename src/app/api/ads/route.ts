import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorizedResponse } from '@/lib/guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/ads?active=1  (public — returns only active ads)
// GET /api/ads?all=1     (admin — returns all ads)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')
    if (all === '1') {
      const admin = await requireAdmin()
      if (!admin) return unauthorizedResponse()
      const ads = await db.ad.findMany({ orderBy: { createdAt: 'desc' } })
      return NextResponse.json({ ads })
    }
    // Public — only active ads
    const ads = await db.ad.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ ads })
  } catch (e) {
    return NextResponse.json({ error: `Server error: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 500 })
  }
}

// POST /api/ads  (admin)  JSON: { title, imageUrl, linkUrl? }
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorizedResponse()
    let body: { title?: string; imageUrl?: string; linkUrl?: string }
    try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
    const title = (body.title ?? '').trim()
    const imageUrl = (body.imageUrl ?? '').trim()
    const linkUrl = (body.linkUrl ?? '').trim() || null
    if (!title || !imageUrl) return NextResponse.json({ error: 'Title and image are required' }, { status: 400 })
    // Limit image size to 2MB to avoid DB bloat
    if (imageUrl.length > 2 * 1024 * 1024) return NextResponse.json({ error: 'Image too large. Please use an image under 2MB.' }, { status: 400 })
    const ad = await db.ad.create({ data: { title, imageUrl, linkUrl } })
    return NextResponse.json({ ad }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: `Server error: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 500 })
  }
}
