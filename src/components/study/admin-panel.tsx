'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Library, LogOut, Eye, Plus, Trash2, BookOpen, FolderOpen, Video, FileText, Inbox, BookMarked, Film, FileDown, X, CheckCircle2, Users, TrendingUp, Link2, Power, Loader2, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { BRANCHES, SEMESTERS, branchLabel } from '@/lib/constants'
import { extractYouTubeId, type Chapter, type Resource, type Subject, type Ad } from '@/lib/types'
import { AdminClock } from './admin-clock'
import { MadeWithLove } from './made-with-love'

export function AdminPanel({ onLogout, onViewSite }: { onLogout: () => void; onViewSite: () => void }) {
  const { toast } = useToast()
  const [branch, setBranch] = useState('CSE')
  const [semester, setSemester] = useState('1')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [chaptersLoading, setChaptersLoading] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [stats, setStats] = useState({ subjects: 0, chapters: 0, videos: 0, notes: 0 })

  // Controlled form state for subjects
  const [subjName, setSubjName] = useState('')
  const [subjCode, setSubjCode] = useState('')
  const [subjBusy, setSubjBusy] = useState(false)

  // Controlled form state for chapters
  const [chapName, setChapName] = useState('')
  const [chapBusy, setChapBusy] = useState(false)

  const loadSubjects = useCallback(async () => {
    setSubjectsLoading(true)
    try {
      const res = await fetch(`/api/subjects?branch=${encodeURIComponent(branch)}&semester=${semester}`, { cache: 'no-store' })
      const data = await res.json()
      setSubjects(data.subjects ?? [])
    } catch { setSubjects([]) } finally { setSubjectsLoading(false) }
  }, [branch, semester])

  const loadStats = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('bsp_admin_token') : null
      const hdrs = token ? { 'X-Admin-Token': token } : {}
      const [subRes, resRes] = await Promise.all([
        fetch('/api/subjects?all=1', { cache: 'no-store', headers: hdrs }),
        fetch('/api/resources?all=1', { cache: 'no-store', headers: hdrs }),
      ])
      const subData = await subRes.json(); const resData = await resRes.json()
      const allSubjects: Subject[] = subData.subjects ?? []; const allResources: Resource[] = resData.resources ?? []
      setStats({ subjects: allSubjects.length, chapters: allSubjects.reduce((s, x) => s + (x._count?.chapters ?? 0), 0), videos: allResources.filter((r) => r.type === 'video').length, notes: allResources.filter((r) => r.type === 'note').length })
    } catch {}
  }, [])

  useEffect(() => { loadSubjects(); setSelectedSubject(null); setChapters([]); setSelectedChapter(null) }, [loadSubjects])
  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => {
    if (!selectedSubject) { setChapters([]); setSelectedChapter(null); return }
    setChaptersLoading(true); setSelectedChapter(null)
    fetch(`/api/chapters?subjectId=${selectedSubject.id}`, { cache: 'no-store' }).then((r) => r.json()).then((d) => setChapters(d.chapters ?? [])).catch(() => setChapters([])).finally(() => setChaptersLoading(false))
  }, [selectedSubject])
  useEffect(() => {
    if (!selectedChapter) { setResources([]); return }
    setResourcesLoading(true)
    fetch(`/api/resources?chapterId=${selectedChapter.id}`, { cache: 'no-store' }).then((r) => r.json()).then((d) => setResources(d.resources ?? [])).catch(() => setResources([])).finally(() => setResourcesLoading(false))
  }, [selectedChapter])

  const notify = (msg: string, type: 'success' | 'error' = 'success') => toast({ title: type === 'success' ? 'Success' : 'Error', description: msg, variant: type === 'error' ? 'destructive' : undefined })

  // Helper: get admin auth headers (token from localStorage for Netlify compatibility)
  function adminHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bsp_admin_token') : null
    return { 'Content-Type': 'application/json', ...(token ? { 'X-Admin-Token': token } : {}), ...extra }
  }

  // Add subject — controlled inputs, optimistic update, loading state
  async function handleAddSubject(e: React.FormEvent) {
    e.preventDefault()
    const name = subjName.trim()
    const code = subjCode.trim() || null
    if (!name || subjBusy) return
    setSubjBusy(true)
    try {
      const res = await fetch('/api/subjects', { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ name, code, branch, semester: parseInt(semester) }) })
      const data = await res.json()
      if (!res.ok) { notify(data.error || 'Failed to add subject', 'error'); return }
      // Optimistic update: add the new subject to the list immediately
      setSubjects((prev) => [...prev, data.subject])
      setSubjName(''); setSubjCode('')
      notify('Subject added')
      loadStats()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Failed', 'error')
    } finally {
      setSubjBusy(false)
    }
  }

  // Delete subject
  async function handleDeleteSubject(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await fetch(`/api/subjects/${id}`, { method: 'DELETE', headers: adminHeaders() })
      setSubjects((prev) => prev.filter((s) => s.id !== id))
      if (selectedSubject?.id === id) setSelectedSubject(null)
      notify('Deleted')
      loadStats()
    } catch { notify('Failed to delete', 'error') }
  }

  // Add chapter — controlled inputs, optimistic update
  async function handleAddChapter(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSubject || chapBusy) return
    const name = chapName.trim()
    if (!name) return
    setChapBusy(true)
    try {
      const res = await fetch('/api/chapters', { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ subjectId: selectedSubject.id, name }) })
      const data = await res.json()
      if (!res.ok) { notify(data.error || 'Failed to add chapter', 'error'); return }
      setChapters((prev) => [...prev, data.chapter])
      setChapName('')
      notify('Chapter added')
      loadStats()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Failed', 'error')
    } finally {
      setChapBusy(false)
    }
  }

  // Delete chapter
  async function handleDeleteChapter(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await fetch(`/api/chapters/${id}`, { method: 'DELETE', headers: adminHeaders() })
      setChapters((prev) => prev.filter((c) => c.id !== id))
      if (selectedChapter?.id === id) setSelectedChapter(null)
      notify('Deleted')
      loadStats()
    } catch { notify('Failed to delete', 'error') }
  }

  async function addResource(type: 'video' | 'note', title: string, youtubeUrl: string, noteUrl: string, noteFileName: string) {
    if (!selectedChapter) return
    const res = await fetch('/api/resources', { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ chapterId: selectedChapter.id, type, title, youtubeUrl, noteUrl, noteFileName }) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to add')
    setResources((prev) => [data.resource, ...prev])
    loadStats()
  }

  async function deleteResource(id: string) {
    await fetch(`/api/resources/${id}`, { method: 'DELETE', headers: adminHeaders() })
    setResources((prev) => prev.filter((r) => r.id !== id))
    loadStats()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 flex-wrap">
          <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0"><Library className="size-6" /></div>
          <div className="min-w-0"><h1 className="font-bold leading-tight">Admin Panel</h1><p className="text-xs text-muted-foreground">Btech Study Point · Full access</p></div>
          <div className="ml-auto flex items-center gap-2 sm:gap-3 flex-wrap"><AdminClock /><Button variant="outline" size="sm" onClick={onViewSite}><Eye className="size-4" /><span className="hidden sm:inline">View Site</span></Button><Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="size-4" /><span className="hidden sm:inline">Logout</span></Button></div>
        </div>
      </header>
      <div className="border-b border-border bg-card/40 px-4 sm:px-6 py-3"><div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3"><StatCard icon={<BookMarked className="size-4" />} label="Subjects" value={stats.subjects} /><StatCard icon={<FolderOpen className="size-4" />} label="Chapters" value={stats.chapters} /><StatCard icon={<Film className="size-4" />} label="Videos" value={stats.videos} /><StatCard icon={<FileDown className="size-4" />} label="Notes" value={stats.notes} /></div></div>
      <main className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: subjects + chapters */}
          <div className="space-y-5">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><BookOpen className="size-4 text-primary" />Subjects</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">Branch</Label><Select value={branch} onValueChange={setBranch}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{BRANCHES.map((b) => <SelectItem key={b.code} value={b.code}>{b.code} — {b.name}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1.5"><Label className="text-xs">Semester</Label><Select value={semester} onValueChange={setSemester}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}</SelectContent></Select></div>
                </div>
                {/* Subject form — controlled inputs with loading state */}
                <form onSubmit={handleAddSubject} className="flex gap-2">
                  <Input placeholder="Subject name" className="flex-1" value={subjName} onChange={(e) => setSubjName(e.target.value)} disabled={subjBusy} />
                  <Input placeholder="Code" className="w-24" value={subjCode} onChange={(e) => setSubjCode(e.target.value)} disabled={subjBusy} />
                  <Button type="submit" size="icon" disabled={subjBusy || !subjName.trim()}>{subjBusy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}</Button>
                </form>
                {/* Subject list */}
                <div className="rounded-lg border border-border">
                  <div className="px-3 py-2 border-b border-border bg-muted/30 text-xs text-muted-foreground">{branchLabel(branch)} · Sem {semester} — {subjects.length} subject(s)</div>
                  <ScrollArea className="max-h-64"><div className="p-1.5">
                    {subjectsLoading ? <div className="py-6 text-center text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Loading...</div>
                    : subjects.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No subjects yet.</p>
                    : <ul className="space-y-1">{subjects.map((s) => (
                      <li key={s.id} className={cn('group flex items-center gap-2 rounded-md px-2.5 py-2', selectedSubject?.id === s.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}>
                        <button className="flex-1 text-left flex items-center gap-2 min-w-0" onClick={() => setSelectedSubject(s)}>
                          <BookOpen className="size-4 shrink-0" />
                          <span className="text-sm font-medium truncate">{s.name}</span>
                          {s.code && <Badge variant="outline" className={cn('text-[10px] shrink-0', selectedSubject?.id === s.id ? 'border-primary-foreground/40' : '')}>{s.code}</Badge>}
                        </button>
                        <button onClick={() => handleDeleteSubject(s.id, s.name)} className="size-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive"><Trash2 className="size-3.5" /></button>
                      </li>
                    ))}</ul>}
                  </div></ScrollArea>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FolderOpen className="size-4 text-primary" />Chapters</CardTitle></CardHeader>
              <CardContent>
                {!selectedSubject ? <p className="text-sm text-muted-foreground text-center py-6">Select a subject above.</p>
                : <>
                  <div className="text-xs text-muted-foreground mb-3">For: <span className="font-medium text-foreground">{selectedSubject.name}</span></div>
                  {/* Chapter form — controlled inputs */}
                  <form onSubmit={handleAddChapter} className="flex gap-2 mb-3">
                    <Input placeholder="Chapter name" className="flex-1" value={chapName} onChange={(e) => setChapName(e.target.value)} disabled={chapBusy} />
                    <Button type="submit" size="icon" disabled={chapBusy || !chapName.trim()}>{chapBusy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}</Button>
                  </form>
                  <div className="rounded-lg border border-border">
                    <ScrollArea className="max-h-64"><div className="p-1.5">
                      {chaptersLoading ? <div className="py-6 text-center text-sm"><Loader2 className="size-4 animate-spin inline mr-2" />Loading...</div>
                      : chapters.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No chapters yet.</p>
                      : <ul className="space-y-1">{chapters.map((c) => (
                        <li key={c.id} className={cn('group flex items-center gap-2 rounded-md px-2.5 py-2', selectedChapter?.id === c.id ? 'bg-accent' : 'hover:bg-accent/60')}>
                          <button className="flex-1 text-left flex items-center gap-2 min-w-0" onClick={() => setSelectedChapter(c)}>
                            <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
                            <span className="text-sm truncate">{c.name}</span>
                            {c._count?.resources ? <Badge variant="secondary" className="text-[10px]">{c._count.resources}</Badge> : null}
                          </button>
                          <button onClick={() => handleDeleteChapter(c.id, c.name)} className="size-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive"><Trash2 className="size-3.5" /></button>
                        </li>
                      ))}</ul>}
                    </div></ScrollArea>
                  </div>
                </>}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: add content + resources list */}
          <div className="space-y-5">
            <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Plus className="size-4 text-primary" />Add Content</CardTitle></CardHeader><CardContent>{!selectedChapter ? <div className="text-center py-10"><Inbox className="size-10 mx-auto text-muted-foreground/50 mb-2" /><p className="text-sm text-muted-foreground">Select a subject and chapter first.</p></div> : <AddContentForm chapterName={selectedChapter.name} onAdd={async (type, title, ytUrl, noteUrl, noteFileName) => { try { await addResource(type, title, ytUrl, noteUrl, noteFileName); notify(`${type === 'video' ? 'Video' : 'Note'} added`) } catch (e) { notify(e instanceof Error ? e.message : 'Failed', 'error') } }} />}</CardContent></Card>
            <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="size-4 text-primary" />Content List</CardTitle></CardHeader><CardContent>{!selectedChapter ? <p className="text-sm text-muted-foreground text-center py-6">Select a chapter.</p> : resourcesLoading ? <div className="text-center py-6 text-sm"><Loader2 className="size-4 animate-spin inline mr-2" />Loading...</div> : resources.length === 0 ? <div className="text-center py-10"><Inbox className="size-10 mx-auto text-muted-foreground/50 mb-2" /><p className="text-sm text-muted-foreground">No content yet.</p></div> : <ScrollArea className="max-h-96"><ul className="space-y-2">{resources.map((r) => <li key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5"><div className={cn('size-9 rounded-md flex items-center justify-center shrink-0', r.type === 'video' ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400')}>{r.type === 'video' ? <Video className="size-4" /> : <FileText className="size-4" />}</div><div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{r.title}</p><p className="text-xs text-muted-foreground truncate">{r.type === 'video' ? `YouTube: ${r.youtubeId}` : r.noteFileName || 'PDF'}</p></div><button onClick={() => { if (confirm(`Delete "${r.title}"?`)) { deleteResource(r.id); notify('Deleted') } }} className="size-8 rounded-md flex items-center justify-center hover:bg-destructive/10 text-destructive"><Trash2 className="size-4" /></button></li>)}</ul></ScrollArea>}</CardContent></Card>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6"><AdsSection /></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6"><UsersStatsSection /></div>
      </main>
      <footer className="mt-auto border-t border-border bg-card/60 py-3 text-center text-xs text-muted-foreground"><div>Admin Panel · Btech Study Point</div><div className="mt-1"><MadeWithLove /></div></footer>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"><div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">{icon}</div><div><div className="text-lg font-bold tabular-nums">{value}</div><div className="text-xs text-muted-foreground">{label}</div></div></div>
}

function AddContentForm({ chapterName, onAdd }: { chapterName: string; onAdd: (type: 'video' | 'note', title: string, ytUrl: string, noteUrl: string, noteFileName: string) => Promise<void> }) {
  const [type, setType] = useState<'video' | 'note'>('video')
  const [title, setTitle] = useState('')
  const [ytUrl, setYtUrl] = useState('')
  const [noteUrl, setNoteUrl] = useState('')
  const [noteFileName, setNoteFileName] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    if (!title.trim()) return
    if (type === 'video' && !ytUrl.trim()) return
    if (type === 'note' && !noteUrl.trim()) return
    setBusy(true)
    try { await onAdd(type, title.trim(), ytUrl.trim(), noteUrl.trim(), noteFileName.trim()); setTitle(''); setYtUrl(''); setNoteUrl(''); setNoteFileName('') } finally { setBusy(false) }
  }

  return <div className="space-y-4">
    <div className="text-xs text-muted-foreground">Adding to: <span className="font-medium text-foreground">{chapterName}</span></div>
    <Tabs value={type} onValueChange={(v) => setType(v as 'video' | 'note')}><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="video"><Video className="size-4 mr-2" />YouTube Video</TabsTrigger><TabsTrigger value="note"><FileText className="size-4 mr-2" />Note (PDF)</TabsTrigger></TabsList></Tabs>
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" placeholder={type === 'video' ? 'e.g. Lecture 1 - Introduction' : 'e.g. Unit 1 Notes'} value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} /></div>
      {type === 'video' ? (
        <div className="space-y-2"><Label htmlFor="ytUrl">YouTube URL</Label><Input id="ytUrl" placeholder="https://www.youtube.com/watch?v=VIDEO_ID" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} disabled={busy} /><p className="text-[11px] text-muted-foreground">Paste the YouTube link of your unlisted video.</p>{ytUrl && extractYouTubeId(ytUrl) && <p className="text-[11px] text-emerald-400">✓ Valid (ID: {extractYouTubeId(ytUrl)})</p>}{ytUrl && !extractYouTubeId(ytUrl) && <p className="text-[11px] text-destructive">✗ Invalid YouTube URL</p>}</div>
      ) : (
        <><div className="space-y-2"><Label htmlFor="noteUrl">PDF URL</Label><Input id="noteUrl" placeholder="https://example.com/notes.pdf" value={noteUrl} onChange={(e) => setNoteUrl(e.target.value)} disabled={busy} /></div><div className="space-y-2"><Label htmlFor="noteFileName">Display filename (optional)</Label><Input id="noteFileName" placeholder="Unit1_Notes.pdf" value={noteFileName} onChange={(e) => setNoteFileName(e.target.value)} disabled={busy} /></div></>
      )}
      <Button type="submit" className="w-full" disabled={busy || !title.trim() || (type === 'video' ? !ytUrl.trim() : !noteUrl.trim())}>{busy ? <><Loader2 className="size-4 animate-spin" />Adding...</> : <><CheckCircle2 className="size-4" />Add {type === 'video' ? 'Video' : 'Note'}</>}</Button>
    </form>
  </div>
}

