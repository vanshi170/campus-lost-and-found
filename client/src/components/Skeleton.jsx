import React from 'react';

export function CardSkeleton() {
  return (
    <div className="skeleton skeleton-card" aria-hidden="true" />
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="skeleton-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }} aria-hidden="true">
      <div className="skeleton" style={{ height: '360px', borderRadius: 'var(--radius-card)' }} />
      <div className="skeleton" style={{ height: '40px', width: '60%', borderRadius: '8px' }} />
      <div className="skeleton" style={{ height: '24px', width: '40%', borderRadius: '8px' }} />
      <div className="skeleton" style={{ height: '100px', width: '100%', borderRadius: '14px' }} />
    </div>
  );
}

export default { CardSkeleton, GridSkeleton, DetailSkeleton };
