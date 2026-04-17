import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import { behavioralQuestions } from '@/lib/mock/behavioral'
import { mockSessions } from '@/lib/mock/sessions'
import type { TranscriptSegment } from '@/lib/types'

const session = mockSessions[1]

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)
  useEffect(() => {
    if (seconds <= 0) return
    const id = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [seconds])
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function Waveform({ speaking }: { speaking: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    const BARS = 48
    const BAR_W = (W - (BARS - 1) * 2) / BARS

    const draw = () => {
      tRef.current += speaking ? 0.07 : 0.015
      const t = tRef.current
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < BARS; i++) {
        const norm = i / BARS
        const baseAmp = speaking
          ? 0.15 + 0.7 * Math.abs(Math.sin(norm * 8 + t * 2.5) * Math.sin(t * 1.3 + norm * 4))
          : 0.04 + 0.08 * Math.abs(Math.sin(norm * 3 + t))
        const h = Math.max(2, baseAmp * H)
        const x = i * (BAR_W + 2)
        const y = (H - h) / 2
        const alpha = speaking ? 0.7 + 0.3 * (h / H) : 0.25
        ctx.fillStyle = `rgba(255, 107, 53, ${alpha})`
        ctx.beginPath()
        ctx.roundRect(x, y, BAR_W, h, 2)
        ctx.fill()
      }
      frameRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [speaking])

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={80}
      className="w-full max-w-lg"
    />
  )
}

