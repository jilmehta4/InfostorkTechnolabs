import React, { useState, useEffect, useRef } from 'react'
import { postChat } from '../api.js'

// Language options
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' }
];

// Language-specific UI text
const uiText = {
  en: {
    initialMessage: "Hello! I'm your AI companion. How can I assist you today?",
    placeholder: "Type your message here...",
    send: "Send",
    thinking: "Thinking...",
    error: "Error contacting server. Please try again.",
    noResponse: "Sorry, I could not generate a response."
  },
  hi: {
    initialMessage: "नमस्ते! मैं आपका AI साथी हूं। मैं आज आपकी कैसे सहायता कर सकता हूं?",
    placeholder: "अपना संदेश यहाँ टाइप करें...",
    send: "भेजें",
    thinking: "सोच रहा हूं...",
    error: "सर्वर से संपर्क करने में त्रुटि। कृपया पुनः प्रयास करें।",
    noResponse: "क्षमा करें, मैं प्रतिक्रिया उत्पन्न नहीं कर सका।"
  },
  gu: {
    initialMessage: "નમસ્તે! હું તમારો AI સાથી છું. હું આજે તમારી કેવી રીતે સહાય કરી શકું?",
    placeholder: "તમારો સંદેશ અહીં ટાઇપ કરો...",
    send: "મોકલો",
    thinking: "વિચારી રહ્યો છું...",
    error: "સર્વરનો સંપર્ક કરવામાં ભૂલ. કૃપા કરીને ફરી પ્રયાસ કરો.",
    noResponse: "માફ કરો, હું પ્રતિભાવ જનરેટ કરી શક્યો નથી."
  },
  mr: {
    initialMessage: "नमस्कार! मी तुमचा AI साथी आहे. मी आज तुमची कशी मदत करू शकतो?",
    placeholder: "तुमचा संदेश येथे टाइप करा...",
    send: "पाठवा",
    thinking: "विचार करत आहे...",
    error: "सर्व्हरशी संपर्क करताना त्रुटी. कृपया पुन्हा प्रयत्न करा.",
    noResponse: "क्षमस्व, मी प्रतिसाद व्युत्पन्न करू शकलो नाही."
  },
  te: {
    initialMessage: "నమస్కారం! నేను మీ AI సహచరుడిని. నేను ఈరోజు మీకు ఎలా సహాయం చేయగలను?",
    placeholder: "మీ సందేశాన్ని ఇక్కడ టైప్ చేయండి...",
    send: "పంపండి",
    thinking: "ఆలోచిస్తున్నాను...",
    error: "సర్వర్‌ను సంప్రదించడంలో లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.",
    noResponse: "క్షమించండి, నేను ప్రతిస్పందనను రూపొందించలేకపోయాను."
  }
};

export default function ChatBox() {
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [language, setLanguage] = useState('en') // English as default
  const [msgs, setMsgs] = useState([
    { role: 'bot', text: uiText.en.initialMessage }
  ])
  const chatBoxRef = useRef(null)

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [msgs])

  useEffect(() => {
    // Update initial message when language changes
    const text = uiText[language] || uiText.en;
    setMsgs([{ role: 'bot', text: text.initialMessage }])
  }, [language])

  const send = async () => {
    const question = input.trim()
    if (!question) return
    setMsgs(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    setBusy(true)
    try {
      const data = await postChat(question, language)
      const text = uiText[language] || uiText.en;
      const answer = data?.answer || text.noResponse;
      setMsgs(prev => [...prev, { role: 'bot', text: answer }])
    } catch (e) {
      const text = uiText[language] || uiText.en;
      setMsgs(prev => [...prev, { 
        role: 'bot', 
        text: text.error
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

  const text = uiText[language] || uiText.en;
  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div>
      <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
        <label style={{ fontSize: '14px', fontWeight: '600', color: '#2d3748' }}>Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: '8px 16px',
            border: '2px solid #6b46c1',
            borderRadius: '20px',
            background: 'white',
            color: '#6b46c1',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            outline: 'none',
            minWidth: '150px'
          }}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
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
          placeholder={text.placeholder}
          disabled={busy}
        />
        <button className="send-button" onClick={send} disabled={busy}>
          {busy ? text.thinking : text.send}
        </button>
      </div>
    </div>
  )
}