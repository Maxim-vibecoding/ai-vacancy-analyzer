import { useState, type FormEvent } from 'react'
import { analyzeVacancy, type AnalysisResult } from './analyzer'
import './App.css'

const SAMPLE_VACANCY = `Мы ищем Senior Frontend-разработчика в продуктовую команду.

Обязанности:
- Разрабатывать интерфейсы на React и TypeScript
- Участвовать в планировании и приоритизации задач
- Менторить junior-разработчиков и проводить code review
- Координировать работу с дизайнерами и backend

Требования:
- Опыт работы от 4 лет
- Знание JavaScript, TypeScript, React, Next.js
- Опыт с REST, GraphQL, Docker
- Понимание CI/CD и Git
- Готовность проводить собеседования и давать обратную связь

Будет плюсом опыт тимлидерства и работа с метриками команды.`

type ResultSection = {
  title: string
  items: string[]
  accent: string
}

function ResultBlock({ title, items, accent }: ResultSection) {
  return (
    <section className={`result-block result-block--${accent}`} aria-labelledby={`heading-${accent}`}>
      <h2 id={`heading-${accent}`}>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  function handleAnalyze(event: FormEvent) {
    event.preventDefault()
    const analysis = analyzeVacancy(text)
    setResult(analysis)
    setHasAnalyzed(true)
  }

  function handleSample() {
    setText(SAMPLE_VACANCY)
    setResult(null)
    setHasAnalyzed(false)
  }

  return (
    <div className="page">
      <div className="page__glow" aria-hidden="true" />
      <header className="hero">
        <p className="hero__brand">AI Vacancy Analyzer</p>
        <h1 className="hero__title">Быстрый анализ вакансии</h1>
        <p className="hero__lead">
          Вставьте текст вакансии — демонстрационный анализатор выделит требования, технологии,
          управленческие компетенции и опыт.
        </p>
      </header>

      <main className="workspace">
        <form className="analyzer-form" onSubmit={handleAnalyze}>
          <label className="analyzer-form__label" htmlFor="vacancy-text">
            Текст вакансии
          </label>
          <textarea
            id="vacancy-text"
            className="analyzer-form__input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Вставьте сюда описание вакансии…"
            rows={14}
            spellCheck={false}
          />
          <div className="analyzer-form__actions">
            <button type="submit" className="btn btn--primary" disabled={!text.trim()}>
              Проанализировать
            </button>
            <button type="button" className="btn btn--ghost" onClick={handleSample}>
              Подставить пример
            </button>
          </div>
        </form>

        {hasAnalyzed && result && (
          <div className="results" aria-live="polite">
            <ResultBlock title="Ключевые требования" items={result.requirements} accent="requirements" />
            <ResultBlock title="Технологии" items={result.technologies} accent="technologies" />
            <ResultBlock
              title="Управленческие компетенции"
              items={result.management}
              accent="management"
            />
            <ResultBlock title="Требуемый опыт" items={result.experience} accent="experience" />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Демо-логика без внешних AI API — подходит для обучения и прототипирования.</p>
      </footer>
    </div>
  )
}

export default App
