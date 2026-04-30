import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Truck, MapPin, ChevronRight, Package, Clock } from 'lucide-react';

const statusColors = { booked: '#3A86FF', picked_up: '#FFB236', in_transit: '#FF5A1F', at_port: '#9B59B6', delivered: '#06D6A0', cancelled: '#FF4757' };
const statusLabels = { booked: 'Booked', picked_up: 'Picked Up', in_transit: 'In Transit', at_port: 'At Port', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function ShipmentsPage() {
  const { authFetch } = useAuth();
  const toast = useToast();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch('/api/shipments?limit=50');
        if (res.ok) { const d = await res.json(); setShipments(d.data.shipments); }
        else throw new Error();
      } catch { toast.error('Failed to load shipments'); }
      finally { setLoading(false); }
    })();
  }, [authFetch]);

  const filtered = filter === 'all' ? shipments : shipments.filter(s => s.status === filter);

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>My Shipments</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Track and manage all your logistics operations</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'booked', 'in_transit', 'at_port', 'delivered'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
              background: filter === f ? '#FF5A1F' : 'rgba(255,255,255,0.05)',
              color: filter === f ? '#fff' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s'
            }}
          >
            {f === 'all' ? 'All' : statusLabels[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>Loading shipments...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Package size={50} color="rgba(255,255,255,0.1)" />
          <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: '1rem' }}>No shipments found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(s => (
            <Link key={s._id} to={`/shipments/${s._id}`} style={{ textDecoration: 'none' }}>
              <div className="glass" style={{ padding: '1.2rem 1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'border-color 0.2s', border: `1px solid rgba(255,255,255,0.08)` }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${statusColors[s.status]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Truck size={20} color={statusColors[s.status]} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{s.bookingId}</span>
                    <span style={{ fontSize: '0.73rem', padding: '2px 8px', background: `${statusColors[s.status]}15`, color: statusColors[s.status], borderRadius: '20px', border: `1px solid ${statusColors[s.status]}30` }}>
                      {statusLabels[s.status]}
                    </span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span><MapPin size={12} style={{ marginRight: '3px' }} />{s.origin} → {s.destination}</span>
                    <span><Clock size={12} style={{ marginRight: '3px' }} />{new Date(s.createdAt).toLocaleDateString('en-IN')}</span>
                    {s.cargo && <span>{s.cargo.cbm?.toFixed(2)} CBM · {s.cargo.weight}kg</span>}
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', textAlign: 'right', flexShrink: 0 }}>
                  {s.transporterId?.businessName || s.transporterId?.name}
                  <ChevronRight size={16} style={{ display: 'block', marginLeft: 'auto', marginTop: '0.3rem' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
