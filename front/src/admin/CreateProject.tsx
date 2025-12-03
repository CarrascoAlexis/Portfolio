import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CreateProject.css';

export default function CreateProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Créer un Projet - Alexis Carrasco';
  }, []);

  useEffect(() => {
    // load images from gallery
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:4000/api/images');
        if (!res.ok) return;
        const b = await res.json();
        setGallery(b.images || []);
      } catch (e) {
        console.error('failed to load gallery', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function toggleImage(img: string) {
    setImages((prev) => prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]);
  }

  async function submit(e?: any) {
    if (e && e.preventDefault) e.preventDefault();
    
    if (!name.trim()) {
      alert('Le titre est obligatoire');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('http://localhost:4000/api/admin/projects/manual', {
        method: 'POST', 
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: name, 
          description, 
          url: url || undefined,
          images 
        })
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
      alert('Erreur réseau');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container create-project">
      <div className="admin-header">
        <div>
          <div className="hero-badge">
            <span className="badge-dot"></span>
            NOUVEAU PROJET
          </div>
          <h1 className="hero-title">Créer un projet</h1>
          <p className="hero-subtitle">Ajoutez un projet manuel à votre portfolio avec titre, description et images.</p>
        </div>
        <div className="hero-actions">
          <Link to="/admin/projects"><button className="btn btn-secondary">Annuler</button></Link>
        </div>
      </div>

      <form onSubmit={submit} className="create-form">
        <div className="form-section">
          <h2 className="section-title">Informations du projet</h2>
          
          <div className="form-group">
            <label htmlFor="project-title">Titre *</label>
            <input 
              id="project-title"
              type="text"
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Nom du projet"
              disabled={busy}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="project-description">Description</label>
            <textarea 
              id="project-description"
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Décrivez brièvement votre projet..."
              rows={4}
              disabled={busy}
            />
          </div>

          <div className="form-group">
            <label htmlFor="project-url">URL du projet (optionnel)</label>
            <input 
              id="project-url"
              type="url"
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              placeholder="https://github.com/username/project"
              disabled={busy}
            />
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">Galerie d'images</h2>
          <p className="section-description">
            Sélectionnez les images à associer à ce projet. {images.length > 0 && `${images.length} image(s) sélectionnée(s).`}
          </p>

          {loading && <div className="loading-state">Chargement des images…</div>}

          {!loading && gallery.length === 0 && (
            <div className="empty-state">
              <p>Aucune image disponible.</p>
              <Link to="/admin/images"><button type="button" className="btn btn-secondary">Gérer les images</button></Link>
            </div>
          )}

          {!loading && gallery.length > 0 && (
            <div className="gallery-grid">
              {gallery.map((img: any) => {
                const src = typeof img === 'string' ? img : (img.url || img.path || (img.filename ? `/uploads/${img.filename}` : ''));
                const label = typeof img === 'string' ? img.split('/').pop() : (img.originalname || img.filename || (src ? src.split('/').pop() : 'image'));
                const selected = src && images.includes(src);
                return (
                  <div 
                    key={src || label} 
                    className={`gallery-item ${selected ? 'selected' : ''}`}
                    onClick={() => toggleImage(src)}
                  >
                    <div className="gallery-image">
                      <img src={src} alt={label} />
                      {selected && <div className="selected-badge">✓</div>}
                    </div>
                    <div className="gallery-label">{label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Création en cours...' : 'Créer le projet'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => navigate('/admin/projects')}
            disabled={busy}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
