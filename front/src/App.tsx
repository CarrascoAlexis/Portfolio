import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import GameOverlay from './components/GameOverlay';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import './App.css';

function App() {
  const [isGameActive, setIsGameActive] = useState(false);

  const handleGameToggle = () => {
    setIsGameActive(!isGameActive);
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
      </div>
    </BrowserRouter>
  );
}

export default App;
