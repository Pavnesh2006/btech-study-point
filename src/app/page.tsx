'use client'
import { useEffect, useSyncExternalStore, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { WelcomeForm } from '@/components/study/welcome-form'
import { StudyDashboard } from '@/components/study/study-dashboard'
import { AdminLogin } from '@/components/study/admin-login'
import { AdminPanel } from '@/components/study/admin-panel'
import type { StudentInfo } from '@/lib/types'

const STORAGE_KEY = 'bsp_student'
const ADMIN_REMEMBER_KEY = 'bsp_admin_remember'
const studentListeners = new Set<() => void>()
let cachedStudent: StudentInfo | null = null; let cachedRaw: string | null | undefined = undefined
function getStudentSnapshot(): StudentInfo | null { if (typeof window === 'undefined') return null; const raw = (() => { try { return localStorage.getItem(STORAGE_KEY) } catch { return null } })(); if (raw === cachedRaw) return cachedStudent; cachedRaw = raw; try { const p = JSON.parse(raw ?? ''); if (p && typeof p.name === 'string' && typeof p.branch === 'string' && typeof p.semester === 'number') { cachedStudent = p; return p } } catch {} cachedStudent = null; return null }
function getStudentServerSnapshot(): StudentInfo | null { return null }
function subscribeStudent(cb: () => void): () => void { studentListeners.add(cb); if (typeof window !== 'undefined') window.addEventListener('storage', cb); return () => { studentListeners.delete(cb); if (typeof window !== 'undefined') window.removeEventListener('storage', cb) } }
function notifyStudent() { cachedRaw = undefined; studentListeners.forEach((cb) => cb()) }
function saveStudent(info: StudentInfo) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(info)) } catch {} notifyStudent() }
function clearStudent() { try { localStorage.removeItem(STORAGE_KEY) } catch {} notifyStudent() }
function getHashSnapshot(): string { if (typeof window === 'undefined') return ''; return window.location.hash.replace('#', '').toLowerCase() }
function getHashServerSnapshot(): string { return '' }
function subscribeHash(cb: () => void): () => void { if (typeof window !== 'undefined') window.addEventListener('hashchange', cb); return () => { if (typeof window !== 'undefined') window.removeEventListener('hashchange', cb) } }
function clearAdminHash() { if (typeof window !== 'undefined' && window.location.hash) { history.replaceState(null, '', window.location.pathname + window.location.search); window.dispatchEvent(new HashChangeEvent('hashchange')) } }

const pageVariants = { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.02 } }
const pageTransition = { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }

export default function Home() {
  const student = useSyncExternalStore(subscribeStudent, getStudentSnapshot, getStudentServerSnapshot)
  const hash = useSyncExternalStore(subscribeHash, getHashSnapshot, getHashServerSnapshot)
  const [mode, setMode] = useState<'user' | 'admin'>('user')
  const [adminAuthed, setAdminAuthed] = useState(false)
  const [adminChecking, setAdminChecking] = useState(false)
  const [userVerified, setUserVerified] = useState(false) // have we checked the user cookie?

  // Check if admin has saved credentials in localStorage for auto-login
  const hasAdminRemember = typeof window !== 'undefined' && !!localStorage.getItem(ADMIN_REMEMBER_KEY)

  const wantAdmin = hash === 'admin' || mode === 'admin'
  const [prevWantAdmin, setPrevWantAdmin] = useState(false)
  if (wantAdmin !== prevWantAdmin) {
    setPrevWantAdmin(wantAdmin)
    if (wantAdmin) setAdminChecking(true)
    else setAdminAuthed(false)
  }

  // Verify admin session when admin mode is requested
  useEffect(() => {
    if (!wantAdmin) return
    let c = false
    fetch('/api/admin/verify', { cache: 'no-store' })
      .then((r) => { if (!c) setAdminAuthed(r.ok) })
      .catch(() => { if (!c) setAdminAuthed(false) })
      .finally(() => { if (!c) setAdminChecking(false) })
    return () => { c = true }
  }, [wantAdmin])

  // On mount: verify user session cookie. If valid but localStorage is empty, restore it.
  // We do NOT block the UI on this — if localStorage has student data, show dashboard immediately.
  useEffect(() => {
    let c = false
    fetch('/api/auth/verify', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (c) return
        if (d?.authenticated) {
          // User is logged in — make sure localStorage has their info
          if (!getStudentSnapshot()) {
            saveStudent({ name: d.user.name, branch: d.user.branch, semester: d.user.semester })
          }
        }
        // If not authenticated AND localStorage has data, it means the cookie expired.
        // We keep the localStorage data so the user sees the dashboard, but on next
        // action that requires auth, they'll be prompted. This prevents "logout on refresh".
        setUserVerified(true)
      })
      .catch(() => { if (!c) setUserVerified(true) })
    return () => { c = true }
  }, [])

  // Derive the view. Key change: if localStorage has student data, show dashboard
  // IMMEDIATELY without waiting for verify. This prevents logout on refresh.
  // For admin: if cookie is valid (adminAuthed), show panel. If not but credentials
  // are saved (hasAdminRemember), show login screen which auto-logs in. Otherwise show login.
  const view = !wantAdmin
    ? student ? 'dashboard' : (userVerified ? 'welcome' : 'checking')
    : adminChecking ? 'admin-checking' : (adminAuthed ? 'admin-panel' : 'admin-login')

  let content: React.ReactNode
  if (view === 'checking' || view === 'admin-checking') {
    content = <motion.div key={view} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="bg-study-animated bg-study-gradient min-h-screen flex items-center justify-center"><div className="flex flex-col items-center gap-3"><Loader2 className="size-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">{view === 'admin-checking' ? 'Verifying admin...' : 'Loading...'}</p></div></motion.div>
  } else if (view === 'admin-login') {
    content = <motion.div key="admin-login" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><AdminLogin onSuccess={() => setAdminAuthed(true)} onBack={() => { clearAdminHash(); setMode('user') }} /></motion.div>
  } else if (view === 'admin-panel') {
    content = <motion.div key="admin-panel" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><AdminPanel onLogout={() => { fetch('/api/admin/login', { method: 'DELETE' }).catch(() => {}); try { localStorage.removeItem(ADMIN_REMEMBER_KEY) } catch {} setAdminAuthed(false); setPrevWantAdmin(false) }} onViewSite={() => { clearAdminHash(); setMode('user') }} /></motion.div>
  } else if (view === 'dashboard' && student) {
    content = <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><StudyDashboard student={student} onExit={() => { fetch('/api/auth/logout', { method: 'POST' }).catch(() => {}); clearStudent(); setMode('user') }} /></motion.div>
  } else {
    content = <motion.div key="welcome" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}><WelcomeForm onSubmit={(info) => { saveStudent(info); setMode('user') }} onAdminDetected={() => setMode('admin')} /></motion.div>
  }
  return <AnimatePresence mode="wait">{content}</AnimatePresence>
}
