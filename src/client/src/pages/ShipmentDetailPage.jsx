import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Truck, MapPin, Clock, Package, CreditCard, CheckCircle, Circle, ChevronLeft } from 'lucide-react';

const milestones = [
  { key: 'booked', label: 'Booked', desc: 'Booking confirmed, initial payment released', pct: 10 },
  { key: 'picked_up', label: 'Picked Up', desc: 'GPS lock at exporter address', pct: 20 },
  { key: 'in_transit', label: 'In Transit', desc: 'FASTag toll checkpoint confirmed', pct: 20 },
  { key: 'at_port', label: 'At Port', desc: 'Destination GPS lock at Mundra Port', pct: 25 },
  { key: 'delivered', label: 'Delivered', desc: 'Proof of delivery confirmed', pct: 25 },
];

const statusColors = { booked: '#3A86FF', picked_up: '#FFB236', in_transit: '#FF5A1F', at_port: '#9B59B6', delivered: '#06D6A0', cancelled: '#FF4757' };
const order = ['booked', 'picked_up', 'in_transit', 'at_port', 'delivered'];

export default function ShipmentDetailPage() {
  const { id } = useParams();
  const { authFetch, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      const res = await authFetch(`/api/shipments/${id}`);
      if (!res.ok) throw new Error();
      const d = await res.json();
      setData(d.data);
    } catch { toast.error('Failed to load shipment details'); navigate('/shipments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await authFetch(`/api/shipments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, notes: `Status updated to ${newStatus} by transporter` })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message);
      toast.success(`Status updated to ${newStatus} — Milestone payment released!`);
      setData(prev => ({ ...prev, shipment: d.data.shipment, payment: d.data.payment }));
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(false); }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading shipment...</div>;
  if (!data) return null;

  const { shipment, payment } = data;
  const currentIdx = order.indexOf(shipment.status);
  const nextStatus = currentIdx < order.length - 1 ? order[currentIdx + 1] : null;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/shipments')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ChevronLeft size={16} /> Back to Shipments
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{shipment.bookingId}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            <MapPin size={14} />
            {shipment.origin} → {shipment.destination}
          </div>
        </div>
        <span style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', background: `${statusColors[shipment.status]}15`, color: statusColors[shipment.status], borderRadius: '20px', border: `1px solid ${statusColors[shipment.status]}30`, fontWeight: 600 }}>
          {shipment.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Milestone Timeline */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="#FF5A1F" /> Escrow Milestones
            </h3>
            {milestones.map((m, i) => {
              const mStatus = payment?.milestones?.find(pm => pm.name === m.key);
              const isPast = currentIdx >= i;
              const isCurrent = currentIdx === i;
              return (
                <div key={m.key} style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: mStatus?.status === 'released' ? '#06D6A0' : isCurrent ? '#FF5A1F' : 'rgba(255,255,255,0.08)',
                      border: `2px solid ${mStatus?.status === 'released' ? '#06D6A0' : isCurrent ? '#FF5A1F' : 'rgba(255,255,255,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.4s ease'
                    }}>
                      {mStatus?.status === 'released' ? <CheckCircle size={16} color="#fff" /> : <Circle size={14} color={isCurrent ? '#fff' : 'rgba(255,255,255,0.25)'} />}
                    </div>
                    {i < milestones.length - 1 && <div style={{ width: '2px', height: '32px', background: mStatus?.status === 'released' ? '#06D6A0' : 'rgba(255,255,255,0.08)', marginTop: '4px', transition: 'background 0.4s ease' }} />}
                  </div>
                  <div style={{ paddingTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600, color: mStatus?.status === 'released' ? '#06D6A0' : isCurrent ? '#fff' : 'rgba(255,255,255,0.4)' }}>{m.label}</span>
                      <span style={{ fontSize: '0.75rem', color: '#FF5A1F', background: 'rgba(255,90,31,0.1)', padding: '1px 6px', borderRadius: '10px' }}>{m.pct}%</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{m.desc}</div>
                    {mStatus?.amount && <div style={{ color: mStatus.status === 'released' ? '#06D6A0' : 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '0.2rem', fontWeight: 500 }}>
                      ₹{mStatus.amount.toLocaleString('en-IN')} {mStatus.status === 'released' ? '✓ Released' : '🔒 Locked'}
                    </div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tracking history */}
          {shipment.trackingHistory?.length > 0 && (
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <h3 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="#3A86FF" /> Tracking History
              </h3>
              {shipment.trackingHistory.slice().reverse().map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.8rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3A86FF', marginTop: '5px', flexShrink: 0 }} />
                  <div>
                    <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{h.status.replace('_', ' ')}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{h.notes} · {new Date(h.timestamp).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Cargo Info */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <Package size={16} color="#FFB236" /> Cargo Details
            </h3>
            {[
              ['Description', shipment.cargo?.description],
              ['Volume', `${shipment.cargo?.cbm?.toFixed(3)} CBM`],
              ['Weight', `${shipment.cargo?.weight} kg`],
              ['Dimensions', `${shipment.cargo?.length}×${shipment.cargo?.width}×${shipment.cargo?.height} cm`],
              ['Quantity', shipment.cargo?.quantity],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                <span style={{ color: '#fff', fontWeight: 500, textAlign: 'right' }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          {payment && (
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={16} color="#06D6A0" /> Payment
              </h3>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem' }}>
                ₹{payment.totalAmount?.toLocaleString('en-IN')}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '1rem' }}>Total escrow amount</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Status</span>
                <span style={{ color: payment.status === 'fully_released' ? '#06D6A0' : '#FFB236', fontWeight: 500 }}>
                  {payment.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Update Status (Transporter only) */}
          {user?.role === 'transporter' && nextStatus && shipment.status !== 'cancelled' && (
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Update Status</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                Next: <strong style={{ color: '#fff' }}>{nextStatus.replace('_', ' ')}</strong> — This releases the payment milestone.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={updating}
                onClick={() => updateStatus(nextStatus)}
              >
                {updating ? 'Updating...' : `Mark as ${nextStatus.replace('_', ' ')} ▶`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
