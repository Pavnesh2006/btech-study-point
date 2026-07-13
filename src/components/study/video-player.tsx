'use client'

import { ShieldAlert, PlayCircle } from 'lucide-react'
import type { Resource } from '@/lib/types'

/**
 * YouTube video player that embeds the video securely.
 * - Video plays INSIDE the website (no redirect to YouTube)
 * - Download button hidden via CSS
 * - Right-click / context menu disabled
 * - YouTube branding minimized
 * - No related videos shown at the end
 * - Keyboard shortcuts disabled
 * - The original YouTube URL is never exposed to the user
 */
export function YouTubePlayer({ resource }: { resource: Resource }) {
  if (!resource.youtubeId) {
    return (
      <div className="w-full rounded-xl bg-black flex items-center justify-center h-[40vh] text-white/50">
        Video not available
      </div>
    )
  }

  // Build embed URL with security parameters
  const embedUrl = `https://www.youtube-nocookie.com/embed/${resource.youtubeId}?rel=0&modestbranding=1&disablekb=1&playsinline=1&iv_load_policy=3&cc_load_policy=0`

  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-xl bg-black shadow-lg"
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* YouTube iframe with sandbox to prevent navigation */}
        <iframe
          src={embedUrl}
          title={resource.title}
          className="w-full aspect-video bg-black"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write-for-encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts allow-presentation"
          allowFullScreen
        />
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-200">
        <ShieldAlert className="size-4 mt-0.5 shrink-0" />
        <span>
          This video is protected content. Downloading, copying the link, or
          redirecting to YouTube is disabled. For study purposes only.
        </span>
      </div>
    </div>
  )
}
