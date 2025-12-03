import { useState } from 'react';
import './Footer.css';

interface FooterProps {
  onGameToggle: () => void;
}

export default function Footer({ onGameToggle }: FooterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleGameClick = () => {
    if (window.innerWidth <= 768) {
      return;
    }
    onGameToggle();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Erreur lors de l\'envoi du message');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Impossible de contacter le serveur');
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-contact">
            <h3>Me contacter</h3>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Votre nom *"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={status === 'sending'}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Votre email *"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={status === 'sending'}
                  />
                </div>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="subject"
                  placeholder="Sujet"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={status === 'sending'}
                />
              </div>
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Votre message *"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  disabled={status === 'sending'}
                />
              </div>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Envoi en cours...' : 'Envoyer'}
              </button>
              {status === 'success' && (
                <p className="success-message">✓ Message envoyé avec succès !</p>
              )}
              {status === 'error' && (
                <p className="error-message">✗ {errorMessage}</p>
              )}
            </form>
          </div>
          
          <div className="footer-info">
            <h3>À propos</h3>
            <p>Portfolio développé avec React, TypeScript et Node.js</p>
            <div className="footer-links">
              <button className="game-toggle-btn" onClick={handleGameClick}>
                🎮 Lancer le jeu
              </button>
              <a href="https://github.com/CarrascoAlexis" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/acarrasco75019/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Alexis Carrasco. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
