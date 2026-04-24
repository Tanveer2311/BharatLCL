import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Truck, ArrowRight, Eye, EyeOff, Building2, Phone, Hash } from 'lucide-react';

const roles = [
  { value: 'exporter', label: '📦 Exporter', desc: 'Book LCL space & track shipments' },
  { value: 'transporter', label: '🚛 Transporter', desc: 'List capacity & manage logistics' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: '', mobileNumber: '', businessName: '', gstNumber: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 2-step form

  const updateForm = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.role) return toast.error('Please select your role.');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({
        name: form.name, email: form.email, password: form.password,
        role: form.role, mobileNumber: form.mobileNumber,
        businessName: form.businessName || undefined,
        gstNumber: form.gstNumber || undefined
      });
      toast.success(`Welcome to BharatLCL, ${user.name.split(' ')[0]}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(58,134,255,0.1) 0%, transparent 70%)', top: '-300px', left: '-300px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,90,31,0.08) 0%, transparent 70%)', bottom: '-200px', right: '-200px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '480px', animation: 'fadeIn 0.6s ease' }}>
        <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #FF5A1F, #FF8A00)', borderRadius: '10px', padding: '7px 9px', display: 'flex' }}>
                <Truck size={22} color="white" />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Bharat<span style={{ color: '#FF5A1F' }}>LCL</span></span>
            </div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Create Account</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>Step {step} of 2 — {step === 1 ? 'Account Details' : 'Business Details'}</p>
          </div>

          {/* Progress bar */}
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '2rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', background: 'linear-gradient(90deg, #FF5A1F, #FF8A00)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1}>
              {/* Role Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">I am a...</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {roles.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => updateForm('role', r.value)}
                      style={{
                        padding: '1rem', borderRadius: '14px', border: `2px solid ${form.role === r.value ? '#FF5A1F' : 'rgba(255,255,255,0.1)'}`,
                        background: form.role === r.value ? 'rgba(255,90,31,0.12)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{r.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" className="input-field" placeholder="Ramesh Kumar" value={form.name} onChange={e => updateForm('name', e.target.value)} required />
              </div>

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" className="input-field" placeholder="your@email.com" value={form.email} onChange={e => updateForm('email', e.target.value)} required />
              </div>

              <div className="input-group" style={{ position: 'relative' }}>
                <label className="input-label">Password</label>
                <input type={showPass ? 'text' : 'password'} className="input-field" placeholder="Min 6 characters" value={form.password} onChange={e => updateForm('password', e.target.value)} required style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '2.6rem', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input type="password" className="input-field" placeholder="Repeat password" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', fontSize: '1rem', fontWeight: 600 }}>
                Continue <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="input-group" style={{ position: 'relative' }}>
                <label className="input-label"><Phone size={14} style={{ marginRight: '4px' }} />Mobile Number</label>
                <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.mobileNumber} onChange={e => updateForm('mobileNumber', e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label"><Building2 size={14} style={{ marginRight: '4px' }} />Business Name (optional)</label>
                <input type="text" className="input-field" placeholder="Rajasthan Exports Pvt Ltd" value={form.businessName} onChange={e => updateForm('businessName', e.target.value)} />
              </div>
              <div className="input-group">
                <label className="input-label"><Hash size={14} style={{ marginRight: '4px' }} />GST Number (optional)</label>
                <input type="text" className="input-field" placeholder="27AAPFU0939F1ZV" value={form.gstNumber} onChange={e => updateForm('gstNumber', e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ height: '52px' }}>← Back</button>
                <button type="submit" className="btn btn-primary" style={{ height: '52px', fontWeight: 600 }} disabled={loading}>
                  {loading ? <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Already have an account? </span>
            <Link to="/login" style={{ color: '#FF5A1F', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
