import React, { useState } from 'react'
import Hero from './components/Hero.jsx'
import ChatBox from './components/ChatBox.jsx'

export default function App() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div>
      {!showChat ? (
        <Hero onCommence={() => setShowChat(true)} />
      ) : (
        <div className="chat-section">
          <div className="chat-container">
            <button className="back-button" onClick={() => setShowChat(false)}>
              ← Back to Home
            </button>
            
            <div className="chat-card">
              <h1 className="chat-title">AI Chat Interface</h1>
              <p className="chat-subtitle">Engage in meaningful conversation with our intelligent assistant</p>
              <ChatBox />
              <p className="footer-note">
                Powered by advanced AI • Your conversations are processed securely
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}