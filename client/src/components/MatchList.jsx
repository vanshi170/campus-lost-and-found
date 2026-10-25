import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import GlassCard from './GlassCard';
import StatusBadge from './StatusBadge';
import { Sparkles, ArrowUpRight, Compass, ShieldCheck } from 'lucide-react';

export default function MatchList({ itemId, initialMatches = null }) {
  const [matches, setMatches] = useState(initialMatches);
  const [loading, setLoading] = useState(!initialMatches);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialMatches) {
      setMatches(initialMatches);
      setLoading(false);
      return;
    }

    if (!itemId) return;

    let isMounted = true;
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/items/${itemId}/matches`);
        if (isMounted && res.data.success) {
          setMatches(res.data.matches);
        }
      } catch (err) {
        if (isMounted) setError('Could not load automated matches at this time.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMatches();
    return () => {
      isMounted = false;
    };
  }, [itemId, initialMatches]);

  if (loading) {
    return (
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-amber)' }} />
          <span>Searching for Matches...</span>
        </h3>
        <div className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-card)', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-card)' }} />
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="match-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={20} style={{ color: 'var(--accent-amber)' }} />
          <span>Suggested Matches ({matches?.length || 0})</span>
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Jaccard & Proximity Scored
        </span>
      </div>

      {(!matches || matches.length === 0) ? (
        <GlassCard style={{ padding: '2rem', textAlign: 'center' }}>
          <Compass size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
            No strong matches found yet
          </h4>
          <p style={{ fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            When another campus member posts a matching item with similar category, keywords, or location, it will show up here automatically.
          </p>
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {matches.map(({ item: matchedItem, matchScore, reasons }) => {
            // Determine ring border color based on score tier
            let scoreColor = 'var(--accent-rose)';
            if (matchScore >= 65) scoreColor = 'var(--accent-sage)';
            else if (matchScore >= 45) scoreColor = 'var(--accent-amber)';

            return (
              <GlassCard key={matchedItem._id} interactive className="match-card">
                {/* Score Circular Indicator */}
                <div
                  className="match-score-badge"
                  style={{ borderColor: scoreColor, color: scoreColor }}
                  title={`Computed similarity match score: ${matchScore}%`}
                >
                  <span>{matchScore}%</span>
                  <span className="match-score-label">Match</span>
                </div>

                {/* Match Information */}
                <div className="match-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <StatusBadge type={matchedItem.type} size="small" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {matchedItem.category} • {matchedItem.campusZone}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {matchedItem.title}
                  </h4>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {matchedItem.description}
                  </p>

                  {/* Match Reason Chips */}
                  {reasons && reasons.length > 0 && (
                    <div className="match-reasons-list">
                      {reasons.map((reason, idx) => (
                        <span key={idx} className="match-reason-chip">
                          ✓ {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Link */}
                <Link
                  to={`/items/${matchedItem._id}`}
                  className="btn-secondary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', flexShrink: 0 }}
                >
                  <span>View Post</span>
                  <ArrowUpRight size={15} />
                </Link>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
