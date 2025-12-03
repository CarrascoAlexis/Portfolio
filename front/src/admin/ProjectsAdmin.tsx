import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EditProjectModal from '../components/EditProjectModal';
import './ProjectsAdmin.css';

type Project = any;

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [visMap, setVisMap] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'github' | 'manual'>('all');
  
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Gestion Projets - Alexis Carrasco';
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      // GitHub projects (public)
      const gh = await fetch('/api/projects');
      const ghList = gh.ok ? ((await gh.json()).projects || []).map((p: any) => ({ ...p, _source: 'github' })) : [];

      // manual projects (admin)
      const manual = await fetch('/api/admin/projects/manual', { credentials: 'include' });
      const manualList = manual.ok ? ((await manual.json()).projects || []).map((p: any) => ({ ...p, _source: 'manual' })) : [];

      // load visibilities
      const vis = await fetch('/api/projects/visibility');
      if (vis.ok) {
        const bv = await vis.json();
        setVisMap(bv.visibility || {});
      }

      setProjects([...manualList, ...ghList]);
    } catch (e) {
      console.error('loadAll error', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  function openEdit(project: any) {
    setEditingProject(project);
    setModalOpen(true);
  }

  function closeEdit() {
    setModalOpen(false);
    setEditingProject(null);
  }

  async function handleSave() {
    await loadAll();
    closeEdit();
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce projet manuel ?')) return;
    try {
      const res = await fetch(`/api/admin/projects/manual/${id}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      if (res.ok) { 
        await loadAll();
        closeEdit();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau');
    }
  }

  const filtered = projects.filter(p => {
    if (filter === 'all') return true;
    return p._source === filter;
  });

  const sortedProjects = [...filtered].sort((a, b) => {
    const aVis = visMap.hasOwnProperty(getKey(a)) ? visMap[getKey(a)] : true;
    const bVis = visMap.hasOwnProperty(getKey(b)) ? visMap[getKey(b)] : true;
    if (aVis !== bVis) return bVis ? 1 : -1;
    return (a.name || a.title || '').localeCompare(b.name || b.title || '');
  });

  function getKey(p: any) {
    return p._source === 'github' ? `github:${p.full_name}` : `manual:${p.id}`;
  }

  function isVisible(p: any) {
    const key = getKey(p);
    return visMap.hasOwnProperty(key) ? visMap[key] : true;
  }

  return (
    <div className="container admin-projects">
      <div className="admin-header">
        <div>
          <div className="hero-badge">
            <span className="badge-dot"></span>
            GESTION PROJETS
          </div>
          <h1 className="hero-title">Projets</h1>
          <p className="hero-subtitle">Gérez vos projets GitHub et manuels, modifiez leur visibilité et métadonnées.</p>
        </div>
        <div className="hero-actions">
          <Link to="/admin/projects/new"><button className="btn btn-primary">Créer un projet</button></Link>
          <Link to="/admin"><button className="btn btn-secondary">Retour dashboard</button></Link>
        </div>
      </div>

      <div className="projects-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous ({projects.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'manual' ? 'active' : ''}`}
          onClick={() => setFilter('manual')}
        >
          Manuels ({projects.filter(p => p._source === 'manual').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'github' ? 'active' : ''}`}
          onClick={() => setFilter('github')}
        >
          GitHub ({projects.filter(p => p._source === 'github').length})
        </button>
      </div>

      {loading && <div className="loading-state">Chargement des projets…</div>}

      {!loading && sortedProjects.length === 0 && (
        <div className="empty-state">
          <p>Aucun projet trouvé.</p>
          <Link to="/admin/projects/new"><button className="btn btn-primary">Créer votre premier projet</button></Link>
        </div>
      )}

      <div className="projects-grid">
        {sortedProjects.map(p => {
          const visible = isVisible(p);
          return (
            <div 
              key={getKey(p)} 
              className={`project-card ${!visible ? 'hidden-project' : ''}`}
              onClick={() => openEdit(p)}
            >
              <div className="project-card-header">
                <div className="project-title">{p.name || p.title || p.full_name}</div>
                <div className="project-badges">
                  <span className={`badge badge-source ${p._source}`}>{p._source === 'github' ? 'GitHub' : 'Manuel'}</span>
                  <span className={`badge badge-visibility ${visible ? 'visible' : 'hidden'}`}>
                    {visible ? 'Visible' : 'Caché'}
                  </span>
                </div>
              </div>
              <div className="project-card-body">
                <p className="project-description">{p.description || 'Pas de description'}</p>
              </div>
              <div className="project-card-footer">
                <div className="project-meta">
                  {p.language && <span className="meta-item">{p.language}</span>}
                  {p.stargazers_count !== undefined && <span className="meta-item">★ {p.stargazers_count}</span>}
                </div>
                <div className="project-action">
                  <span className="action-hint">Cliquer pour modifier →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && editingProject && (
        <EditProjectModal
          project={editingProject}
          visMap={visMap}
          onClose={closeEdit}
          onSave={handleSave}
          onDelete={editingProject._source === 'manual' ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
