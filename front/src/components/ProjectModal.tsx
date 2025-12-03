type Props = {
  project: any;
  visible: boolean;
  onClose: () => void;
  onToggleVisibility?: () => Promise<void> | void;
  visibility?: boolean | null;
  busy?: boolean;
};

export default function ProjectModal({ project, visible, onClose, onToggleVisibility, visibility = null, busy = false }: Props) {
  if (!visible || !project) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10010, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ background: '#fff', padding: 20, maxWidth: 720, width: '90%', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{project.title || project.name || project._displayTitle || project.full_name}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <p>{project.description}</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          {project.url && <a className="btn" href={project.url} target="_blank" rel="noreferrer">Voir le repo / live</a>}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            {typeof visibility === 'boolean' && onToggleVisibility && (
              <>
                <span>Visible on site:</span>
                <button className="btn" onClick={onToggleVisibility} disabled={busy}>{visibility ? 'Oui' : 'Non'}</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
