import { useEffect } from 'react';
import './About.css';

export default function About() {
  useEffect(() => {
    document.title = 'À propos - Alexis Carrasco';
  }, []);

  return (
    <div className="about">
      <section className="about-hero">
        <div className="container">
          <h1>À propos de moi</h1>
          <p className="lead">Alexis Carrasco - Passionné par le développement web et les technologies modernes</p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>Mon parcours</h2>
              <p>
                Je suis Alexis Carrasco, développeur full stack passionné par la création d'applications 
                web performantes et élégantes. Je me spécialise dans les technologies modernes comme 
                React, TypeScript, et Node.js.
              </p>
              <p>
                Mon approche combine rigueur technique, créativité, et souci du détail pour livrer 
                des solutions qui dépassent les attentes. Chaque projet est une opportunité d'apprendre 
                et d'innover.
              </p>

              <h2>Mes valeurs</h2>
              <ul className="values-list">
                <li>
                  <span className="value-icon">✓</span>
                  <strong>Excellence technique</strong> : Code propre, maintenable et performant
                </li>
                <li>
                  <span className="value-icon">✓</span>
                  <strong>Innovation</strong> : Toujours à l'affût des nouvelles technologies
                </li>
                <li>
                  <span className="value-icon">✓</span>
                  <strong>Collaboration</strong> : Travail d'équipe et communication efficace
                </li>
              </ul>
            </div>

            <div className="about-stats">
              <div className="stat-card">
                <div className="stat-number">3+</div>
                <div className="stat-label">Années d'expérience</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">20+</div>
                <div className="stat-label">Projets réalisés</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">100%</div>
                <div className="stat-label">Satisfaction client</div>
              </div>
            </div>
          </div>

          <div className="tech-stack">
            <h2>Technologies maîtrisées</h2>
            <div className="tech-categories">
              <div className="tech-category">
                <h3>Frontend</h3>
                <div className="tech-tags">
                  <span className="tech-tag">React</span>
                  <span className="tech-tag">TypeScript</span>
                  <span className="tech-tag">Vue.js</span>
                  <span className="tech-tag">HTML5/CSS3</span>
                  <span className="tech-tag">Tailwind</span>
                </div>
              </div>
              <div className="tech-category">
                <h3>Backend</h3>
                <div className="tech-tags">
                  <span className="tech-tag">Node.js</span>
                  <span className="tech-tag">Express</span>
                  <span className="tech-tag">PostgreSQL</span>
                  <span className="tech-tag">MongoDB</span>
                  <span className="tech-tag">Redis</span>
                </div>
              </div>
              <div className="tech-category">
                <h3>DevOps & Tools</h3>
                <div className="tech-tags">
                  <span className="tech-tag">Docker</span>
                  <span className="tech-tag">Git</span>
                  <span className="tech-tag">CI/CD</span>
                  <span className="tech-tag">AWS</span>
                  <span className="tech-tag">Linux</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
