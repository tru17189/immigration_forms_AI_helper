import { useState } from 'react'
import { useTermTranslation } from './useTermTranslation'

export type Language = 'en' | 'es' | 'pt'

export interface TermTranslation {
    definition: string
    example: string
}

export interface GlossaryTerm {
    id: string
    label: string
    formName?: string
}

export interface GeneralQuestionType {
    term: GlossaryTerm
    inputType?: React.HTMLInputTypeAttribute
}

interface Props {
  activeLang: Language
  onLangChange: (lang: Language) => void
  onTranslationReady: (data: { definition: string; example: string } | null) => void
  onLoadingChange: (loading: boolean) => void
  onError: (error: string | null) => void
}

const LANGUAGES: Language[] = ['en', 'es', 'pt']

export function GeneralQuestion({ activeLang, onLangChange, onTranslationReady, onLoadingChange, onError }: Props) {
    const [formName, setFormName] = useState('')
    const [questionText, setQuestionText] = useState('')
    const [termId] = useState('def1')

    const { loadingLang, getTranslation, resetTranslations } = useTermTranslation(
        termId,
        questionText,
        formName
    )

    const handleSubmit = async () => {
        if (!questionText.trim()) return
        resetTranslations()
        onLoadingChange(true)
        onError(null)
        onTranslationReady(null)
        const result = await getTranslation(activeLang)
        onLoadingChange(false)
        if (result) {
            onTranslationReady(result)
        } else {
            onError(`Could not load ${activeLang} translation.`)
        }
    }

    const handleLangSwitch = async (lang: Language) => {
        onLangChange(lang)
        onLoadingChange(true)
        onError(null)
        const result = await getTranslation(lang)
        onLoadingChange(false)
        if (result) {
            onTranslationReady(result)
        } else {
            onError(`Could not load ${lang} translation.`)
        }
    }

    return (
        <div className="field-group">
            <input
                className="field-input"
                id="formName-input"
                placeholder="Name of the form you are filling out"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={{ marginBottom: '1rem' }}
            />

            <input
                className="field-input"
                id="question-input"
                placeholder="Enter your question here..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
            />

            <div className="lang-pills" style={{ marginTop: '0.75rem' }}>
                {LANGUAGES.map(lang => (
                    <span
                        key={lang}
                        className={`lang-pill ${activeLang === lang ? 'active' : ''}`}
                        onClick={() => handleLangSwitch(lang)}
                        role="button"
                    >
                        {loadingLang === lang ? '...' : lang.toUpperCase()}
                    </span>
                ))}
            </div>

            <button
                className="translate-btn"
                onClick={handleSubmit}
                disabled={!questionText.trim()}
            >
                Translate
            </button>
        </div>
    )
}
