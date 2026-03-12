"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Mic, Square, Play, Pause, RotateCcw, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void
  disabled?: boolean
  className?: string
}

type RecorderState = "idle" | "recording" | "recorded" | "playing"

export function AudioRecorder({
  onRecordingComplete,
  disabled = false,
  className,
}: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle")
  const [duration, setDuration] = useState(0)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioBlobRef = useRef<Blob | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteTimeDomainData(data)
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      const val = (data[i] - 128) / 128
      sum += val * val
    }
    const rms = Math.sqrt(sum / data.length)
    setAudioLevel(Math.min(1, rms * 3))
    animFrameRef.current = requestAnimationFrame(updateAudioLevel)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Set up analyser for visualisation
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      })

      chunksRef.current = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        audioBlobRef.current = blob
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = URL.createObjectURL(blob)
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        setState("recorded")
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(100)

      setDuration(0)
      setState("recording")
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)

      updateAudioLevel()
    } catch {
      console.error("Microphone access denied")
    }
  }, [updateAudioLevel])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    setAudioLevel(0)
  }, [])

  const playback = useCallback(() => {
    if (!audioUrlRef.current) return
    const audio = new Audio(audioUrlRef.current)
    audioRef.current = audio
    setPlaybackTime(0)
    setState("playing")

    const interval = setInterval(() => {
      setPlaybackTime(Math.floor(audio.currentTime))
    }, 200)

    audio.onended = () => {
      clearInterval(interval)
      setState("recorded")
      setPlaybackTime(0)
    }
    audio.play()
  }, [])

  const pausePlayback = useCallback(() => {
    audioRef.current?.pause()
    setState("recorded")
  }, [])

  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    audioBlobRef.current = null
    audioUrlRef.current = null
    setState("idle")
    setDuration(0)
    setPlaybackTime(0)
  }, [])

  const submit = useCallback(() => {
    if (audioBlobRef.current) {
      onRecordingComplete(audioBlobRef.current)
    }
  }, [onRecordingComplete])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Visualiser ring */}
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
            state === "recording"
              ? "bg-red-500/10 border-2 border-red-500/50"
              : state === "recorded" || state === "playing"
                ? "bg-primary/10 border-2 border-primary/50"
                : "bg-muted border-2 border-border"
          )}
          style={
            state === "recording"
              ? {
                  boxShadow: `0 0 ${20 + audioLevel * 40}px rgba(239,68,68,${0.2 + audioLevel * 0.4})`,
                  transform: `scale(${1 + audioLevel * 0.08})`,
                }
              : undefined
          }
        >
          {state === "recording" ? (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full transition-all duration-75"
                  style={{
                    height: `${12 + audioLevel * 28 * (0.5 + Math.random() * 0.5)}px`,
                  }}
                />
              ))}
            </div>
          ) : state === "playing" ? (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full animate-pulse"
                  style={{
                    height: `${8 + Math.random() * 24}px`,
                    background: "var(--brand-gradient-primary)",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          ) : state === "recorded" ? (
            <Play className="w-8 h-8 text-primary ml-1" />
          ) : (
            <Mic className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        {/* Timer badge */}
        {(state === "recording" || state === "recorded" || state === "playing") && (
          <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-background border border-border text-xs font-mono font-medium">
            {state === "playing"
              ? `${formatTime(playbackTime)} / ${formatTime(duration)}`
              : formatTime(duration)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-2">
        {state === "idle" && (
          <Button
            onClick={startRecording}
            disabled={disabled}
            size="lg"
            className="rounded-full gap-2 px-8"
            style={{
              background:
                "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
            }}
          >
            <Mic className="w-4 h-4" />
            Start Recording
          </Button>
        )}

        {state === "recording" && (
          <Button
            onClick={stopRecording}
            variant="destructive"
            size="lg"
            className="rounded-full gap-2 px-8 animate-pulse"
          >
            <Square className="w-4 h-4" />
            Stop
          </Button>
        )}

        {state === "recorded" && (
          <>
            <Button
              onClick={playback}
              variant="outline"
              size="icon-lg"
              className="rounded-full"
            >
              <Play className="w-4 h-4 ml-0.5" />
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              size="icon-lg"
              className="rounded-full"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={submit}
              disabled={disabled}
              size="lg"
              className="rounded-full gap-2 px-8"
              style={{
                background:
                  "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
              }}
            >
              <Upload className="w-4 h-4" />
              Use Recording
            </Button>
          </>
        )}

        {state === "playing" && (
          <>
            <Button
              onClick={pausePlayback}
              variant="outline"
              size="icon-lg"
              className="rounded-full"
            >
              <Pause className="w-4 h-4" />
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              size="icon-lg"
              className="rounded-full"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Instructions */}
      {state === "idle" && (
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Describe your business, target market, and what makes you unique.
          Speak naturally -- our AI will extract the key insights.
        </p>
      )}
      {state === "recording" && (
        <p className="text-sm text-red-500 font-medium animate-pulse">
          Recording... speak clearly about your business
        </p>
      )}
    </div>
  )
}
