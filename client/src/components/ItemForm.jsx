import React, { useState, useRef } from 'react';
import GlassCard from './GlassCard';
import {
  UploadCloud,
  X,
  HelpCircle,
  Search,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'ID & Cards',
  'Bags',
  'Keys',
  'Books & Stationery',
  'Clothing',
  'Accessories',
  'Other'
];

const CAMPUS_ZONES = [
  'Library',
  'Canteen',
  'Hostel',
  'Academic Block',
  'Sports Ground',
  'Parking',
  'Auditorium',
  'Other'
];

export default function ItemForm({
  initialData = {},
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Publish Post'
}) {
  const [type, setType] = useState(initialData.type || 'lost');
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [category, setCategory] = useState(initialData.category || 'Electronics');
  const [color, setColor] = useState(initialData.color || '');
  const [locationName, setLocationName] = useState(initialData.locationName || '');
  const [campusZone, setCampusZone] = useState(initialData.campusZone || 'Library');
  const [dateOccurred, setDateOccurred] = useState(() => {
    if (initialData.dateOccurred) {
      return new Date(initialData.dateOccurred).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData.imageUrl || '');
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // Maximum allowed date is today
  const today = new Date().toISOString().split('T')[0];

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (3 MB)
    if (file.size > 3 * 1024 * 1024) {
      setError('Selected image exceeds the 3 MB limit. Please choose a smaller file.');
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are supported.');
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveExistingImage(false);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setRemoveExistingImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !locationName.trim()) {
      setError('Please provide a title, description, and specific location.');
      return;
    }

    setError('');

    // Prepare multipart form data
    const formData = new FormData();
    formData.append('type', type);
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('color', color.trim());
    formData.append('locationName', locationName.trim());
    formData.append('campusZone', campusZone);
    formData.append('dateOccurred', dateOccurred);

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (removeExistingImage) {
      formData.append('removeImage', 'true');
    }

    onSubmit(formData);
  };

  return (
    <GlassCard className="item-form-container">
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              borderRadius: 'var(--radius-input)',
              background: 'var(--accent-error-bg)',
              color: '#ffd8d8',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.9rem'
            }}
          >
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Type Selector Toggle */}
        <div className="type-selector-pills">
          <button
            type="button"
            className={`type-pill-btn ${type === 'lost' ? 'active-lost' : ''}`}
            onClick={() => setType('lost')}
          >
            <HelpCircle size={20} />
            <span>I Lost Something</span>
          </button>
          <button
            type="button"
            className={`type-pill-btn ${type === 'found' ? 'active-found' : ''}`}
            onClick={() => setType('found')}
          >
            <Search size={20} />
            <span>I Found Something</span>
          </button>
        </div>

        {/* 2. Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            Item Title *
          </label>
          <input
            id="title"
            type="text"
            className="glass-input"
            placeholder={
              type === 'lost'
                ? 'e.g. Black HP 15-inch Laptop Bag'
                : 'e.g. Blue boAt Wireless Headphones'
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        {/* 3. Category & Color */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Category *
            </label>
            <select
              id="category"
              className="glass-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="color">
              Primary Color (optional)
            </label>
            <input
              id="color"
              type="text"
              className="glass-input"
              placeholder="e.g. Matte Black, Navy Blue"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              maxLength={40}
            />
          </div>
        </div>

        {/* 4. Campus Zone & Specific Location */}
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="campusZone">
              Campus Zone *
            </label>
            <select
              id="campusZone"
              className="glass-select"
              value={campusZone}
              onChange={(e) => setCampusZone(e.target.value)}
            >
              {CAMPUS_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="locationName">
              Specific Location *
            </label>
            <input
              id="locationName"
              type="text"
              className="glass-input"
              placeholder="e.g. 2nd floor quiet reading hall, Desk 14"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
              maxLength={120}
            />
          </div>
        </div>

        {/* 5. Date Occurred */}
        <div className="form-group">
          <label className="form-label" htmlFor="dateOccurred">
            Date {type === 'lost' ? 'Lost' : 'Found'} *
          </label>
          <input
            id="dateOccurred"
            type="date"
            className="glass-input"
            value={dateOccurred}
            max={today}
            onChange={(e) => setDateOccurred(e.target.value)}
            required
          />
        </div>

        {/* 6. Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Detailed Description *
          </label>
          <textarea
            id="description"
            className="glass-textarea"
            rows={4}
            placeholder="Include distinctive marks, stickers, serial numbers, scratches, or contents inside..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            maxLength={1000}
          />
        </div>

        {/* 7. Image Upload */}
        <div className="form-group">
          <label className="form-label">Item Photo (Optional, max 3 MB)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleImageChange}
            id="item-photo-upload"
          />

          {!imagePreview ? (
            <div
              className="file-dropzone"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <UploadCloud size={32} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                Click to browse or drop photo here
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                JPG, PNG, or WebP up to 3 MB
              </p>
            </div>
          ) : (
            <div>
              <div className="file-preview-wrap">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="file-remove-btn"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Photo attached. Click the (X) icon to replace or delete.
              </p>
            </div>
          )}
        </div>

        {/* 8. Submit button */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ minWidth: '160px' }}
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}
