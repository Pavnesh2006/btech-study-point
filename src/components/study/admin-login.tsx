'use client'
import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, GraduationCap, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

const REMEMBER_KEY = 'bsp_admin_remember'
const TOKEN_KEY = 'bsp_admin_token'

export function AdminLogin({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [autoLogin, setAutoLogin] = useState(false)
  const tried = useRef(false)

  useEffect(() => {
    if (tried.current) return; tried.current = true
    try {
      const saved = localStorage.getItem(REMEMBER_KEY)
      if (!saved) return
      const p = JSON.parse(saved)
      if (p?.email && p?.password) {
        setEmail(p.email); setPassword(p.password); setRemember(true); setAutoLogin(true)
        fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: p.email, password: p.password }) })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data?.token) {
              localStorage.setItem(TOKEN_KEY, data.token)
              onSuccess()
            } else {
              setAutoLogin(false)
              localStorage.removeItem(REMEMBER_KEY)
              localStorage.removeItem(TOKEN_KEY)
            }
          })
          .catch(() => setAutoLogin(false))
      }
    } catch {}
  }, [onSuccess])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      // Store token in localStorage for header-based auth (Netlify compatibility)
      if (data.token) localStorage.setItem(TOKEN_KEY, data.token)
      if (remember) localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, password }))
      else { localStorage.removeItem(REMEMBER_KEY) }
      onSuccess()
    } catch { setError('Network error. Please try again.') } finally { setLoading(false) }
  }

  if (autoLogin) return <div className="bg-study-animated bg-study-gradient min-h-screen flex flex-col items-center justify-center"><div className="flex flex-col items-center gap-3"><Loader2 className="size-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Opening admin panel...</p></div></div>

  return (
    <div className="bg-study-animated bg-study-gradient min-h-screen w-full flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center text-center mb-8 animate-fade-in-down">
            <div className="size-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 mb-4 animate-pulse-teal"><ShieldCheck className="size-9" /></div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <p className="mt-1 text-muted-foreground text-sm">Btech Study Point — Secure administrator access</p>
          </div>
          <Card className="shadow-2xl border-border/60 glass-card animate-fade-in-up">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="email">Admin Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" /></div></div>
                <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input id="password" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" /></div></div>
                <div className="flex items-center gap-2"><Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} /><Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Keep me logged in (save credentials)</Label></div>
                {error && <p className="text-sm text-destructive font-medium">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>{loading ? <><Loader2 className="size-4 animate-spin" /> Signing in...</> : <><ShieldCheck className="size-4" /> Sign In</>}</Button>
              </form>
              <Button variant="ghost" className="w-full mt-3" onClick={onBack}><ArrowLeft className="size-4" /> Back to Study Point</Button>
            </CardContent>
          </Card>
          <div className="mt-6 text-center"><Button variant="link" className="text-muted-foreground" onClick={onBack}><GraduationCap className="size-4 mr-1" /> Go to student site</Button></div>
        </div>
      </main>
      <footer className="mt-auto border-t border-border/60 bg-card/50 backdrop-blur py-4 text-center text-xs text-muted-foreground">Restricted area · Authorized administrators only.</footer>
    </div>
  )
}
