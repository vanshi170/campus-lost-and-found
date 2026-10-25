import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = Info;
        let className = 'toast-info';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          className = 'toast-success';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          className = 'toast-error';
        }

        return (
          <div key={toast.id} className={`toast ${className}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Icon size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: 'inherit', opacity: 0.7, padding: '2px', display: 'flex' }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
