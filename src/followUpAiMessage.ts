import { useState, useCallback, useRef } from "react";
import type { Language } from "./GeneralQuestion";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    dangerouslyAllowBrowser: true,
});

type Role = "user" | "assistant";

interface ChatEntry {
    role: Role;
    content: string;
}

const SYSTEM_PROMPT = `You are an AI agent that answers questions related to U.S. immigration laws.
You will receive a definition and example that were provided to help the user understand a question
from an immigration form. Your job is to ask the user if they have more questions and then answer
any follow-ups clearly and concisely. This is a chat conversation — keep answers short, friendly,
and ideal for a chat bubble. Do NOT give legal advice. Respond in plain text using markdown 
(your answer will be inside a div element).`;

async function fetchFollowup(translation:string, lang:Language, question:string,
    history: ChatEntry[], formName?:string
): Promise<string> {
    const messages = history.length ? history.map(({ role, content }) => ({ role, content }))
    : [
        {
            role: "user" as const,
            content: `The definition and example were: ${translation}
                    About the question: "${question}" from the form: "${formName ?? "unknown"}".
                    Language: "${lang}". Ask the user if they have more questions about this. 
                    Respond in the same language as the definition.`,
        },
    ];

    const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages,
    });
    return msg.content[0].type === "text" ? msg.content[0].text.trim() : ""
}

export function useFollowUp(question:string, formName?:string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const historyRef = useRef<ChatEntry[]>([]);

    const getFollowUp = useCallback(
        async (translation:string, lang:Language): Promise<string|null> => {
            setLoading(true);
            setError(null);
            historyRef.current = [];

            try {
                const reply = await fetchFollowup(translation, lang, question, [], formName);
                historyRef.current = [
                    {role: "user", content: `The definition and example were: ${translation}
                    About the question: "${question}" from the form: "${formName ?? "unknown"}".
                    Language: "${lang}". Ask the user if they have more questions about this.`,},
                    {role: "assistant", content: reply},
                ];
                return reply;
            } catch {
                setError("Could not generate follow-up.")
                return null;
            } finally {
                setLoading(false);
            }
        }, [question, formName]
    );

    const sendReply = useCallback(
        async (userMessage:string, lang: Language): Promise<string | null> => {
            setLoading(true);
            setError(null);
            historyRef.current.push({ role: "user", content: userMessage });
            try {
                const reply = await fetchFollowup("", lang, question, historyRef.current, formName);
                historyRef.current.push({ role: "assistant", content: reply });
                return reply;
            }catch {
                historyRef.current.pop(); // rollback failed user msg
                setError("Could not send reply.");
                return null;
            } finally {
                setLoading(false);
            }
        }, [question, formName]
    ); 

    const resetChat = useCallback(() => {
        historyRef.current = [];
        setError(null);
    }, []);

    return { loading, error, getFollowUp, sendReply, resetChat };
}