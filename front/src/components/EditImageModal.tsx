import { useState } from 'react';
import './EditImageModal.css';

type EditImageModalProps = {
  image: any;
  projects: any[];
  onClose: () => void;
  onSave: () => void;
  onDelete: (filename: string) => void;
};

export default function EditImageModal({ image, projects, onClose, onSave, onDelete }: EditImageModalProps) {
  const [project, setProject] = useState(image.project || '');
  const [isPrimary, setIsPrimary] = useState(!!image.isPrimary);
  const [deleteOthers, setDeleteOthers] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setBusy(true);
    try {
      // Update image metadata (project link and primary status)
      const res = await fetch(`http://localhost:4000/api/admin/images/${encodeURIComponent(image.filename)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project: project || null, 
          isPrimary,
          deleteOthers: isPrimary && deleteOthers 
        })
      });

      if (!res.ok) {
        alert('Erreur lors de la mise à jour');
        setBusy(false);
        return;
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
      <div className="modal-content edit-image-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-badge">
              <span className="badge-dot"></span>
              ÉDITER IMAGE
            </div>
            <h2 className="modal-title">{image.originalname}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="image-preview-large">
            <img 
              src={image.url.startsWith('/') ? `http://localhost:4000${image.url}` : image.url} 
              alt={image.originalname}
            />
          </div>

          <div className="form-group">
            <label>Projet associé</label>
            <select value={project} onChange={e => setProject(e.target.value)}>
              <option value="">Aucun projet</option>
              {projects.map(p => {
                const key = p.full_name || `manual:${p.id}`;
                const label = p.name || p.title || p.full_name;
                return <option key={key} value={key}>{label}</option>;
              })}
            </select>
          </div>

          {project && (
            <div className="form-group">
              <label>Image principale du projet</label>
              <div className="visibility-toggle">
                <button
                  type="button"
                  className={`toggle-option ${isPrimary ? 'active' : ''}`}
                  onClick={() => setIsPrimary(true)}
                >
                  Principale
                </button>
                <button
                  type="button"
                  className={`toggle-option ${!isPrimary ? 'active' : ''}`}
                  onClick={() => setIsPrimary(false)}
                >
                  Secondaire
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                L'image principale s'affichera sur la carte du projet dans la liste.
              </p>
              
              {isPrimary && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input 
                      type="checkbox" 
                      checked={deleteOthers}
                      onChange={e => setDeleteOthers(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                    />
                    Supprimer les autres images de ce projet
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginLeft: '1.625rem' }}>
                    Toutes les autres images liées à ce projet seront supprimées (économise de l'espace).
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="info-box">
            <p><strong>Taille :</strong> {(image.size / 1024).toFixed(1)} Ko</p>
            <p><strong>Type :</strong> {image.mimetype}</p>
            <p><strong>Uploadé :</strong> {new Date(image.uploaded_at).toLocaleString('fr-FR')}</p>
          </div>
        </div>

        <div className="modal-footer">
          <div>
            <button 
              type="button" 
              className="btn btn-danger" 
              onClick={() => onDelete(image.filename)}
              disabled={busy}
            >
              Supprimer
            </button>
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
