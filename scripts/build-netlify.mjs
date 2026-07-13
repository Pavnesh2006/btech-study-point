import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseUrl = process.env.DATABASE_URL || ''
const isPostgres = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')

console.log(`[build] DATABASE_URL: ${isPostgres ? 'postgresql' : 'sqlite'}`)

if (isPostgres) {
  const prod = path.join(__dirname, '..', 'prisma', 'schema.prod.prisma')
  const main = path.join(__dirname, '..', 'prisma', 'schema.prisma')
  if (fs.existsSync(prod)) { fs.copyFileSync(prod, main); console.log('[build] Using PostgreSQL schema') }
} else {
  console.warn('[build] WARNING: DATABASE_URL is not PostgreSQL! Set it to a Neon/Supabase connection string.')
}

console.log('[build] Generating Prisma client...')
try { execSync('npx prisma generate', { stdio: 'inherit' }) } catch { try { execSync('npm exec -- prisma generate', { stdio: 'inherit' }) } catch { console.warn('[build] prisma generate failed') } }

console.log('[build] Building Next.js...')
execSync('npx next build', { stdio: 'inherit' })
console.log('[build] Done!')
