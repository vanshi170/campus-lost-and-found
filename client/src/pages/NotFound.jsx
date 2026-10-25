import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { HelpCircle, Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page-fade" style={{ maxWidth: '520px', margin: '4rem auto', textAlign: 'center' }}>
      <GlassCard style={{ padding: '3rem 2rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            color: 'var(--accent-amber)'
          }}
        >
          <HelpCircle size={32} />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>404</h1>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          It seems this campus page has wandered off or the item report was relocated.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/" className="btn-primary">
            <Home size={16} />
            <span>Return Home</span>
          </Link>
          <Link to="/browse" className="btn-secondary">
            <Compass size={16} />
            <span>Browse Items</span>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
