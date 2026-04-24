import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Truck, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,90,31,0.12) 0%, transparent 70%)', top: '-200px', right: '-200px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(58,134,255,0.08) 0%, transparent 70%)', bottom: '-100px', left: '-100px', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeIn 0.6s ease' }}>
        <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #FF5A1F, #FF8A00)', borderRadius: '10px', padding: '7px 9px', display: 'flex' }}>
                <Truck size={22} color="white" />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Bharat<span style={{ color: '#FF5A1F' }}>LCL</span></span>
            </div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Welcome back</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>Sign in to manage your freight operations</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="your@company.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <label className="input-label">Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
                style={{ paddingRight: '3rem' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '1rem', top: '2.6rem', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
              <a href="#" style={{ color: '#FF5A1F', fontSize: '0.85rem', textDecoration: 'none' }}>Forgot password?</a>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '52px', fontSize: '1rem', fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Signing In...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Sign In <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>New to BharatLCL? </span>
            <Link to="/register" style={{ color: '#FF5A1F', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>Create Account</Link>
          </div>
        </div>

        {/* Demo hint */}
        <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '16px', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={16} color="#FFB236" />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>Register a new account to explore the full platform.</span>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
