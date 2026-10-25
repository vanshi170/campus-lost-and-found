import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';
import StatusBadge from './StatusBadge';
import {
  MapPin,
  Calendar,
  Laptop,
  CreditCard,
  Briefcase,
  Key,
  BookOpen,
  Shirt,
  Sparkles,
  Package
} from 'lucide-react';

// Map categories to appropriate clean Lucide icons
const categoryIcons = {
  Electronics: Laptop,
  'ID & Cards': CreditCard,
  Bags: Briefcase,
  Keys: Key,
  'Books & Stationery': BookOpen,
  Clothing: Shirt,
  Accessories: Sparkles,
  Other: Package
};

export default function ItemCard({ item }) {
  if (!item) return null;

  const [imgError, setImgError] = useState(false);
  const CategoryIcon = categoryIcons[item.category] || Package;

  // Format date readable
  const formattedDate = item.dateOccurred
    ? new Date(item.dateOccurred).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <Link to={`/items/${item._id}`} style={{ textDecoration: 'none' }}>
      <GlassCard interactive className="item-card">
        {/* Photo Container */}
        <div className="item-card-image-wrap">
          <div className="item-badge-corner">
            <StatusBadge type={item.type} />
          </div>

          {item.status === 'resolved' && (
            <div className="item-status-corner">
              <StatusBadge status="resolved" />
            </div>
          )}

          {item.imageUrl && !imgError ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="item-card-img"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="item-card-placeholder">
              <CategoryIcon size={42} strokeWidth={1.4} />
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>No photo attached</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="item-card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <CategoryIcon size={14} />
            <span>{item.category}</span>
            {item.color && (
              <>
                <span>•</span>
                <span>{item.color}</span>
              </>
            )}
          </div>

          <h3 className="item-card-title">{item.title}</h3>

          <p className="item-card-description">{item.description}</p>

          <div className="item-card-meta">
            <div className="item-card-meta-row">
              <MapPin size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.campusZone} ({item.locationName})
              </span>
            </div>
            <div className="item-card-meta-row">
              <Calendar size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
