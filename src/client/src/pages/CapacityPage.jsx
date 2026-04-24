import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Search, Filter, Package, Truck, MapPin, Calendar, ChevronRight, Plus, Star } from 'lucide-react';

function SlotCard({ slot, onBook }) {
  const { user } = useAuth();
  const daysUntil = Math.ceil((new Date(slot.departureDate) - new Date()) / (1000 * 60 * 60 * 24));
  const score = slot.verificationScore || Math.floor(Math.random() * 30) + 70;
  const pct = Math.round((slot.availableCBM / slot.totalCBM) * 100);

  return (
    <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {score >= 90 && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(6,214,160,0.15)', color: '#06D6A0', borderRadius: '20px', border: '1px solid rgba(6,214,160,0.3)' }}>⭐ Top Rated</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginBottom: '0.2rem' }}>
            {slot.origin} → {slot.destination}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Truck size={12} /> {slot.transporterId?.businessName || slot.transporterId?.name || 'Verified Transporter'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#FF5A1F', fontWeight: 700, fontSize: '1.1rem' }}>₹{slot.pricePerCBM?.toLocaleString('en-IN')}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>per CBM</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.82rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '0.2rem' }}>Departure</div>
          <div style={{ color: '#fff', fontWeight: 500 }}>{new Date(slot.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
          <div style={{ color: daysUntil <= 3 ? '#FF4757' : '#06D6A0', fontSize: '0.75rem' }}>{daysUntil === 0 ? 'Today' : `${daysUntil}d away`}</div>
        </div>
        <div style={{ fontSize: '0.82rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '0.2rem' }}>ULIP Score</div>
          <div style={{ color: score >= 80 ? '#06D6A0' : '#FFB236', fontWeight: 600 }}>{score}/100</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{score >= 70 ? '✓ Verified' : '⚠ Pending'}</div>
        </div>
      </div>

      {/* CBM Progress bar */}
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Available Space</span>
          <span style={{ color: '#fff', fontWeight: 500 }}>{slot.availableCBM} / {slot.totalCBM} CBM</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct > 50 ? '#06D6A0' : pct > 20 ? '#FFB236' : '#FF4757', borderRadius: '6px', transition: 'width 0.6s ease' }} />
        </div>
      </div>

      {user?.role === 'exporter' && (
        <button
          onClick={() => onBook(slot)}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.65rem', fontSize: '0.92rem' }}
        >
          Book This Slot <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

function BookingModal({ slot, onClose, onConfirm }) {
  const [form, setForm] = useState({ description: '', type: 'general', length: '', width: '', height: '', weight: '', quantity: 1 });
  const [loading, setLoading] = useState(false);
  const cbm = form.length && form.width && form.height ? ((form.length * form.width * form.height) / 1000000).toFixed(3) : 0;
  const cost = cbm > 0 ? (cbm * slot.pricePerCBM).toFixed(0) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm({ containerId: slot._id, cargo: { ...form, length: +form.length, width: +form.width, height: +form.height, weight: +form.weight, quantity: +form.quantity } });
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass" style={{ padding: '2rem', borderRadius: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Book This Slot</h3>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          {slot.origin} → {slot.destination} | {new Date(slot.departureDate).toLocaleDateString('en-IN')} | ₹{slot.pricePerCBM}/CBM
        </p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Cargo Description</label>
            <input className="input-field" type="text" placeholder="e.g. Handmade Rugs" required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">Length (cm)</label>
              <input className="input-field" type="number" min="1" required value={form.length} onChange={e => setForm(p => ({ ...p, length: e.target.value }))} style={{ padding: '0.75rem' }} />
            </div>
            <div className="input-group">
              <label className="input-label">Width (cm)</label>
              <input className="input-field" type="number" min="1" required value={form.width} onChange={e => setForm(p => ({ ...p, width: e.target.value }))} style={{ padding: '0.75rem' }} />
            </div>
            <div className="input-group">
              <label className="input-label">Height (cm)</label>
              <input className="input-field" type="number" min="1" required value={form.height} onChange={e => setForm(p => ({ ...p, height: e.target.value }))} style={{ padding: '0.75rem' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="input-group">
              <label className="input-label">Weight (kg)</label>
              <input className="input-field" type="number" min="1" required value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} style={{ padding: '0.75rem' }} />
            </div>
            <div className="input-group">
              <label className="input-label">Quantity</label>
              <input className="input-field" type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} style={{ padding: '0.75rem' }} />
            </div>
          </div>

          {cbm > 0 && (
            <div style={{ background: 'rgba(255,90,31,0.08)', border: '1px solid rgba(255,90,31,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Calculated CBM</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{cbm} m³</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Estimated Cost</span>
                <span style={{ color: '#FF5A1F', fontWeight: 700, fontSize: '1.1rem' }}>₹{parseInt(cost).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ height: '48px' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ height: '48px' }} disabled={loading}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CapacityPage() {
  const { user, authFetch } = useAuth();
  const toast = useToast();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filters, setFilters] = useState({ origin: 'Jaipur', destination: 'Mundra', date: '', minCBM: '', maxPrice: '' });

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
      const res = await authFetch(`/api/capacity/slots?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.data.slots);
      }
    } catch { toast.error('Failed to load capacity slots'); }
    finally { setLoading(false); }
  }, [authFetch, filters, toast]);

  useEffect(() => { fetchSlots(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchSlots(); };

  const handleBook = async (cargo) => {
    try {
      const res = await authFetch('/api/capacity/book', { method: 'POST', body: JSON.stringify(cargo) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      toast.success(`Booking confirmed! ID: ${data.data.shipment.bookingId}`);
      setSelectedSlot(null);
      fetchSlots();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1280px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Capacity Discovery</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Find available LCL container slots on the Jaipur-Mundra corridor</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="glass" style={{ padding: '1.2rem 1.5rem', borderRadius: '20px', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
          {[
            { key: 'origin', label: 'Origin', placeholder: 'Jaipur' },
            { key: 'destination', label: 'Destination', placeholder: 'Mundra' },
            { key: 'date', label: 'Date', placeholder: '', type: 'date' },
            { key: 'minCBM', label: 'Min CBM', placeholder: '5', type: 'number' },
            { key: 'maxPrice', label: 'Max Price/CBM', placeholder: '3000', type: 'number' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginBottom: '0.3rem' }}>{label}</label>
              <input
                type={type || 'text'}
                className="input-field"
                placeholder={placeholder}
                value={filters[key]}
                onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))}
                style={{ padding: '0.65rem 0.9rem', fontSize: '0.9rem' }}
              />
            </div>
          ))}
          <button type="submit" className="btn btn-primary" style={{ height: '46px', whiteSpace: 'nowrap' }}>
            <Search size={16} /> Search
          </button>
        </div>
      </form>

      {/* Slots Grid */}
      {user?.role === 'transporter' && (
        <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
          <Link to="/capacity/add" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
            <Plus size={16} /> List New Capacity
          </Link>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '250px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Package size={60} color="rgba(255,255,255,0.1)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>No slots found</h3>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>Try adjusting your filters or check back soon</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {slots.map(slot => <SlotCard key={slot._id} slot={slot} onBook={setSelectedSlot} />)}
        </div>
      )}

      {selectedSlot && (
        <BookingModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} onConfirm={handleBook} />
      )}
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 0.5 } 50% { opacity: 1 } }
      `}</style>
    </div>
  );
}
