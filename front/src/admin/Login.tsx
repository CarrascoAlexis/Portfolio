import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AdminLogin() {
  const [user, setUser] = useState('admin');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const next = search.get('next') || '/admin';

  useEffect(() => {
    document.title = 'Admin Login - Alexis Carrasco';
  }, []);

  async function submit(e: any) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: user, password: pass })
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        setError(b.error || 'Login failed');
        return;
      }
      navigate(next);
    } catch (err: any) {
      setError(err?.message || 'Network error');
    }
  }

  return (
    <div className="container">
      <h2>Admin Login</h2>
      <form onSubmit={submit} style={{ maxWidth: 420 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Username</label>
          <input value={user} onChange={e => setUser(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} />
        </div>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <div style={{ marginTop: 8 }}>
          <button type="submit" className="btn btn-primary">Se connecter</button>
        </div>
      </form>
    </div>
  );
}
