import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

function ProblemPanel({ className }: { className?: string }) {
  return (
    <div className={`border-r border-ink-700/40 bg-ink-950 p-5 overflow-hidden flex flex-col gap-3 ${className ?? ''}`}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-paper">Two Sum</span>
        <span className="font-mono text-[9px] text-moss border border-moss/30 bg-moss/10 px-1.5 py-0.5 rounded-sm">Easy</span>
      </div>
      <p className="font-mono text-[10px] leading-relaxed text-paper-dim">
        Given an array of integers <span className="text-ember">nums</span> and an integer <span className="text-ember">target</span>, return indices of the two numbers that add up to <span className="text-ember">target</span>.
      </p>
      <div className="border-l-2 border-ember/30 bg-ink-800/50 rounded-sm px-3 py-2">
        <p className="font-mono text-[9px] text-paper-faint mb-1.5 uppercase tracking-widest">Example</p>
        <p className="font-mono text-[10px] text-paper-dim">Input: <span className="text-paper">nums = [2,7,11,15], target = 9</span></p>
        <p className="font-mono text-[10px] text-paper-dim">Output: <span className="text-moss">[0, 1]</span></p>
      </div>
      <div className="pt-2 border-t border-ink-700/40">
        <p className="font-mono text-[9px] text-paper-faint uppercase tracking-widest mb-1.5">Constraints</p>
        <p className="font-mono text-[10px] text-paper-dim">· 2 ≤ nums.length ≤ 10⁴</p>
        <p className="font-mono text-[10px] text-paper-dim">· Each input has exactly one solution</p>
      </div>
    </div>
  )
}

type Token = { text: string; cls: string }
type CodeLine = Token[]

const kw = (t: string): Token => ({ text: t, cls: 'text-purple-400' })
const fn = (t: string): Token => ({ text: t, cls: 'text-sky-300' })
// const str = (t: string): Token => ({ text: t, cls: 'text-amber-300' })
// const num = (t: string): Token => ({ text: t, cls: 'text-orange-300' })
const cm = (t: string): Token => ({ text: t, cls: 'text-ink-500' })
const tx = (t: string): Token => ({ text: t, cls: 'text-paper/75' })
const op = (t: string): Token => ({ text: t, cls: 'text-paper-faint' })

const CODE_LINES: CodeLine[] = [
  [kw('from'), tx(' typing '), kw('import'), tx(' List')],
  [],
  [kw('class'), tx(' '), fn('Solution'), op(':')],
  [tx('    '), kw('def'), tx(' '), fn('twoSum'), op('('), tx('self, nums: List['), fn('int'), tx('], target: '), fn('int'), op(') -> List['), fn('int'), op(']'), op(':')],
  [tx('        '), cm('# hash map: value → index')],
  [tx('        '), tx('seen'), op(': dict['), fn('int'), op(', '), fn('int'), op('] = '), op('{'), op('}')],
  [],
  [tx('        '), kw('for'), tx(' i, n '), kw('in'), tx(' '), fn('enumerate'), op('('), tx('nums'), op(')')],
  [tx('            '), tx('complement'), op(' = '), tx('target'), op(' - '), tx('n')],
  [],
  [tx('            '), kw('if'), tx(' complement '), kw('in'), tx(' seen'), op(':')],
  [tx('                '), kw('return'), tx(' '), op('['), tx('seen'), op('['), tx('complement'), op(']'), op(', '), tx('i'), op(']')],
  [],
  [tx('            '), tx('seen'), op('['), tx('n'), op('] = '), tx('i')],
]

