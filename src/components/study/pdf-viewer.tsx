'use client'

import { Download, FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Resource } from '@/lib/types'

export function PdfViewer({ resource }: { resource: Resource }) {
  const url = resource.noteUrl || ''
  if (!url) {
    return <div className="w-full rounded-xl bg-muted flex items-center justify-center h-[40vh] text-muted-foreground">Note not available</div>
  }
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><FileText className="size-5" /></div>
          <div className="min-w-0"><p className="font-medium truncate">{resource.title}</p><p className="text-xs text-muted-foreground truncate">{resource.noteFileName || 'PDF Document'}</p></div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm"><a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /> Open</a></Button>
          <Button asChild size="sm"><a href={url} download={resource.noteFileName || 'note.pdf'}><Download className="size-4" /> Download</a></Button>
        </div>
      </div>
      <div className="w-full rounded-xl overflow-hidden border border-border bg-muted/30 shadow-sm"><iframe key={resource.id} src={url} title={resource.title} className="w-full h-[70vh] bg-white" /></div>
    </div>
  )
}
