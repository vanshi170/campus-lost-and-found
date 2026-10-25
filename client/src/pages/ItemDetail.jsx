import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import MatchList from '../components/MatchList';
import ItemForm from '../components/ItemForm';
import { DetailSkeleton } from '../components/Skeleton';
import {
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Lock,
  Edit3,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Share2,
  Tag,
  Palette,
  Package
} from 'lucide-react';

export default function ItemDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const newlyPosted = searchParams.get('newlyPosted') === 'true';

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [item, setItem] = useState(null);
  const [canViewContact, setCanViewContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/items/${id}`);
        if (isMounted && res.data.success) {
          setItem(res.data.item);
          setCanViewContact(res.data.canViewContact);
        }
      } catch (err) {
        if (isMounted) {
          showToast('Failed to load item or item does not exist.', 'error');
          navigate('/browse');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchItem();

    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated, navigate, showToast]);

  const isOwner = Boolean(
    user && item && item.postedBy && (user._id === item.postedBy._id || user._id === item.postedBy)
  );

  const handleResolve = async () => {
    try {
      const res = await api.patch(`/api/items/${id}/resolve`);
      if (res.data.success) {
        setItem(res.data.item);
        showToast('Item successfully marked as resolved!', 'success');
      }
    } catch (err) {
      showToast('Could not mark item as resolved.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete(`/api/items/${id}`);
      if (res.data.success) {
        showToast('Item post has been permanently removed.', 'info');
        navigate('/browse');
      }
    } catch (err) {
      showToast('Failed to delete item.', 'error');
    }
  };

  const handleUpdate = async (formData) => {
    setIsUpdating(true);
    try {
      const res = await api.put(`/api/items/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setItem(res.data.item);
        setIsEditing(false);
        showToast('Item details updated successfully!', 'success');
      }
    } catch (err) {
      showToast('Failed to update item details.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  if (loading) {
    return (
      <div className="page-fade">
        <DetailSkeleton />
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="page-fade" style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Back button and breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="btn-secondary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          title="Share post"
        >
          <Share2 size={15} />
          <span>Share</span>
        </button>
      </div>

      {/* Newly posted celebration banner */}
      {newlyPosted && (
        <div
          style={{
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-card)',
            background: 'var(--accent-sage-bg)',
            border: '1px solid var(--accent-sage-border)',
            color: '#d6f2df',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <Sparkles size={22} style={{ color: 'var(--accent-sage)', flexShrink: 0 }} />
          <div>
            <strong>Your report is live!</strong> Check the suggested matches below to see if anyone has already reported this item.
          </div>
        </div>
      )}

      {isEditing ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Edit Item Post</h2>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel Editing
            </button>
          </div>
          <ItemForm
            initialData={item}
            onSubmit={handleUpdate}
            isSubmitting={isUpdating}
            submitLabel="Save Changes"
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Main Detail Glass Card */}
          <GlassCard style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: (item.imageUrl && !imgError) ? '1fr 1fr' : '1fr', gap: '2rem' }}>
              {/* Photo View */}
              {item.imageUrl && !imgError && (
                <div
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'rgba(0, 0, 0, 0.3)',
                    maxHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={() => setImgError(true)}
                  />
                </div>
              )}

              {/* Information Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <StatusBadge type={item.type} />
                  {item.status === 'resolved' && <StatusBadge status="resolved" />}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Posted {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h1 style={{ fontSize: '1.85rem', lineHeight: 1.25 }}>{item.title}</h1>

                {/* Badges / Key Attributes */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', margin: '0.25rem 0' }}>
                  <div className="glass-badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <Tag size={13} style={{ opacity: 0.7 }} />
                    <span>{item.category}</span>
                  </div>

                  {item.color && (
                    <div className="glass-badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <Palette size={13} style={{ opacity: 0.7 }} />
                      <span>{item.color}</span>
                    </div>
                  )}

                  <div className="glass-badge" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <MapPin size={13} style={{ opacity: 0.7 }} />
                    <span>{item.campusZone}</span>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                    Description
                  </h4>
                  <p style={{ fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                    {item.description}
                  </p>
                </div>

                {/* Location & Date Details */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-input)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.9rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <MapPin size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
                    <span><strong>Location:</strong> {item.locationName} ({item.campusZone})</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Calendar size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
                    <span>
                      <strong>Date {item.type === 'lost' ? 'Lost' : 'Found'}:</strong>{' '}
                      {new Date(item.dateOccurred).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    {item.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={handleResolve}
                        className="btn-success"
                      >
                        <CheckCircle2 size={16} />
                        <span>Mark as Resolved</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                    >
                      <Edit3 size={15} />
                      <span>Edit Post</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn-danger"
                    >
                      <Trash2 size={15} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <GlassCard style={{ padding: '1.5rem', background: 'rgba(50, 15, 25, 0.6)', border: '1px solid var(--accent-rose-border)' }}>
              <h3 style={{ color: 'var(--accent-rose)', marginBottom: '0.5rem' }}>Confirm Deletion</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                Are you sure you want to delete this post? This action cannot be undone and any uploaded photo will be removed.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={handleDelete} className="btn-danger">
                  Yes, Delete Post
                </button>
                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </GlassCard>
          )}

          {/* Contact Details Card: Visible only when logged in */}
          <GlassCard style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: 'var(--accent-amber)' }} />
              <span>Poster Contact Information</span>
            </h3>

            {canViewContact && item.postedBy ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <User size={16} style={{ opacity: 0.7 }} />
                  <span style={{ fontSize: '1rem', fontWeight: 600 }}>{item.postedBy.name}</span>
                </div>

                {item.postedBy.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Mail size={16} style={{ opacity: 0.7 }} />
                    <a
                      href={`mailto:${item.postedBy.email}`}
                      style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}
                    >
                      {item.postedBy.email}
                    </a>
                  </div>
                )}

                {item.postedBy.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Phone size={16} style={{ opacity: 0.7 }} />
                    <a
                      href={`tel:${item.postedBy.phone}`}
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {item.postedBy.phone}
                    </a>
                  </div>
                )}

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Please reach out politely and arrange handover in a safe, public campus location (e.g., Central Library reception or Student Center).
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Lock size={22} style={{ color: 'var(--accent-amber)' }} />
                  <div>
                    <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                      Contact details protected
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Log in to your campus account to view this student's email and phone number.
                    </p>
                  </div>
                </div>

                <Link
                  to="/login"
                  state={{ from: { pathname: `/items/${id}` } }}
                  className="btn-primary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                >
                  Log In to Contact
                </Link>
              </div>
            )}
          </GlassCard>

          {/* 3. Suggested Automated Similarity Matches */}
          <MatchList itemId={item._id} />
        </div>
      )}
    </div>
  );
}
