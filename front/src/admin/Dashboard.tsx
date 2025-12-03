import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="container">
      <h1>Admin</h1>
      <p>Bienvenue dans le panneau d'administration.</p>
      <ul>
        <li><Link to="/admin/projects">Gérer les projets</Link></li>
        <li><Link to="/admin/images">Gérer les images</Link></li>
      </ul>
    </div>
  );
}
