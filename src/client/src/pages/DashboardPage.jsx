import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Truck, Package, CreditCard, TrendingUp, ArrowRight, Clock, CheckCircle, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>{value}</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{label}</div>
      {sub && <div style={{ color, fontSize: '0.78rem', marginTop: '0.4rem' }}>{sub}</div>}
    </div>
  );
}

const statusColors = { booked: '#3A86FF', picked_up: '#FFB236', in_transit: '#FF5A1F', at_port: '#9B59B6', delivered: '#06D6A0', cancelled: '#FF4757' };
const statusLabels = { booked: 'Booked', picked_up: 'Picked Up', in_transit: 'In Transit', at_port: 'At Port', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function DashboardPage() {
  const { user, authFetch } = useAuth();
  const toast = useToast();
  const [shipments, setShipments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          authFetch('/api/shipments?limit=5'),
          authFetch('/api/payments')
        ]);
        if (sRes.ok) { const d = await sRes.json(); setShipments(d.data.shipments || []); }
        if (pRes.ok) { const d = await pRes.json(); setPayments(d.data.payments || []); }
      } catch { toast.error('Failed to load dashboard data'); }
      finally { setLoading(false); }
    };
    load();
  }, [authFetch, toast]);

  const totalPaid = payments.reduce((sum, p) => {
    return sum + p.milestones.filter(m => m.status === 'released').reduce((s, m) => s + m.amount, 0);
  }, 0);

  const activeShipments = shipments.filter(s => !['delivered', 'cancelled'].includes(s.status)).length;

  const isExporter = user?.role === 'exporter';
  const isTransporter = user?.role === 'transporter';

  const roleColors = { exporter: '#FF5A1F', transporter: '#3A86FF', admin: '#06D6A0' };
  const roleColor = roleColors[user?.role] || '#FF5A1F';

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Welcome banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>
            Welcome, <span style={{ color: roleColor }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
            {user?.businessName ? user.businessName : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            {user?.gstNumber && <span style={{ marginLeft: '0.5rem', color: '#06D6A0', fontSize: '0.8rem' }}>· GST Verified ✓</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isExporter && <Link to="/capacity" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}><Package size={16} /> Book Capacity</Link>}
          {isTransporter && <Link to="/capacity/add" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}><Truck size={16} /> List Capacity</Link>}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={Truck} label="Total Shipments" value={shipments.length} color="#FF5A1F" sub={activeShipments > 0 ? `${activeShipments} active` : 'All delivered'} />
        <StatCard icon={Package} label="Active Shipments" value={activeShipments} color="#3A86FF" />
        <StatCard icon={CreditCard} label={isExporter ? 'Total Paid' : 'Total Earned'} value={`₹${totalPaid.toLocaleString('en-IN')}`} color="#06D6A0" />
        <StatCard icon={TrendingUp} label="Cost Savings" value="~35%" color="#FFB236" sub="vs. FCL shipping" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
        {/* Recent Shipments */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Recent Shipments</h3>
            <Link to="/shipments" style={{ color: '#FF5A1F', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>View All <ChevronRight size={14} /></Link>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.3)' }}>Loading...</div>
          ) : shipments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Package size={40} color="rgba(255,255,255,0.15)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>No shipments yet</p>
              {isExporter && <Link to="/capacity" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>Find Capacity</Link>}
            </div>
          ) : (
            shipments.map(s => (
              <Link key={s._id} to={`/shipments/${s._id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', transition: 'background 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${statusColors[s.status]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={16} color={statusColors[s.status]} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 500, fontSize: '0.9rem' }}>{s.bookingId}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{s.cargo?.description?.slice(0, 30) || 'Cargo'}…</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '3px 10px', background: `${statusColors[s.status]}15`, color: statusColors[s.status], borderRadius: '20px', border: `1px solid ${statusColors[s.status]}30` }}>
                  {statusLabels[s.status]}
                </span>
              </Link>
            ))
          )}
        </div>

        {/* Payment Milestones / Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', flex: 1 }}>
            <h3 style={{ margin: '0 0 1.2rem', fontSize: '1rem' }}>Quick Actions</h3>
            {[
              isExporter ? { to: '/capacity', label: 'Search Capacity', icon: Package, color: '#FF5A1F' } : { to: '/capacity/add', label: 'Add Container', icon: Truck, color: '#FF5A1F' },
              { to: '/shipments', label: 'Track Shipments', icon: MapPin, color: '#3A86FF' },
              { to: '/payments', label: 'View Payments', icon: CreditCard, color: '#06D6A0' },
              { to: '/documents', label: 'My Documents', icon: CheckCircle, color: '#FFB236' },
            ].map(({ to, label, icon: Icon, color }) => (
              <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.5rem', textDecoration: 'none', transition: 'background 0.2s', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 500 }}>
                <Icon size={18} color={color} />
                {label}
                <ArrowRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
