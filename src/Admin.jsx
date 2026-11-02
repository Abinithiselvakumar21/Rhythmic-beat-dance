
import { useState } from 'react';
import './Admin.css';

const API_URL = 'https://rhythmic-beat-dance.onrender.com/api/auth/login';

function Admin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          'Backend response correct-ah illa. Backend login route-a check pannunga.'
        );
      }

      if (!response.ok) {
        setMessage(
          data.message || `Login failed (${response.status})`
        );
        return;
      }

      if (!data.token) {
        setMessage(
          'Login response-la token varala. Backend auth code-a check pannunga.'
        );
        return;
      }

      sessionStorage.setItem('adminToken', data.token);
      window.location.href = '/admin-dashboard';
    } catch (error) {
      console.error('Admin login error:', error);

      setMessage(
        error.message ||
          'Server connect aagala. Backend URL and CORS settings check pannunga.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-page">
      <form className="admin-card" onSubmit={handleLogin}>
        <a href="/" className="admin-back">
          ← Back to website
        </a>

        <p className="admin-eyebrow">
          RHYTHMIC DANCE COURT
        </p>

        <h1>Admin Login</h1>

        <p className="admin-description">
          Sign in to manage your dance events.
        </p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter admin username"
          autoComplete="username"
          required
          disabled={loading}
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
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {message && (
          <p className="admin-message" role="alert">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}

export default Admin;