function EditorPanel() {
  return (
    <div className="bg-[#060608] flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 py-2.5 border-b border-ink-700/40 bg-ink-900/40 shrink-0 min-w-0">
        <span className="font-mono text-[10px] text-ember/65 border-b border-ember/35 px-2 pb-px shrink-0">solution.py</span>
        <span className="font-mono text-[10px] text-paper-faint/35 px-2 shrink-0 hidden sm:inline">✎ Whiteboard</span>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-[9px] text-paper-faint/50 border border-ink-700/50 rounded-sm px-1.5 py-0.5">▶ Run</span>
          <span className="font-mono text-[9px] text-ink-950 bg-ember/80 rounded-sm px-1.5 py-0.5">Submit</span>
        </div>
      </div>
      <div className="p-3 overflow-x-hidden overflow-y-hidden">
        {CODE_LINES.map((tokens, i) => (
          <div key={i} className="flex items-start gap-3 leading-5 min-w-0">
            <span className="font-mono text-[9px] text-ink-600/60 w-4 text-right shrink-0 select-none mt-px">{i + 1}</span>
            <span className="font-mono text-[10px] whitespace-pre overflow-hidden truncate">
              {tokens.length === 0 ? '\u00A0' : tokens.map((t, j) => (
                <span key={j} className={t.cls}>{t.text}</span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const CHAT: { role: 'ai' | 'user'; text: string }[] = [
  { role: 'ai',   text: "Walk me through your approach before you start coding." },
  { role: 'user', text: "I'll use a hash map — store each value's index as I iterate so I can check the complement in O(1)." },
  { role: 'ai',   text: "Good. What's the space complexity?" },
  { role: 'user', text: "O(n) worst case — one entry per element." },
  { role: 'ai',   text: "And what about duplicate values in the array?" },
]

function ChatPanel() {
  return (
    <div className="bg-ink-950 p-3 flex flex-col gap-2 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-1 shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse-ember shrink-0" />
        <span className="font-mono text-[9px] text-ember/65">George · AI Interviewer</span>
      </div>
      <div className="flex flex-col gap-2 overflow-hidden">
        {CHAT.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-sm px-2.5 py-1.5 max-w-[92%] ${
              msg.role === 'ai'
                ? 'bg-ink-800/80 border border-ink-700/50'
                : 'bg-ink-800/50 border border-ember/15'
            }`}>
              <p className={`font-mono text-[9px] leading-relaxed ${
                msg.role === 'ai' ? 'text-paper-dim' : 'text-paper/80'
              }`}>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto shrink-0 border border-ink-700/50 rounded-sm px-2.5 py-1.5 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-ember/40 shrink-0" />
        <span className="font-mono text-[9px] text-paper-faint/30">Listening…</span>
      </div>
    </div>
  )
}

export function BrowserScrollReveal() {
  // Ref sits on the browser container itself — so progress 0 = browser
  // just entering the viewport from below, not the section headline.
  const browserRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: browserRef,
    offset: ['start end', 'end start'],
  })

  // Rise into frame as browser enters (0 → 0.25)
  const browserY  = useTransform(scrollYProgress, [0, 0.25], [80, 0])
  const browserOp = useTransform(scrollYProgress, [0, 0.2],  [0, 1])

  // Tilt unfolds only after browser is fully visible (0.25 → 0.55)
  const rotateXRaw = useTransform(scrollYProgress, [0.25, 0.55], [22, 0])
  const rotateX    = useSpring(rotateXRaw, { stiffness: 60, damping: 18, mass: 0.4 })

  // Glare sweeps once mid-unfold (0.32 → 0.52)
  const glareX  = useTransform(scrollYProgress, [0.32, 0.52], ['-110%', '210%'])
  const glareOp = useTransform(scrollYProgress, [0.32, 0.42, 0.52], [0, 0.28, 0])

  // Ambient glow after landing (0.55 → 0.66)
  const glowOp = useTransform(scrollYProgress, [0.55, 0.66], [0, 1])

  // Labels staggered after browser is flat (0.45 → 0.62)
  const l1Op = useTransform(scrollYProgress, [0.45, 0.53], [0, 1])
  const l1Y  = useTransform(scrollYProgress, [0.45, 0.53], [10, 0])
  const l2Op = useTransform(scrollYProgress, [0.49, 0.57], [0, 1])
  const l2Y  = useTransform(scrollYProgress, [0.49, 0.57], [10, 0])
  const l3Op = useTransform(scrollYProgress, [0.53, 0.61], [0, 1])
  const l3Y  = useTransform(scrollYProgress, [0.53, 0.61], [10, 0])

  return (
    <section className="relative py-28">
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="text-center mb-16 px-6"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-ember mb-5">
          ▶ watch it in action
        </p>
        <h2 className="font-sans text-4xl font-extrabold text-paper md:text-5xl">
          Simulate the interview. Not just the code.
        </h2>
        <p className="mt-4 text-paper-dim text-base max-w-sm mx-auto leading-relaxed">
          Problem, code, and a live AI interviewer in one flow.
        </p>
      </motion.div>

      {/* Browser + labels */}
      <div className="relative mx-auto max-w-5xl px-4 lg:px-16">

        {/* Label — left */}
        <motion.div
          style={{ opacity: l1Op, y: l1Y }}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center gap-2"
        >
          <span className="font-mono text-[10px] text-paper border border-ember/35 bg-ember/8 rounded-sm px-2.5 py-1 whitespace-nowrap shadow-[0_0_8px_rgba(255,107,53,0.15)]">
            Problem statement
          </span>
          <div className="w-5 h-px bg-ember/30" />
        </motion.div>

        {/* Label — top center */}
        <motion.div
          style={{ opacity: l2Op, y: l2Y }}
          className="absolute left-1/2 -translate-x-1/2 -top-7 z-10 hidden lg:block"
        >
          <span className="font-mono text-[10px] text-ember/60 border border-ember/28 bg-ink-900 rounded-sm px-2.5 py-1 whitespace-nowrap">
            Monaco editor
          </span>
        </motion.div>

        {/* Label — right */}
        <motion.div
          style={{ opacity: l3Op, y: l3Y }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center gap-2"
        >
          <div className="w-5 h-px bg-ember/30" />
          <span className="font-mono text-[10px] text-paper border border-ember/35 bg-ember/8 rounded-sm px-2.5 py-1 whitespace-nowrap shadow-[0_0_8px_rgba(255,107,53,0.15)]">
            AI interviewer
          </span>
        </motion.div>

        {/* Browser — ref here so progress 0 = browser enters viewport */}
        <div ref={browserRef}>
        <motion.div
          style={{
            transformPerspective: 1200,
            rotateX,
            y: browserY,
            opacity: browserOp,
            transformOrigin: 'bottom center',
          }}
          className="w-full rounded-lg border border-ink-700/70 bg-ink-900 overflow-hidden relative shadow-card"
        >
            {/* Glare */}
            <motion.div
              aria-hidden
              style={{ x: glareX, opacity: glareOp }}
              className="absolute inset-0 z-20 pointer-events-none"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(108deg, transparent 38%, rgba(255,255,255,0.07) 50%, transparent 62%)',
                }}
              />
            </motion.div>

            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-700/50 bg-ink-800/80">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57] shrink-0" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E] shrink-0" />
              <span className="w-3 h-3 rounded-full bg-[#28C840] shrink-0" />
              <div className="flex-1 mx-3 h-6 bg-ink-900/80 rounded-sm flex items-center justify-center border border-ink-700/30">
                <span className="font-mono text-[10px] text-paper-faint/50">
                  interview.app / session · Two Sum
                </span>
              </div>
              <span className="font-mono text-[10px] text-ember/55 shrink-0">● LIVE</span>
            </div>

            {/* body: editor+chat on mobile, problem+editor+chat on desktop */}
            <div className="grid grid-cols-[1fr_130px] lg:grid-cols-[200px_1fr_200px] min-h-[240px] lg:min-h-[340px] overflow-hidden">
              <ProblemPanel className="hidden lg:block" />
              <div className="min-w-0 overflow-hidden border-r border-ink-700/40"><EditorPanel /></div>
              <ChatPanel />
            </div>
        </motion.div>
        </div>

        {/* Ambient glow */}
        <motion.div
          aria-hidden
          style={{ opacity: glowOp }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/5 pointer-events-none"
        >
          <div
            style={{
              height: '8px',
              background: 'radial-gradient(ellipse, rgba(74,222,128,0.15) 0%, transparent 70%)',
              filter: 'blur(6px)',
            }}
          />
        </motion.div>
      </div>
    </section>
  )
}
