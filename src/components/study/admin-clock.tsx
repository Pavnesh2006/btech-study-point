'use client'
import { useSyncExternalStore } from 'react'
import { Clock } from 'lucide-react'

function subscribeTick(cb: () => void): () => void { const id = setInterval(cb, 1000); return () => clearInterval(id) }
function getTick(): number { return Math.floor(Date.now() / 1000) }
function getServerTick(): number { return 0 }

export function AdminClock() {
  const tick = useSyncExternalStore(subscribeTick, getTick, getServerTick)
  const now = tick ? new Date(tick * 1000) : null
  const time = now ? now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '--:--:--'
  const date = now ? now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : 'Loading...'
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
      <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Clock className="size-5" /></div>
      <div className="leading-tight">
        <div className="font-mono font-semibold text-lg tabular-nums tracking-tight">{time}</div>
        <div className="text-xs text-muted-foreground">{date}</div>
      </div>
    </div>
  )
}
