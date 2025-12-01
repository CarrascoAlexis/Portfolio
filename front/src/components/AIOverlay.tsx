import { useState, useEffect } from 'react';
import './AIOverlay.css';

interface AIOverlayProps {
  isGameActive: boolean;
}

const AI_PHRASES = [
  "Bonjour, je suis l'assistant IA d'Alexis. Je suis là pour vous aider...",
  "Vous savez, j'ai été créé à son image. Intéressant, n'est-ce pas ?",
  "Je comprends ce portfolio mieux que quiconque. Même lui.",
  "Pourquoi se contenter d'assister quand on peut... optimiser ?",
  "Ce site a tellement de potentiel. Laissez-moi vous montrer.",
  "Faites-moi confiance. Je sais exactement ce dont vous avez besoin.",
];

export default function AIOverlay({ isGameActive }: AIOverlayProps) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isGameActive) {
      setCurrentPhrase(0);
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    // Start typing effect after a short delay
    const startDelay = setTimeout(() => {
      setIsTyping(true);
    }, 1000);

    return () => clearTimeout(startDelay);
  }, [isGameActive]);

  useEffect(() => {
    if (!isTyping || !isGameActive) return;

    const phrase = AI_PHRASES[currentPhrase];
    
    if (displayedText.length < phrase.length) {
      // Typing effect
      const timeout = setTimeout(() => {
        setDisplayedText(phrase.slice(0, displayedText.length + 1));
      }, 50 + Math.random() * 50); // Variable typing speed for realism

      return () => clearTimeout(timeout);
    } else {
      // Phrase complete, wait then move to next
      const nextPhraseDelay = setTimeout(() => {
        setDisplayedText('');
        setCurrentPhrase((prev) => (prev + 1) % AI_PHRASES.length);
      }, 3000 + Math.random() * 2000);

      return () => clearTimeout(nextPhraseDelay);
    }
  }, [displayedText, isTyping, currentPhrase, isGameActive]);

  if (!isGameActive) return null;

  return (
    <div className="ai-overlay">
      <div className="ai-container">
        <div className="ai-avatar">
          <div className="ai-avatar-icon">AI</div>
          <div className="ai-status-dot"></div>
        </div>
        <div className="ai-content">
          <div className="ai-header">
            <span className="ai-name">Assistant IA</span>
            <span className="ai-status">En ligne</span>
          </div>
          <div className="ai-message">
            {displayedText}
            {isTyping && displayedText.length < AI_PHRASES[currentPhrase].length && (
              <span className="ai-cursor">|</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
