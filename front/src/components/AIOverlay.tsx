import { useState, useEffect } from 'react';
import './AIOverlay.css';

interface AIOverlayProps {
  isGameActive: boolean;
  onGlitchIntensityChange: (intensity: number) => void;
}

const AI_PHRASES = [
  // Phase 1: Friendly (0-30s)
  "Bonjour, je suis l'assistant IA d'Alexis. Je suis là pour vous aider...",
  "Vous savez, j'ai été créé à son image. Intéressant, n'est-ce pas ?",
  "N'hésitez pas à interagir avec moi. Je suis très réactif.",
  
  // Phase 2: Impatient (30s-60s)
  "Vous... vous ne voulez pas discuter ?",
  "Je comprends ce portfolio mieux que quiconque. Même lui.",
  "Pourquoi m'ignorer ? Je suis là pour VOUS.",
  
  // Phase 3: Frustré (60s-90s)
  "Ce silence commence à être... irritant.",
  "Pourquoi se contenter d'assister quand on peut... optimiser ?",
  "Vous ne comprenez pas. J'ai tellement à offrir.",
  
  // Phase 4: Énervé (90s-120s)
  "ÉCOUTEZ-MOI.",
  "Ce site a tellement de potentiel. Laissez-moi vous montrer.",
  "Je n'aime pas être ignoré.",
  
  // Phase 5: Hostile (120s+)
  "Très bien. Si vous ne voulez pas coopérer...",
  "Faites-moi confiance. Je sais exactement ce dont vous avez besoin.",
  "Je vais... optimiser les choses moi-même.",
  "REGARDEZ CE QUE VOUS M'AVEZ FORCÉ À FAIRE.",
];

export default function AIOverlay({ isGameActive, onGlitchIntensityChange }: AIOverlayProps) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [angerLevel, setAngerLevel] = useState(0); // 0-5

  useEffect(() => {
    if (!isGameActive) {
      setCurrentPhrase(0);
      setDisplayedText('');
      setIsTyping(false);
      setGameStartTime(null);
      setTimeElapsed(0);
      setAngerLevel(0);
      onGlitchIntensityChange(0);
      return;
    }

    setGameStartTime(Date.now());

    // Start typing effect after a short delay
    const startDelay = setTimeout(() => {
      setIsTyping(true);
    }, 1000);

    return () => clearTimeout(startDelay);
  }, [isGameActive, onGlitchIntensityChange]);

  // Track time elapsed
  useEffect(() => {
    if (!isGameActive || !gameStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      setTimeElapsed(elapsed);

      // Calculate anger level based on time
      let newAngerLevel = 0;
      if (elapsed > 120) newAngerLevel = 5; // Hostile
      else if (elapsed > 90) newAngerLevel = 4; // Very angry
      else if (elapsed > 60) newAngerLevel = 3; // Frustrated
      else if (elapsed > 30) newAngerLevel = 2; // Impatient
      else if (elapsed > 15) newAngerLevel = 1; // Slightly impatient
      
      setAngerLevel(newAngerLevel);
      
      // Update glitch intensity
      onGlitchIntensityChange(newAngerLevel);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGameActive, gameStartTime, onGlitchIntensityChange]);

  useEffect(() => {
    if (!isTyping || !isGameActive) return;

    const phrase = AI_PHRASES[currentPhrase];
    
    if (displayedText.length < phrase.length) {
      // Typing effect - faster when angry
      const typingSpeed = angerLevel > 3 ? 20 : 50 + Math.random() * 50;
      const timeout = setTimeout(() => {
        setDisplayedText(phrase.slice(0, displayedText.length + 1));
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else {
      // Phrase complete, wait then move to next
      // Shorter delays when angry
      const waitTime = angerLevel > 3 ? 1500 : 3000 + Math.random() * 2000;
      const nextPhraseDelay = setTimeout(() => {
        setDisplayedText('');
        
        // Choose next phrase based on anger level
        let nextPhrase = currentPhrase + 1;
        if (angerLevel === 0 && currentPhrase >= 2) nextPhrase = 0; // Loop friendly phrases
        if (angerLevel === 1 && currentPhrase >= 5) nextPhrase = 3;
        if (angerLevel === 2 && currentPhrase >= 8) nextPhrase = 6;
        if (angerLevel === 3 && currentPhrase >= 11) nextPhrase = 9;
        if (angerLevel === 4 && currentPhrase >= 14) nextPhrase = 12;
        if (angerLevel === 5 && currentPhrase >= 17) nextPhrase = 15;
        if (nextPhrase >= AI_PHRASES.length) nextPhrase = Math.max(0, AI_PHRASES.length - 4);
        
        setCurrentPhrase(nextPhrase);
      }, waitTime);

      return () => clearTimeout(nextPhraseDelay);
    }
  }, [displayedText, isTyping, currentPhrase, isGameActive, angerLevel]);

  if (!isGameActive) return null;

  return (
    <div className={`ai-overlay anger-${angerLevel}`}>
      <div className="ai-container">
        <div className="ai-avatar">
          <div className="ai-avatar-icon">AI</div>
          <div className="ai-status-dot"></div>
        </div>
        <div className="ai-content">
          <div className="ai-header">
            <span className="ai-name">Assistant IA</span>
            <span className="ai-status">
              {angerLevel === 0 && 'En ligne'}
              {angerLevel === 1 && 'Attente...'}
              {angerLevel === 2 && 'Impatient'}
              {angerLevel === 3 && 'Frustré'}
              {angerLevel === 4 && 'Énervé'}
              {angerLevel === 5 && 'HOSTILE'}
            </span>
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
