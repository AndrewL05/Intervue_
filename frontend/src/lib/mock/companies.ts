import type { Company } from '../types'

export const companies: Company[] = [
  { id: 'google', name: 'Google', behavioralThemes: ['Impact at scale', 'Ambiguity handling', 'Ownership'], technicalFocus: ['Algorithms', 'System design', 'Data structures'], styleSignals: ['Deep follow-ups', 'Time complexity obsessed'] },
  { id: 'meta', name: 'Meta', behavioralThemes: ['Move fast', 'Direct communication', 'Long-term impact'], technicalFocus: ['Coding', 'System design', 'Behavioral'], styleSignals: ['STAR responses', 'Concrete metrics'] },
  { id: 'amazon', name: 'Amazon', behavioralThemes: ['Leadership Principles', 'Ownership', 'Customer obsession'], technicalFocus: ['Coding', 'LP stories', 'System design'], styleSignals: ['Heavy LP focus', 'Specific examples required'] },
  { id: 'apple', name: 'Apple', behavioralThemes: ['Craftsmanship', 'Collaboration', 'Attention to detail'], technicalFocus: ['Algorithms', 'Low-level systems', 'APIs'], styleSignals: ['Polish over speed', 'Code quality'] },
  { id: 'microsoft', name: 'Microsoft', behavioralThemes: ['Growth mindset', 'Collaboration', 'Impact'], technicalFocus: ['Coding', 'OOP design', 'Behavioral'], styleSignals: ['Friendly tone', 'Clear communication'] },
  { id: 'stripe', name: 'Stripe', behavioralThemes: ['User empathy', 'High craft', 'Pragmatism'], technicalFocus: ['System design', 'API design', 'Distributed systems'], styleSignals: ['Written exercise', 'Documentation quality'] },
  { id: 'airbnb', name: 'Airbnb', behavioralThemes: ['Belonging', 'Creativity', 'Community impact'], technicalFocus: ['Frontend', 'Full-stack', 'Performance'], styleSignals: ['Culture fit focus', 'Design sensibility'] },
  { id: 'netflix', name: 'Netflix', behavioralThemes: ['Context not control', 'Candor', 'Innovation'], technicalFocus: ['Distributed systems', 'Streaming', 'Algorithms'], styleSignals: ['Senior expectations', 'Independence'] },
  { id: 'jane-street', name: 'Jane Street', behavioralThemes: ['Intellectual curiosity', 'Precision', 'Reasoning'], technicalFocus: ['Algorithms', 'Probability', 'Functional programming'], styleSignals: ['Whiteboardy', 'Maths under pressure'] },
  { id: 'none', name: 'General / No preference', behavioralThemes: ['Core SWE competencies'], technicalFocus: ['Algorithms', 'Data structures', 'System design'], styleSignals: ['Balanced format'] },
]
