import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorizedResponse } from '@/lib/guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    if (!subjectId) return NextResponse.json({ error: 'subjectId is required' }, { status: 400 })
    const chapters = await db.chapter.findMany({ where: { subjectId }, orderBy: { name: 'asc' }, include: { _count: { select: { resources: true } } } })
    return NextResponse.json({ chapters })
  } catch (e) { return NextResponse.json({ error: `Server error: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 500 }) }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorizedResponse()
    let body: { subjectId?: string; name?: string }
    try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
    const subjectId = (body.subjectId ?? '').trim()
    const name = (body.name ?? '').trim()
    if (!subjectId || !name) return NextResponse.json({ error: 'subjectId and name are required' }, { status: 400 })
    const subject = await db.subject.findUnique({ where: { id: subjectId } })
    if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
    try {
      const chapter = await db.chapter.create({ data: { name, subjectId } })
      return NextResponse.json({ chapter }, { status: 201 })
    } catch { return NextResponse.json({ error: 'Chapter already exists in this subject' }, { status: 409 }) }
  } catch (e) { return NextResponse.json({ error: `Server error: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 500 }) }
}
