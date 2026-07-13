'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Loader2, ArrowRight, Mail, Lock, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { BRANCHES, SEMESTERS } from '@/lib/constants'
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '@/lib/auth'
import type { StudentInfo } from '@/lib/types'
import { MadeWithLove } from './made-with-love'

interface WelcomeFormProps {
  onSubmit: (info: StudentInfo) => void
  onAdminDetected: () => void
}

type Mode = 'register' | 'login'

export function WelcomeForm({ onSubmit, onAdminDetected }: WelcomeFormProps) {
  const [mode, setMode] = useState<Mode>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [branch, setBranch] = useState('')
  const [semester, setSemester] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) { setError('Please enter a valid email address'); return }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)

    // Admin credential detection
    if (trimmedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      setLoading(false); onAdminDetected(); return
    }

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login'
      const body = mode === 'register'
        ? { email: trimmedEmail, password, name: name.trim(), branch, semester: Number(semester) }
        : { email: trimmedEmail, password }
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      let data: any = {}
      try { data = await res.json() } catch {
        setError(`Server returned an error (HTTP ${res.status}). The database may not be configured. If this is a Netlify deployment, set DATABASE_URL to a PostgreSQL connection string.`)
        setLoading(false); return
      }
      if (!res.ok || !data.success) { setError(data.error || `Request failed (HTTP ${res.status}).`); setLoading(false); return }
      try { localStorage.setItem('bsp_student', JSON.stringify(data.user)) } catch {}
      onSubmit(data.user)
    } catch (err) {
      console.error('Auth error:', err)
      setError('Cannot connect to the server. If this is a Netlify deployment, the API may be starting up — please wait and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-study-animated bg-study-gradient min-h-screen w-full flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col items-center text-center mb-8">
            <motion.div whileHover={{ rotate: -8, scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} className="size-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 mb-4 animate-pulse-teal">
              <GraduationCap className="size-9" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Btech Study Point</h1>
            <p className="mt-2 text-muted-foreground text-sm max-w-xs">Your one-stop platform for semester-wise study material, video lectures and notes.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <Card className="shadow-2xl border-border/60 glass-card">
              <CardContent className="p-6">
                <div className="flex gap-1 p-1 rounded-lg bg-muted mb-5">
                  <button type="button" onClick={() => setMode('register')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'register' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Register</button>
                  <button type="button" onClick={() => setMode('login')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'login' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Login</button>
                </div>
                <h2 className="text-lg font-semibold mb-1">{mode === 'register' ? 'Create Account' : 'Welcome Back'}</h2>
                <p className="text-sm text-muted-foreground mb-5">{mode === 'register' ? 'Enter your details to access study material.' : 'Login with your email and password.'}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" autoComplete="email" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input id="password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" /></div>
                  </div>
                  {mode === 'register' && (
                    <>
                      <div className="space-y-2"><Label htmlFor="name">Full Name</Label><div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input id="name" placeholder="e.g. Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" /></div></div>
                      <div className="space-y-2"><Label htmlFor="branch">Branch</Label><Select value={branch} onValueChange={setBranch}><SelectTrigger id="branch" className="w-full"><SelectValue placeholder="Select your branch" /></SelectTrigger><SelectContent>{BRANCHES.map((b) => <SelectItem key={b.code} value={b.code}>{b.code} — {b.name}</SelectItem>)}</SelectContent></Select></div>
                      <div className="space-y-2"><Label htmlFor="semester">Semester</Label><Select value={semester} onValueChange={setSemester}><SelectTrigger id="semester" className="w-full"><SelectValue placeholder="Select semester" /></SelectTrigger><SelectContent>{SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}</SelectContent></Select></div>
                    </>
                  )}
                  {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? <><Loader2 className="size-4 animate-spin" />{mode === 'register' ? 'Creating account...' : 'Logging in...'}</> : <>{mode === 'register' ? 'Create Account' : 'Login'}<ArrowRight className="size-4" /></>}</Button>
                </form>
                <p className="text-xs text-center text-muted-foreground mt-4">{mode === 'register' ? <>Already have an account? <button type="button" onClick={() => setMode('login')} className="text-primary font-medium hover:underline">Login</button></> : <>Don&apos;t have an account? <button type="button" onClick={() => setMode('register')} className="text-primary font-medium hover:underline">Register</button></>}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <footer className="mt-auto border-t border-border/60 bg-card/50 backdrop-blur py-4 text-center text-xs text-muted-foreground">
        <div>Btech Study Point — Empowering engineering students with quality study material.</div>
        <div className="mt-1"><MadeWithLove /></div>
      </footer>
    </div>
  )
}
