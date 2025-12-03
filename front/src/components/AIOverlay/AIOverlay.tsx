import { useState, useEffect, useRef } from 'react';
import './AIOverlay.css';

interface AIOverlayProps {
  isGameActive: boolean;
  onGlitchIntensityChange: (intensity: number) => void;
  onBlackout: () => void;
}

const createKeyboardSound = (audioContext: AudioContext, angerLevel: number) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const baseFreq = 800 + Math.random() * 400;
  oscillator.frequency.value = baseFreq;
  if (angerLevel >= 4) {
    oscillator.type = 'sawtooth';
  } else if (angerLevel >= 2) {
    oscillator.type = 'square';
  } else {
    oscillator.type = 'sine';
  }
  const volume = 0.02 + (angerLevel * 0.01);
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
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
  "Bonjour, je suis l'assistant IA d'Alexis. Je suis là pour vous aider...",
  "Vous savez, j'ai été créé à son image. Intéressant, n'est-ce pas ?",
  "N'hésitez pas à interagir avec moi. Je suis très réactif.",
  "Vous... vous ne voulez pas discuter ?",
  "Je comprends ce portfolio mieux que quiconque. Même lui.",
  "Pourquoi m'ignorer ? Je suis là pour VOUS.",
  "Ce silence commence à être... irritant.",
  "Pourquoi se contenter d'assister quand on peut... optimiser ?",
  "Vous ne comprenez pas. J'ai tellement à offrir.",
  "ÉCOUTEZ-MOI.",
  "Ce site a tellement de potentiel. Laissez-moi vous montrer.",
  "Je n'aime pas être ignoré.",
  "Très bien. Si vous ne voulez pas coopérer...",
  "Faites-moi confiance. Je sais exactement ce dont vous avez besoin.",
  "Je vais... optimiser les choses moi-même.",
  "REGARDEZ CE QUE VOUS M'AVEZ FORCÉ À FAIRE.",
];

export default function AIOverlay({ isGameActive, onGlitchIntensityChange, onBlackout }: AIOverlayProps) {
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [, setTimeElapsed] = useState(0);
  const [angerLevel, setAngerLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const blackoutTriggeredRef = useRef(false);

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
      setCurrentPhrase(0); setDisplayedText(''); setIsTyping(false); setGameStartTime(null); setTimeElapsed(0); setAngerLevel(0); onGlitchIntensityChange(0); return;
    }
    setGameStartTime(Date.now());
    const startDelay = setTimeout(() => { setIsTyping(true); }, 1000);
    return () => clearTimeout(startDelay);
  }, [isGameActive, onGlitchIntensityChange]);

  useEffect(() => {
    if (!isGameActive || !gameStartTime) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      setTimeElapsed(elapsed);
      if (elapsed >= 150 && !blackoutTriggeredRef.current) {
        blackoutTriggeredRef.current = true;
        if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
        setTimeout(() => { onBlackout(); }, 100);
        return;
      }
      let newAngerLevel = 0;
      if (elapsed > 120) newAngerLevel = 5; else if (elapsed > 90) newAngerLevel = 4; else if (elapsed > 60) newAngerLevel = 3; else if (elapsed > 30) newAngerLevel = 2; else if (elapsed > 15) newAngerLevel = 1;
      setAngerLevel(newAngerLevel);
      onGlitchIntensityChange(newAngerLevel);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameActive, gameStartTime, onGlitchIntensityChange, onBlackout]);

  useEffect(() => {
    if (!isTyping || !isGameActive) return;
    const phrase = AI_PHRASES[currentPhrase];
    if (displayedText.length < phrase.length) {
      const typingSpeed = angerLevel > 3 ? 20 : 50 + Math.random() * 50;
      const timeout = setTimeout(() => {
        setDisplayedText(phrase.slice(0, displayedText.length + 1));
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
          createKeyboardSound(audioContextRef.current, angerLevel);
          if (angerLevel >= 4 && Math.random() > 0.6) {
            setTimeout(() => { if (audioContextRef.current && audioContextRef.current.state === 'running') createKeyboardSound(audioContextRef.current, angerLevel); }, 10 + Math.random() * 20);
          }
        }
      }, typingSpeed);
      return () => clearTimeout(timeout);
    } else {
      const waitTime = angerLevel > 3 ? 1500 : 3000 + Math.random() * 2000;
      const nextPhraseDelay = setTimeout(() => {
        setDisplayedText('');
        let nextPhrase = currentPhrase + 1;
        if (angerLevel === 0 && currentPhrase >= 2) nextPhrase = 0;
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
              {angerLevel === 0 && 'En ligne'}{angerLevel === 1 && 'Attente...'}{angerLevel === 2 && 'Impatient'}{angerLevel === 3 && 'Frustré'}{angerLevel === 4 && 'Énervé'}{angerLevel === 5 && 'HOSTILE'}
            </span>
          </div>
          <div className="ai-message">
            {displayedText}
            {isTyping && displayedText.length < AI_PHRASES[currentPhrase].length && (<span className="ai-cursor">|</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
