import React, { useEffect, useState, useRef } from "react"
import { Camera, Loader2, User, AlertCircle, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface AvatarUploadProps {
  userId: string
  avatarUrl?: string | null
  onUploadSuccess?: (newUrl: string) => void
  size?: "sm" | "md" | "lg"
}


export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  avatarUrl: initialAvatarUrl,
  onUploadSuccess,
  size = "md",
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null)
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync initial URL prop if provided
  useEffect(() => {
    if (initialAvatarUrl) {
      setAvatarUrl(initialAvatarUrl)
    } else {
      fetchAvatar()
    }
  }, [initialAvatarUrl, userId])

  // Fetch current avatar from public bucket if not passed via props
  const fetchAvatar = async () => {
    try {
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${userId}/avatar.png`)

      if (data?.publicUrl) {
        // Cache-busting query parameter to force refresh updated images
        setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`)
      }
    } catch {
      // Quiet fail if no avatar exists yet
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setErrorMessage(null)
    setSuccess(false)

    // 1. Validate File Type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WebP).")
      return
    }

    // 2. Validate File Size (1 MB limit)
    const MAX_SIZE = 1 * 1024 * 1024 // 1MB
    if (file.size > MAX_SIZE) {
      setErrorMessage("Image size must be under 1 MB.")
      return
    }

    try {
      setUploading(true)

      // Upload/Upsert image into user's folder
      const filePath = `${userId}/avatar.png`
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        })

      if (uploadError) throw uploadError

      // Retrieve public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const freshUrl = `${data.publicUrl}?t=${Date.now()}`

      setAvatarUrl(freshUrl)
      setSuccess(true)
      if (onUploadSuccess) onUploadSuccess(freshUrl)

      // Clear success feedback after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload image.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // Size mapping styles
  const sizeClasses = {
    sm: "size-9 text-xs",
    md: "size-11 text-sm",
    lg: "size-16 text-base",
  }

  const iconSizes = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5",
  }

  return (
    <div className="relative flex flex-col items-center gap-1.5">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        id="avatar-upload-input"
        disabled={uploading}
      />

      {/* Interactive Avatar Container */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-label="Upload avatar photo"
        className={cn(
          "group relative flex items-center justify-center overflow-hidden rounded-full border border-border/80 bg-muted/60 transition-all duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          sizeClasses[size],
          uploading && "cursor-not-allowed opacity-80"
        )}
      >
        {/* Render Image or Fallback User Icon */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="User avatar"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setAvatarUrl(null)}
          />
        ) : (
          <User className={cn("text-muted-foreground transition-colors group-hover:text-foreground", iconSizes[size])} />
        )}

        {/* Hover Camera Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Camera className={iconSizes[size]} />
        </div>

        {/* Loading Spinner Overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[1px]">
            <Loader2 className={cn("animate-spin text-primary", iconSizes[size])} />
          </div>
        )}

        {/* Success Indicator Badge */}
        {success && !uploading && (
          <div className="absolute bottom-0 right-0 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
            <Check className="size-2.5 stroke-[3]" />
          </div>
        )}
      </button>

      {/* Inline Tooltip Error Message */}
      {errorMessage && (
        <div className="absolute top-full mt-1 z-20 flex items-center gap-1 rounded-md bg-destructive px-2 py-1 text-[10px] font-medium text-destructive-foreground shadow-md animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="size-3 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}