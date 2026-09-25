import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'

export const UpdateToast: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error: unknown) {
      console.error('SW registration error', error)
    },
  })

  if (!needRefresh) return null

  return (
    <div 
      role="status" 
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-xl text-card-foreground animate-in slide-in-from-bottom-5"
    >
      <div className="text-xs">
        <p className="font-semibold">New version available</p>
        <p className="text-muted-foreground">Refresh to load latest features.</p>
      </div>
      <button
        type="button"
        onClick={() => void updateServiceWorker(true)}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <RefreshCw className="size-3.5" />
        <span>Refresh</span>
      </button>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
        aria-label="Dismiss update alert"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}