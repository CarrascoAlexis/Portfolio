import { useState, useEffect, useRef } from 'react';
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

  // Position for dev panel: one of the four corners. Persisted in localStorage.
  type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  const [corner, setCorner] = useState<Corner>(() => {
    try {
      const saved = localStorage.getItem('devPanelCorner');
      return (saved as Corner) || 'top-left';
    } catch (e) {
      return 'top-left';
    }
  });

  // Drag state
  const draggingRef = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // When dragPos is non-null, listen to pointer movements and update position.
  useEffect(() => {
    if (!dragPos) return;

    const onMove = (e: MouseEvent) => {
      e.preventDefault();
      setDragPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };

    const onUp = (e: MouseEvent) => {
      // Snap to closest corner
      const cx = e.clientX;
      const cy = e.clientY;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const hor = cx < w / 2 ? 'left' : 'right';
      const ver = cy < h / 2 ? 'top' : 'bottom';
      const newCorner = (ver + '-' + hor) as typeof corner;
      setDragPos(null);
      try { localStorage.setItem('devPanelCorner', newCorner); } catch (err) {}
      // setCorner expects one of four values — update by reloading from storage
      window.requestAnimationFrame(() => {
        try {
          const saved = (localStorage.getItem('devPanelCorner') as typeof corner) || 'top-left';
          // @ts-ignore
          setCorner(saved);
        } catch (err) {
          // ignore
        }
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      setDragPos({ x: t.clientX - dragOffset.current.x, y: t.clientY - dragOffset.current.y });
    };

    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!t) return onUp(new MouseEvent('mouseup'));
      const cx = t.clientX;
      const cy = t.clientY;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const hor = cx < w / 2 ? 'left' : 'right';
      const ver = cy < h / 2 ? 'top' : 'bottom';
      const newCorner = (ver + '-' + hor) as typeof corner;
      setDragPos(null);
      try { localStorage.setItem('devPanelCorner', newCorner); } catch (err) {}
      try {
        const saved = (localStorage.getItem('devPanelCorner') as typeof corner) || 'top-left';
        // @ts-ignore
        setCorner(saved);
      } catch (err) {}
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [dragPos]);

  // Compute panel style depending on corner or dragPos
  const getPanelStyle = () => {
    const base = {
      position: 'fixed' as const,
      zIndex: 99999,
      display: 'flex',
      gap: '8px',
      flexDirection: 'column' as const,
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '12px',
      borderRadius: '8px',
      border: '2px solid #00ff00',
    };

    if (dragPos) {
      return { ...base, left: `${Math.max(6, Math.min(window.innerWidth - 200, dragPos.x))}px`, top: `${Math.max(6, Math.min(window.innerHeight - 80, dragPos.y))}px` };
    }

    switch (corner) {
      case 'top-left': return { ...base, top: '10px', left: '10px' };
      case 'top-right': return { ...base, top: '10px', right: '10px' };
      case 'bottom-left': return { ...base, bottom: '10px', left: '10px' };
      case 'bottom-right': return { ...base, bottom: '10px', right: '10px' };
      default: return { ...base, top: '10px', left: '10px' };
    }
  };

  const getCompactButtonStyle = () => {
    const base = { position: 'fixed' as const, zIndex: 99999, padding: '6px 10px', background: '#111', color: '#00ff00', border: '2px solid #00ff00', borderRadius: '6px', cursor: 'pointer' };
    if (dragPos) {
      return { ...base, left: `${Math.max(6, Math.min(window.innerWidth - 80, dragPos.x))}px`, top: `${Math.max(6, Math.min(window.innerHeight - 40, dragPos.y))}px` };
    }
    switch (corner) {
      case 'top-left': return { ...base, top: '10px', left: '10px' };
      case 'top-right': return { ...base, top: '10px', right: '10px' };
      case 'bottom-left': return { ...base, bottom: '10px', left: '10px' };
      case 'bottom-right': return { ...base, bottom: '10px', right: '10px' };
      default: return { ...base, top: '10px', left: '10px' };
    }
  };

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
                <div style={getPanelStyle()}>
                      <div
                        ref={panelRef}
                        onMouseDown={(e) => {
                          // start dragging if header is grabbed
                          const rect = panelRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                          setDragPos({ x: rect.left, y: rect.top });
                        }}
                        onTouchStart={(e) => {
                          const touch = e.touches[0];
                          const rect = panelRef.current?.getBoundingClientRect();
                          if (!rect || !touch) return;
                          dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
                          setDragPos({ x: rect.left, y: rect.top });
                        }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', cursor: 'grab' }}
                      >
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
                <button onClick={() => setShowDevControls(true)} style={getCompactButtonStyle()}>Dev</button>
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
