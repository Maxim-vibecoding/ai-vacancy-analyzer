export type AnalysisResult = {
  requirements: string[]
  technologies: string[]
  management: string[]
  experience: string[]
}

const TECHNOLOGIES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Kotlin',
  'Go',
  'Golang',
  'C#',
  'C++',
  'PHP',
  'Ruby',
  'Swift',
  'Rust',
  'Scala',
  'React',
  'Next.js',
  'Vue',
  'Angular',
  'Svelte',
  'Node.js',
  'Express',
  'NestJS',
  'Django',
  'Flask',
  'FastAPI',
  'Spring',
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Kafka',
  'RabbitMQ',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Git',
  'CI/CD',
  'GraphQL',
  'REST',
  'Linux',
  'Terraform',
  'Webpack',
  'Vite',
]

const MANAGEMENT_KEYWORDS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /управлен\w*|менеджмент|management|lead(ership)?|руководитель/i, label: 'Управление людьми и процессами' },
  { pattern: /команд\w+|team\s*lead|тимлид|тим-лид/i, label: 'Работа с командой / тимлидерство' },
  { pattern: /ментор\w*|наставн\w*|mentor(ing|ship)?/i, label: 'Менторство и развитие сотрудников' },
  { pattern: /планирован\w*|roadmap|приоритет\w*|планирован/i, label: 'Планирование и приоритизация' },
  { pattern: /делегир\w*|координац\w*|facilitat/i, label: 'Координация и делегирование' },
  { pattern: /one[\s-]?on[\s-]?one|1[\s-]?1|обратн\w*\s+связ|feedback/i, label: 'Обратная связь и 1:1' },
  { pattern: /найм|hiring|собеседован|interview/i, label: 'Найм и проведение собеседований' },
  { pattern: /okr|kpi|метрик\w*|performance/i, label: 'Работа с метриками и результативностью' },
]

const REQUIREMENT_HINTS =
  /(?:обязанност|требован|ожидаем|нужен|нужна|нужно|must|required|responsibilit|experience with|опыт работ)/i

function uniquePreserveOrder(items: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of items) {
    const key = item.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }
  return result
}

function extractTechnologies(text: string): string[] {
  const found: string[] = []
  for (const tech of TECHNOLOGIES) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(?:^|[^\\w.+#])${escaped}(?:$|[^\\w.+#])`, 'i')
    if (pattern.test(text)) {
      found.push(tech)
    }
  }
  return found
}

function extractManagement(text: string): string[] {
  return MANAGEMENT_KEYWORDS.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label)
}

function extractExperience(text: string): string[] {
  const findings: string[] = []
  const yearPatterns = [
    /(\d+)\+?\s*(?:год(?:а|ов)?|лет|years?|yrs?)/gi,
    /опыт(?:ом)?\s+(?:работы\s+)?(?:от\s+)?(\d+)\s*(?:год(?:а|ов)?|лет)/gi,
    /(\d+)\s*[-–—]\s*(\d+)\s*(?:год(?:а|ов)?|лет|years?)/gi,
  ]

  for (const pattern of yearPatterns) {
    for (const match of text.matchAll(pattern)) {
      findings.push(match[0].replace(/\s+/g, ' ').trim())
    }
  }

  if (/senior|сеньор|ведущ/i.test(text)) {
    findings.push('Уровень: Senior / ведущий специалист')
  } else if (/middle|мидл|миддл/i.test(text)) {
    findings.push('Уровень: Middle')
  } else if (/junior|джун/i.test(text)) {
    findings.push('Уровень: Junior')
  }

  if (/без опыта|no experience|junior friendly/i.test(text)) {
    findings.push('Возможен вход без опыта или с минимальным стажем')
  }

  return uniquePreserveOrder(findings)
}

function extractRequirements(text: string): string[] {
  const lines = text
    .split(/\r?\n|[•·▪▫]/)
    .map((line) => line.replace(/^[\s\-*–—\d.)]+/, '').trim())
    .filter((line) => line.length > 12)

  const fromLines = lines.filter((line) => REQUIREMENT_HINTS.test(line) || line.length < 140)

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && REQUIREMENT_HINTS.test(s))

  const combined = uniquePreserveOrder([...fromLines, ...sentences])
    .map((item) => (item.length > 160 ? `${item.slice(0, 157)}…` : item))
    .slice(0, 8)

  return combined
}

export function analyzeVacancy(rawText: string): AnalysisResult {
  const text = rawText.trim()

  if (!text) {
    return {
      requirements: [],
      technologies: [],
      management: [],
      experience: [],
    }
  }

  const requirements = extractRequirements(text)
  const technologies = extractTechnologies(text)
  const management = extractManagement(text)
  const experience = extractExperience(text)

  return {
    requirements:
      requirements.length > 0
        ? requirements
        : ['Явных ключевых требований не найдено — уточните формулировки в тексте вакансии.'],
    technologies:
      technologies.length > 0
        ? technologies
        : ['Технологии не распознаны. Добавьте названия стека в текст вакансии.'],
    management:
      management.length > 0
        ? management
        : ['Управленческие компетенции явно не указаны.'],
    experience:
      experience.length > 0
        ? experience
        : ['Требования к опыту не обнаружены в явном виде.'],
  }
}
