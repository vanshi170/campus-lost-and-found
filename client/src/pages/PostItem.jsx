import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ItemForm from '../components/ItemForm';
import { useToast } from '../context/ToastContext';
import { PlusCircle } from 'lucide-react';

export default function PostItem() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'found' ? 'found' : 'lost';

  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success && res.data.item) {
        showToast('Item posted successfully! Checking for matches...', 'success');
        // Redirect to detail page with match highlighting
        navigate(`/items/${res.data.item._id}?newlyPosted=true`);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to post item. Please check your inputs.';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-fade" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
          <PlusCircle size={26} style={{ color: 'var(--accent-amber)' }} />
          <span>Report an Item</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          Enter the details below. Our campus matching engine will immediately check for probable matches.
        </p>
      </div>

      <ItemForm
        initialData={{ type: initialType }}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Publish Campus Post"
      />
    </div>
  );
}
