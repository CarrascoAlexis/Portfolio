import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p>&copy; {new Date().getFullYear()} Portfolio. Tous droits réservés.</p>
        <div className="footer-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
