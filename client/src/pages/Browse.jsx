import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import FilterBar from '../components/FilterBar';
import ItemCard from '../components/ItemCard';
import { GridSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filters from URL or default
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    category: searchParams.get('category') || 'All',
    campusZone: searchParams.get('campusZone') || 'All',
    status: searchParams.get('status') || 'open',
    q: searchParams.get('q') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    page: parseInt(searchParams.get('page'), 10) || 1,
    limit: 12
  });

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Sync state to searchParams
  const syncParams = useCallback((newFilters) => {
    const params = {};
    if (newFilters.type && newFilters.type !== 'all') params.type = newFilters.type;
    if (newFilters.category && newFilters.category !== 'All') params.category = newFilters.category;
    if (newFilters.campusZone && newFilters.campusZone !== 'All') params.campusZone = newFilters.campusZone;
    if (newFilters.status && newFilters.status !== 'all') params.status = newFilters.status;
    if (newFilters.q) params.q = newFilters.q;
    if (newFilters.from) params.from = newFilters.from;
    if (newFilters.to) params.to = newFilters.to;
    if (newFilters.page > 1) params.page = newFilters.page.toString();

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch items from Node API
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: filters.limit,
        page: filters.page,
        status: filters.status
      };

      if (filters.type && filters.type !== 'all') params.type = filters.type;
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.campusZone && filters.campusZone !== 'All') params.campusZone = filters.campusZone;
      if (filters.q) params.q = filters.q;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await api.get('/api/items', { params });
      if (res.data.success) {
        setItems(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    syncParams(newFilters);
  };

  const handleClearFilters = () => {
    const cleared = {
      type: 'all',
      category: 'All',
      campusZone: 'All',
      status: 'open',
      q: '',
      from: '',
      to: '',
      page: 1,
      limit: 12
    };
    setFilters(cleared);
    syncParams(cleared);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const updated = { ...filters, page: newPage };
    setFilters(updated);
    syncParams(updated);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-fade">
      {/* Page Title & Count */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>Browse Campus Items</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Search across all reported lost and found items on campus.
          </p>
        </div>

        {!loading && (
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing {items.length} of {total} item{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Item Grid or Empty / Skeleton State */}
      {loading ? (
        <GridSkeleton count={8} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No items matched your filters"
          description="Try broadening your search keywords or resetting your category/zone filters to see all campus posts."
          actionLabel="Reset All Filters"
          onActionClick={handleClearFilters}
        />
      ) : (
        <>
          <div className="items-grid">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-wrap">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page <= 1}
                aria-label="Previous Page"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Keep pagination compact if many pages
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= filters.page - 1 && pageNum <= filters.page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`pagination-btn ${pageNum === filters.page ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === filters.page - 2 ||
                  pageNum === filters.page + 2
                ) {
                  return (
                    <span key={pageNum} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page >= totalPages}
                aria-label="Next Page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
