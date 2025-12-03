import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Dashboard.css';

type Project = any;

function parseDate(p: Project) {
  return new Date(p.created_at || p.createdAt || p.pushed_at || p.updated_at || p.pushedAt || Date.now());
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [visMap, setVisMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard Admin - Alexis Carrasco';
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Charger projets
        const res = await fetch('http://localhost:4000/api/projects');
        if (res.ok) {
          const b = await res.json();
          setProjects(b.projects || []);
        }

        // Charger visibilité
        const vis = await fetch('http://localhost:4000/api/projects/visibility');
        if (vis.ok) {
          const bv = await vis.json();
          setVisMap(bv.visibility || {});
        }
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = projects.length;
  const visible = projects.filter(p => {
    const key = p.full_name ? `github:${p.full_name}` : `manual:${p.id}`;
    return visMap.hasOwnProperty(key) ? visMap[key] : true;
  }).length;
  const hidden = total - visible;
  const recent = [...projects].sort((a, b) => +parseDate(b) - +parseDate(a)).slice(0, 5);

  return (
    <div className="container admin-dashboard">
      <div className="admin-header">
        <div>
          <div className="hero-badge">
            <span className="badge-dot"></span>
            ADMIN PANEL
          </div>
          <h1 className="hero-title">Tableau de bord</h1>
          <p className="hero-subtitle">Gérez vos projets, images et statistiques.</p>
        </div>
        <div className="hero-actions">
          <Link to="/admin/projects/new"><button className="btn btn-primary">Créer un projet</button></Link>
          <Link to="/admin/projects"><button className="btn btn-secondary">Gérer projets</button></Link>
          <Link to="/admin/images"><button className="btn btn-secondary">Gérer images</button></Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{loading ? '—' : total}</div>
          <div className="stat-label">Total projets</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{loading ? '—' : visible}</div>
          <div className="stat-label">Visibles</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{loading ? '—' : hidden}</div>
          <div className="stat-label">Cachés</div>
        </div>
      </div>

      <div className="recent-projects">
        <h2>Projets récents</h2>
        {loading && <p style={{ color: 'var(--text-muted)' }}>Chargement…</p>}
        {!loading && recent.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Aucun projet trouvé</p>}
        <div className="projects-list">
          {recent.map((p: any) => {
            const key = p.full_name ? `github:${p.full_name}` : `manual:${p.id}`;
            const isVisible = visMap.hasOwnProperty(key) ? visMap[key] : true;
            return (
              <Link 
                key={key} 
                to="/admin/projects" 
                className="project-item"
              >
                <div className="project-info">
                  <div className="project-name">{p.name || p.title || p.full_name}</div>
                  <div className="project-meta">
                    <span className="project-source">{p.full_name ? 'GitHub' : 'Manuel'}</span>
                    <span className="project-separator">•</span>
                    <span className={`project-visibility ${isVisible ? 'visible' : 'hidden'}`}>
                      {isVisible ? 'Visible' : 'Caché'}
                    </span>
                  </div>
                </div>
                <div className="project-date">
                  {parseDate(p).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
