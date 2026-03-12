"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, ImageIcon, FileWarning } from "lucide-react"

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5

export interface UploadedFile {
  id: string
  file: File
  preview: string
  name: string
  size: number
}

interface FileUploaderProps {
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  disabled?: boolean
}

export function FileUploader({ files, onFilesChange, disabled }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndAddFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null)
      const filesToAdd: UploadedFile[] = []

      for (const file of Array.from(newFiles)) {
        if (files.length + filesToAdd.length >= MAX_FILES) {
          setError(`Maximum ${MAX_FILES} files allowed`)
          break
        }
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(`${file.name}: Unsupported format. Use PNG, JPG, WebP, or SVG.`)
          continue
        }
        if (file.size > MAX_FILE_SIZE) {
          setError(`${file.name}: File too large. Maximum 10MB.`)
          continue
        }
        filesToAdd.push({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        })
      }

      if (filesToAdd.length > 0) {
        onFilesChange([...files, ...filesToAdd])
      }
    },
    [files, onFilesChange],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      if (!disabled) validateAndAddFiles(e.dataTransfer.files)
    },
    [disabled, validateAndAddFiles],
  )

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id)
    if (file) URL.revokeObjectURL(file.preview)
    onFilesChange(files.filter((f) => f.id !== id))
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          disabled
            ? "border-zinc-800 bg-zinc-900/30 cursor-not-allowed opacity-50"
            : dragActive
              ? "border-[#8b5cf6] bg-[#8b5cf6]/5"
              : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(e) => e.target.files && validateAndAddFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
        <p className="text-sm text-zinc-300 font-medium">
          Drag & drop product images or brand materials
        </p>
        <p className="text-xs text-zinc-500 mt-1">
          PNG, JPG, WebP, SVG up to 10MB each (max {MAX_FILES} files)
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <FileWarning className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {files.map((f) => (
            <div key={f.id} className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
              <div className="aspect-square relative">
                {f.file.type === "image/svg+xml" ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <ImageIcon className="w-8 h-8 text-zinc-500" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(f.id)
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div className="px-2 py-1.5">
                <p className="text-xs text-zinc-400 truncate">{f.name}</p>
                <p className="text-xs text-zinc-600">{formatSize(f.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
