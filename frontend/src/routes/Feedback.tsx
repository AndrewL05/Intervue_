import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/cn'
import { mockFeedback, mockSessions } from '@/lib/mock/sessions'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

function MetricRing({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = score / max
  const r = 32
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)
  const color = pct >= 0.75 ? '#7E9E5C' : pct >= 0.55 ? '#FF6B35' : '#B23A3A'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-20 w-20">
        <svg className="-rotate-90" width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(250,247,242,0.06)" strokeWidth="4" />
          <motion.circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-sm font-medium text-paper">{score}</span>
        </div>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-paper-faint">{label}</p>
    </div>
  )
}

function QuestionAccordion({ qf, idx }: { qf: typeof mockFeedback[0]['perQuestion'][0]; idx: number }) {
  const [open, setOpen] = useState(idx === 0)

  return (
    <div className={cn(
      'rounded-md border transition-all duration-200',
      open ? 'border-ember/20 bg-ink-900' : 'border-ink-700/60 bg-ink-900 hover:border-ink-600'
    )}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-paper-faint">Q{String(idx + 1).padStart(2, '0')}</span>
          <p className="text-sm font-medium text-paper line-clamp-1">{qf.questionText}</p>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <span className={cn(
            'font-mono text-sm font-semibold',
            qf.score >= 75 ? 'text-moss' : qf.score >= 55 ? 'text-ember' : 'text-crimson'
          )}>
            {qf.score}
          </span>
          <span className={cn('font-mono text-xs text-paper-faint transition-transform duration-200', open && 'rotate-180')}>▾</span>
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="border-t border-ink-700/50 p-5 space-y-5"
        >
          {/* Evidence spans */}
          {qf.evidenceSpans.length > 0 && (
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-paper-faint">Evidence from your answer</p>
              <div className="space-y-2">
                {qf.evidenceSpans.map((span, i) => (
                  <div key={i} className="rounded-sm border-l-2 border-ember/50 bg-ember/5 px-4 py-3">
                    <p className="mb-1 text-sm text-paper italic">"{span.text}"</p>
                    <p className="font-mono text-[10px] text-paper-faint">{span.context}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths + Improvements */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-moss">Strengths</p>
              <ul className="space-y-1.5">
                {qf.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-paper-dim">
                    <span className="text-moss shrink-0">+</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-crimson">Improve</p>
              <ul className="space-y-1.5">
                {qf.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-paper-dim">
                    <span className="text-crimson shrink-0">△</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Better answer */}
          {qf.betterAnswer && (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-paper-faint">Stronger answer</p>
              <p className="rounded-sm border border-ink-700/50 bg-ink-800 px-4 py-3 text-sm leading-relaxed text-paper-dim italic">
                "{qf.betterAnswer}"
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export function Feedback() {
  const { id } = useParams()
  const navigate = useNavigate()
  const report = mockFeedback.find((f) => f.id === id) ?? mockFeedback[0]
  const session = mockSessions.find((s) => s.id === report.sessionId) ?? mockSessions[0]

  const scoreColor = report.overallScore >= 75 ? 'text-moss' : report.overallScore >= 55 ? 'text-ember' : 'text-crimson'

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <motion.div variants={stagger} initial="hidden" animate="show">
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-10">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-paper-faint">
            {session.company ?? 'General'} · {session.mode} · {new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 className="font-display text-4xl font-semibold text-paper md:text-5xl">Interview Feedback</h1>
        </motion.div>

        {/* Overall score + metrics */}
        <motion.div variants={fadeUp} className="mb-8 rounded-md border border-ink-700/60 bg-ink-900 p-8">
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1 font-mono text-xs uppercase tracking-widest text-paper-faint">Overall score</p>
              <p className={cn('font-display text-7xl font-semibold leading-none', scoreColor)}>
                {report.overallScore}
              </p>
              <p className="mt-1 font-mono text-xs text-paper-faint">/ 100</p>
            </div>
            <div className="h-px w-full bg-ink-700/60 sm:h-20 sm:w-px" />
            <div className="flex flex-wrap gap-8">
              {report.metrics.map((m) => (
                <MetricRing key={m.label} label={m.label} score={m.score} max={m.max} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Strengths + Weaknesses */}
        <motion.div variants={fadeUp} className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-moss/20 bg-moss/5 p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-moss">Top strengths</p>
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-paper-dim">
                  <span className="text-moss shrink-0">✓</span>{s}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-crimson/20 bg-crimson/5 p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-crimson">Areas to improve</p>
            <ul className="space-y-2">
              {report.weaknesses.map((w, i) => (
                <li key={i} className="flex gap-2 text-sm text-paper-dim">
                  <span className="text-crimson shrink-0">△</span>{w}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Per-question */}
        {report.perQuestion.length > 0 && (
          <motion.div variants={fadeUp} className="mb-8">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-paper-faint">Question breakdown</p>
            <div className="space-y-3">
              {report.perQuestion.map((qf, i) => (
                <QuestionAccordion key={qf.questionId} qf={qf} idx={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Drills */}
        <motion.div variants={fadeUp} className="mb-10">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-paper-faint">Suggested drills</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {report.drills.map((d, i) => (
              <div key={i} className="rounded-md border border-ink-700/60 bg-ink-900 p-5">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ember">{d.type}</p>
                <p className="mb-2 font-display text-sm font-semibold text-paper">{d.title}</p>
                <p className="text-xs leading-relaxed text-paper-dim">{d.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Replay stub + nav */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => toast.info('Audio replay coming soon')}
            className="flex items-center gap-2 rounded-sm border border-ink-700/60 px-4 py-2 font-mono text-xs text-paper-faint hover:border-paper-faint/30 hover:text-paper-dim transition-all duration-200"
          >
            ▶ Replay session audio
          </button>
          <button
            onClick={() => navigate('/setup')}
            className="flex items-center gap-2 rounded-sm bg-ember px-5 py-2 font-mono text-xs text-ink-950 hover:bg-ember-soft transition-all duration-200"
          >
            Practice again →
          </button>
          <button
            onClick={() => navigate('/history')}
            className="font-mono text-xs text-paper-faint hover:text-paper-dim transition-colors border-b border-transparent hover:border-paper-faint/30 pb-px"
          >
            View all sessions →
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
