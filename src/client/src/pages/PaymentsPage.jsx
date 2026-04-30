import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CreditCard, TrendingUp, Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusColors = { initiated: '#3A86FF', partially_released: '#FFB236', fully_released: '#06D6A0', refunded: '#FF4757' };

export default function PaymentsPage() {
  const { authFetch } = useAuth();
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch('/api/payments');
        if (res.ok) {
          const d = await res.json();
          setPayments(d.data.payments || []);
          setTotalPaid(d.data.totalPaid || 0);
        }
      } catch { toast.error('Failed to load payments'); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Payments & Escrow</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>View your escrow milestone payments and transaction history</p>
      </div>

      {/* Summary Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Transacted', value: `₹${totalPaid.toLocaleString('en-IN')}`, color: '#06D6A0', icon: TrendingUp },
          { label: 'Active Escrows', value: payments.filter(p => p.status !== 'fully_released').length, color: '#FFB236', icon: Lock },
          { label: 'Completed', value: payments.filter(p => p.status === 'fully_released').length, color: '#3A86FF', icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="glass-card" style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>Loading payments...</div>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <CreditCard size={50} color="rgba(255,255,255,0.1)" />
          <p style={{ color: 'rgba(255,255,255,0.3)', marginTop: '1rem' }}>No payment records yet. Book a shipment to get started.</p>
          <Link to="/capacity" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>Find Capacity</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {payments.map(p => {
            const released = p.milestones.filter(m => m.status === 'released').reduce((s, m) => s + m.amount, 0);
            const progressPct = (released / p.totalAmount) * 100;
            return (
              <div key={p._id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <Link to={`/shipments/${p.shipmentId?._id}`} style={{ color: '#FF5A1F', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
                      {p.shipmentId?.bookingId || 'Shipment'}
                    </Link>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      {p.exporterId?.name} → {p.transporterId?.businessName || p.transporterId?.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>₹{p.totalAmount?.toLocaleString('en-IN')}</div>
                    <span style={{ fontSize: '0.73rem', padding: '2px 8px', background: `${statusColors[p.status] || '#888'}15`, color: statusColors[p.status] || '#888', borderRadius: '20px' }}>
                      {p.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
                    <span>Released: ₹{released.toLocaleString('en-IN')}</span>
                    <span>{Math.round(progressPct)}% of total</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #3A86FF, #06D6A0)', borderRadius: '8px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>

                {/* Mini milestone dots */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {p.milestones.map(m => (
                    <div key={m.name} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', margin: '0 auto 4px', background: m.status === 'released' ? '#06D6A0' : 'rgba(255,255,255,0.1)' }} />
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{m.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
