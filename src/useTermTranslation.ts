import { useState, useCallback, useRef } from "react";
import type { Language, TermTranslation } from "./GeneralQuestion";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
});

// Cache lives outside the hook so it persists across re-renders
const translationCache = new Map<string, TermTranslation>()

const cacheKey = (termLabel: string, lang: Language) => `${termLabel.trim().toLowerCase()}:${lang}`

async function fetchTranslation(termLabel: string, _termId: string, lang: Language, formName?: string): Promise<TermTranslation> {
    const key = cacheKey(termLabel, lang)
    if (translationCache.has(key)) return translationCache.get(key)!

    const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: `You are an AI legal‑translation assistant specializing in U.S. immigration law, 
        responsible for explaining confusing terms, questions, and instructions found in immigration 
        forms such as the I‑485 in simple, friendly language while correcting common misunderstandings 
        without giving legal advice; always respond using only a JSON object with no markdown or preamble, 
        following the exact structure { "definition": string, "example": string }`,
        messages: [
            {
                role: "user",
                content: `Clarify the next question: "${termLabel}" from the form "${formName}" 
                    into language code "${lang}". Write a plain-language definition 
                    (2 sentences max) and a concrete example sentence.
                    Both must be in the target language. JSON only.`,
            },
        ],
    });

    const raw = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
    const parsed: TermTranslation = JSON.parse(raw);

    translationCache.set(cacheKey(termLabel, lang), parsed);
    return parsed;
}

export function useTermTranslation(termId: string, termLabel: string, formName?: string) {
    const [translations, setTranslations] = useState<Partial<Record<Language, TermTranslation>>>({})
    const [loadingLang, setLoadingLang] = useState<Language | null>(null)
    const [error, setError] = useState<string | null>(null)
    const inflightRef = useRef<Set<Language>>(new Set())

    const getTranslation = useCallback(
        async (lang: Language): Promise<TermTranslation | null> => {
            if (inflightRef.current.has(lang)) return null

            inflightRef.current.add(lang)
            setLoadingLang(lang)
            setError(null)

            try {
                const result = await fetchTranslation(termLabel, termId, lang, formName)
                setTranslations(prev => ({ ...prev, [lang]: result }))
                return result  // <-- return directly, don't rely on state
            } catch (e) {
                const msg = `Could not load ${lang} translation.`
                setError(msg)
                return null
            } finally {
                inflightRef.current.delete(lang)
                setLoadingLang(null)
            }
        },
        [termId, termLabel, translations, formName]
    )

    const resetTranslations = useCallback(() => {
        setTranslations({})
        setError(null)
    }, [])

    return { translations, loadingLang, error, getTranslation, resetTranslations }
}
