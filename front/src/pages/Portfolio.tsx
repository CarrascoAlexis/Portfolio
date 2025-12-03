import { useState, useEffect } from 'react';
import './Portfolio.css';
const fallbackProjects = [
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'Plateforme de vente en ligne complète avec gestion des paiements et tableau de bord admin.',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    category: 'web',
    image: '🛒'
  },
  {
    id: 2,
    title: 'Real-time Chat Application',
    description: 'Application de messagerie instantanée avec support multi-rooms et notifications en temps réel.',
    technologies: ['React', 'Socket.IO', 'Express', 'Redis'],
    category: 'web',
    image: '💬'
  },
  {
    id: 3,
    title: 'Portfolio Dashboard',
    description: 'Dashboard interactif pour suivre et analyser les performances d\'un portefeuille d\'investissement.',
    technologies: ['Vue.js', 'TypeScript', 'D3.js', 'Firebase'],
    category: 'dashboard',
    image: '📊'
  },
  {
    id: 4,
    title: 'Task Management System',
    description: 'Système de gestion de tâches et projets avec fonctionnalités de collaboration en équipe.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Docker'],
    category: 'web',
    image: '✅'
  },
  {
    id: 5,
    title: 'Weather Forecast App',
    description: 'Application météo moderne avec prévisions à 7 jours et visualisations interactives.',
    technologies: ['React', 'TypeScript', 'OpenWeather API'],
    category: 'mobile',
    image: '🌤️'
  },
  {
    id: 6,
    title: 'Blog Platform',
    description: 'Plateforme de blog avec éditeur markdown, commentaires et système de tags.',
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
    category: 'web',
    image: '📝'
  }
];

const categories = ['all', 'web', 'mobile', 'dashboard'];

export default function Portfolio() {
  const [filter, setFilter] = useState('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:4000/api/projects');
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const body = await res.json();
        if (cancelled) return;
        const apiProjects = (body.projects || []).map((project: any, i: number) => ({
          id: project.id || `${i}-${project.full_name}`,
          title: project.name || project.full_name,
          description: project.description || '',
          technologies: project.language ? [project.language] : [],
          category: 'web',
          image: project.html_url ? '🔗' : '📦',
          url: project.html_url || project.url || project.clone_url
        }));
        setProjects(apiProjects.length ? apiProjects : fallbackProjects);
      } catch (err: any) {
        console.warn('Failed to load projects from API, using fallback', err);
        setError(err?.message || 'Failed to load projects');
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(project => project.category === filter);

  return (
    <div className="portfolio">
      <section className="portfolio-hero">
        <div className="container">
          <h1>Mes Projets</h1>
          <p className="lead">Une sélection de mes réalisations récentes</p>
        </div>
      </section>

      <section className="portfolio-content">
        <div className="container">
          <div className="portfolio-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'Tous' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {loading && <p>Loading projects…</p>}
          {error && <p className="error">Error: {error}</p>}

          <div className="projects-grid">
            {filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-image">
                  <span className="project-emoji">{project.image}</span>
                </div>
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tech">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="tech-badge">{tech}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.url ? (
                      <a className="project-link" href={project.url} target="_blank" rel="noreferrer">Voir le projet →</a>
                    ) : (
                      <button className="project-link">Voir le projet →</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
