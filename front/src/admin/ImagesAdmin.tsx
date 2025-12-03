import { useEffect, useState } from 'react';

export default function AdminImages() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [project, setProject] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/admin/images', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const b = await res.json();
      setImages(b.images || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function upload(e: any) {
    e.preventDefault();
    if (!file) return alert('Choose a file');
    const fd = new FormData();
    fd.append('file', file as File);
    if (project) fd.append('project', project);
    try {
      const res = await fetch('http://localhost:4000/api/images', { method: 'POST', credentials: 'include', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      await load();
      setFile(null); setProject('');
    } catch (err) { console.error(err); }
  }

  async function remove(filename: string) {
    if (!confirm('Supprimer cette image ?')) return;
    try {
      const res = await fetch(`http://localhost:4000/api/admin/images/${encodeURIComponent(filename)}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Delete failed');
      await load();
    } catch (e) { console.error(e); }
  }

  return (
    <div className="container">
      <h2>Images</h2>
      <form onSubmit={upload} style={{ marginBottom: 12 }}>
        <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
        <input placeholder="Project (owner/repo)" value={project} onChange={e => setProject(e.target.value)} />
        <button className="btn" type="submit">Upload</button>
      </form>
      {loading && <p>Chargement…</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        {images.map(img => (
          <div key={img.filename} style={{ border: '1px solid #ddd', padding: 8 }}>
            <img src={img.url.startsWith('/') ? `http://localhost:4000${img.url}` : img.url} alt={img.originalname} style={{ width: '100%', height: 'auto' }} />
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 12 }}>{img.originalname}</div>
              <div style={{ fontSize: 11, color: '#666' }}>{img.project || '—'}</div>
              <button onClick={() => remove(img.filename)} style={{ marginTop: 6 }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
