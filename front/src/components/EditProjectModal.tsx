import { useState, useEffect } from 'react';
import './EditProjectModal.css';

type EditProjectModalProps = {
  project: any;
  visMap: Record<string, boolean>;
  onClose: () => void;
  onSave: () => void;
  onDelete?: (id: string) => void;
};

export default function EditProjectModal({ project, visMap, onClose, onSave, onDelete }: EditProjectModalProps) {
  const isGithub = project._source === 'github';
  const projectKey = isGithub ? `github:${project.full_name}` : `manual:${project.id}`;
  const initialVisible = visMap.hasOwnProperty(projectKey) ? visMap[projectKey] : true;

  // Editable fields
  const [name, setName] = useState(project.name || project.title || '');
  const [description, setDescription] = useState(project.description || '');
  const [tags, setTags] = useState<string[]>(project.tags || []);
  const [visible, setVisible] = useState(initialVisible);
  const [images, setImages] = useState<string[]>(project.images || []);
  
  const [tagInput, setTagInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);

  useEffect(() => {
    // Load gallery for manual projects
    if (!isGithub) {
      (async () => {
        try {
          const res = await fetch('http://localhost:4000/api/images');
          if (res.ok) {
            const b = await res.json();
            setGallery(b.images || []);
          }
        } catch (e) {
          console.error('Failed to load gallery', e);
        }
      })();
    }
  }, [isGithub]);

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  function toggleImage(img: string) {
    setImages(prev => prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]);
  }

  async function handleSave() {
    setBusy(true);
    try {
      // Save visibility
      const visRes = await fetch('http://localhost:4000/api/admin/visibility', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: projectKey, visible })
      });

      if (!visRes.ok) {
        alert('Erreur lors de la mise à jour de la visibilité');
        setBusy(false);
        return;
      }

      // For manual projects, update all fields
      if (!isGithub) {
        const updateRes = await fetch(`http://localhost:4000/api/admin/projects/manual/${project.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, tags, images })
        });

        if (!updateRes.ok) {
          alert('Erreur lors de la mise à jour du projet');
          setBusy(false);
          return;
        }
      }

      onSave();
    } catch (e) {
      console.error('Save error', e);
      alert('Erreur réseau');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content edit-project-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-badge">
              <span className="badge-dot"></span>
              {isGithub ? 'PROJET GITHUB' : 'PROJET MANUEL'}
            </div>
            <h2 className="modal-title">{project.name || project.title || project.full_name}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Nom (read-only pour GitHub) */}
          <div className="form-group">
            <label>Nom du projet</label>
            {isGithub ? (
              <div className="readonly-field">{name}</div>
            ) : (
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="Nom du projet"
              />
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              placeholder="Description du projet"
              rows={4}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags / Technologies</label>
            <div className="tags-container">
              {tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
            </div>
            <div className="tag-input-group">
              <input 
                type="text" 
                value={tagInput} 
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Ajouter un tag"
              />
              <button type="button" onClick={addTag} className="btn-add-tag">+</button>
            </div>
          </div>

          {/* Images (manuel seulement) */}
          {!isGithub && (
            <div className="form-group">
              <label>Images du projet</label>
              <div className="images-gallery">
                {gallery.length === 0 && <p className="text-muted">Aucune image disponible</p>}
                {gallery.map(img => (
                  <div 
                    key={img} 
                    className={`gallery-item ${images.includes(img) ? 'selected' : ''}`}
                    onClick={() => toggleImage(img)}
                  >
                    <img src={img} alt="gallery" />
                    {images.includes(img) && <div className="selected-badge">✓</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visibilité */}
          <div className="form-group">
            <label>Visibilité publique</label>
            <div className="visibility-toggle">
              <button
                type="button"
                className={`toggle-option ${visible ? 'active' : ''}`}
                onClick={() => setVisible(true)}
              >
                Visible
              </button>
              <button
                type="button"
                className={`toggle-option ${!visible ? 'active' : ''}`}
                onClick={() => setVisible(false)}
              >
                Caché
              </button>
            </div>
          </div>

          {/* Info GitHub */}
          {isGithub && (
            <div className="info-box">
              <p><strong>Note :</strong> Les projets GitHub sont synchronisés depuis votre dépôt. Seules la description, les tags et la visibilité peuvent être modifiés.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div>
            {onDelete && !isGithub && (
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={() => onDelete(project.id)}
                disabled={busy}
              >
                Supprimer
              </button>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
              Annuler
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={busy}>
              {busy ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
