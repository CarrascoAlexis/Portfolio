import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../config/api';
import './CreateProject.css';

export default function CreateProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Créer un Projet - Alexis Carrasco';
  }, []);

  async function submit(e?: any) {
    if (e && e.preventDefault) e.preventDefault();
    
    if (!name.trim()) {
      alert('Le titre est obligatoire');
      return;
    }

    setBusy(true);
    try {
      const res = await apiFetch('/admin/projects/manual', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: name, 
          description, 
          url: url || undefined
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
