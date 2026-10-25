import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import { LogIn, Sparkles, Mail, Lock, UserCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      showToast('Welcome back! Logged in successfully.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click helper for viva demonstration
  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo@123');
    setError('');
  };

  return (
    <div className="page-fade" style={{ maxWidth: '440px', margin: '3rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <LogIn size={24} style={{ color: 'var(--accent-amber)' }} />
          <span>Campus Login</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Sign in to report items and connect with campus owners.
        </p>
      </div>

      <GlassCard style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                borderRadius: 'var(--radius-input)',
                background: 'var(--accent-error-bg)',
                color: '#ffd8d8',
                fontSize: '0.875rem'
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              College Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="glass-input"
                placeholder="e.g. rahul@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="glass-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Viva Helper */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem' }}>
            Demo Student Accounts (Viva / Testing):
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('rahul@campus.edu')}
              className="glass-badge"
              style={{ background: 'rgba(255,255,255,0.06)', cursor: 'pointer' }}
            >
              Rahul
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('priya@campus.edu')}
              className="glass-badge"
              style={{ background: 'rgba(255,255,255,0.06)', cursor: 'pointer' }}
            >
              Priya
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('amit@campus.edu')}
              className="glass-badge"
              style={{ background: 'rgba(255,255,255,0.06)', cursor: 'pointer' }}
            >
              Amit
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
            Register here
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
