import { useEffect, useState } from 'react';

type Project = any;

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/admin/projects/manual', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const b = await res.json();
      setProjects(b.projects || []);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function create() {
    try {
      const res = await fetch('http://localhost:4000/api/admin/projects/manual', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: title, description: desc })
      });
      if (!res.ok) throw new Error('Create failed');
      await load();
      setTitle(''); setDesc('');
    } catch (e) { console.error(e); }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce projet ?')) return;
    try {
      await fetch(`http://localhost:4000/api/admin/projects/manual/${id}`, { method: 'DELETE', credentials: 'include' });
      await load();
    } catch (e) { console.error(e); }
  }

  return (
    <div className="container">
      <h2>Projets (manuels)</h2>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} />
        <input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <button onClick={create} className="btn">Ajouter</button>
      </div>
      {loading && <p>Chargement…</p>}
      <ul>
        {projects.map(p => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            <strong>{p.name || p.title}</strong> — {p.description}
            <button style={{ marginLeft: 8 }} onClick={() => remove(p.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
