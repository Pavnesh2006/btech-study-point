import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || ''
  const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')
  try {
    await db.user.count()
    return NextResponse.json({ status: 'ok', database: 'connected', databaseType: isPostgres ? 'postgresql' : 'sqlite', s3Enabled: !!(process.env.S3_BUCKET && process.env.AWS_ACCESS_KEY_ID) })
  } catch (e) {
    return NextResponse.json({ status: 'error', database: 'disconnected', databaseType: isPostgres ? 'postgresql' : 'sqlite', error: e instanceof Error ? e.message : 'unknown', message: isPostgres ? 'Check DATABASE_URL' : 'SQLite does NOT work on Netlify. Set DATABASE_URL to a PostgreSQL connection string.' }, { status: 500 })
  }
}
