import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Portfolio.css';

export default function Project() {
  const { name } = useParams();
  const decoded = name ? decodeURIComponent(name) : '';
  const [project, setProject] = useState<any | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!decoded) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // fetch all projects and find by name (owner resolution removed from URL)
        const res = await fetch(`http://localhost:4000/api/projects`);
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const body = await res.json();
        const found = (body.projects || []).find((p: any) => {
          const pname = p.name || p.title || (p.full_name ? p.full_name.split('/').pop() : undefined);
          return pname === decoded;
        });
        if (!found) {
          setError('Project not found');
          setLoading(false);
          return;
        }
        if (cancelled) return;
        setProject(found);

        // load images from backend API (if we have full_name, prefer it)
        try {
          const projId = found.full_name || (found.owner && `${found.owner.login}/${found.name}`) || `${found.name}`;
          const imgRes = await fetch(`http://localhost:4000/api/images?project=${encodeURIComponent(projId)}`);
          if (imgRes.ok) {
            const imgBody = await imgRes.json();
            setImages(imgBody.images || []);
          }
        } catch (e) {
          console.warn('Failed to load images', e);
        }

        // try to fetch README if we can infer owner/repo
        try {
          if (found.full_name) {
            const parts = found.full_name.split('/');
            const owner = parts[0];
            const repo = parts[1];
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md`;
            let r = await fetch(rawUrl);
            if (r.status === 404) {
              const apiReadme = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers: { Accept: 'application/vnd.github.v3.raw' } });
              if (apiReadme.ok) {
                const text = await apiReadme.text();
                setReadme(text);
              }
            } else if (r.ok) {
              const text = await r.text();
              setReadme(text);
            }
          }
        } catch (e) {
          console.warn('Failed to load README', e);
        }

      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [decoded]);

  if (loading) return <div className="container"><p>Chargement…</p></div>;
  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!project) return <div className="container"><p className="error">Projet introuvable.</p></div>;

  return (
    <div className="portfolio container">
      <div style={{ margin: '18px 0' }}>
        <Link to="/projects">← Retour</Link>
      </div>

      <h1>{project.name || project.title || project.full_name}</h1>
      {project.description && <p>{project.description}</p>}

      <div style={{ margin: '12px 0' }}>
        <strong>Technologies:</strong>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {(project.language ? [project.language] : project.technologies || []).map((t: string, i: number) => (
            <span key={i} className="tech-badge">{t}</span>
          ))}
        </div>
      </div>

      {project.html_url && (
        <div style={{ margin: '12px 0' }}>
          <a href={project.html_url} target="_blank" rel="noreferrer">Voir le dépôt sur GitHub</a>
        </div>
      )}

      <div style={{ margin: '12px 0' }}>
        <strong>Galerie:</strong>
        {images.length === 0 ? (
          <p className="muted">Aucune image pour ce projet.</p>
        ) : (
          <div className="project-gallery" style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {images.map((img: any) => (
              <div key={img.filename} className="gallery-item" style={{ border: '2px solid var(--line-color)', overflow: 'hidden', transition: 'all var(--transition-normal)', cursor: 'pointer' }}>
                <div style={{ aspectRatio: '16/9', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                  <img 
                    src={img.url.startsWith('/') ? `http://localhost:4000${img.url}` : img.url} 
                    alt={img.originalname} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform var(--transition-normal)' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ margin: '12px 0' }}>
        <strong>README:</strong>
        {readme ? (
          <pre style={{ whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.04)', padding: 12, borderRadius: 6 }}>{readme}</pre>
        ) : (
          <p className="muted">Aucun README disponible.</p>
        )}
      </div>
    </div>
  );
}
