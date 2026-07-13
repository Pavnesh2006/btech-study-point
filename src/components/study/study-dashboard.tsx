'use client'
import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, BookOpen, FolderOpen, Video, FileText, Loader2, ArrowLeft, PlayCircle, Inbox, LogOut, X, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { branchLabel } from '@/lib/constants'
import type { Ad, Chapter, Resource, StudentInfo, Subject } from '@/lib/types'
import { YouTubePlayer } from './video-player'
import { PdfViewer } from './pdf-viewer'
import { MadeWithLove } from './made-with-love'

export function StudyDashboard({ student, onExit }: { student: StudentInfo; onExit: () => void }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [chaptersLoading, setChaptersLoading] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [viewingResource, setViewingResource] = useState<Resource | null>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set())

  const loadSubjects = useCallback(async () => {
    setSubjectsLoading(true)
    try { const res = await fetch(`/api/subjects?branch=${encodeURIComponent(student.branch)}&semester=${student.semester}`, { cache: 'no-store' }); const data = await res.json(); setSubjects(data.subjects ?? []) } catch { setSubjects([]) } finally { setSubjectsLoading(false) }
  }, [student.branch, student.semester])

  useEffect(() => { loadSubjects() }, [loadSubjects])
  useEffect(() => { fetch('/api/ads', { cache: 'no-store' }).then((r) => r.json()).then((d) => setAds(d.ads ?? [])).catch(() => {}) }, [])
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

  const videos = resources.filter((r) => r.type === 'video')
  const notes = resources.filter((r) => r.type === 'note')
  const visibleAds = ads.filter((a) => !dismissedAds.has(a.id))

  function dismissAd(id: string) { setDismissedAds((prev) => new Set(prev).add(id)) }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }} className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <motion.div whileHover={{ rotate: -8, scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }} className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg shadow-primary/20"><GraduationCap className="size-6" /></motion.div>
          <div className="min-w-0 flex-1"><h1 className="font-bold leading-tight truncate">Btech Study Point</h1><p className="text-xs text-muted-foreground truncate">Welcome, <span className="font-medium text-foreground">{student.name}</span></p></div>
          <div className="hidden sm:flex items-center gap-2"><Badge variant="secondary" className="font-medium">{student.branch}</Badge><Badge variant="secondary" className="font-medium">Sem {student.semester}</Badge></div>
          <Button variant="outline" size="sm" onClick={() => { if (confirm('Exit to the main screen? You can log back in anytime.')) onExit() }} title="Exit" className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"><LogOut className="size-4" /><span className="hidden sm:inline">Exit</span></Button>
        </div>
      </motion.header>

      {/* Ads banner */}
      <AnimatePresence>
        {visibleAds.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-border bg-card/60 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
              <Megaphone className="size-4 text-primary shrink-0" />
              <div className="flex-1 overflow-x-auto flex gap-3 scrollbar-thin">
                {visibleAds.map((ad) => (
                  <div key={ad.id} className="relative shrink-0 rounded-lg border border-border bg-background overflow-hidden group">
                    {ad.linkUrl ? <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"><img src={ad.imageUrl} alt={ad.title} className="h-20 w-auto max-w-xs object-cover" /></a> : <img src={ad.imageUrl} alt={ad.title} className="h-20 w-auto max-w-xs object-cover" />}
                    <button onClick={() => dismissAd(ad.id)} className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80" title="Dismiss"><X className="size-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <motion.aside initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="lg:w-80 xl:w-96 lg:border-r border-border bg-sidebar/40 flex flex-col min-h-0">
          <div className="p-4 border-b border-border"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold flex items-center gap-2"><BookOpen className="size-4 text-primary" />Subjects</h2><span className="text-xs text-muted-foreground">{branchLabel(student.branch)} · Sem {student.semester}</span></div></div>
          <ScrollArea className="flex-1 min-h-0 max-h-[35vh] lg:max-h-none scrollbar-thin"><div className="p-2">
            {subjectsLoading ? <div className="flex items-center justify-center py-8 text-muted-foreground text-sm"><Loader2 className="size-4 animate-spin mr-2" />Loading...</div>
            : subjects.length === 0 ? <div className="text-center py-8 px-4"><Inbox className="size-8 mx-auto text-muted-foreground/50 mb-2" /><p className="text-sm text-muted-foreground">No subjects added yet.</p></div>
            : <ul className="space-y-1">{subjects.map((s, i) => <motion.li key={s.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}><button onClick={() => setSelectedSubject(s)} className={cn('w-full text-left rounded-lg px-3 py-2.5 flex items-center gap-2', selectedSubject?.id === s.id ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent text-foreground')}><BookOpen className={cn('size-4 shrink-0', selectedSubject?.id === s.id ? 'text-primary-foreground' : 'text-muted-foreground')} /><span className="flex-1 min-w-0"><span className="block text-sm font-medium truncate">{s.name}</span>{s.code && <span className={cn('block text-xs truncate', selectedSubject?.id === s.id ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{s.code}</span>}</span>{s._count && s._count.chapters > 0 && <span className={cn('text-xs px-1.5 py-0.5 rounded-full shrink-0', selectedSubject?.id === s.id ? 'bg-primary-foreground/20' : 'bg-muted')}>{s._count.chapters}</span>}</button></motion.li>)}</ul>}
          </div></ScrollArea>
          <AnimatePresence>{selectedSubject && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border bg-card/60 flex flex-col min-h-0 max-h-[45vh] lg:max-h-[45%] overflow-hidden"><div className="p-4 pb-2 flex items-center gap-2"><button onClick={() => setSelectedSubject(null)} className="lg:hidden text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /></button><FolderOpen className="size-4 text-primary shrink-0" /><h3 className="text-sm font-semibold truncate flex-1">{selectedSubject.name}</h3><span className="text-xs text-muted-foreground">Chapters</span></div><ScrollArea className="flex-1 min-h-0 scrollbar-thin"><div className="p-2 pt-1">{chaptersLoading ? <div className="flex items-center justify-center py-6 text-muted-foreground text-sm"><Loader2 className="size-4 animate-spin mr-2" />Loading...</div> : chapters.length === 0 ? <p className="text-center text-sm text-muted-foreground py-6">No chapters yet.</p> : <ul className="space-y-1">{chapters.map((c, i) => <motion.li key={c.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}><button onClick={() => setSelectedChapter(c)} className={cn('w-full text-left rounded-lg px-3 py-2 flex items-center gap-2', selectedChapter?.id === c.id ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/60')}><span className={cn('size-1.5 rounded-full shrink-0', selectedChapter?.id === c.id ? 'bg-primary' : 'bg-muted-foreground/40')} /><span className="text-sm truncate flex-1">{c.name}</span>{c._count && c._count.resources > 0 && <span className="text-xs text-muted-foreground">{c._count.resources}</span>}</button></motion.li>)}</ul>}</div></ScrollArea></motion.div>}</AnimatePresence>
        </motion.aside>
        <main className="flex-1 min-w-0 min-h-0 flex flex-col">
          <ScrollArea className="flex-1 min-h-0 scrollbar-thin"><div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {!selectedChapter ? <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}><div className="text-center py-20"><motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">{selectedSubject ? <FolderOpen className="size-8" /> : <BookOpen className="size-8" />}</motion.div><h3 className="text-xl font-semibold mb-1">{selectedSubject ? 'Select a chapter' : 'Select a subject'}</h3><p className="text-muted-foreground text-sm max-w-sm mx-auto">{selectedSubject ? `Browse chapters of "${selectedSubject.name}" to view video lectures and notes.` : 'Pick a subject from the left sidebar.'}</p></div></motion.div>
              : resourcesLoading ? <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-24 text-muted-foreground"><Loader2 className="size-6 animate-spin mr-2" />Loading...</motion.div>
              : <motion.div key={selectedChapter.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
                  <div><div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><span>{selectedSubject?.name}</span><span>/</span><span className="text-foreground font-medium">{selectedChapter.name}</span></div><h2 className="text-2xl font-bold tracking-tight">{selectedChapter.name}</h2></div>
                  {resources.length === 0 ? <div className="text-center py-20 rounded-xl border border-dashed border-border"><Inbox className="size-10 mx-auto text-muted-foreground/50 mb-3" /><p className="text-muted-foreground">No videos or notes added yet.</p></div>
                  : <Tabs defaultValue="video" className="w-full"><TabsList className="grid w-full max-w-md grid-cols-2"><TabsTrigger value="video"><Video className="size-4 mr-2" />Videos{videos.length > 0 && <span className="ml-1.5 text-xs bg-primary/10 text-primary rounded-full px-1.5">{videos.length}</span>}</TabsTrigger><TabsTrigger value="note"><FileText className="size-4 mr-2" />Notes{notes.length > 0 && <span className="ml-1.5 text-xs bg-primary/10 text-primary rounded-full px-1.5">{notes.length}</span>}</TabsTrigger></TabsList>
                    <TabsContent value="video" className="mt-5">{videos.length === 0 ? <div className="text-center py-16 rounded-xl border border-dashed border-border"><Video className="size-8 mx-auto text-muted-foreground/50 mb-2" /><p className="text-muted-foreground">No videos yet.</p></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{videos.map((v, i) => <motion.button key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }} onClick={() => setViewingResource(v)} className="text-left rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"><div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><PlayCircle className="size-10 text-primary/80" /></div><div className="p-3"><h3 className="font-medium text-sm truncate">{v.title}</h3><p className="text-xs text-muted-foreground mt-0.5 truncate">{new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p></div></motion.button>)}</div>}</TabsContent>
                    <TabsContent value="note" className="mt-5">{notes.length === 0 ? <div className="text-center py-16 rounded-xl border border-dashed border-border"><FileText className="size-8 mx-auto text-muted-foreground/50 mb-2" /><p className="text-muted-foreground">No notes yet.</p></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{notes.map((n, i) => <motion.button key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }} onClick={() => setViewingResource(n)} className="text-left rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"><div className="relative aspect-video bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center"><FileText className="size-10 text-emerald-500/80" /></div><div className="p-3"><h3 className="font-medium text-sm truncate">{n.title}</h3><p className="text-xs text-muted-foreground mt-0.5 truncate">{n.noteFileName || 'PDF'}</p></div></motion.button>)}</div>}</TabsContent>
                  </Tabs>}
                </motion.div>}
            </AnimatePresence>
          </div></ScrollArea>
        </main>
      </div>
      <footer className="mt-auto border-t border-border bg-card/60 py-3 text-center text-xs text-muted-foreground"><div>Btech Study Point · {student.name} ({student.branch}, Sem {student.semester})</div><div className="mt-1"><MadeWithLove /></div></footer>

      {/* Resource viewer modal */}
      <AnimatePresence>{viewingResource && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewingResource(null)}><motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}><div className="flex items-center gap-3 p-4 border-b border-border">{viewingResource.type === 'video' ? <PlayCircle className="size-5 text-primary shrink-0" /> : <FileText className="size-5 text-emerald-500 shrink-0" />}<div className="min-w-0 flex-1"><h3 className="font-semibold truncate">{viewingResource.title}</h3></div><button onClick={() => setViewingResource(null)} className="size-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"><X className="size-5" /></button></div><div className="flex-1 overflow-auto p-4">{viewingResource.type === 'video' ? <YouTubePlayer resource={viewingResource} /> : <PdfViewer resource={viewingResource} />}</div></motion.div></motion.div>}</AnimatePresence>
    </div>
  )
}
