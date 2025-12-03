import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // load images from gallery
    (async () => {
      try {
        const res = await fetch('http://localhost:4000/api/images');
        if (!res.ok) return;
        const b = await res.json();
        setGallery(b.images || []);
      } catch (e) {
        console.error('failed to load gallery', e);
      }
    })();
  }, []);

  function toggleImage(img: string) {
    setImages((prev) => prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]);
  }

  async function submit(e?: any) {
    if (e && e.preventDefault) e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('http://localhost:4000/api/admin/projects/manual', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, images })
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        alert(b.error || 'Erreur lors de la création');
        setBusy(false);
        return;
      }
      // success -> go back to list
      navigate('/admin/projects');
    } catch (e) {
      console.error(e);
      alert('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <h2>Créer un projet</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 800 }}>
        <label>
          Titre
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Titre du projet" />
        </label>
        <label>
          Description
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Courte description" />
        </label>

        <div>
          <div style={{ marginBottom: 8 }}>Galerie (choisir des images)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {gallery.length === 0 && <div>Aucune image trouvée</div>}
            {gallery.map(img => (
              <div key={img} style={{ width: 120, border: images.includes(img) ? '3px solid #00a' : '1px solid #ddd', padding: 4, borderRadius: 6 }}>
                <img src={img} alt="img" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <small style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.split('/').pop()}</small>
                  <button type="button" onClick={() => toggleImage(img)} style={{ fontSize: 12 }}>{images.includes(img) ? 'Retirer' : 'Ajouter'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" className="btn" disabled={busy}>{busy ? 'Création...' : 'Créer'}</button>
          <button type="button" style={{ marginLeft: 8 }} onClick={() => navigate('/admin/projects')}>Annuler</button>
        </div>
      </form>
    </div>
  );
}
