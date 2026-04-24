import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FileText, Download, Package, Loader } from 'lucide-react';

export default function DocumentsPage() {
  const { authFetch } = useAuth();
  const toast = useToast();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch('/api/shipments?limit=20');
        if (res.ok) { const d = await res.json(); setShipments(d.data.shipments || []); }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const generateDoc = async (shipmentId, type) => {
    setGenerating(`${shipmentId}-${type}`);
    try {
      const res = await authFetch(`/api/documents/generate`, {
        method: 'POST',
        body: JSON.stringify({ shipmentId, type })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message);
      toast.success(`${type} generated! Document ready in your account.`);
    } catch (err) {
      toast.error(err.message || 'Document generation failed');
    } finally { setGenerating(null); }
  };

  const docTypes = [
    { key: 'shipping_bill', label: 'Shipping Bill', desc: 'Official customs export document' },
    { key: 'packing_list', label: 'Packing List', desc: 'Detailed cargo packing manifest' },
    { key: 'commercial_invoice', label: 'Commercial Invoice', desc: 'Invoice for international trade' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText color="#FFB236" /> Documents
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Auto-generate shipping bills, packing lists, and invoices for your shipments</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
          <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', marginBottom: '0.5rem' }} />
          Loading shipments...
        </div>
      ) : shipments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Package size={50} color="rgba(255,255,255,0.1)" />
          <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: '1rem' }}>No shipments available for document generation.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {shipments.map(s => (
            <div key={s._id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{s.bookingId}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>{s.cargo?.description} · {s.origin} → {s.destination}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {docTypes.map(({ key, label, desc }) => {
                  const isGen = generating === `${s._id}-${key}`;
                  return (
                    <button
                      key={key}
                      onClick={() => generateDoc(s._id, key)}
                      disabled={!!generating}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.1rem', borderRadius: '12px', cursor: 'pointer',
                        background: 'rgba(255,178,54,0.08)', border: '1px solid rgba(255,178,54,0.2)',
                        color: '#FFB236', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s'
                      }}
                    >
                      {isGen ? <Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Download size={14} />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
