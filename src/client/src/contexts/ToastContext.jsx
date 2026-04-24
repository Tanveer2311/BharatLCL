import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const colors = {
    success: '#06D6A0', error: '#FF4757', info: '#3A86FF', warning: '#FFB236'
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '360px' }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: 'rgba(15,15,20,0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${colors[t.type]}40`,
              borderLeft: `4px solid ${colors[t.type]}`,
              borderRadius: '12px',
              padding: '1rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${colors[t.type]}20`
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{icons[t.type]}</span>
            <span style={{ color: '#fff', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}>{t.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
