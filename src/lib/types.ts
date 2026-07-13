export interface StudentInfo {
  name: string
  branch: string
  semester: number
}

export interface Subject {
  id: string
  name: string
  code: string | null
  branch: string
  semester: number
  createdAt: string
  _count?: { chapters: number }
}

export interface Chapter {
  id: string
  name: string
  subjectId: string
  createdAt: string
  _count?: { resources: number }
}

export type ResourceType = 'video' | 'note'

export interface Resource {
  id: string
  title: string
  type: ResourceType
  youtubeId: string | null
  noteUrl: string | null
  noteFileName: string | null
  chapterId: string
  createdAt: string
  chapter?: { id: string; name: string; subject: { id: string; name: string; branch: string; semester: number } }
}

export interface Ad {
  id: string
  title: string
  imageUrl: string
  linkUrl: string | null
  active: boolean
  createdAt: string
}

/** Extract YouTube video ID from various URL formats */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // just the ID
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
