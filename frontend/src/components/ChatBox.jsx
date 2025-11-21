import React, { useState, useEffect, useRef } from 'react'
import { postChat } from '../api.js'

export default function ChatBox() {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [language, setLanguage] = useState('en')
  const [msgs, setMsgs] = useState([
    { role: 'bot', text: 'Hello! I\'m your AI companion. How can I assist you today?' }
  ])
  const chatBoxRef = useRef(null)

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [msgs])

  useEffect(() => {
    // Update initial message when language changes
    if (language === 'hi') {
      setMsgs([{ role: 'bot', text: 'नमस्ते! मैं आपका AI साथी हूं। मैं आज आपकी कैसे सहायता कर सकता हूं?' }])
    } else {
      setMsgs([{ role: 'bot', text: 'Hello! I\'m your AI companion. How can I assist you today?' }])
    }
  }, [language])

  const send = async () => {
    const question = input.trim()
    if (!question) return
    setMsgs(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    setBusy(true)
    try {
      const data = await postChat(question, language)
      const answer = data?.answer || (language === 'hi' ? 'क्षमा करें, मैं प्रतिक्रिया उत्पन्न नहीं कर सका।' : 'Sorry, I could not generate a response.')
      setMsgs(prev => [...prev, { role: 'bot', text: answer }])
    } catch (e) {
      setMsgs(prev => [...prev, { 
        role: 'bot', 
        text: language === 'hi' 
          ? 'सर्वर से संपर्क करने में त्रुटि। कृपया पुनः प्रयास करें।' 
          : 'Error contacting server. Please try again.' 
      }])
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
      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          className={`language-button ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
          style={{
            padding: '8px 16px',
            border: '2px solid #6b46c1',
            borderRadius: '20px',
            background: language === 'en' ? '#6b46c1' : 'transparent',
            color: language === 'en' ? 'white' : '#6b46c1',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
        >
          English
        </button>
        <button
          className={`language-button ${language === 'hi' ? 'active' : ''}`}
          onClick={() => setLanguage('hi')}
          style={{
            padding: '8px 16px',
            border: '2px solid #6b46c1',
            borderRadius: '20px',
            background: language === 'hi' ? '#6b46c1' : 'transparent',
            color: language === 'hi' ? 'white' : '#6b46c1',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
        >
          हिंदी
        </button>
      </div>
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
          placeholder={language === 'hi' ? 'अपना संदेश यहाँ टाइप करें...' : 'Type your message here...'}
          disabled={busy}
        />
        <button className="send-button" onClick={send} disabled={busy}>
          {busy ? (language === 'hi' ? 'सोच रहा हूं...' : 'Thinking...') : (language === 'hi' ? 'भेजें' : 'Send')}
        </button>
      </div>
    </div>
  )
}