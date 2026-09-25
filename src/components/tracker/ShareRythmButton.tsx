import React, { useState } from 'react'
import { Share2, Check } from 'lucide-react' // Removed 'Copy'

export const ShareRhythmButton: React.FC<{ streakCount: number }> = ({ streakCount }) => {
  const [copied, setCopied] = useState(false)

  const shareData = {
    title: 'My Rhythm Streak',
    text: `I am on a ${streakCount}-day streak tracking my daily habits with Rhythm!`,
    url: window.location.href,
  }

  const handleShare = async () => {
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard()
        }
      }
    } else {
      await copyToClipboard()
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.error('Clipboard copy failed:', err)
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted transition-colors"
      aria-label="Share your habit streak"
    >
      {copied ? <Check className="size-4 text-emerald-500" /> : <Share2 className="size-4" />}
      <span>{copied ? 'Copied link!' : 'Share Progress'}</span>
    </button>
  )
}