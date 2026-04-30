import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Plus, Truck, Calendar, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AddCapacityPage() {
  const { authFetch } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    totalCBM: '', pricePerCBM: '', departureDate: '', estimatedArrival: '',
    origin: 'Jaipur', destination: 'Mundra', vehicleNumber: '',
    cargoTypes: ['general']
  });
  const [loading, setLoading] = useState(false);

  const cargoOptions = ['general', 'fragile', 'hazardous', 'refrigerated', 'textile', 'handicraft', 'gems'];

  const toggleCargo = (type) => {
    setForm(p => ({
      ...p,
      cargoTypes: p.cargoTypes.includes(type)
        ? p.cargoTypes.filter(c => c !== type)
        : [...p.cargoTypes, type]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authFetch('/api/capacity/slots', {
        method: 'POST',
        body: JSON.stringify({ ...form, totalCBM: +form.totalCBM, pricePerCBM: +form.pricePerCBM })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      toast.success('Container capacity listed successfully!');
      navigate('/capacity');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>List Container Capacity</h1>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>Add available LCL space for exporters to discover and book.</p>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label"><Package size={13} style={{ marginRight: '4px' }} />Total CBM Available</label>
              <input type="number" min="1" step="0.5" className="input-field" placeholder="e.g. 20" required value={form.totalCBM} onChange={e => setForm(p => ({ ...p, totalCBM: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Price per CBM (₹)</label>
              <input type="number" min="1" className="input-field" placeholder="e.g. 1850" required value={form.pricePerCBM} onChange={e => setForm(p => ({ ...p, pricePerCBM: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label"><Calendar size={13} style={{ marginRight: '4px' }} />Departure Date</label>
              <input type="date" className="input-field" required value={form.departureDate} onChange={e => setForm(p => ({ ...p, departureDate: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Estimated Arrival</label>
              <input type="date" className="input-field" value={form.estimatedArrival} onChange={e => setForm(p => ({ ...p, estimatedArrival: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Origin City</label>
              <input type="text" className="input-field" placeholder="Jaipur" value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Destination Port</label>
              <input type="text" className="input-field" placeholder="Mundra" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label"><Truck size={13} style={{ marginRight: '4px' }} />Vehicle Number</label>
              <input type="text" className="input-field" placeholder="RJ14 CA 1234" value={form.vehicleNumber} onChange={e => setForm(p => ({ ...p, vehicleNumber: e.target.value }))} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label">Accepted Cargo Types</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {cargoOptions.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleCargo(type)}
                  style={{
                    padding: '0.4rem 0.9rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                    border: `1px solid ${form.cargoTypes.includes(type) ? '#FF5A1F' : 'rgba(255,255,255,0.1)'}`,
                    background: form.cargoTypes.includes(type) ? 'rgba(255,90,31,0.15)' : 'rgba(255,255,255,0.02)',
                    color: form.cargoTypes.includes(type) ? '#FF5A1F' : 'rgba(255,255,255,0.45)',
                    transition: 'all 0.2s'
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', fontSize: '1rem' }} disabled={loading}>
            <Plus size={18} />{loading ? 'Listing...' : 'List Capacity'}
          </button>
        </form>
      </div>
    </div>
  );
}
