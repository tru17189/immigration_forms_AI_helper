import './document.css'
import { GeneralQuestion } from './GeneralQuestion'
import type { Language } from './GeneralQuestion'
import { useState } from 'react'

export default function Main() {
    const [lang, setLang] = useState<Language>('en')
    const [translation, setTranslation] = useState<{ definition: string; example: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const panelVisible = loading || !!error || !!translation

    return (
        <div className="page-wrapper">
            <title>Document simplifier</title>

            <div className="app-layout">
                <div className="form-section">
                    <p className="section-title">
                        Sometimes immigration forms have confusing questions;
                        this AI tool clarifies common misunderstandings in your own language.
                        Fill them out safely and more confidently.
                    </p>
                    <GeneralQuestion
                        activeLang={lang}
                        onLangChange={setLang}
                        onTranslationReady={setTranslation}
                        onLoadingChange={setLoading}
                        onError={setError}
                    />
                </div>

                <div className={`result-panel ${panelVisible ? 'result-panel--visible' : ''}`}>
                    <div className="result-panel__header">
                        <span className="result-panel__label">Translation</span>
                        <div className="lang-pills">
                            {(['en', 'es', 'pt'] as Language[]).map(l => (
                                <span
                                    key={l}
                                    className={`lang-pill ${lang === l ? 'active' : ''}`}
                                    onClick={() => setLang(l)}
                                    role="button"
                                >
                                    {l.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>

                    <hr className="popover-divider" />

                    {loading && (
                        <div className="result-panel__loading">
                            <span className="result-panel__spinner" />
                            <span>Translating…</span>
                        </div>
                    )}

                    {!loading && error && (
                        <p className="result-panel__error">{error}</p>
                    )}

                    {!loading && !error && translation && (
                        <>
                            <p className="result-panel__definition">{translation.definition}</p>
                            <div className="popover-example">
                                <span className="example-label">Example</span>
                                <span className="example-text">{translation.example}</span>
                            </div>
                        </>
                    )}

                    {!loading && !error && !translation && (
                        <p className="result-panel__placeholder">
                            Your translation will appear here once you submit a question.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
