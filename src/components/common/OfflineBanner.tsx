import React from 'react'

interface OfflineBannerProps {
  isOnline: boolean
  queuedCount?: number
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOnline, queuedCount = 0 }) => {
  if (isOnline) return null

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-medium text-center">
      You are currently offline. {queuedCount > 0 ? `${queuedCount} habit(s) queued for sync.` : 'Changes will sync when reconnected.'}
    </div>
  )
}