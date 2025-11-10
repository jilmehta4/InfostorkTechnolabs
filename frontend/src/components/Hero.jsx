import React from 'react'

export default function Hero({ onCommence }) {
  return (
    <>
      <div className="header">
        <div className="logo">✨ AI Wisdom</div>
      </div>

      <section className="hero">
        <img 
          className="hero-bg" 
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80" 
          alt="Serene background"
        />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Discover the wisdom of artificial intelligence,<br/>
            flowing like consciousness through digital rivers
          </h1>
          <p className="hero-description">
            An AI companion is an element through which knowledge and understanding flows, 
            just like the universal consciousness. We welcome you to immerse yourself in 
            intelligent conversations and join the ever-growing community exploring the 
            future of human-AI interaction.
          </p>
          <button className="cta-button" onClick={onCommence}>
            COMMENCE <span className="arrow">→</span>
          </button>
        </div>
      </section>
    </>
  )
}