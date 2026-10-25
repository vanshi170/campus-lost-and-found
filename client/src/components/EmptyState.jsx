import React from 'react';
import GlassCard from './GlassCard';
import { PackageSearch } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = PackageSearch,
  title = 'No items found',
  description = 'Try adjusting your search criteria or clear active filters.',
  actionLabel,
  actionLink,
  onActionClick
}) {
  return (
    <GlassCard className="empty-state">
      <div className="empty-state-icon">
        <Icon size={32} />
      </div>

      <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{title}</h3>

      <p style={{ maxWidth: '420px', fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn-primary" style={{ marginTop: '0.75rem' }}>
          {actionLabel}
        </Link>
      )}

      {actionLabel && onActionClick && !actionLink && (
        <button type="button" onClick={onActionClick} className="btn-primary" style={{ marginTop: '0.75rem' }}>
          {actionLabel}
        </button>
      )}
    </GlassCard>
  );
}
