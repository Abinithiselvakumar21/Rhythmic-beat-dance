
import { useState } from 'react';
import './Admin.css';

function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Login failed');
        return;
      }

      sessionStorage.setItem('adminToken', data.token);
      setMessage('Login successful!');

      window.location.href = '/admin-dashboard';
    } catch (error) {
      setMessage('Server connect aagala. Backend running-ah check pannunga.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-page">
      <form className="admin-card" onSubmit={handleLogin}>
        <a href="/" className="admin-back">← Back to website</a>

        <p className="admin-eyebrow">RHYTHMIC DANCE COURT</p>
        <h1>Admin Login</h1>
        <p className="admin-description">
          Sign in to manage your dance events.
        </p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter admin username"
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {message && <p className="admin-message" role="status">{message}</p>}
      </form>
    </main>
  );
}

export default Admin;
