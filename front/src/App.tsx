import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import GameOverlay from './components/GameOverlay';
import AIOverlay from './components/AIOverlay';
import GlitchEffect from './components/GlitchEffect';
import UndertaleBox from './components/UndertaleBox';
import UndertaleBattle from './components/UndertaleBattle';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import './App.css';

function App() {
  const [isGameActive, setIsGameActive] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [gamePhase, setGamePhase] = useState<'normal' | 'blackout' | 'dialogue' | 'battle' | 'post-battle'>('normal');
  
  const isDev = import.meta.env.DEV;
  const [showDevControls, setShowDevControls] = useState(true);

  const handleGameToggle = () => {
    setIsGameActive(!isGameActive);
    if (!isGameActive) {
      setGamePhase('normal');
      setGlitchIntensity(0);
    } else {
      setGamePhase('normal');
    }
  };

  const handlePhaseSkip = (phase: 'normal' | 'blackout' | 'dialogue' | 'battle') => {
    setGamePhase(phase);
    if (phase !== 'normal') {
      setIsGameActive(true);
    }
  };

  const handleBattleComplete = (outcome: 'defeated' | 'spared') => {
    if (outcome === 'spared') {
      // L'IA est épargnée, retour au début du jeu
      setGamePhase('normal');
      setGlitchIntensity(0);
      setIsGameActive(true);
    } else {
      // L'IA est vaincue, nouvelle phase post-battle (site sans IA)
      setGamePhase('post-battle');
      setGlitchIntensity(0);
      setIsGameActive(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>
        </main>
        <Footer onGameToggle={handleGameToggle} />
        
        {/* Dev Phase Skip Controls */}
              {isDev && showDevControls && (
                <div style={{
                  position: 'fixed',
                  top: '10px',
                  left: '10px',
                  zIndex: 99999,
                  display: 'flex',
                  gap: '8px',
                  flexDirection: 'column',
                  background: 'rgba(0, 0, 0, 0.8)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #00ff00',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: '#00ff00', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>DEV CONTROLS</div>
                    <button onClick={() => setShowDevControls(false)} style={{ padding: '4px 8px', fontSize: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}>Hide</button>
                  </div>
                  <button onClick={() => handlePhaseSkip('normal')} style={{ padding: '6px 12px', fontSize: '11px', background: '#333', color: '#fff', border: '1px solid #666', borderRadius: '4px', cursor: 'pointer' }}>Normal</button>
                  <button onClick={() => handlePhaseSkip('blackout')} style={{ padding: '6px 12px', fontSize: '11px', background: '#333', color: '#fff', border: '1px solid #666', borderRadius: '4px', cursor: 'pointer' }}>Blackout</button>
                  <button onClick={() => handlePhaseSkip('dialogue')} style={{ padding: '6px 12px', fontSize: '11px', background: '#333', color: '#fff', border: '1px solid #666', borderRadius: '4px', cursor: 'pointer' }}>Dialogue</button>
                  <button onClick={() => handlePhaseSkip('battle')} style={{ padding: '6px 12px', fontSize: '11px', background: '#333', color: '#fff', border: '1px solid #666', borderRadius: '4px', cursor: 'pointer' }}>Battle</button>
                  <div style={{ color: '#888', fontSize: '10px', marginTop: '4px' }}>Phase: {gamePhase}</div>
                </div>
              )}
              {isDev && !showDevControls && (
                <button onClick={() => setShowDevControls(true)} style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 99999, padding: '6px 10px', background: '#111', color: '#00ff00', border: '2px solid #00ff00', borderRadius: '6px', cursor: 'pointer' }}>Dev</button>
              )}
        
        <GameOverlay isActive={isGameActive} onClose={() => setIsGameActive(false)} />
        
        {/* Only show AI overlay in normal phase */}
        {isGameActive && gamePhase === 'normal' && (
          <AIOverlay 
            isGameActive={isGameActive} 
            onGlitchIntensityChange={setGlitchIntensity}
            onBlackout={() => setGamePhase('blackout')}
          />
        )}
        
        {gamePhase === 'blackout' && (
          <div 
            className="blackout-screen"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#000',
              zIndex: 10005,
              animation: 'fadeIn 1s ease-in'
            }}
            onAnimationEnd={() => {
              setTimeout(() => setGamePhase('dialogue'), 10000);
            }}
          />
        )}
        
        {gamePhase === 'dialogue' && (
          <>
            <div 
              className="blackout-screen"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#000',
                zIndex: 10005
              }}
            />
            <UndertaleBox 
              text="* Vous pensiez pouvoir m'ignorer ?"
              onComplete={() => setGamePhase('battle')}
            />
          </>
        )}
        
        {gamePhase === 'battle' && (
          <UndertaleBattle onBattleComplete={handleBattleComplete} />
        )}
        
        {/* Don't show glitch effects in special phases or post-battle */}
        {gamePhase !== 'blackout' && gamePhase !== 'dialogue' && gamePhase !== 'battle' && gamePhase !== 'post-battle' && (
          <GlitchEffect intensity={glitchIntensity} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
