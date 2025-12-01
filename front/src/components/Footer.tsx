import './Footer.css';

interface FooterProps {
  onGameToggle: () => void;
}

export default function Footer({ onGameToggle }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p>&copy; {new Date().getFullYear()} Portfolio. Tous droits réservés.</p>
        <div className="footer-links">
          <button className="game-toggle-btn" onClick={onGameToggle}>
            🎮 Lancer le jeu
          </button>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
