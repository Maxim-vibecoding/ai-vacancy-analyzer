export type MatchCategory = 'Strong Match' | 'Potential Match' | 'Weak Match'

export type MatchScoreResult = {
  score: number
  category: MatchCategory
  explanation: string
}

const BASE_SCORE = 36
const MANAGEMENT_POINTS = 11
const DOMAIN_POINTS = 6
const JUNIOR_PENALTY = 32

type Keyword = {
  label: string
  pattern: RegExp
}

const MANAGEMENT_KEYWORDS: Keyword[] = [
  { label: 'руководитель', pattern: /руководител/iu },
  { label: 'директор', pattern: /директор/iu },
  { label: 'head', pattern: /\bhead\b/iu },
  { label: 'lead', pattern: /\blead\b/iu },
  { label: 'управление командой', pattern: /управлен[а-яё]*\s+команд/iu },
]

const DOMAIN_KEYWORDS: Keyword[] = [
  { label: 'delivery', pattern: /\bdelivery\b/iu },
  { label: 'portfolio', pattern: /\bportfolio\b/iu },
  { label: 'program', pattern: /\bprogram\b/iu },
  { label: 'product', pattern: /\bproduct\b/iu },
  { label: 'PMO', pattern: /\bpmo\b/iu },
  { label: 'agile', pattern: /\bagile\b/iu },
  { label: 'scrum', pattern: /\bscrum\b/iu },
  { label: 'kanban', pattern: /\bkanban\b/iu },
  { label: 'budget', pattern: /\bbudget\b/iu },
  { label: 'stakeholders', pattern: /\bstakeholders?\b/iu },
]

const SENIOR_OR_LEAD_ROLE =
  /senior|сеньор|ведущ|руководител|директор|\bhead\b|\blead\b|тимлид|тим-лид|team\s*lead/iu

const HIRING_JUNIOR_ROLE =
  /(?:ищем|требуется|нужен|нужна|вакансия|позиция|looking for|hiring)\s+(?:a\s+|an\s+)?(?:junior|джуниор|intern|internship|стаж[её]р)/iu

const JUNIOR_JOB_TITLE =
  /\b(?:junior|джуниор)\s+(?:developer|engineer|разработчик|специалист|analyst|менеджер)/iu

const INTERN_OR_TRAINEE = /\b(?:intern|internship)\b|стаж[её]р|стажировк/iu
const OPENING_JUNIOR_HINT = /junior|джуниор|intern|стаж[её]р/iu

function matches(text: string, pattern: RegExp): boolean {
  pattern.lastIndex = 0
  return pattern.test(text)
}

function findKeywords(text: string, keywords: readonly Keyword[]): string[] {
  return keywords.filter(({ pattern }) => matches(text, pattern)).map(({ label }) => label)
}

export function isJuniorVacancy(text: string): boolean {
  const opening = text.slice(0, 280)

  if (matches(opening, SENIOR_OR_LEAD_ROLE)) {
    return false
  }

  return (
    matches(text, HIRING_JUNIOR_ROLE) ||
    matches(text, JUNIOR_JOB_TITLE) ||
    matches(opening, INTERN_OR_TRAINEE) ||
    matches(opening, OPENING_JUNIOR_HINT)
  )
}

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function categorizeScore(score: number): MatchCategory {
  if (score >= 75) {
    return 'Strong Match'
  }
  if (score >= 50) {
    return 'Potential Match'
  }
  return 'Weak Match'
}

function buildExplanation(
  managementHits: string[],
  domainHits: string[],
  junior: boolean,
  empty: boolean,
): string {
  if (empty) {
    return 'Текст вакансии пустой — оценить соответствие нельзя.'
  }

  const parts: string[] = []

  if (managementHits.length > 0) {
    parts.push(`Управленческие маркеры повысили оценку: ${managementHits.join(', ')}.`)
  }

  if (domainHits.length > 0) {
    parts.push(`Ключевые слова delivery-контура: ${domainHits.join(', ')}.`)
  }

  if (junior) {
    parts.push('Вакансия выглядит как junior / intern / стажёр, поэтому оценка снижена.')
  }

  if (parts.length === 0) {
    parts.push('Явных управленческих и delivery-маркеров мало, поэтому оценка ближе к базовой.')
  }

  return parts.join(' ')
}

export function calculateMatchScore(rawText: string): MatchScoreResult {
  const text = rawText.trim()

  if (!text) {
    return {
      score: 0,
      category: 'Weak Match',
      explanation: buildExplanation([], [], false, true),
    }
  }

  const managementHits = findKeywords(text, MANAGEMENT_KEYWORDS)
  const domainHits = findKeywords(text, DOMAIN_KEYWORDS)
  const junior = isJuniorVacancy(text)

  const rawScore =
    BASE_SCORE +
    managementHits.length * MANAGEMENT_POINTS +
    domainHits.length * DOMAIN_POINTS -
    (junior ? JUNIOR_PENALTY : 0)

  const score = clampScore(rawScore)

  return {
    score,
    category: categorizeScore(score),
    explanation: buildExplanation(managementHits, domainHits, junior, false),
  }
}
