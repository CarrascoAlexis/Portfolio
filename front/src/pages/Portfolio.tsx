import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Portfolio.css';

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
          url: project.html_url || project.url || project.clone_url,
          full_name: project.full_name || (project.owner && `${project.owner.login}/${project.name}`)
        }));
        if (apiProjects.length === 0) {
          setError('Aucun projet trouvé.');
          setProjects([]);
        } else {
          setProjects(apiProjects);
        }
      } catch (err: any) {
        console.warn('Failed to load projects from API', err);
        setError(err?.message || 'Impossible de charger les projets');
        setProjects([]);
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

          {loading && <p>Chargement des projets…</p>}
          {error && <p className="error">{error}</p>}

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
                    {project.technologies.map((tech: string, i: number) => (
                      <span key={i} className="tech-badge">{tech}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.title ? (
                      <Link className="project-link" to={`/projects/${encodeURIComponent(project.title)}`}>Voir le projet →</Link>
                    ) : project.url ? (
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
