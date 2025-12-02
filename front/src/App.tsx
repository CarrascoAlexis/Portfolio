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

  const handleGameToggle = () => {
    setIsGameActive(!isGameActive);
    if (!isGameActive) {
      setGamePhase('normal');
      setGlitchIntensity(0);
    } else {
      setGamePhase('normal');
    }
  };

  const handleBattleComplete = () => {
    setGamePhase('post-battle');
    setGlitchIntensity(0);
    // Return to normal gameplay after battle
    setTimeout(() => {
      setGamePhase('normal');
    }, 1000);
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
        
        <GameOverlay isActive={isGameActive} onClose={() => setIsGameActive(false)} />
        
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
        
        {gamePhase !== 'blackout' && gamePhase !== 'dialogue' && gamePhase !== 'battle' && (
          <GlitchEffect intensity={glitchIntensity} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
