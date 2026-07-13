import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseUrl = process.env.DATABASE_URL || ''
const isPostgres = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')

console.log(`[build] DATABASE_URL scheme: ${isPostgres ? 'postgresql' : 'sqlite'}`)

if (isPostgres) {
  const prod = path.join(__dirname, '..', 'prisma', 'schema.prod.prisma')
  const main = path.join(__dirname, '..', 'prisma', 'schema.prisma')
  if (fs.existsSync(prod)) {
    fs.copyFileSync(prod, main)
    console.log('[build] Copied PostgreSQL schema to prisma/schema.prisma')
  } else {
    // Patch the provider in-place
    let schema = fs.readFileSync(main, 'utf8')
    schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"')
    fs.writeFileSync(main, schema)
    console.log('[build] Patched schema provider to postgresql')
  }
} else {
  console.warn('[build] WARNING: DATABASE_URL is not PostgreSQL!')
  console.warn('[build] SQLite does NOT work on Netlify.')
  console.warn('[build] Get a free PostgreSQL database from https://neon.tech')
}

// Generate Prisma client
console.log('[build] Generating Prisma client...')
try {
  execSync('npx prisma generate', { stdio: 'inherit' })
} catch {
  console.warn('[build] npx prisma generate failed, trying npm exec...')
  try { execSync('npm exec -- prisma generate', { stdio: 'inherit' }) } catch { console.warn('[build] prisma generate failed — continuing') }
}

// Push schema to database (creates tables if they don't exist)
if (isPostgres) {
  console.log('[build] Pushing schema to database (creating tables)...')
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
    console.log('[build] Database tables created/verified')
  } catch {
    console.warn('[build] prisma db push failed — tables may need manual creation')
  }
}

// Build Next.js
console.log('[build] Building Next.js...')
execSync('npx next build', { stdio: 'inherit' })
console.log('[build] Done!')
