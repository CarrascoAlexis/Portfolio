import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <span className="logo-icon"></span>
          <span className="logo-text">PORTFOLIO</span>
        </Link>

        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Accueil</Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)}>À propos</Link>
          <Link to="/portfolio" onClick={() => setIsMenuOpen(false)}>Portfolio</Link>
        </nav>
      </div>
    </header>
  );
}
