export type InterviewMode = 'technical' | 'behavioral' | 'mixed'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type InterviewerPersona = 'friendly' | 'neutral' | 'intense' | 'skeptical'
export type SpeakerRole = 'interviewer' | 'user'
export type Language = 'python' | 'javascript' | 'java' | 'cpp' | 'go'

export interface TranscriptSegment {
  id: string
  speaker: SpeakerRole
  text: string
  timestamp: number
  isHighlighted?: boolean
  highlightReason?: string
}

export interface TestCase {
  id: string
  input: string
  expected: string
  actual?: string
  passed?: boolean
}

export interface CodingProblem {
  id: string
  title: string
  difficulty: Difficulty
  description: string
  examples: { input: string; output: string; explanation?: string }[]
  constraints: string[]
  starterCode: Record<Language, string>
  testCases: TestCase[]
  timeComplexity?: string
  spaceComplexity?: string
}

export interface BehavioralQuestion {
  id: string
  text: string
  followUps: string[]
  theme: string
}

export interface InterviewerPersonaConfig {
  id: InterviewerPersona
  name: string
  description: string
  traits: string[]
  sampleIntro: string
}

export interface Company {
  id: string
  name: string
  behavioralThemes: string[]
  technicalFocus: string[]
  styleSignals: string[]
}

export interface MetricScore {
  label: string
  score: number
  max: number
  evidence?: string
}

export interface QuestionFeedback {
  questionId: string
  questionText: string
  score: number
  evidenceSpans: { text: string; context: string; timestamp: number }[]
  strengths: string[]
  improvements: string[]
  betterAnswer?: string
}

export interface FeedbackReport {
  id: string
  sessionId: string
  overallScore: number
  metrics: MetricScore[]
  perQuestion: QuestionFeedback[]
  strengths: string[]
  weaknesses: string[]
  drills: { title: string; description: string; type: string }[]
  generatedAt: string
}

export interface InterviewSession {
  id: string
  mode: InterviewMode
  company?: string
  role: string
  difficulty: Difficulty
  durationMinutes: number
  persona: InterviewerPersona
  startedAt: string
  endedAt?: string
  transcript: TranscriptSegment[]
  problemId?: string
  feedbackId?: string
  overallScore?: number
}
