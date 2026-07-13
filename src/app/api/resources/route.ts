import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorizedResponse } from '@/lib/guard'
import { extractYouTubeId } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/resources?chapterId=xxx  (public)   |  ?all=1 (admin: every resource)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')
    if (all === '1') {
      const admin = await requireAdmin()
      if (!admin) return unauthorizedResponse()
      const resources = await db.resource.findMany({ orderBy: { createdAt: 'desc' }, include: { chapter: { include: { subject: true } } } })
      return NextResponse.json({ resources })
    }
    const chapterId = searchParams.get('chapterId')
    if (!chapterId) return NextResponse.json({ error: 'chapterId is required' }, { status: 400 })
    const resources = await db.resource.findMany({ where: { chapterId }, orderBy: [{ type: 'asc' }, { createdAt: 'desc' }] })
    return NextResponse.json({ resources })
  } catch (e) {
    return NextResponse.json({ error: `Server error: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 500 })
  }
}

// POST /api/resources  (admin)  JSON: { chapterId, type, title, youtubeId?, noteUrl?, noteFileName? }
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorizedResponse()
    let body: { chapterId?: string; type?: string; title?: string; youtubeUrl?: string; youtubeId?: string; noteUrl?: string; noteFileName?: string }
    try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

    const chapterId = (body.chapterId ?? '').trim()
    const type = (body.type ?? '').trim() as 'video' | 'note'
    const title = (body.title ?? '').trim()

    if (!chapterId || !type || !title) return NextResponse.json({ error: 'chapterId, type, and title are required' }, { status: 400 })
    if (type !== 'video' && type !== 'note') return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

    const chapter = await db.chapter.findUnique({ where: { id: chapterId } })
    if (!chapter) return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })

    let youtubeId: string | null = null
    let noteUrl: string | null = null
    let noteFileName: string | null = null

    if (type === 'video') {
      // Extract YouTube ID from URL or direct ID
      const input = body.youtubeUrl || body.youtubeId || ''
      youtubeId = extractYouTubeId(input)
      if (!youtubeId) {
        return NextResponse.json({ error: 'Invalid YouTube URL. Paste a link like https://www.youtube.com/watch?v=VIDEO_ID' }, { status: 400 })
      }
    } else {
      // Note — accept a URL (external PDF link)
      noteUrl = (body.noteUrl ?? '').trim() || null
      noteFileName = (body.noteFileName ?? '').trim() || null
      if (!noteUrl) return NextResponse.json({ error: 'Note URL is required' }, { status: 400 })
    }

    const resource = await db.resource.create({ data: { title, type, youtubeId, noteUrl, noteFileName, chapterId } })
    return NextResponse.json({ resource }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: `Server error: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 500 })
  }
}
