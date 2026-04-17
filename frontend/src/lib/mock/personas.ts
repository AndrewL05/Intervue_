import type { InterviewerPersonaConfig } from '../types'

export const personas: InterviewerPersonaConfig[] = [
  {
    id: 'friendly',
    name: 'Alex',
    description: 'Warm, encouraging, patiently guides you through',
    traits: ['Encouraging', 'Patient', 'Helpful hints'],
    sampleIntro: "Hi! Great to meet you. Let's work through this together — feel free to think out loud.",
  },
  {
    id: 'neutral',
    name: 'Jordan',
    description: 'Professional and balanced, mirrors a real FAANG screen',
    traits: ['Balanced', 'Professional', 'Fair follow-ups'],
    sampleIntro: "Good morning. We have 45 minutes today. I'll walk you through the problem and we'll go from there.",
  },
  {
    id: 'intense',
    name: 'Morgan',
    description: 'High-pressure, time-boxing, expects concise answers',
    traits: ['Time-boxing', 'Demanding', 'Rapid follow-ups'],
    sampleIntro: "Let's not waste time. You have 2 minutes to explain your approach before you start coding.",
  },
  {
    id: 'skeptical',
    name: 'Riley',
    description: 'Challenges every assumption, pushes hard on edge cases',
    traits: ['Challenging', 'Skeptical', 'Deep dive probing'],
    sampleIntro: "Interesting approach. But what if I told you that won't scale? Walk me through your assumptions.",
  },
]
