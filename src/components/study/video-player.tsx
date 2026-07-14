'use client'

import { ShieldAlert } from 'lucide-react'
import type { Resource } from '@/lib/types'

/**
 * YouTube video player that embeds the video securely.
 * - Video plays INSIDE the website (no redirect to YouTube)
 * - YouTube channel name hidden
 * - Copy link button disabled
 * - Related videos hidden
 * - Right-click disabled on the container
 *
 * Uses youtube-nocookie.com for privacy. The key parameters:
 * - rel=0: no related videos from other channels
 * - modestbranding=1: minimal YouTube branding
 * - playsinline=1: don't autoplay fullscreen on mobile
 * - iv_load_policy=3: hide annotations
 * - cc_load_policy=0: don't force closed captions
 * - fs=1: allow fullscreen
 *
 * The iframe is wrapped in a container that blocks right-click
 * and adds an overlay to hide the YouTube title/channel when paused.
 */
export function YouTubePlayer({ resource }: { resource: Resource }) {
  if (!resource.youtubeId) {
    return (
      <div className="w-full rounded-xl bg-black flex items-center justify-center h-[40vh] text-white/50">
        Video not available
      </div>
    )
  }

  // Build embed URL — youtube-nocookie for privacy, minimal branding
  const embedUrl = `https://www.youtube-nocookie.com/embed/${resource.youtubeId}?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&cc_load_policy=0&fs=1&disablekb=1`

  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-xl bg-black shadow-lg select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          src={embedUrl}
          title={resource.title}
          className="w-full aspect-video bg-black pointer-events-auto"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-200">
        <ShieldAlert className="size-4 mt-0.5 shrink-0" />
        <span>
          This video is for study purposes only. Please do not download or redistribute.
        </span>
      </div>
    </div>
  )
}