export function BehavioralInterview() {
  const navigate = useNavigate()
  const [questionIdx, setQuestionIdx] = useState(0)
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(true)
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([session.transcript[0]])
  const [showHistory, setShowHistory] = useState(false)
  const totalSecs = session.durationMinutes * 60
  const timeStr = useCountdown(totalSecs - 60)

  const currentQuestion = behavioralQuestions[questionIdx]

  useEffect(() => {
    const id = setTimeout(() => {
      setInterviewerSpeaking(false)
      setTimeout(() => setUserSpeaking(true), 800)
    }, 3000)
    return () => clearTimeout(id)
  }, [questionIdx])

  useEffect(() => {
    if (!userSpeaking) return
    const lines = [session.transcript[1], session.transcript[2], session.transcript[3]].filter(Boolean)
    lines.forEach((seg, i) => {
      setTimeout(() => {
        setTranscript((t) => [...t, seg])
        if (i === lines.length - 1) {
          setTimeout(() => {
            setUserSpeaking(false)
            setInterviewerSpeaking(true)
            setTimeout(() => setInterviewerSpeaking(false), 2500)
          }, 1200)
        }
      }, i * 3500 + 2000)
    })
  }, [userSpeaking])

  const handleNext = () => {
    if (questionIdx < behavioralQuestions.length - 1) {
      setQuestionIdx((i) => i + 1)
      setInterviewerSpeaking(true)
      setUserSpeaking(false)
      setTranscript([])
    } else {
      navigate('/feedback/feedback-2')
    }
  }

  const speakingLabel = interviewerSpeaking ? 'Interviewer is speaking' : userSpeaking ? "You're speaking" : 'Listening...'
  const speakingColor = interviewerSpeaking ? 'text-paper-dim' : userSpeaking ? 'text-ember' : 'text-paper-faint'

  return (
    <div className="flex h-screen flex-col bg-ink-950 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-ink-700/60 bg-ink-900 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ember">◆</span>
          <span className="font-display text-sm font-semibold text-paper">Intervue</span>
          <span className="font-mono text-xs text-paper-faint ml-2">Behavioral · {session.company ?? 'General'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-paper-faint">{timeStr}</span>
          <button
            onClick={() => navigate('/feedback/feedback-2')}
            className="font-mono text-xs uppercase tracking-widest text-paper-faint hover:text-crimson transition-colors border border-ink-700/60 px-3 py-1 rounded-sm hover:border-crimson/40"
          >
            End session
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main centered content */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
          {/* Question counter */}
          <motion.p
            key={questionIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 font-mono text-xs uppercase tracking-widest text-paper-faint"
          >
            Question {String(questionIdx + 1).padStart(2, '0')} / {String(behavioralQuestions.length).padStart(2, '0')}
          </motion.p>

          {/* Question text */}
          <AnimatePresence mode="wait">
            <motion.h2
              key={questionIdx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-10 max-w-2xl text-center font-display text-2xl font-semibold leading-snug text-paper md:text-3xl"
            >
              {currentQuestion.text}
            </motion.h2>
          </AnimatePresence>

          {/* Waveform */}
          <div className="mb-6 flex flex-col items-center gap-4">
            <Waveform speaking={userSpeaking || interviewerSpeaking} />
            <div className="flex items-center gap-2">
              {(userSpeaking || interviewerSpeaking) && (
                <div className={cn('h-2 w-2 animate-pulse-ember rounded-full', userSpeaking ? 'bg-ember' : 'bg-paper-dim')} />
              )}
              <span className={cn('font-mono text-xs', speakingColor)}>{speakingLabel}</span>
            </div>
          </div>

          {/* Interviewer persona card */}
          <div className="mb-8 flex items-center gap-3 rounded-md border border-ink-700/60 bg-ink-900 px-5 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 font-display text-sm font-semibold text-paper border border-ink-700/80">
              R
            </div>
            <div>
              <p className="text-sm font-medium text-paper">Riley</p>
              <p className="font-mono text-[10px] text-paper-faint">Skeptical · Amazon LP</p>
            </div>
            {interviewerSpeaking && (
              <div className="ml-3 flex items-center gap-1.5">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: [1, 2.5, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    className="h-3 w-0.5 rounded-full bg-ember origin-bottom"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMuted((m) => !m)}
              className={cn(
                'rounded-sm border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all duration-200',
                muted
                  ? 'border-crimson/40 bg-crimson/10 text-crimson'
                  : 'border-ink-700/60 text-paper-faint hover:border-paper-faint/30 hover:text-paper-dim'
              )}
            >
              {muted ? '⊘ Muted' : '⊙ Mute'}
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              className="rounded-sm border border-ink-700/60 px-4 py-2 font-mono text-xs uppercase tracking-widest text-paper-faint hover:border-paper-faint/30 hover:text-paper-dim transition-all duration-200"
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button
              onClick={handleNext}
              className="rounded-sm border border-ink-700/60 px-4 py-2 font-mono text-xs uppercase tracking-widest text-paper-faint hover:border-paper-faint/30 hover:text-paper-dim transition-all duration-200"
            >
              Skip →
            </button>
          </div>
        </div>

        {/* Right: transcript / history drawer */}
        <div className="flex w-[280px] shrink-0 flex-col border-l border-ink-700/60 bg-ink-900">
          <div className="flex items-center gap-2 border-b border-ink-700/60 p-3">
            <button
              onClick={() => setShowHistory(false)}
              className={cn('font-mono text-xs uppercase tracking-widest transition-colors', !showHistory ? 'text-paper' : 'text-paper-faint hover:text-paper-dim')}
            >
              Transcript
            </button>
            <span className="text-paper-faint/40">|</span>
            <button
              onClick={() => setShowHistory(true)}
              className={cn('font-mono text-xs uppercase tracking-widest transition-colors', showHistory ? 'text-paper' : 'text-paper-faint hover:text-paper-dim')}
            >
              Questions
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!showHistory ? (
              <div className="space-y-3">
                {transcript.map((seg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-2"
                  >
                    <span className={cn(
                      'mt-0.5 shrink-0 font-mono text-[9px] font-medium uppercase',
                      seg.speaker === 'interviewer' ? 'text-paper-faint' : 'text-ember'
                    )}>
                      {seg.speaker === 'interviewer' ? 'INT' : 'YOU'}
                    </span>
                    <p className="text-xs leading-relaxed text-paper-dim">{seg.text}</p>
                  </motion.div>
                ))}
                {transcript.length === 0 && (
                  <p className="font-mono text-xs text-paper-faint/40">Transcript will appear here...</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {behavioralQuestions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => { setQuestionIdx(i); setShowHistory(false) }}
                    className={cn(
                      'w-full rounded-sm border p-3 text-left transition-all duration-150',
                      i === questionIdx
                        ? 'border-ember/30 bg-ember/8'
                        : i < questionIdx
                        ? 'border-ink-700/40 bg-ink-800/40 opacity-60'
                        : 'border-ink-700/40 hover:border-ink-600'
                    )}
                  >
                    <p className={cn('font-mono text-[10px] mb-1 uppercase tracking-widest', i === questionIdx ? 'text-ember' : 'text-paper-faint')}>
                      Q{String(i + 1).padStart(2, '0')} {i < questionIdx ? '· done' : i === questionIdx ? '· active' : ''}
                    </p>
                    <p className="text-xs text-paper-dim line-clamp-2">{q.text}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
