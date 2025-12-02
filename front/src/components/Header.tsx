import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const themeRef = useRef<HTMLDivElement | null>(null);

  // Close theme menu on outside click or Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!themeRef.current) return;
      if (!themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setThemeOpen(false);
    }

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <span className="logo-icon"></span>
          <span className="logo-text">PORTFOLIO</span>
        </Link>

        <button 
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)}>À propos</Link>
          <Link to="/portfolio" onClick={() => setMenuOpen(false)}>Portfolio</Link>
          {/* Theme dropdown button */}
          <div className={`theme-wrapper ${themeOpen ? 'open' : ''}`} ref={themeRef}>
            <button
              className="theme-button"
              onClick={(e) => { e.stopPropagation(); setThemeOpen(prev => !prev); }}
              aria-haspopup="true"
              aria-expanded={themeOpen}
            >
              Theme
            </button>
            <div className="theme-menu" role="menu" aria-hidden={!themeOpen}>
              <button
                className="theme-menu-item"
                role="menuitem"
                onClick={() => { setThemeOpen(false); if (theme !== 'print-stream') setTheme('print-stream'); }}
              >
                Print Stream
              </button>
              <button
                className="theme-menu-item"
                role="menuitem"
                onClick={() => { setThemeOpen(false); if (theme !== 'fever-dream') setTheme('fever-dream'); }}
              >
                Fever Dream
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
