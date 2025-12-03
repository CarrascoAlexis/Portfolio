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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin</h1>
          <p style={{ marginTop: 6, color: '#999' }}>Bienvenue dans le panneau d'administration.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/admin/projects/new"><button className="btn">Créer un projet</button></Link>
          <Link to="/admin/projects"><button className="btn">Gérer projets</button></Link>
          <Link to="/admin/images"><button className="btn">Gérer images</button></Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', padding: 12, borderRadius: 8, background: 'linear-gradient(180deg,#0f1724,#071226)', color: '#fff', boxShadow: '0 4px 14px rgba(2,6,23,0.6)' }}>
          <div style={{ fontSize: 12, color: '#9ad8ff' }}>Nombre de projets</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{loading ? '…' : total}</div>
        </div>

        <div style={{ flex: '1 1 320px', padding: 12, borderRadius: 8, background: '#fff', boxShadow: '0 4px 14px rgba(2,6,23,0.06)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#222' }}>Projets récents</div>
          <div style={{ marginTop: 8 }}>
            {recent.length === 0 && <div style={{ color: '#666' }}>{loading ? 'Chargement…' : 'Aucun projet trouvé'}</div>}
            {recent.map((p: any) => (
              <div key={(p.id || p.full_name || p.name) + ''} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name || p.title || p.full_name}</div>
                  <div style={{ fontSize: 12, color: '#777' }}>{p._source || (p.full_name ? 'github' : 'manual')}</div>
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>{new Date(p.created_at || p.createdAt || p.pushed_at || p.updated_at || Date.now()).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
