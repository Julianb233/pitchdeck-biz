"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SlideContent } from "@/lib/types";
import type { PitchFeedback } from "@/lib/pitch-coach/session";
import {
  Mic,
  MicOff,
  Play,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  MessageSquare,
  Trophy,
  Loader2,
  Sparkles,
  Target,
  Gauge,
  Eye,
  CheckCircle2,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SessionConfig {
  sessionId: string;
  userId: string;
  tier: string;
  slidesCount: number;
}

interface SlideFeedbackState {
  slideNumber: number;
  feedback: PitchFeedback;
}

type SessionPhase = "landing" | "setup" | "coaching" | "summary";

// ── Score Ring Component ──────────────────────────────────────────────────────

function ScoreRing({
  score,
  size = 80,
  label,
}: {
  score: number;
  size?: number;
  label: string;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80
      ? "text-emerald-400"
      : score >= 60
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            className="text-zinc-800"
            strokeWidth={4}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            className={color}
            strokeWidth={4}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${color}`}
        >
          {score}
        </span>
      </div>
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PitchCoachPage() {
  const [phase, setPhase] = React.useState<SessionPhase>("landing");
  const [session, setSession] = React.useState<SessionConfig | null>(null);
  const [slides, setSlides] = React.useState<SlideContent[]>([]);
  const [currentSlideIdx, setCurrentSlideIdx] = React.useState(0);
  const [transcript, setTranscript] = React.useState("");
  const [isRecording, setIsRecording] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isStarting, setIsStarting] = React.useState(false);
  const [feedbackMap, setFeedbackMap] = React.useState<
    Map<number, PitchFeedback>
  >(new Map());
  const [currentFeedback, setCurrentFeedback] =
    React.useState<PitchFeedback | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const currentSlide = slides[currentSlideIdx] ?? null;

  // ── Load deck from sessionStorage ──────────────────────────────────────

  React.useEffect(() => {
    try {
      const stored = sessionStorage.getItem("pitchdeck-content");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.slides && Array.isArray(parsed.slides)) {
          setSlides(parsed.slides);
        }
      }
    } catch {
      // No deck available
    }
  }, []);

  // ── Start Session ──────────────────────────────────────────────────────

  async function handleStartSession() {
    setIsStarting(true);
    try {
      const res = await fetch("/api/pitch-coach/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresPurchase) {
          toast.error(
            `Pitch coaching requires a purchase ($${data.price}/session) or Founder Suite subscription.`
          );
          return;
        }
        throw new Error(data.error ?? "Failed to start session");
      }

      setSession(data);
      setPhase("coaching");
      toast.success("Coaching session started!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start session"
      );
    } finally {
      setIsStarting(false);
    }
  }

  // ── Recording ──────────────────────────────────────────────────────────

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        // For MVP, we use the text transcript. Voice-to-text would require
        // additional integration with Whisper or Google Speech-to-Text.
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      toast.info("Recording... Speak your pitch for this slide.");
    } catch {
      toast.error(
        "Microphone access denied. You can type your pitch instead."
      );
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  // ── Submit for Feedback ────────────────────────────────────────────────

  async function handleSubmitPitch() {
    if (!session || !currentSlide || transcript.length < 10) {
      toast.error("Please provide a more detailed pitch (at least a few sentences).");
      return;
    }

    setIsAnalyzing(true);
    setCurrentFeedback(null);

    try {
      const res = await fetch("/api/pitch-coach/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          slideNumber: currentSlide.slideNumber,
          slideTitle: currentSlide.title,
          slideType: currentSlide.type,
          slideBulletPoints: currentSlide.bulletPoints,
          userTranscript: transcript,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");

      const feedback = data.feedback as PitchFeedback;
      setCurrentFeedback(feedback);

      setFeedbackMap((prev) => {
        const next = new Map(prev);
        next.set(currentSlide.slideNumber, feedback);
        return next;
      });

      toast.success(`Score: ${feedback.overallScore}/100`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to analyze pitch"
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  function goToSlide(dir: "prev" | "next") {
    const newIdx =
      dir === "prev"
        ? Math.max(0, currentSlideIdx - 1)
        : Math.min(slides.length - 1, currentSlideIdx + 1);
    setCurrentSlideIdx(newIdx);
    setTranscript("");
    setCurrentFeedback(feedbackMap.get(slides[newIdx]?.slideNumber) ?? null);
  }

  // ── Compute Summary ────────────────────────────────────────────────────

  const allFeedback = Array.from(feedbackMap.values());
  const avgScore =
    allFeedback.length > 0
      ? Math.round(
          allFeedback.reduce((s, f) => s + f.overallScore, 0) /
            allFeedback.length
        )
      : 0;

  // ── Landing Phase ──────────────────────────────────────────────────────

  if (phase === "landing") {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 text-sm text-violet-300">
            <Sparkles className="h-4 w-4" />
            AI-Powered Coaching
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Pitch Coach
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Practice your pitch slide-by-slide with AI feedback. Get scored on
            clarity, confidence, pacing, and content coverage. Walk into your
            next investor meeting fully prepared.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Mic className="h-6 w-6 text-violet-400" />,
              title: "Record or Type",
              description:
                "Practice your pitch by speaking into your mic or typing your script. Both modes get full AI analysis.",
            },
            {
              icon: <BarChart3 className="h-6 w-6 text-emerald-400" />,
              title: "Real-Time Scoring",
              description:
                "Get scored on 4 dimensions: clarity, confidence, pacing, and content coverage. Track your improvement.",
            },
            {
              icon: <MessageSquare className="h-6 w-6 text-amber-400" />,
              title: "Actionable Feedback",
              description:
                "Receive specific suggestions and strong points for each slide. Know exactly what to improve.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3"
            >
              {card.icon}
              <h3 className="font-semibold text-white">{card.title}</h3>
              <p className="text-sm text-zinc-400">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">Ready to practice?</h2>
          <div className="flex items-center justify-center gap-6 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>
                <strong className="text-white">Founder Suite</strong> — 1
                session/month included
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>
                <strong className="text-white">Add-on</strong> — $49 per session
              </span>
            </div>
          </div>

          {slides.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-zinc-500">
                No deck loaded. Generate a pitch deck first to use the coach.
              </p>
              <Button variant="outline" asChild>
                <a href="/create">Create a Deck</a>
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              onClick={() => setPhase("setup")}
              className="bg-violet-600 hover:bg-violet-500 text-white px-8"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Coaching Session
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Setup Phase ────────────────────────────────────────────────────────

  if (phase === "setup") {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        <h1 className="text-2xl font-bold">Session Setup</h1>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <p className="text-zinc-300">
            Your deck has <strong>{slides.length} slides</strong>. You&apos;ll
            practice presenting each slide and receive AI feedback.
          </p>
          <div className="text-sm text-zinc-400 space-y-2">
            <p>How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Navigate to each slide in your deck</li>
              <li>Record your pitch or type what you would say</li>
              <li>Submit for instant AI analysis</li>
              <li>Review feedback and improve</li>
              <li>Get a session summary when you&apos;re done</li>
            </ol>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setPhase("landing")}
            >
              Back
            </Button>
            <Button
              onClick={handleStartSession}
              disabled={isStarting}
              className="bg-violet-600 hover:bg-violet-500 text-white"
            >
              {isStarting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {isStarting ? "Starting..." : "Begin Session"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Summary Phase ──────────────────────────────────────────────────────

  if (phase === "summary") {
    return (
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-2">
          <Trophy className="h-10 w-10 text-amber-400 mx-auto" />
          <h1 className="text-2xl font-bold">Session Complete</h1>
          <p className="text-zinc-400">
            You reviewed {feedbackMap.size} of {slides.length} slides
          </p>
        </div>

        {/* Overall Score */}
        <div className="flex justify-center">
          <ScoreRing score={avgScore} size={120} label="Overall Score" />
        </div>

        {/* Category Scores */}
        <div className="flex justify-center gap-8">
          {[
            {
              label: "Clarity",
              score: Math.round(
                allFeedback.reduce((s, f) => s + f.clarity.score, 0) /
                  Math.max(allFeedback.length, 1)
              ),
            },
            {
              label: "Confidence",
              score: Math.round(
                allFeedback.reduce((s, f) => s + f.confidence.score, 0) /
                  Math.max(allFeedback.length, 1)
              ),
            },
            {
              label: "Pacing",
              score: Math.round(
                allFeedback.reduce((s, f) => s + f.pacing.score, 0) /
                  Math.max(allFeedback.length, 1)
              ),
            },
            {
              label: "Coverage",
              score: Math.round(
                allFeedback.reduce((s, f) => s + f.contentCoverage.score, 0) /
                  Math.max(allFeedback.length, 1)
              ),
            },
          ].map((cat) => (
            <ScoreRing
              key={cat.label}
              score={cat.score}
              size={72}
              label={cat.label}
            />
          ))}
        </div>

        {/* Per-slide breakdown */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Slide Breakdown</h2>
          {slides.map((slide) => {
            const fb = feedbackMap.get(slide.slideNumber);
            return (
              <div
                key={slide.slideNumber}
                className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <span className="text-sm font-mono text-zinc-500 w-8">
                  #{slide.slideNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{slide.title}</p>
                  <p className="text-xs text-zinc-500">{slide.type}</p>
                </div>
                {fb ? (
                  <Badge
                    variant="outline"
                    className={
                      fb.overallScore >= 80
                        ? "border-emerald-500/30 text-emerald-400"
                        : fb.overallScore >= 60
                          ? "border-amber-500/30 text-amber-400"
                          : "border-red-500/30 text-red-400"
                    }
                  >
                    {fb.overallScore}/100
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-zinc-600">
                    Skipped
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <Button variant="outline" onClick={() => setPhase("landing")}>
            Back to Overview
          </Button>
          <Button
            onClick={() => {
              setFeedbackMap(new Map());
              setCurrentSlideIdx(0);
              setCurrentFeedback(null);
              setTranscript("");
              setPhase("setup");
            }}
            className="bg-violet-600 hover:bg-violet-500 text-white"
          >
            Practice Again
          </Button>
        </div>
      </div>
    );
  }

  // ── Coaching Phase ─────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Pitch Coach</h1>
          <Badge variant="outline" className="text-violet-400 border-violet-500/30">
            Slide {currentSlideIdx + 1} / {slides.length}
          </Badge>
          {feedbackMap.size > 0 && (
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
              Avg: {avgScore}/100
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPhase("summary")}
        >
          End Session
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Slide Reference */}
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className="text-xs capitalize"
              >
                {currentSlide?.type ?? "slide"}
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentSlideIdx === 0}
                  onClick={() => goToSlide("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentSlideIdx === slides.length - 1}
                  onClick={() => goToSlide("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold">{currentSlide?.title}</h2>
              {currentSlide?.subtitle && (
                <p className="text-sm text-zinc-400 mt-1">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {currentSlide?.bulletPoints &&
              currentSlide.bulletPoints.length > 0 && (
                <ul className="space-y-2">
                  {currentSlide.bulletPoints.map((bp, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-zinc-300"
                    >
                      <span className="text-violet-400 mt-0.5 shrink-0">
                        &bull;
                      </span>
                      {bp}
                    </li>
                  ))}
                </ul>
              )}

            {currentSlide?.notes && (
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <p className="text-xs text-zinc-500 mb-1">Speaker Notes</p>
                <p className="text-sm text-zinc-400">{currentSlide.notes}</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
            <h3 className="text-sm font-medium text-zinc-300">
              Your Pitch for This Slide
            </h3>

            <textarea
              className="w-full h-32 rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-sm text-white placeholder:text-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              placeholder="Type what you would say when presenting this slide... or use the microphone to record."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              disabled={isAnalyzing}
            />

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                className={
                  isRecording
                    ? "border-red-500/50 text-red-400 hover:text-red-300"
                    : ""
                }
              >
                {isRecording ? (
                  <MicOff className="mr-1 h-4 w-4" />
                ) : (
                  <Mic className="mr-1 h-4 w-4" />
                )}
                {isRecording ? "Stop" : "Record"}
              </Button>

              <Button
                onClick={handleSubmitPitch}
                disabled={isAnalyzing || transcript.length < 10}
                className="bg-violet-600 hover:bg-violet-500 text-white"
              >
                {isAnalyzing ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-1 h-4 w-4" />
                )}
                {isAnalyzing ? "Analyzing..." : "Get Feedback"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Feedback Panel */}
        <div className="space-y-4">
          {currentFeedback ? (
            <>
              {/* Score Dashboard */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="flex items-center justify-center gap-6">
                  <ScoreRing
                    score={currentFeedback.overallScore}
                    size={96}
                    label="Overall"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <ScoreRing
                      score={currentFeedback.clarity.score}
                      size={64}
                      label="Clarity"
                    />
                    <ScoreRing
                      score={currentFeedback.confidence.score}
                      size={64}
                      label="Confidence"
                    />
                    <ScoreRing
                      score={currentFeedback.pacing.score}
                      size={64}
                      label="Pacing"
                    />
                    <ScoreRing
                      score={currentFeedback.contentCoverage.score}
                      size={64}
                      label="Coverage"
                    />
                  </div>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-violet-400" />
                  Detailed Feedback
                </h3>

                {[
                  {
                    icon: <Target className="h-4 w-4 text-blue-400" />,
                    label: "Clarity",
                    data: currentFeedback.clarity,
                  },
                  {
                    icon: <Gauge className="h-4 w-4 text-amber-400" />,
                    label: "Confidence",
                    data: currentFeedback.confidence,
                  },
                  {
                    icon: <Play className="h-4 w-4 text-emerald-400" />,
                    label: "Pacing",
                    data: currentFeedback.pacing,
                  },
                  {
                    icon: <Eye className="h-4 w-4 text-violet-400" />,
                    label: "Content Coverage",
                    data: currentFeedback.contentCoverage,
                  },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {item.icon}
                      {item.label}
                      <span className="text-zinc-500">
                        {item.data.score}/100
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 pl-6">
                      {item.data.feedback}
                    </p>
                  </div>
                ))}
              </div>

              {/* Suggestions & Strengths */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
                  <h4 className="text-sm font-medium text-amber-400">
                    Improve
                  </h4>
                  <ul className="space-y-1.5">
                    {currentFeedback.suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="text-xs text-zinc-400 flex gap-1.5"
                      >
                        <span className="text-amber-500 shrink-0">&rarr;</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
                  <h4 className="text-sm font-medium text-emerald-400">
                    Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {currentFeedback.strongPoints.map((s, i) => (
                      <li
                        key={i}
                        className="text-xs text-zinc-400 flex gap-1.5"
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 flex flex-col items-center justify-center text-center space-y-3">
              <BarChart3 className="h-10 w-10 text-zinc-700" />
              <h3 className="text-lg font-medium text-zinc-400">
                Feedback will appear here
              </h3>
              <p className="text-sm text-zinc-600 max-w-sm">
                Type or record your pitch for the current slide, then click
                &quot;Get Feedback&quot; to receive AI coaching.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
