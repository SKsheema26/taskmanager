import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', confirm: '' });
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
    await signup({ 
      username: form.username, 
      email: form.email, 
      full_name: form.full_name, 
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
            <label htmlFor="username">Username <span style={{color:'var(--danger)'}}>*</span></label>
            <input id="username" name="username" type="text" placeholder="Choose a username"
              value={form.username} onChange={handleChange} autoComplete="username" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email <span style={{color:'var(--danger)'}}>*</span></label>
            <input id="email" name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="full_name">Full name <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
            <input id="full_name" name="full_name" type="text" placeholder="Your full name"
              value={form.full_name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password <span style={{color:'var(--danger)'}}>*</span></label>
            <input id="password" name="password" type="password" placeholder="At least 6 characters"
              value={form.password} onChange={handleChange} autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirm password <span style={{color:'var(--danger)'}}>*</span></label>
            <input id="confirm" name="confirm" type="password" placeholder="Repeat your password"
              value={form.confirm} onChange={handleChange} autoComplete="new-password" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
