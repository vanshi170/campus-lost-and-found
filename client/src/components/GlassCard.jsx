import React from 'react';

/**
 * Reusable iOS-style Glassmorphism Card Container
 */
export default function GlassCard({
  children,
  className = '',
  interactive = false,
  style = {},
  onClick
}) {
  const classes = `glass-card ${interactive ? 'glass-card-interactive' : ''} ${className}`.trim();

  return (
    <div className={classes} style={style} onClick={onClick}>
      {children}
    </div>
  );
}
