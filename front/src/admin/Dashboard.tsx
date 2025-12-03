import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

type Project = any;

function parseDate(p: Project) {
  return new Date(p.created_at || p.createdAt || p.pushed_at || p.updated_at || p.pushedAt || Date.now());
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:4000/api/projects');
        if (!res.ok) {
          setProjects([]);
          return;
        }
        const b = await res.json();
        setProjects(b.projects || []);
      } catch (e) {
        console.error('Failed to load projects for dashboard', e);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = projects.length;
  const recent = [...projects].sort((a, b) => +parseDate(b) - +parseDate(a)).slice(0, 6);

  return (
    <div className="container">
      <div className="hero" style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
        <div className="hero-content">
          <h1 className="hero-title">Admin</h1>
          <p className="hero-subtitle">Gérez vos projets et images. Statistiques rapides et accès aux outils.</p>
        </div>
        <div className="hero-actions" style={{ alignSelf: 'center' }}>
          <Link to="/admin/projects/new"><button className="btn btn-primary">Créer un projet</button></Link>
          <Link to="/admin/projects"><button className="btn btn-secondary">Gérer projets</button></Link>
          <Link to="/admin/images"><button className="btn btn-secondary">Gérer images</button></Link>
        </div>
      </div>

      <div className="skills-grid" style={{ marginTop: '1rem' }}>
        <div className="stat-card skill-card">
          <div style={{ fontSize: 12, color: 'var(--accent-subtle)' }}>Nombre de projets</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{loading ? '…' : total}</div>
        </div>

        <div className="skill-card">
          <h3>Projets récents</h3>
          <div>
            {recent.length === 0 && <div style={{ color: 'var(--text-muted)' }}>{loading ? 'Chargement…' : 'Aucun projet trouvé'}</div>}
            {recent.map((p: any) => (
              <div key={(p.id || p.full_name || p.name) + ''} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name || p.title || p.full_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p._source || (p.full_name ? 'github' : 'manual')}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(p.created_at || p.createdAt || p.pushed_at || p.updated_at || Date.now()).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
