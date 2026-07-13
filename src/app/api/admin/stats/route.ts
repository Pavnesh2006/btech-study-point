import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, unauthorizedResponse } from '@/lib/guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return unauthorizedResponse()
  try {
    const allUsers = await db.user.findMany({ select: { branch: true, semester: true, createdAt: true } })
    const totalUsers = allUsers.length
    const branchMap = new Map<string, number>()
    const semMap = new Map<number, number>()
    for (const u of allUsers) {
      branchMap.set(u.branch, (branchMap.get(u.branch) ?? 0) + 1)
      semMap.set(u.semester, (semMap.get(u.semester) ?? 0) + 1)
    }
    const byBranch = Array.from(branchMap.entries()).map(([branch, count]) => ({ branch, count })).sort((a, b) => b.count - a.count)
    const bySemester = Array.from(semMap.entries()).map(([semester, count]) => ({ semester, count })).sort((a, b) => a.semester - b.semester)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentCount = allUsers.filter((u) => u.createdAt >= sevenDaysAgo).length
    const latestUsers = await db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, email: true, name: true, branch: true, semester: true, createdAt: true } })
    return NextResponse.json({ totalUsers, byBranch, bySemester, recentCount, latestUsers })
  } catch (e) {
    return NextResponse.json({ error: `Stats error: ${e instanceof Error ? e.message : 'unknown'}` }, { status: 500 })
  }
}
