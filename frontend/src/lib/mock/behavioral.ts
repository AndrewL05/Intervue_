import type { BehavioralQuestion } from '../types'

export const behavioralQuestions: BehavioralQuestion[] = [
  {
    id: 'q1',
    text: 'Tell me about a time you had to deliver a project under significant time pressure. How did you prioritize, and what would you do differently?',
    followUps: [
      'What was the hardest trade-off you made?',
      'How did you communicate scope changes to stakeholders?',
      'Looking back, what would you do differently?',
    ],
    theme: 'ownership',
  },
  {
    id: 'q2',
    text: 'Describe a situation where you disagreed with a technical decision made by your team. How did you handle it?',
    followUps: [
      'Did you ultimately change your mind or convince others?',
      'How did you maintain the relationship after the disagreement?',
      "What would you do if you couldn't reach agreement?",
    ],
    theme: 'communication',
  },
  {
    id: 'q3',
    text: "Walk me through a complex system you designed. What were the key trade-offs you made and why?",
    followUps: [
      'How did you handle scalability?',
      'What would you change about the architecture today?',
      'How did you validate your design decisions?',
    ],
    theme: 'technical-leadership',
  },
  {
    id: 'q4',
    text: 'Tell me about a time you had to learn something completely new very quickly to solve a problem.',
    followUps: [
      'How did you structure your learning?',
      'What was the outcome?',
      'How do you typically approach learning a new technology?',
    ],
    theme: 'growth',
  },
  {
    id: 'q5',
    text: 'Describe the most impactful thing you have built or contributed to. How did you measure that impact?',
    followUps: [
      'How did you prioritize this over other work?',
      "What was the hardest part?",
      'How would you scale this impact 10x?',
    ],
    theme: 'impact',
  },
]
