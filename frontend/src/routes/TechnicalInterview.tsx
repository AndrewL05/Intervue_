import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import { problems } from '@/lib/mock/problems'
import { mockSessions } from '@/lib/mock/sessions'
import type { Language, TranscriptSegment } from '@/lib/types'

const session = mockSessions[0]
const problem = problems[0]

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JS' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'go', label: 'Go' },
]

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

function TimerRing({ timeStr, totalSecs, remainSecs }: { timeStr: string; totalSecs: number; remainSecs: number }) {
  const pct = remainSecs / totalSecs
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)
  const color = pct > 0.4 ? '#FF6B35' : '#B23A3A'

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(250,247,242,0.06)" strokeWidth="3" />
        <circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
        />
      </svg>
      <span className="font-mono text-xs text-paper">{timeStr}</span>
    </div>
  )
}

export function TechnicalInterview() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState<Language>('python')
  const [code, setCode] = useState(problem.starterCode.python)
  const [showTests, setShowTests] = useState(false)
  const [testResults, setTestResults] = useState(problem.testCases)
  const [transcript, setTranscript] = useState<TranscriptSegment[]>(session.transcript.slice(0, 2))
  const [lineIdx, setLineIdx] = useState(2)
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false)
  const transcriptRef = useRef<HTMLDivElement>(null)

  const totalSecs = session.durationMinutes * 60
  const [remainSecs, setRemainSecs] = useState(totalSecs - 120)
  const timeStr = useCountdown(totalSecs - 120)

  useEffect(() => {
    const id = setInterval(() => {
      setRemainSecs((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (lineIdx >= session.transcript.length) return
    const delay = lineIdx < 4 ? 4000 : 7000
    const id = setTimeout(() => {
      const seg = session.transcript[lineIdx]
      if (seg) {
        if (seg.speaker === 'interviewer') setInterviewerSpeaking(true)
        setTranscript((t) => [...t, seg])
        setLineIdx((i) => i + 1)
        setTimeout(() => setInterviewerSpeaking(false), 2000)
      }
    }, delay)
    return () => clearTimeout(id)
  }, [lineIdx])

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: 9999, behavior: 'smooth' })
  }, [transcript])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    setCode(problem.starterCode[lang])
  }

  const handleRun = () => {
    setShowTests(true)
    setTestResults(problem.testCases.map((tc) => ({ ...tc, passed: Math.random() > 0.3 })))
  }

  const handleSubmit = () => {
    setShowTests(true)
    setTestResults(problem.testCases.map((tc) => ({ ...tc, passed: true })))
    setTimeout(() => navigate('/feedback/feedback-1'), 1200)
  }

  return (
    <div className="flex h-screen flex-col bg-ink-950 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-ink-700/60 bg-ink-900 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-ember">◆</span>
          <span className="font-display text-sm font-semibold text-paper">Intervue</span>
          <span className="font-mono text-xs text-paper-faint ml-2">Technical · {session.company}</span>
        </div>
        <button
          onClick={() => navigate('/feedback/feedback-1')}
          className="font-mono text-xs uppercase tracking-widest text-paper-faint hover:text-crimson transition-colors border border-ink-700/60 px-3 py-1 rounded-sm hover:border-crimson/40"
        >
          End session
        </button>
      </div>

      {/* Three-pane layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Pane 1: Problem */}
        <div className="flex w-[320px] shrink-0 flex-col overflow-y-auto border-r border-ink-700/60 bg-ink-900 p-5">
          <div className="mb-1 flex items-center gap-2">
            <span className={cn(
              'rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest',
              problem.difficulty === 'easy' ? 'bg-moss/15 text-moss' :
              problem.difficulty === 'medium' ? 'bg-ember/15 text-ember' :
              'bg-crimson/15 text-crimson'
            )}>
              {problem.difficulty}
            </span>
          </div>
          <h2 className="mb-4 font-display text-xl font-semibold text-paper">{problem.title}</h2>

          <div className="prose-sm text-sm leading-relaxed text-paper-dim space-y-4">
            <p className="text-paper-dim whitespace-pre-line">{problem.description}</p>

            <div className="space-y-3">
              {problem.examples.map((ex, i) => (
                <div key={i} className="rounded-sm border border-ink-700/50 bg-ink-800 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-paper-faint mb-2">Example {i + 1}</p>
                  <p className="font-mono text-xs text-paper-dim"><span className="text-paper-faint">Input:</span> {ex.input}</p>
                  <p className="font-mono text-xs text-paper-dim"><span className="text-paper-faint">Output:</span> {ex.output}</p>
                  {ex.explanation && <p className="mt-1 text-xs text-paper-faint">{ex.explanation}</p>}
                </div>
              ))}
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-paper-faint mb-2">Constraints</p>
              <ul className="space-y-1">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="font-mono text-xs text-paper-dim flex gap-2">
                    <span className="text-paper-faint">·</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Pane 2: Editor */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Editor toolbar */}
          <div className="flex items-center gap-2 border-b border-ink-700/60 bg-ink-900 px-3 py-2">
            <div className="flex items-center gap-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={cn(
                    'rounded-sm px-2.5 py-1 font-mono text-xs transition-all duration-150',
                    language === lang.id
                      ? 'bg-ember/15 text-ember border border-ember/30'
                      : 'text-paper-faint hover:text-paper-dim border border-transparent'
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleRun}
                className="flex items-center gap-1.5 rounded-sm border border-ink-700/60 bg-ink-800 px-3 py-1.5 font-mono text-xs text-paper-dim hover:border-paper-faint/30 hover:text-paper transition-all"
              >
                ▶ Run
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 rounded-sm bg-ember px-3 py-1.5 font-mono text-xs text-ink-950 hover:bg-ember-soft transition-all"
              >
                Submit →
              </button>
            </div>
          </div>

          {/* Monaco */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'javascript' ? 'javascript' : language}
              value={code}
              onChange={(val) => setCode(val ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: '"JetBrains Mono", monospace',
                fontLigatures: true,
                lineHeight: 1.7,
                padding: { top: 16, bottom: 16 },
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                tabSize: 4,
              }}
            />
          </div>

          {/* Test results drawer */}
          <AnimatePresence>
            {showTests && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-ink-700/60 bg-ink-900"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-mono text-xs uppercase tracking-widest text-paper-faint">Test Results</p>
                    <button onClick={() => setShowTests(false)} className="font-mono text-xs text-paper-faint hover:text-paper-dim">✕</button>
                  </div>
                  <div className="space-y-2">
                    {testResults.map((tc) => (
                      <div key={tc.id} className={cn(
                        'flex items-center gap-3 rounded-sm border p-3',
                        tc.passed ? 'border-moss/30 bg-moss/8' : 'border-crimson/30 bg-crimson/8'
                      )}>
                        <span className={cn('font-mono text-xs', tc.passed ? 'text-moss' : 'text-crimson')}>
                          {tc.passed ? '✓ PASS' : '✗ FAIL'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-xs text-paper-dim truncate">Input: {tc.input}</p>
                          <p className="font-mono text-xs text-paper-faint">Expected: {tc.expected} · Got: {tc.actual ?? '…'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pane 3: Interviewer + Transcript */}
        <div className="flex w-[280px] shrink-0 flex-col border-l border-ink-700/60 bg-ink-900">
          {/* Interviewer card */}
          <div className="border-b border-ink-700/60 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-700/80 bg-ink-800 font-display text-sm font-semibold text-paper">
                J
              </div>
              <div>
                <p className="text-sm font-medium text-paper">Jordan</p>
                <p className="font-mono text-[10px] text-paper-faint capitalize">{session.persona}</p>
              </div>
              <div className="ml-auto">
                {interviewerSpeaking ? (
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 animate-pulse-ember rounded-full bg-ember" />
                    <span className="font-mono text-[10px] text-ember">Speaking</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-paper-faint/40" />
                    <span className="font-mono text-[10px] text-paper-faint">Listening</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transcript stream */}
          <div
            ref={transcriptRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
          >
            {transcript.map((seg) => (
              <motion.div
                key={seg.id}
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
                <p className={cn('text-xs leading-relaxed', seg.isHighlighted ? 'text-paper' : 'text-paper-dim')}>
                  {seg.isHighlighted && (
                    <span className="mr-1 inline-block h-1 w-1 rounded-full bg-ember align-middle" />
                  )}
                  {seg.text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-end border-t border-ink-700/60 p-4">
            <TimerRing timeStr={timeStr} totalSecs={totalSecs} remainSecs={remainSecs} />
          </div>
        </div>
      </div>
    </div>
  )
}
