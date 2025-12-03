import { useEffect, useState } from 'react';
import ProjectModal from '../components/ProjectModal';

type Project = any;

export default function AdminProjects() {
  const [githubProjects, setGithubProjects] = useState<Project[]>([]);
  const [manualProjects, setManualProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [visMap, setVisMap] = useState<Record<string, boolean>>({});

  const [modalProject, setModalProject] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibility, setModalVisibility] = useState<boolean | null>(null);
  const [modalBusy, setModalBusy] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      // GitHub projects (public)
      const gh = await fetch('http://localhost:4000/api/projects');
      if (gh.ok) {
        const b = await gh.json();
        const list = (b.projects || []).map((p: any) => ({ ...p, _source: 'github' }));
        setGithubProjects(list);
      } else {
        setGithubProjects([]);
      }

      // manual projects (admin)
      const manual = await fetch('http://localhost:4000/api/admin/projects/manual', { credentials: 'include' });
      if (manual.ok) {
        const bm = await manual.json();
        const mlist = (bm.projects || []).map((p: any) => ({ ...p, _source: 'manual' }));
        setManualProjects(mlist);
      } else {
        setManualProjects([]);
      }

      // load visibilities (all)
      const vis = await fetch('http://localhost:4000/api/projects/visibility');
      if (vis.ok) {
        const bv = await vis.json();
        setVisMap(bv.visibility || {});
      }
    } catch (e) {
      console.error('loadAll error', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function create() {
    try {
      const res = await fetch('http://localhost:4000/api/admin/projects/manual', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: title, description: desc })
      });
      if (!res.ok) throw new Error('Create failed');
      await loadAll();
      setTitle(''); setDesc('');
    } catch (e) { console.error(e); }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce projet ?')) return;
    try {
      await fetch(`http://localhost:4000/api/admin/projects/manual/${id}`, { method: 'DELETE', credentials: 'include' });
      await loadAll();
    } catch (e) { console.error(e); }
  }

  async function toggleVisibility(key: string) {
    try {
      const newVal = !visMap[key];
      const res = await fetch('http://localhost:4000/api/admin/visibility', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: key, visible: newVal })
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        alert(b.error || 'Not authorized');
        return;
      }
      // update local map and reload fresh data to keep everything in sync
      setVisMap((m) => ({ ...m, [key]: newVal }));
      await loadAll();
    } catch (e) {
      console.error('toggleVisibility error', e);
      alert('Network error');
    }
  }

  function openAdminModal(project: any) {
    setModalProject(project);
    setModalVisible(true);
    (async () => {
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
    })();
  }

  function closeAdminModal() {
    setModalVisible(false);
    setModalProject(null);
    setModalVisibility(null);
  }

  const combined = [
    ...manualProjects.map(p => ({ ...p, _displayTitle: p.name || p.title || `manual-${p.id}` })),
    ...githubProjects.map(p => ({ ...p, _displayTitle: p.name || p.title || p.full_name }))
  ];

  return (
    <div className="container">
      <h2>Projets</h2>
      <p>Affiche les projets GitHub publics et les projets manuels.</p>

      <div style={{ marginBottom: 12 }}>
        <input placeholder="Titre (manual)" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <button onClick={create} className="btn">Ajouter manuel</button>
      </div>

      {loading && <p>Chargement…</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Titre</th>
            <th>Source</th>
            <th>Visible</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {combined.map(p => {
            const key = p._source === 'github' ? `github:${p.full_name}` : `manual:${p.id}`;
            // server-side defaults to visible when no explicit visibility is set,
            // so mirror that default here to avoid showing `Non` for projects
            // that are actually visible but not present in the visibility map.
            const visible = visMap.hasOwnProperty(key) ? !!visMap[key] : true;
            return (
              <tr key={key} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '8px 6px' }}>
                  <a href="#" onClick={e => { e.preventDefault(); openAdminModal(p); }}>{p._displayTitle}</a>
                </td>
                <td style={{ textAlign: 'center' }}>{p._source}</td>
                <td style={{ textAlign: 'center' }}>{visible ? 'Oui' : 'Non'}</td>
                <td style={{ textAlign: 'center' }}>
                  {p._source === 'manual' && <button onClick={() => remove(p.id)}>Supprimer</button>}
                  <button style={{ marginLeft: 8 }} onClick={() => toggleVisibility(key)}>Basculer visibilité</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ProjectModal
        project={modalProject}
        visible={!!modalVisible}
        onClose={closeAdminModal}
        onToggleVisibility={async () => {
          if (!modalProject) return;
          const key = modalProject._source === 'github' ? `github:${modalProject.full_name}` : `manual:${modalProject.id}`;
          await toggleVisibility(key);
          // refresh visMap and modal visibility; default to true when key is absent
          const vis = await fetch('http://localhost:4000/api/projects/visibility');
          if (vis.ok) {
            const bv = await vis.json();
            const map = bv.visibility || {};
            setVisMap(map);
            setModalVisibility(map.hasOwnProperty(key) ? !!map[key] : true);
          }
        }}
        visibility={modalVisibility}
        busy={modalBusy}
      />
    </div>
  );
}
