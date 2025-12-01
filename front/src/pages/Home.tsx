import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              <span>DISPONIBLE POUR DE NOUVEAUX PROJETS</span>
            </div>
            <h1 className="hero-title">
              Développeur <span className="highlight">Full Stack</span>
            </h1>
            <p className="hero-subtitle">
              Création d'expériences web modernes et performantes avec une approche technique rigoureuse.
            </p>
            <div className="hero-actions">
              <Link to="/portfolio" className="btn btn-primary">
                Voir mes projets
              </Link>
              <Link to="/about" className="btn btn-secondary">
                En savoir plus
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-grid">
              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="skills-preview">
        <div className="container">
          <h2>Compétences principales</h2>
          <div className="skills-grid">
            <div className="skill-card">
              <div className="skill-icon">⚡</div>
              <h3>Frontend</h3>
              <p>React, TypeScript, Vue.js</p>
            </div>
            <div className="skill-card">
              <div className="skill-icon">🔧</div>
              <h3>Backend</h3>
              <p>Node.js, Express, PostgreSQL</p>
            </div>
            <div className="skill-card">
              <div className="skill-icon">🎨</div>
              <h3>Design</h3>
              <p>UI/UX, Responsive Design</p>
            </div>
            <div className="skill-card">
              <div className="skill-icon">🚀</div>
              <h3>DevOps</h3>
              <p>Docker, CI/CD, Cloud</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
