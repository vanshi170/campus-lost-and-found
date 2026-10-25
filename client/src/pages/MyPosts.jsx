import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { GridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import {
  FolderOpen,
  Sparkles,
  CheckCircle2,
  Trash2,
  ArrowUpRight,
  PlusCircle,
  Calendar,
  MapPin
} from 'lucide-react';

export default function MyPosts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/items/mine');
      if (res.data.success) {
        setItems(res.data.items);
      }
    } catch (err) {
      showToast('Failed to load your posts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleResolve = async (itemId) => {
    try {
      const res = await api.patch(`/api/items/${itemId}/resolve`);
      if (res.data.success) {
        showToast('Item marked as resolved!', 'success');
        setItems((prev) =>
          prev.map((item) => (item._id === itemId ? { ...item, status: 'resolved' } : item))
        );
      }
    } catch (err) {
      showToast('Could not mark as resolved.', 'error');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) return;

    try {
      const res = await api.delete(`/api/items/${itemId}`);
      if (res.data.success) {
        showToast('Post deleted.', 'info');
        setItems((prev) => prev.filter((item) => item._id !== itemId));
      }
    } catch (err) {
      showToast('Failed to delete post.', 'error');
    }
  };

  return (
    <div className="page-fade">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FolderOpen size={26} style={{ color: 'var(--accent-amber)' }} />
            <span>My Campus Posts</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage your reports and track automated match suggestions.
          </p>
        </div>

        <Link to="/post" className="btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
          <PlusCircle size={16} />
          <span>New Post</span>
        </Link>
      </div>

      {loading ? (
        <GridSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="You haven't posted any items yet"
          description="Have you lost or found keys, a water bottle, an ID card, or an electronic device? Create your first post to let the campus network help."
          actionLabel="Create a Post"
          actionLink="/post"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map((item) => (
            <GlassCard key={item._id} style={{ padding: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <StatusBadge type={item.type} size="small" />
                    {item.status === 'resolved' && <StatusBadge status="resolved" size="small" />}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.85rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} />
                      <span>{item.campusZone} ({item.locationName})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} />
                      <span>{new Date(item.dateOccurred).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Match Badge & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                  {/* Strong Match Count Badge */}
                  {item.status === 'open' && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.8rem',
                        borderRadius: 'var(--radius-pill)',
                        background:
                          item.strongMatchCount > 0
                            ? 'var(--accent-sage-bg)'
                            : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${
                          item.strongMatchCount > 0
                            ? 'var(--accent-sage-border)'
                            : 'var(--glass-border)'
                        }`,
                        color:
                          item.strongMatchCount > 0
                            ? 'var(--accent-sage)'
                            : 'var(--text-muted)',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      <Sparkles size={14} />
                      <span>
                        {item.strongMatchCount}{' '}
                        {item.strongMatchCount === 1 ? 'strong match' : 'strong matches'}
                      </span>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Link
                      to={`/items/${item._id}`}
                      className="btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                    >
                      <span>View</span>
                      <ArrowUpRight size={14} />
                    </Link>

                    {item.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleResolve(item._id)}
                        className="btn-success"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Resolve</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="btn-danger"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}
                      title="Delete post"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
