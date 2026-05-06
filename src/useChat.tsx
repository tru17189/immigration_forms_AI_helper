import { useCallback, useEffect, useRef, useState } from "react"
import type { Language } from "./GeneralQuestion"
import './document.css'
import { useFollowUp } from "./followUpAiMessage";

type Sender = 'me' | 'AI'; 
interface Message { 
    id: string; 
    sender: Sender;
    text: string | null; 
    timestamp: Date 
}

interface useChatProps {
    followUp: string | null
    wasMessageReceived: boolean
    onWasMessageReceived: (wasMessageReceived: boolean) => void
    activeLanguage: Language
    sendReply: ((userMessage: string, lang: Language) => Promise<string | null>) | null
}
export function UseChat({followUp, wasMessageReceived, onWasMessageReceived, 
    activeLanguage, sendReply}:useChatProps) {
    const [messages, setMessages] = useState<Message[]>([])

    const addMessageAi = (newMessage: string | null) => {
        const newMsg: Message = { 
            id: crypto.randomUUID(), 
            sender: 'AI', 
            text: newMessage, 
            timestamp: new Date(), 
        }
        setMessages(prev => [...prev, newMsg])
    }

    useEffect(() => {
        if (wasMessageReceived && followUp) {
            addMessageAi(followUp)
            onWasMessageReceived(false)
        }
    }, [wasMessageReceived, followUp])

    const sendMessage = async (activeLanguage:Language) => {
        if (!sendReply) return
        const input = (document.getElementById("sendMessageInput") as HTMLInputElement)
        const text = input.value.trim()
        if (!text) return
        const newMsg: Message = { 
            id: crypto.randomUUID(), 
            sender: 'me', 
            text: text, 
            timestamp: new Date(), 
        }
        setMessages(prev => [...prev, newMsg])
        const result = await sendReply(text, activeLanguage)
        addMessageAi(result)
        input.value = ""
    }

    return(
        <div style={{padding:"1rem 0;"}}>
            <div className="chat-panel">
                <header className="chat-header">
                    <div className="name">AI assistance</div>
                </header>
                <main className="messages-area">
                    {messages.map(msg => (
                        <div key={msg.id} className={`message ${msg.sender === 'AI' ? 'incoming' : 'outgoing'}`}>
                            <div className="msg-avatar">{msg.sender}</div>
                            <div>
                                <div className="bubble">{msg.text}</div>
                                <div className="msg-time">{msg.timestamp.toLocaleTimeString()}</div>
                            </div>
                        </div>
                    ))}
                    <footer className="input-area">
                        <div className="input-wrap">
                            <input id="sendMessageInput" type="text" 
                            placeholder="Type a message…" aria-label="Message input" />
                        </div>
                        <button className="send-btn" aria-label="Send message"
                        onClick={() => sendMessage(activeLanguage)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(activeLanguage) }}>
                            <i className="ti ti-send" style={{fontSize:"13px"}} aria-hidden="true">
                                Send
                            </i>
                        </button>
                    </footer>
                </main>
            </div>
        </div>
    )
}