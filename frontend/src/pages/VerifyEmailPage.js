import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/auth/verify-email?token=${token}`)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    } else {
      setStatus('error');
    }
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo" style={{ justifyContent: 'center' }}>
          <div className="auth-logo-icon">✓</div>
          <span>TaskManager</span>
        </div>

        {status === 'verifying' && (
          <>
            <div className="spinner" style={{ margin: '24px auto' }} />
            <p>Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, margin: '16px 0' }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>Email Verified!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Your account is now active. You can log in.
            </p>
            <Link to="/login" className="btn-primary" 
              style={{ display: 'inline-block', textDecoration: 'none' }}>
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, margin: '16px 0' }}>❌</div>
            <h2 style={{ marginBottom: 8 }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              The link is invalid or expired.
            </p>
            <Link to="/login" className="btn-primary"
              style={{ display: 'inline-block', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}