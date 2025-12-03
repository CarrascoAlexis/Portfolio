import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EditImageModal from '../components/EditImageModal';
import './ImagesAdmin.css';

export default function AdminImages() {
  const [images, setImages] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    document.title = 'Gestion Images - Alexis Carrasco';
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [imgRes, projRes] = await Promise.all([
        fetch('/admin/images', { credentials: 'include' }),
        fetch('/projects')
      ]);

      if (imgRes.ok) {
        const b = await imgRes.json();
        setImages(b.images || []);
      }

      if (projRes.ok) {
        const pb = await projRes.json();
        setProjects(pb.projects || []);
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  }

  useEffect(() => { load(); }, []);

  async function upload(e: any) {
    e.preventDefault();
    if (!file) return alert('Sélectionnez un fichier');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    if (selectedProject) fd.append('project', selectedProject);
    
    try {
      const res = await fetch('/images', { 
        method: 'POST', 
        credentials: 'include', 
        body: fd 
      });
      if (!res.ok) throw new Error('Upload failed');
      await load();
      setFile(null); 
      setSelectedProject('');
      setUploadMode(false);
    } catch (err) { 
      console.error(err);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  }

  function openEdit(img: any) {
    setEditingImage(img);
    setModalOpen(true);
  }

  function closeEdit() {
    setModalOpen(false);
    setEditingImage(null);
  }

  async function handleSave() {
    await load();
    closeEdit();
  }

  async function handleDelete(filename: string) {
    if (!confirm('Supprimer cette image ?')) return;
    try {
      const res = await fetch(`/admin/images/${encodeURIComponent(filename)}`, { 
        method: 'DELETE', 
        credentials: 'include' 
      });
      if (res.ok) {
        await load();
        closeEdit();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (e) { 
      console.error(e);
      alert('Erreur réseau');
    }
  }

  async function bulkDelete() {
    if (selectedImages.size === 0) return;
    if (!confirm(`Supprimer ${selectedImages.size} image(s) ?`)) return;
    
    try {
      const promises = Array.from(selectedImages).map(filename =>
        fetch(`/admin/images/${encodeURIComponent(filename)}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      );
      await Promise.all(promises);
      setSelectedImages(new Set());
      setSelectionMode(false);
      await load();
    } catch (e) {
      console.error(e);
      alert('Erreur lors de la suppression');
    }
  }

  function toggleImageSelection(filename: string) {
    const newSet = new Set(selectedImages);
    if (newSet.has(filename)) {
      newSet.delete(filename);
    } else {
      newSet.add(filename);
    }
    setSelectedImages(newSet);
  }

  return (
    <div className="container admin-images">
      <div className="admin-header">
        <div>
          <div className="hero-badge">
            <span className="badge-dot"></span>
            GESTION IMAGES
          </div>
          <h1 className="hero-title">Images</h1>
          <p className="hero-subtitle">Téléversez et gérez les images de vos projets.</p>
        </div>
        <div className="hero-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setUploadMode(!uploadMode)}
          >
            {uploadMode ? 'Annuler' : 'Ajouter une image'}
          </button>
          <Link to="/admin"><button className="btn btn-secondary">Retour dashboard</button></Link>
        </div>
      </div>

      {uploadMode && (
        <div className="upload-section">
          <form onSubmit={upload} className="upload-form">
            <div className="form-group">
              <label>Fichier image</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                disabled={uploading}
              />
            </div>
            <div className="form-group">
              <label>Lier à un projet (optionnel)</label>
              <select 
                value={selectedProject} 
                onChange={e => setSelectedProject(e.target.value)}
                disabled={uploading}
              >
                <option value="">Aucun projet</option>
                {projects.map(p => {
                  const key = p.full_name || `manual:${p.id}`;
                  const label = p.name || p.title || p.full_name;
                  return <option key={key} value={key}>{label}</option>;
                })}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={uploading || !file}>
              {uploading ? 'Upload...' : 'Téléverser'}
            </button>
          </form>
        </div>
      )}

      {!loading && images.length > 0 && (
        <div className="images-toolbar">
          <div className="toolbar-filters">
            <select value={filterProject} onChange={e => setFilterProject(e.target.value)}>
              <option value="all">Tous les projets</option>
              <option value="none">Sans projet</option>
              {projects.map(p => {
                const key = p.full_name || `manual:${p.id}`;
                const label = p.name || p.title || p.full_name;
                return <option key={key} value={key}>{label}</option>;
              })}
            </select>
          </div>
          <div className="toolbar-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => { setSelectionMode(!selectionMode); setSelectedImages(new Set()); }}
            >
              {selectionMode ? 'Annuler sélection' : 'Sélectionner'}
            </button>
            {selectionMode && selectedImages.size > 0 && (
              <button className="btn btn-danger" onClick={bulkDelete}>
                Supprimer ({selectedImages.size})
              </button>
            )}
          </div>
        </div>
      )}

      {loading && <div className="loading-state">Chargement des images…</div>}

      {!loading && images.length === 0 && (
        <div className="empty-state">
          <p>Aucune image disponible.</p>
          <button className="btn btn-primary" onClick={() => setUploadMode(true)}>
            Ajouter votre première image
          </button>
        </div>
      )}

      <div className="images-grid">
        {images
          .filter(img => {
            if (filterProject === 'all') return true;
            if (filterProject === 'none') return !img.project;
            return img.project === filterProject;
          })
          .map(img => (
          <div 
            key={img.filename} 
            className={`image-card ${selectedImages.has(img.filename) ? 'selected' : ''}`}
            onClick={(e) => {
              if (selectionMode) {
                e.stopPropagation();
                toggleImageSelection(img.filename);
              } else {
                openEdit(img);
              }
            }}
          >
            {selectionMode && (
              <div className="selection-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedImages.has(img.filename)}
                  onChange={() => toggleImageSelection(img.filename)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
            )}
            <div className="image-preview">
              <img 
                src={img.url.startsWith('/') ? `${img.url}` : img.url} 
                alt={img.originalname} 
              />
            </div>
            <div className="image-info">
              <div className="image-name">{img.originalname}</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                {img.project && (
                  <span className="badge badge-project">{img.project}</span>
                )}
                {img.isPrimary && (
                  <span className="badge badge-primary" style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)', borderColor: 'var(--accent-primary)' }}>★ Principale</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && editingImage && (
        <EditImageModal
          image={editingImage}
          projects={projects}
          onClose={closeEdit}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
