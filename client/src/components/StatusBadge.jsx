import React from 'react';
import { CheckCircle2, Search, HelpCircle } from 'lucide-react';

export default function StatusBadge({ type, status, size = 'normal' }) {
  // If status is resolved, that takes priority or can be rendered alongside
  if (status === 'resolved') {
    return (
      <span
        className="glass-badge"
        style={{
          background: 'var(--accent-sage-bg)',
          borderColor: 'var(--accent-sage-border)',
          color: 'var(--accent-sage)',
          fontSize: size === 'small' ? '0.75rem' : '0.8rem'
        }}
      >
        <CheckCircle2 size={13} />
        Resolved
      </span>
    );
  }

  // Lost badge (muted rose)
  if (type === 'lost') {
    return (
      <span
        className="glass-badge"
        style={{
          background: 'var(--accent-rose-bg)',
          borderColor: 'var(--accent-rose-border)',
          color: 'var(--accent-rose)',
          fontSize: size === 'small' ? '0.75rem' : '0.8rem'
        }}
      >
        <HelpCircle size={13} />
        Lost
      </span>
    );
  }

  // Found badge (muted amber)
  if (type === 'found') {
    return (
      <span
        className="glass-badge"
        style={{
          background: 'var(--accent-amber-bg)',
          borderColor: 'var(--accent-amber-border)',
          color: 'var(--accent-amber)',
          fontSize: size === 'small' ? '0.75rem' : '0.8rem'
        }}
      >
        <Search size={13} />
        Found
      </span>
    );
  }

  return null;
}
