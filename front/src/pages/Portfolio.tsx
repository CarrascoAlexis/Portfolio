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
        // load only visible projects (combined GitHub + manual) from API
        const [projRes, imgRes] = await Promise.all([
          fetch('http://localhost:4000/api/projects?visible=1'),
          fetch('http://localhost:4000/api/images')
        ]);
        
        if (!projRes.ok) throw new Error(`API error ${projRes.status}`);
        const body = await projRes.json();
        
        let allImages: any[] = [];
        if (imgRes.ok) {
          const imgBody = await imgRes.json();
          allImages = imgBody.images || [];
        }
        
        if (cancelled) return;
        // API now returns combined projects (manual + github) filtered by visibility
        const apiProjects = (body.projects || []).map((project: any, i: number) => {
          const projectKey = project.full_name || `manual:${project.id}`;
          // Find primary image for this project
          const primaryImage = allImages.find(img => img.project === projectKey && img.isPrimary);
          
          return {
            id: project.id || `${i}-${project.full_name || project.name}`,
            title: project.name || project.title || project.full_name,
            description: project.description || project._raw?.description || '',
            technologies: project.language ? [project.language] : (project._raw?.technologies || []),
            category: project.category || (project._raw?.category) || 'web',
            image: primaryImage?.url || project.image || (project.html_url ? '🔗' : '📦'),
            imageUrl: primaryImage?.url || null,
            url: project.html_url || project.url || project.clone_url || null,
            full_name: project.full_name || (project._raw && project._raw.owner && `${project._raw.owner}/${project._raw.name}`) || null,
            _source: project._source || (project._raw ? 'manual' : 'github'),
            visible: project.visible !== undefined ? project.visible : true,
            _raw: project._raw || null
          };
        });

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

  // Public page does not open modal — modal is admin-only. Public cards link to internal project page.

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
                  {project.imageUrl ? (
                    <img 
                      src={project.imageUrl.startsWith('/') ? `http://localhost:4000${project.imageUrl}` : project.imageUrl} 
                      alt={project.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span className="project-emoji">{project.image}</span>
                  )}
                </div>
                <div className="project-content">
                  <h3>
                    <Link to={`/projects/${encodeURIComponent(project.title)}`}>{project.title}</Link>
                  </h3>
                  <p>{project.description}</p>
                  <div className="project-tech">
                    {project.technologies.map((tech: string, i: number) => (
                      <span key={i} className="tech-badge">{tech}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    <Link className="project-link" to={`/projects/${encodeURIComponent(project.title)}`}>Voir le projet →</Link>
                    {project.url && (
                      <a className="project-link" href={project.url} target="_blank" rel="noreferrer" style={{ marginLeft: 8 }}>Voir sur GitHub / Live</a>
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
