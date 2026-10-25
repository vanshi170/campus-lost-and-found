import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import GlassCard from '../components/GlassCard';
import ItemCard from '../components/ItemCard';
import { CardSkeleton } from '../components/Skeleton';
import {
  HelpCircle,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    totalResolved: 0,
    itemsThisWeek: 0
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          api.get('/api/stats'),
          api.get('/api/items?limit=4&status=open')
        ]);

        if (isMounted) {
          if (statsRes.data.success) {
            setStats(statsRes.data.stats);
          }
          if (itemsRes.data.success) {
            setRecentItems(itemsRes.data.items);
          }
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-fade" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: 'center', padding: '1.25rem 1rem 1.5rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '-0.03em'
          }}
        >
          Lost something on campus?<br />
          <span style={{ color: 'var(--accent-amber)' }}>Found something?</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: '620px',
            margin: '0 auto 2.25rem auto',
            color: 'var(--text-secondary)',
            lineHeight: 1.6
          }}
        >
          The smart student network that connects lost belongings with their rightful owners through real-time category, text, and location matching.
        </p>

        {/* Two Main Glass Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/post?type=lost')}
            className="btn-primary"
            style={{
              padding: '0.9rem 1.8rem',
              fontSize: '1.05rem',
              background: 'var(--accent-rose-bg)',
              color: '#ffffff',
              border: '1px solid var(--accent-rose-border)',
              boxShadow: '0 8px 24px rgba(217, 128, 143, 0.25)'
            }}
          >
            <HelpCircle size={20} style={{ color: 'var(--accent-rose)' }} />
            <span>I Lost Something</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/post?type=found')}
            className="btn-primary"
            style={{
              padding: '0.9rem 1.8rem',
              fontSize: '1.05rem',
              background: 'var(--accent-amber-bg)',
              color: '#ffffff',
              border: '1px solid var(--accent-amber-border)',
              boxShadow: '0 8px 24px rgba(232, 181, 99, 0.25)'
            }}
          >
            <Search size={20} style={{ color: 'var(--accent-amber)' }} />
            <span>I Found Something</span>
          </button>
        </div>
      </section>

      {/* 2. LIVE CAMPUS STATS BAR */}
      <section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >
          <GlassCard style={{ padding: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Items Reported Lost
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--accent-rose)', margin: '0.3rem 0' }}>
              {stats.totalLost}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Awaiting recovery</span>
          </GlassCard>

          <GlassCard style={{ padding: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Items Reported Found
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--accent-amber)', margin: '0.3rem 0' }}>
              {stats.totalFound}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Safe in campus custody</span>
          </GlassCard>

          <GlassCard style={{ padding: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Successfully Resolved
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--accent-sage)', margin: '0.3rem 0' }}>
              {stats.totalResolved}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Reunited with owners</span>
          </GlassCard>

          <GlassCard style={{ padding: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Posted This Week
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.3rem 0' }}>
              {stats.itemsThisWeek}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active campus activity</span>
          </GlassCard>
        </div>
      </section>

      {/* 3. HOW IT WORKS 3-STEP SECTION */}
      <section style={{ maxWidth: '1050px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>How It Works</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Three simple steps to recover missing possessions on campus.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <GlassCard style={{ padding: '2rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--accent-amber)',
                marginBottom: '1rem'
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Post Your Item</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Provide title, category, campus zone, location details, and an optional photo. Takes under 60 seconds.
            </p>
          </GlassCard>

          <GlassCard style={{ padding: '2rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--accent-sage)',
                marginBottom: '1rem'
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Smart Match Engine</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Our automated matching algorithm instantly checks candidate items using Jaccard word similarity, zone proximity, and date alignment.
            </p>
          </GlassCard>

          <GlassCard style={{ padding: '2rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--accent-rose)',
                marginBottom: '1rem'
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Connect & Resolve</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Verified logged-in campus members can view contact details, verify item ownership, and mark posts as resolved.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* 4. RECENTLY POSTED ITEMS */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>Recently Posted</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Latest open reports from fellow students and staff.
            </p>
          </div>

          <Link
            to="/browse"
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <span>View All</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="skeleton-grid">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : recentItems.length === 0 ? (
          <GlassCard style={{ padding: '3rem', textAlign: 'center' }}>
            <Compass size={38} style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>No recent posts</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              Be the first to report a lost or found item today.
            </p>
          </GlassCard>
        ) : (
          <div className="items-grid">
            {recentItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
