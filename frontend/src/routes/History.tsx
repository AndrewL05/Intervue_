import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { mockSessions } from '@/lib/mock/sessions'
import type { InterviewMode } from '@/lib/types'

type Filter = 'all' | InterviewMode

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}

function ScorePill({ score }: { score?: number }) {
  if (!score) return <span className="font-mono text-xs text-paper-faint">—</span>
  const color = score >= 75 ? 'text-moss bg-moss/10 border-moss/20' : score >= 55 ? 'text-ember bg-ember/10 border-ember/20' : 'text-crimson bg-crimson/10 border-crimson/20'
  return (
    <span className={cn('rounded-sm border px-2 py-0.5 font-mono text-xs font-semibold', color)}>
      {score}
    </span>
  )
}

export function History() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'all' ? mockSessions : mockSessions.filter((s) => s.mode === filter)

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-paper-faint">Your history</p>
        <h1 className="font-display text-4xl font-semibold text-paper md:text-5xl">Past Sessions</h1>
      </motion.div>

      {/* Filter chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-8 flex flex-wrap items-center gap-2"
      >
        {(['all', 'technical', 'behavioral', 'mixed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-widest transition-all duration-150',
              filter === f
                ? 'border-ember/40 bg-ember/10 text-ember'
                : 'border-ink-700/60 text-paper-faint hover:border-ink-600 hover:text-paper-dim'
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-paper-faint">{filtered.length} session{filtered.length !== 1 ? 's' : ''}</span>
      </motion.div>

      {/* Table header */}
      <div className="mb-2 grid grid-cols-[1fr_100px_80px_80px_80px_80px] gap-4 px-4">
        {['Session', 'Company', 'Mode', 'Difficulty', 'Duration', 'Score'].map((h) => (
          <p key={h} className="font-mono text-[10px] uppercase tracking-widest text-paper-faint">{h}</p>
        ))}
      </div>

      {/* Session rows */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
        {filtered.length === 0 ? (
          <motion.div variants={fadeUp} className="rounded-md border border-ink-700/60 bg-ink-900 p-8 text-center">
            <p className="font-mono text-xs text-paper-faint">No sessions yet for this filter.</p>
            <button
              onClick={() => navigate('/setup')}
              className="mt-4 font-mono text-xs text-ember hover:text-ember-soft transition-colors"
            >
              Start your first session →
            </button>
          </motion.div>
        ) : (
          filtered.map((session) => (
            <motion.button
              key={session.id}
              variants={fadeUp}
              onClick={() => session.feedbackId && navigate(`/feedback/${session.feedbackId}`)}
              className="group grid w-full grid-cols-[1fr_100px_80px_80px_80px_80px] items-center gap-4 rounded-md border border-ink-700/60 bg-ink-900 px-4 py-4 text-left transition-all duration-200 hover:border-ember/20 hover:bg-ink-800/60"
            >
              {/* Session info */}
              <div>
                <p className="text-sm font-medium text-paper group-hover:text-paper transition-colors">
                  {session.role}
                </p>
                <p className="font-mono text-xs text-paper-faint">
                  {new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·{' '}
                  {session.endedAt
                    ? new Date(session.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : 'In progress'}
                </p>
              </div>

              <p className="font-mono text-xs text-paper-dim">{session.company ?? '—'}</p>

              <span className={cn(
                'inline-block rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest',
                session.mode === 'technical' ? 'bg-ember/10 text-ember border border-ember/20' :
                session.mode === 'behavioral' ? 'bg-paper/5 text-paper-dim border border-ink-700/60' :
                'bg-moss/10 text-moss border border-moss/20'
              )}>
                {session.mode}
              </span>

              <p className={cn('font-mono text-xs capitalize',
                session.difficulty === 'easy' ? 'text-moss' :
                session.difficulty === 'medium' ? 'text-ember' :
                'text-crimson'
              )}>
                {session.difficulty}
              </p>

              <p className="font-mono text-xs text-paper-faint">{session.durationMinutes}m</p>

              <ScorePill score={session.overallScore} />
            </motion.button>
          ))
        )}
      </motion.div>

      {/* Start new */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex justify-center"
      >
        <button
          onClick={() => navigate('/setup')}
          className="group flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-paper-faint transition-colors hover:text-paper border-b border-transparent hover:border-paper-faint/30 pb-px"
        >
          + Begin a new session
        </button>
      </motion.div>
    </div>
  )
}
