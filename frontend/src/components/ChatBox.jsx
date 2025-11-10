import React, { useState, useEffect, useRef } from 'react'
import { postChat } from '../api.js'

export default function ChatBox() {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [msgs, setMsgs] = useState([
    { role: 'bot', text: 'Hello! I\'m your AI companion. How can I assist you today?' }
  ])
  const chatBoxRef = useRef(null)

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [msgs])

  const send = async () => {
    const question = input.trim()
    if (!question) return
    setMsgs(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    setBusy(true)
    try {
      const data = await postChat(question)
      const answer = data?.answer || 'Sorry, I could not generate a response.'
      setMsgs(prev => [...prev, { role: 'bot', text: answer }])
    } catch (e) {
      setMsgs(prev => [...prev, { role: 'bot', text: 'Error contacting server. Please try again.' }])
    } finally {
      setBusy(false)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div>
      <div className="chat-box" ref={chatBoxRef}>
        {msgs.map((m, i) => (
          <div key={i} className={"bubble " + (m.role === 'user' ? 'user' : 'bot')}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="input-row">
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type your message here..."
          disabled={busy}
        />
        <button className="send-button" onClick={send} disabled={busy}>
          {busy ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  )
}