import React from 'react';
import GlassCard from './GlassCard';
import { Search, RotateCcw, Calendar, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'All',
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
  'All',
  'Library',
  'Canteen',
  'Hostel',
  'Academic Block',
  'Sports Ground',
  'Parking',
  'Auditorium',
  'Other'
];

export default function FilterBar({ filters, onChange, onClear }) {
  const handleTypeChange = (newType) => {
    onChange({ ...filters, type: newType, page: 1 });
  };

  const handleInputChange = (field, value) => {
    onChange({ ...filters, [field]: value, page: 1 });
  };

  return (
    <GlassCard className="filter-bar">
      {/* Top Row: Search and Type Pills */}
      <div className="filter-search-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-input-icon" />
          <input
            type="text"
            className="glass-input"
            placeholder="Search keywords, items, or locations (e.g. laptop, room 204)..."
            value={filters.q || ''}
            onChange={(e) => handleInputChange('q', e.target.value)}
          />
        </div>

        <div className="filter-type-toggles" role="group" aria-label="Item Type Filter">
          <button
            type="button"
            className={`filter-type-btn ${!filters.type || filters.type === 'all' ? 'active' : ''}`}
            onClick={() => handleTypeChange('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`filter-type-btn ${filters.type === 'lost' ? 'active' : ''}`}
            onClick={() => handleTypeChange('lost')}
            style={filters.type === 'lost' ? { color: 'var(--accent-rose)' } : {}}
          >
            Lost
          </button>
          <button
            type="button"
            className={`filter-type-btn ${filters.type === 'found' ? 'active' : ''}`}
            onClick={() => handleTypeChange('found')}
            style={filters.type === 'found' ? { color: 'var(--accent-amber)' } : {}}
          >
            Found
          </button>
        </div>
      </div>

      {/* Bottom Row: Category, Zone, Status, Dates, Clear */}
      <div className="filter-selects-row">
        {/* Category Dropdown */}
        <div className="filter-item">
          <select
            className="glass-select"
            value={filters.category || 'All'}
            onChange={(e) => handleInputChange('category', e.target.value)}
            aria-label="Filter by Category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Campus Zone Dropdown */}
        <div className="filter-item">
          <select
            className="glass-select"
            value={filters.campusZone || 'All'}
            onChange={(e) => handleInputChange('campusZone', e.target.value)}
            aria-label="Filter by Campus Zone"
          >
            {CAMPUS_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone === 'All' ? 'All Campus Zones' : zone}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="filter-item">
          <select
            className="glass-select"
            value={filters.status || 'open'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="open">Status: Open</option>
            <option value="resolved">Status: Resolved</option>
            <option value="all">Status: All Posts</option>
          </select>
        </div>

        {/* Date Range Container */}
        <div className="filter-dates-wrap">
          <Calendar size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="date"
            className="filter-date-field"
            value={filters.from || ''}
            onChange={(e) => handleInputChange('from', e.target.value)}
            title="Date from"
            aria-label="Filter from date"
          />
          <span className="filter-date-sep">to</span>
          <input
            type="date"
            className="filter-date-field"
            value={filters.to || ''}
            onChange={(e) => handleInputChange('to', e.target.value)}
            title="Date to"
            aria-label="Filter to date"
          />
        </div>

        {/* Reset button */}
        <button
          type="button"
          onClick={onClear}
          className="filter-clear-btn"
          title="Reset all filters"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>
    </GlassCard>
  );
}
