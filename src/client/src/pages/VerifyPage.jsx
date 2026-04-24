import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ShieldCheck, Truck, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyPage() {
  const { authFetch } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ transporterId: '', vehicleNumber: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await authFetch('/api/verify/vehicle', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      setResult(data.data);
      toast.success('Verification complete!');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const scoreColor = result ? (result.overallScore >= 70 ? '#06D6A0' : result.overallScore >= 50 ? '#FFB236' : '#FF4757') : '#888';

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck color="#3A86FF" /> ULIP Verification
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Verify transporters using VAHAN, FASTag & LDB government APIs</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleVerify}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Transporter ID</label>
              <input className="input-field" type="text" placeholder="MongoDB ObjectId" required value={form.transporterId} onChange={e => setForm(p => ({ ...p, transporterId: e.target.value }))} />
            </div>
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Vehicle Number</label>
              <input className="input-field" type="text" placeholder="RJ14 CA 1234" required value={form.vehicleNumber} onChange={e => setForm(p => ({ ...p, vehicleNumber: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {loading ? <Loader size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ShieldCheck size={16} />}
            {loading ? 'Verifying...' : 'Run ULIP Verification'}
          </button>
        </form>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'VAHAN API', weight: '40%', desc: 'RC, Insurance & Fitness check' },
          { label: 'FASTag API', weight: '30%', desc: 'Location & toll routing' },
          { label: 'LDB API', weight: '30%', desc: 'Historical shipping performance' },
        ].map(({ label, weight, desc }) => (
          <div key={label} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontWeight: 600, color: '#3A86FF', marginBottom: '0.3rem' }}>{label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem' }}>{weight}</div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Results */}
      {result && (
        <div className="glass" style={{ padding: '2rem', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Verification Result</h3>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: scoreColor }}>{result.overallScore}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Overall Score</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'VAHAN', status: result.vahanStatus, score: result.vahanScore },
              { label: 'FASTag', status: result.fastagStatus, score: result.fastagScore },
              { label: 'LDB', status: result.ldbStatus, score: result.ldbScore },
            ].map(({ label, status, score }) => (
              <div key={label} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  {status === 'passed' ? <CheckCircle size={24} color="#06D6A0" /> : status === 'failed' ? <XCircle size={24} color="#FF4757" /> : <AlertCircle size={24} color="#FFB236" />}
                </div>
                <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ color: status === 'passed' ? '#06D6A0' : '#FF4757', fontSize: '0.8rem', fontWeight: 500 }}>{status?.toUpperCase()}</div>
                {score !== undefined && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.2rem' }}>Score: {score}</div>}
              </div>
            ))}
          </div>

          <div style={{ padding: '1rem', background: result.overallScore >= 70 ? 'rgba(6,214,160,0.1)' : 'rgba(255,71,87,0.1)', borderRadius: '12px', border: `1px solid ${result.overallScore >= 70 ? 'rgba(6,214,160,0.3)' : 'rgba(255,71,87,0.3)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: result.overallScore >= 70 ? '#06D6A0' : '#FF4757', fontWeight: 600 }}>
              {result.overallScore >= 70 ? <CheckCircle size={18} /> : <XCircle size={18} />}
              {result.overallScore >= 70 ? 'Transporter VERIFIED — Safe to proceed' : 'Transporter FAILED verification — Not recommended'}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