function AdsSection() {
  const { toast } = useToast()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadAds = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('bsp_admin_token') : null
      const hdrs = token ? { 'X-Admin-Token': token } : {}
      const res = await fetch('/api/ads?all=1', { cache: 'no-store', headers: hdrs })
      const data = await res.json()
      setAds(data.ads ?? [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAds() }, [loadAds])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    if (f.size > 2 * 1024 * 1024) { toast({ title: 'Error', description: 'Image must be under 2MB', variant: 'destructive' }); return }
    const reader = new FileReader()
    reader.onload = () => { setImageUrl(reader.result as string); if (!title) setTitle(f.name.replace(/\.[^.]+$/, '')) }
    reader.readAsDataURL(f)
  }

  async function addAd(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    if (!title.trim() || !imageUrl) return
    setBusy(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('bsp_admin_token') : null
      const res = await fetch('/api/ads', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Admin-Token': token } : {}) }, body: JSON.stringify({ title: title.trim(), imageUrl, linkUrl: linkUrl.trim() || undefined }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      toast({ title: 'Success', description: 'Ad added' })
      setTitle(''); setImageUrl(''); setLinkUrl(''); if (fileRef.current) fileRef.current.value = ''
      setAds((prev) => [data.ad, ...prev])
    } catch (e) { toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' }) } finally { setBusy(false) }
  }

  async function toggleAd(id: string, active: boolean) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bsp_admin_token') : null
    await fetch(`/api/ads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Admin-Token': token } : {}) }, body: JSON.stringify({ active: !active }) })
    setAds((prev) => prev.map((a) => a.id === id ? { ...a, active: !active } : a))
  }

  async function deleteAd(id: string) {
    if (!confirm('Delete this ad?')) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('bsp_admin_token') : null
    await fetch(`/api/ads/${id}`, { method: 'DELETE', headers: token ? { 'X-Admin-Token': token } : {} })
    setAds((prev) => prev.filter((a) => a.id !== id))
    toast({ title: 'Success', description: 'Ad deleted' })
  }

  return <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Megaphone className="size-4 text-primary" />Ads & Posters</CardTitle></CardHeader><CardContent className="space-y-4">
    <p className="text-xs text-muted-foreground">Upload images/posters as ads. Users see active ads and can dismiss with X.</p>
    <form onSubmit={addAd} className="space-y-3">
      <div className="space-y-2"><Label htmlFor="adTitle">Ad Title</Label><Input id="adTitle" placeholder="e.g. Special Offer" value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy} /></div>
      <div className="space-y-2"><Label htmlFor="adFile">Upload Image (max 2MB)</Label><div className="flex gap-2"><Input id="adFile" ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="flex-1" disabled={busy} />{imageUrl && <Button type="button" variant="outline" size="sm" onClick={() => { setImageUrl(''); if (fileRef.current) fileRef.current.value = '' }}><X className="size-4" /></Button>}</div>{imageUrl && <div className="mt-2 rounded-lg border border-border overflow-hidden p-2 bg-muted/30"><img src={imageUrl} alt="Preview" className="max-h-32 mx-auto rounded" /></div>}</div>
      <div className="space-y-2"><Label htmlFor="adLink">Click Link (optional)</Label><Input id="adLink" placeholder="https://..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} disabled={busy} /></div>
      <Button type="submit" className="w-full" disabled={busy || !title.trim() || !imageUrl}>{busy ? <><Loader2 className="size-4 animate-spin" />Adding...</> : <><Plus className="size-4" />Add Ad</>}</Button>
    </form>
    {loading ? <div className="text-center py-4 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Loading...</div> : ads.length === 0 ? <p className="text-center text-sm text-muted-foreground py-4">No ads yet.</p> : <div className="space-y-2">{ads.map((ad) => <div key={ad.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5"><img src={ad.imageUrl} alt={ad.title} className="size-12 rounded object-cover shrink-0" /><div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{ad.title}</p><div className="flex items-center gap-2 mt-0.5"><Badge variant={ad.active ? 'default' : 'secondary'} className="text-[10px]">{ad.active ? 'Active' : 'Inactive'}</Badge>{ad.linkUrl && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Link2 className="size-3" />Link</span>}</div></div><button onClick={() => toggleAd(ad.id, ad.active)} className={cn('size-8 rounded-md flex items-center justify-center', ad.active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-muted-foreground hover:bg-muted')} title={ad.active ? 'Deactivate' : 'Activate'}><Power className="size-4" /></button><button onClick={() => deleteAd(ad.id)} className="size-8 rounded-md flex items-center justify-center hover:bg-destructive/10 text-destructive"><Trash2 className="size-4" /></button></div>)}</div>}
  </CardContent></Card>
}

function UsersStatsSection() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { fetch('/api/admin/stats', { cache: 'no-store' }).then((r) => r.json()).then((d) => setStats(d)).catch(() => setStats(null)).finally(() => setLoading(false)) }, [])
  if (loading) return <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Users className="size-4 text-primary" />Registered Users</CardTitle></CardHeader><CardContent><div className="py-8 text-center text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Loading...</div></CardContent></Card>
  if (!stats) return null
  return <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Users className="size-4 text-primary" />Registered Users</CardTitle></CardHeader><CardContent>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4"><div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"><div className="size-9 rounded-md bg-primary/10 text-primary flex items-center justify-center"><Users className="size-5" /></div><div><div className="text-2xl font-bold tabular-nums">{stats.totalUsers}</div><div className="text-xs text-muted-foreground">Total</div></div></div><div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"><div className="size-9 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><TrendingUp className="size-5" /></div><div><div className="text-2xl font-bold tabular-nums">{stats.recentCount}</div><div className="text-xs text-muted-foreground">New (7d)</div></div></div><div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 col-span-2 sm:col-span-1"><div className="size-9 rounded-md bg-violet-500/10 text-violet-400 flex items-center justify-center"><BookOpen className="size-5" /></div><div><div className="text-2xl font-bold tabular-nums">{stats.byBranch?.length ?? 0}</div><div className="text-xs text-muted-foreground">Branches</div></div></div></div>
    {stats.latestUsers?.length > 0 && <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="pb-2 pr-3">Name</th><th className="pb-2 pr-3 hidden sm:table-cell">Email</th><th className="pb-2 pr-3">Branch</th><th className="pb-2 pr-3">Sem</th><th className="pb-2 hidden sm:table-cell">Joined</th></tr></thead><tbody>{stats.latestUsers.map((u: any) => <tr key={u.id} className="border-b border-border/50"><td className="py-2 pr-3 font-medium">{u.name}</td><td className="py-2 pr-3 text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">{u.email}</td><td className="py-2 pr-3"><Badge variant="secondary" className="text-[10px]">{u.branch}</Badge></td><td className="py-2 pr-3">{u.semester}</td><td className="py-2 text-muted-foreground text-xs hidden sm:table-cell">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td></tr>)}</tbody></table></div>}
  </CardContent></Card>
}
