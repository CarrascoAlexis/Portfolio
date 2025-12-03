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
  
  const [tagInput, setTagInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [projectImages, setProjectImages] = useState<any[]>([]);
  const [allExistingTags, setAllExistingTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  useEffect(() => {
    // Load all images and filter those linked to this project
    (async () => {
      try {
        const res = await fetch('http://localhost:4000/api/admin/images', { credentials: 'include' });
        if (res.ok) {
          const b = await res.json();
          const images = b.images || [];
          
          // Filter images linked to current project
          const linked = images.filter((img: any) => img.project === projectKey);
          setProjectImages(linked);
        }
      } catch (e) {
        console.error('Failed to load images', e);
      }
    })();
  }, [projectKey]);

  useEffect(() => {
    // Load all existing tags from all projects
    (async () => {
      try {
        const res = await fetch('http://localhost:4000/api/projects');
        if (res.ok) {
          const b = await res.json();
          const projects = b.projects || [];
          const tagsSet = new Set<string>();
          projects.forEach((p: any) => {
            (p.tags || []).forEach((tag: string) => tagsSet.add(tag));
          });
          setAllExistingTags(Array.from(tagsSet).sort());
        }
      } catch (e) {
        console.error('Failed to load existing tags', e);
      }
    })();
  }, []);

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
      setShowTagSuggestions(false);
    }
  }

  function addExistingTag(tag: string) {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  // Filter suggestions based on input and exclude already selected tags
  const tagSuggestions = allExistingTags.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag)
  );

  async function unlinkImage(filename: string) {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/images/${encodeURIComponent(filename)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: null, isPrimary: false })
      });
      
      if (res.ok) {
        // Refresh images
        const imgRes = await fetch('http://localhost:4000/api/admin/images', { credentials: 'include' });
        if (imgRes.ok) {
          const b = await imgRes.json();
          const images = b.images || [];
          const linked = images.filter((img: any) => img.project === projectKey);
          setProjectImages(linked);
        }
      }
    } catch (e) {
      console.error('Failed to unlink image', e);
    }
  }

  async function setPrimaryImage(filename: string) {
    try {
      const res = await fetch(`http://localhost:4000/api/admin/images/${encodeURIComponent(filename)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: projectKey, isPrimary: true })
      });
      
      if (res.ok) {
        // Refresh images
        const imgRes = await fetch('http://localhost:4000/api/admin/images', { credentials: 'include' });
        if (imgRes.ok) {
          const b = await imgRes.json();
          const images = b.images || [];
          const linked = images.filter((img: any) => img.project === projectKey);
          setProjectImages(linked);
        }
      }
    } catch (e) {
      console.error('Failed to set primary image', e);
    }
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

      // Save tags (for both GitHub and manual projects)
      const tagsRes = await fetch('http://localhost:4000/api/admin/tags', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: projectKey, tags })
      });

      if (!tagsRes.ok) {
        alert('Erreur lors de la mise à jour des tags');
        setBusy(false);
        return;
      }

      // For manual projects, update name and description
      if (!isGithub) {
        const updateRes = await fetch(`http://localhost:4000/api/admin/projects/manual/${project.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, tags })
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
              <div style={{ position: 'relative', flex: 1 }}>
                <input 
                  type="text" 
                  value={tagInput} 
                  onChange={e => {
                    setTagInput(e.target.value);
                    setShowTagSuggestions(e.target.value.length > 0);
                  }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  placeholder="Ajouter un tag"
                />
                {showTagSuggestions && tagSuggestions.length > 0 && (
                  <div className="tag-suggestions">
                    {tagSuggestions.slice(0, 10).map(tag => (
                      <div 
                        key={tag} 
                        className="tag-suggestion-item"
                        onClick={() => {
                          addExistingTag(tag);
                          setTagInput('');
                          setShowTagSuggestions(false);
                        }}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" onClick={addTag} className="btn-add-tag">+</button>
            </div>
            {allExistingTags.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Tags existants :
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {allExistingTags.filter(t => !tags.includes(t)).slice(0, 15).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className="existing-tag-btn"
                      onClick={() => addExistingTag(tag)}
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Images (manuel seulement) */}
          {!isGithub && (
            <div className="form-group">
              <label>Images du projet</label>
              {projectImages.length === 0 ? (
                <p className="text-muted">Aucune image liée à ce projet. Utilisez la page "Images" pour en ajouter.</p>
              ) : (
                <div className="project-images-list">
                  {projectImages.map(img => (
                    <div key={img.filename} className="project-image-item">
                      <img 
                        src={img.url.startsWith('/') ? `http://localhost:4000${img.url}` : img.url} 
                        alt={img.originalname}
                      />
                      <div className="image-item-info">
                        <span className="image-name">{img.originalname}</span>
                        {img.isPrimary && <span className="badge-primary">★ Principale</span>}
                      </div>
                      <div className="image-item-actions">
                        {!img.isPrimary && (
                          <button 
                            type="button" 
                            className="btn-icon" 
                            onClick={() => setPrimaryImage(img.filename)}
                            title="Définir comme principale"
                          >
                            ★
                          </button>
                        )}
                        <button 
                          type="button" 
                          className="btn-icon btn-danger" 
                          onClick={() => unlinkImage(img.filename)}
                          title="Retirer du projet"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="help-text" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                💡 Pour ajouter des images à ce projet, allez dans la page <strong>Images</strong> et liez-les au projet "{name}".
              </p>
            </div>
          )}

          {/* Images pour projets GitHub (lecture seule) */}
          {isGithub && projectImages.length > 0 && (
            <div className="form-group">
              <label>Images liées</label>
              <div className="project-images-list">
                {projectImages.map(img => (
                  <div key={img.filename} className="project-image-item">
                    <img 
                      src={img.url.startsWith('/') ? `http://localhost:4000${img.url}` : img.url} 
                      alt={img.originalname}
                    />
                    <div className="image-item-info">
                      <span className="image-name">{img.originalname}</span>
                      {img.isPrimary && <span className="badge-primary">★ Principale</span>}
                    </div>
                    <div className="image-item-actions">
                      {!img.isPrimary && (
                        <button 
                          type="button" 
                          className="btn-icon" 
                          onClick={() => setPrimaryImage(img.filename)}
                          title="Définir comme principale"
                        >
                          ★
                        </button>
                      )}
                      <button 
                        type="button" 
                        className="btn-icon btn-danger" 
                        onClick={() => unlinkImage(img.filename)}
                        title="Retirer du projet"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="help-text" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                💡 Pour ajouter des images, allez dans la page <strong>Images</strong>.
              </p>
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
