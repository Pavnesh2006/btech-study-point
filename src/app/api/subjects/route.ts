import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorizedResponse } from '@/lib/guard'
import { BRANCHES, SEMESTERS } from '@/lib/constants'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')
    if (all === '1') {
      const admin = await requireAdmin()
      if (!admin) return unauthorizedResponse()
      const subjects = await db.subject.findMany({ orderBy: [{ branch: 'asc' }, { semester: 'asc' }, { name: 'asc' }], include: { _count: { select: { chapters: true } } } })
      return NextResponse.json({ subjects })
    }
    const branch = searchParams.get('branch') ?? undefined
    const semester = searchParams.get('semester')
    const sem = semester ? parseInt(semester, 10) : undefined
    const subjects = await db.subject.findMany({ where: { ...(branch ? { branch } : {}), ...(sem && !Number.isNaN(sem) ? { semester: sem } : {}) }, orderBy: [{ semester: 'asc' }, { name: 'asc' }] })
    return NextResponse.json({ subjects })
  } catch (e) {
    return NextResponse.json({ error: `Server error: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorizedResponse()
    let body: { name?: string; code?: string; branch?: string; semester?: number }
    try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
    const name = (body.name ?? '').trim()
    const code = (body.code ?? '').trim() || null
    const branch = (body.branch ?? '').trim()
    const semester = Number(body.semester)
    if (!name || !branch) return NextResponse.json({ error: 'Subject name and branch are required' }, { status: 400 })
    if (!BRANCHES.some((b) => b.code === branch)) return NextResponse.json({ error: 'Invalid branch' }, { status: 400 })
    if (!SEMESTERS.includes(semester as 1|2|3|4|5|6|7|8)) return NextResponse.json({ error: 'Invalid semester' }, { status: 400 })
    try {
      const subject = await db.subject.create({ data: { name, code, branch, semester } })
      return NextResponse.json({ subject }, { status: 201 })
    } catch { return NextResponse.json({ error: 'Subject already exists for this branch & semester' }, { status: 409 }) }
  } catch (e) {
    return NextResponse.json({ error: `Server error: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 500 })
  }
}
