import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children }: PropsWithChildren) {
  const [ok, setOk] = useState<boolean | null>(null);
  const loc = useLocation();

  useEffect(() => {
    let cancelled = false;
    async function me() {
      try {
        const res = await fetch('http://localhost:4000/api/admin/me', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) setOk(false);
          return;
        }
        const body = await res.json();
        if (!cancelled) setOk(body && body.ok);
      } catch (e) {
        if (!cancelled) setOk(false);
      }
    }
    me();
    return () => { cancelled = true; };
  }, []);

  if (ok === null) return <div className="container"><p>Vérification…</p></div>;
  if (ok === false) return <Navigate to={`/admin/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  return <>{children}</>;
}
