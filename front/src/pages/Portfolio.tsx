import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProjectModal from '../components/ProjectModal';
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
        // load github projects
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
          full_name: project.full_name || (project.owner && `${project.owner.login}/${project.name}`),
          _source: 'github'
        }));

        // load manual projects (public)
        const manualRes = await fetch('http://localhost:4000/api/projects/manual');
        let manualBody = { projects: [] };
        if (manualRes.ok) manualBody = await manualRes.json();
        const manualProjects = (manualBody.projects || []).map((p: any) => ({
          id: p.id,
          title: p.name || p.title || `local-${p.id}`,
          description: p.description || '',
          technologies: p.technologies || [],
          category: p.category || 'web',
          image: p.image || '📦',
          url: p.url || null,
          _source: 'manual',
          _raw: p
        }));
        const merged = [...manualProjects, ...apiProjects];
        if (merged.length === 0) {
          setError('Aucun projet trouvé.');
          setProjects([]);
        } else {
          setProjects(merged);
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

  const [modalProject, setModalProject] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibility, setModalVisibility] = useState<boolean | null>(null);
  const [modalBusy, setModalBusy] = useState(false);

  async function openModal(project: any) {
    setModalProject(project);
    setModalVisible(true);
    // determine visibility key
    try {
      const key = project._source === 'github' ? `github:${project.full_name}` : `manual:${project.id}`;
      const res = await fetch(`http://localhost:4000/api/projects/visibility?project=${encodeURIComponent(key)}`);
      if (!res.ok) {
        setModalVisibility(null);
        return;
      }
      const b = await res.json();
      setModalVisibility(b.hasOwnProperty('visible') ? b.visible : null);
    } catch (e) {
      setModalVisibility(null);
    }
  }

  function closeModal() {
    setModalVisible(false);
    setModalProject(null);
    setModalVisibility(null);
  }

  async function toggleVisibility() {
    if (!modalProject) return;
    const key = modalProject._source === 'github' ? `github:${modalProject.full_name}` : `manual:${modalProject.id}`;
    const newVal = !(modalVisibility === true);
    setModalBusy(true);
    try {
      const res = await fetch('http://localhost:4000/api/admin/visibility', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: key, visible: newVal })
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        alert(b.error || 'Not authorized');
        setModalBusy(false);
        return;
      }
      setModalVisibility(newVal);
    } catch (e) {
      alert('Network error');
    } finally {
      setModalBusy(false);
    }
  }

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
              <div key={project.id} className="project-card" onClick={() => openModal(project)} style={{ cursor: 'pointer' }}>
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
                    {project.url ? (
                      <a className="project-link" href={project.url} target="_blank" rel="noreferrer">Voir sur GitHub / Live →</a>
                    ) : (
                      <span className="project-link muted">Infos →</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          <ProjectModal
            project={modalProject}
            visible={!!modalVisible}
            onClose={closeModal}
            onToggleVisibility={toggleVisibility}
            visibility={modalVisibility}
            busy={modalBusy}
          />
        </div>
      </section>
    </div>
  );
}
