import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    full_name: '', 
    password: '', 
    confirm: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { 
      setError('Please fill in all required fields.'); 
      return; 
    }
    if (form.password !== form.confirm) { 
      setError('Passwords do not match.'); 
      return; 
    }
    if (form.password.length < 6) { 
      setError('Password must be at least 6 characters.'); 
      return; 
    }

    setLoading(true); 
    setError('');
    try {
      await authAPI.signup({ 
        username: form.username, 
        email: form.email, 
        full_name: form.full_name || null, 
        password: form.password 
      });
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Something went wrong.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">✓</div>
          <span>TaskManager</span>
        </div>
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Start managing your tasks today</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Username *</label>
            <input id="username" name="username" type="text" 
              placeholder="Choose a username"
              value={form.username} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input id="email" name="email" type="email" 
              placeholder="you@example.com"
              value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="full_name">Full name (optional)</label>
            <input id="full_name" name="full_name" type="text" 
              placeholder="Your full name"
              value={form.full_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input id="password" name="password" type="password" 
              placeholder="At least 6 characters"
              value={form.password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm password *</label>
            <input id="confirm" name="confirm" type="password" 
              placeholder="Repeat your password"
              value={form.confirm} onChange={handleChange} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}