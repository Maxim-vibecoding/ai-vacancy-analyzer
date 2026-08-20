import { describe, expect, it } from 'vitest'
import { calculateMatchScore, categorizeScore, isJuniorVacancy } from './matchScore'

describe('calculateMatchScore', () => {
  it('gives Strong Match when management and delivery keywords stack up', () => {
    const result = calculateMatchScore(`
      Ищем руководителя направления.
      Team lead в delivery-команде.
      Product, agile, scrum.
    `)

    expect(result.score).toBe(82)
    expect(result.category).toBe('Strong Match')
    expect(result.explanation).toMatch(/руководитель/i)
    expect(result.explanation).toMatch(/agile/i)
  })

  it('gives Potential Match for delivery keywords without a management role', () => {
    const result = calculateMatchScore(`
      Ищем специалиста в продуктовую команду.
      Нужен опыт с agile, scrum, kanban и stakeholders.
    `)

    expect(result.score).toBe(60)
    expect(result.category).toBe('Potential Match')
    expect(result.explanation).toMatch(/delivery-контура/i)
    expect(result.explanation).not.toMatch(/снижена/i)
  })

  it('gives Weak Match and lowers the score for an explicit junior / intern vacancy', () => {
    const result = calculateMatchScore(`
      Ищем junior разработчика на стажировку.
      Intern, стажёр, без опыта управления.
    `)

    expect(result.score).toBe(4)
    expect(result.category).toBe('Weak Match')
    expect(result.explanation).toMatch(/junior \/ intern \/ стажёр/i)
  })

  it('clamps the score between 0 and 100', () => {
    const empty = calculateMatchScore('   ')
    const saturated = calculateMatchScore(`
      Руководитель, директор, head, lead, управление командой.
      Delivery, portfolio, program, product, PMO, agile, scrum, kanban, budget, stakeholders.
    `)

    expect(empty.score).toBe(0)
    expect(empty.category).toBe('Weak Match')
    expect(saturated.score).toBe(100)
    expect(saturated.category).toBe('Strong Match')
  })

  it('recognizes Head and HEAD as the same management signal', () => {
    const title = calculateMatchScore('Head of Engineering')
    const upper = calculateMatchScore('HEAD of Engineering')

    expect(title.explanation).toMatch(/\bhead\b/i)
    expect(upper.explanation).toMatch(/\bhead\b/i)
    expect(title.score).toBe(upper.score)
    expect(title.score).toBe(47)
  })

  it('recognizes Delivery and DELIVERY as the same domain signal', () => {
    const title = calculateMatchScore('Delivery manager')
    const upper = calculateMatchScore('DELIVERY manager')

    expect(title.explanation).toMatch(/delivery/i)
    expect(upper.explanation).toMatch(/delivery/i)
    expect(title.score).toBe(upper.score)
    expect(title.score).toBe(42)
  })

  it('recognizes PMO and pmo as the same domain signal', () => {
    const upper = calculateMatchScore('Need PMO experience')
    const lower = calculateMatchScore('Need pmo experience')

    expect(upper.explanation).toMatch(/\bPMO\b/)
    expect(lower.explanation).toMatch(/\bPMO\b/)
    expect(upper.score).toBe(lower.score)
    expect(upper.score).toBe(42)
  })

  it('recognizes Russian management keywords regardless of case', () => {
    const mixed = calculateMatchScore('Руководитель направления')
    const upper = calculateMatchScore('РУКОВОДИТЕЛЬ НАПРАВЛЕНИЯ')

    expect(mixed.explanation).toMatch(/руководитель/i)
    expect(upper.explanation).toMatch(/руководитель/i)
    expect(mixed.score).toBe(upper.score)
  })
})

describe('isJuniorVacancy', () => {
  it('is true for an explicit junior / intern / стажёр role', () => {
    expect(
      isJuniorVacancy(`
        Ищем junior разработчика на стажировку.
        Intern, стажёр, без опыта управления.
      `),
    ).toBe(true)
  })

  it('does not treat a senior/lead vacancy as junior just because it mentions junior developers', () => {
    const vacancy = `
      Мы ищем Senior Frontend-разработчика / Team lead.
      Обязанности:
      - Менторить junior-разработчиков и junior разработчиков
      - Looking for junior talent в команду
    `

    expect(isJuniorVacancy(vacancy)).toBe(false)

    const result = calculateMatchScore(vacancy)
    expect(result.explanation).not.toMatch(/снижена/i)
    expect(result.explanation).toMatch(/lead/i)
  })
})

describe('categorizeScore', () => {
  it('uses the 75 / 50 thresholds', () => {
    expect(categorizeScore(75)).toBe('Strong Match')
    expect(categorizeScore(74)).toBe('Potential Match')
    expect(categorizeScore(50)).toBe('Potential Match')
    expect(categorizeScore(49)).toBe('Weak Match')
  })
})
