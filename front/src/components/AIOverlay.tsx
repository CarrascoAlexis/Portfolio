import { useState, useEffect, useRef } from 'react';
import './AIOverlay.css';

interface AIOverlayProps {
  isGameActive: boolean;
  onGlitchIntensityChange: (intensity: number) => void;
}

// Keyboard typing sounds using Web Audio API
const createKeyboardSound = (audioContext: AudioContext, angerLevel: number) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Base frequency with variation
  const baseFreq = 800 + Math.random() * 400;
  oscillator.frequency.value = baseFreq;
  
  // Different waveforms based on anger level
  if (angerLevel >= 4) {
    oscillator.type = 'sawtooth'; // Harsh sound when angry
  } else if (angerLevel >= 2) {
    oscillator.type = 'square';
  } else {
    oscillator.type = 'sine'; // Soft sound when calm
  }
  
  // Volume increases with anger
  const volume = 0.02 + (angerLevel * 0.01);
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
  
  // Add distortion for higher anger levels
  if (angerLevel >= 3 && Math.random() > 0.7) {
    const glitchOsc = audioContext.createOscillator();
    const glitchGain = audioContext.createGain();
    glitchOsc.frequency.value = baseFreq * (0.5 + Math.random());
    glitchOsc.type = 'sawtooth';
    glitchGain.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);
    glitchGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
    glitchOsc.connect(glitchGain);
    glitchGain.connect(audioContext.destination);
    glitchOsc.start();
    glitchOsc.stop(audioContext.currentTime + 0.05);
  }
};

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
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (isGameActive && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isGameActive]);

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
    timeElapsed;

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
        
        // Play keyboard sound with chaos based on anger level
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          createKeyboardSound(audioContextRef.current, angerLevel);
          
          // Extra chaotic sounds at high anger levels
          if (angerLevel >= 4 && Math.random() > 0.6) {
            setTimeout(() => {
              if (audioContextRef.current && audioContextRef.current.state === 'running') {
                createKeyboardSound(audioContextRef.current, angerLevel);
              }
            }, 10 + Math.random() * 20);
          }
        }
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
