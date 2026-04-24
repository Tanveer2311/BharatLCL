import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Package, TrendingUp, Shield, Zap, ArrowRight, ChevronRight, Star, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function AnimatedNumber({ end, duration = 2000, suffix = '' }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const step = end / (duration / 16);
    let val = 0;
    const timer = setInterval(() => {
      val += step;
      if (val >= end) { val = end; clearInterval(timer); }
      setCurrent(Math.floor(val));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{current.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 2400, suffix: '+', label: 'MSMEs Served', icon: Package },
  { value: 18500, suffix: '+', label: 'CBM Shipped', icon: Truck },
  { value: 98, suffix: '%', label: 'On-Time Rate', icon: TrendingUp },
  { value: 35, suffix: '%', label: 'Cost Savings', icon: Zap },
];

const features = [
  {
    icon: '⚡', title: 'Real-Time Discovery',
    desc: 'Find available LCL slots on the Jaipur-Mundra corridor instantly. Filter by date, CBM, cargo type & price.',
    color: '#FF5A1F'
  },
  {
    icon: '🔒', title: 'Escrow Payments',
    desc: '5-milestone payment protection. Your money stays safe until your cargo completes each verified stage.',
    color: '#3A86FF'
  },
  {
    icon: '📡', title: 'GPS + ULIP Tracking',
    desc: 'Live FASTag + GPS tracking. Government-integrated verification via VAHAN, FASTag & LDB APIs.',
    color: '#06D6A0'
  },
  {
    icon: '📄', title: 'Auto-Documentation',
    desc: 'Shipping bills, packing lists, commercial invoices — auto-generated, instantly downloadable.',
    color: '#FFB236'
  },
];

const testimonials = [
  { name: 'Suresh Agarwal', role: 'Handicraft Exporter, Jaipur', text: 'BharatLCL saved us ₹4.2L in the first quarter. Dead freight costs are now zero.', rating: 5 },
  { name: 'Mohammed Khan', role: 'Textile Trader, Jaipur', text: 'The ULIP verification gives us confidence. We know our transporter is legitimate and GPS-tracked.', rating: 5 },
  { name: 'Priya Sharma', role: 'Transporter, Rajasthan', text: 'Listing my containers and getting bookings is incredibly easy. Revenue up 40% in 2 months.', rating: 5 },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '4rem 2rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(255,90,31,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(58,134,255,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div style={{ animation: 'fadeIn 0.8s ease' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,90,31,0.1)', border: '1px solid rgba(255,90,31,0.3)', borderRadius: '20px', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
                <Globe size={14} color="#FF5A1F" />
                <span style={{ color: '#FF5A1F', fontSize: '0.82rem', fontWeight: 500 }}>Jaipur → Mundra Corridor</span>
              </div>
              <h1 style={{ marginBottom: '1.5rem', lineHeight: 1.1 }}>
                India's First <br />
                <span style={{ background: 'linear-gradient(135deg, #FF5A1F, #FF8A00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>LCL Marketplace</span>
                <br />for MSMEs
              </h1>
              <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.55)', marginBottom: '2.5rem', lineHeight: 1.8, maxWidth: '480px' }}>
                Stop paying for empty container space. Consolidate your cargo, verify transporters via ULIP, and automate your documentation — all in one platform.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary" style={{ height: '52px', fontSize: '1.05rem', padding: '0 1.8rem' }}>
                  Start for Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ height: '52px', fontSize: '1.05rem', padding: '0 1.8rem' }}>
                  View Demo
                </Link>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                <div style={{ display: 'flex' }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: `hsl(${i * 30},70%,60%)`, border: '2px solid #000', marginLeft: i === 1 ? 0 : '-8px' }} />
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '2px' }}>{[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#FF5A1F" color="#FF5A1F" />)}</div>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Trusted by 2,400+ MSMEs</span>
                </div>
              </div>
            </div>

            {/* Visual Card */}
            <div style={{ animation: 'slideIn 0.8s ease', display: 'flex', justifyContent: 'center' }}>
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', width: '100%', maxWidth: '420px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Slot preview card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Live Available Slots</span>
                  <span style={{ fontSize: '0.75rem', padding: '3px 10px', background: 'rgba(6,214,160,0.15)', color: '#06D6A0', borderRadius: '20px', border: '1px solid rgba(6,214,160,0.3)' }}>🟢 Live</span>
                </div>
                {[
                  { cbm: '12 CBM', price: '₹1,850/CBM', date: '28 Apr', score: 94 },
                  { cbm: '8 CBM', price: '₹1,720/CBM', date: '30 Apr', score: 88 },
                  { cbm: '20 CBM', price: '₹1,950/CBM', date: '2 May', score: 97 },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>{s.cbm} Available</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Jaipur → Mundra · {s.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#FF5A1F', fontWeight: 700, fontSize: '0.95rem' }}>{s.price}</div>
                      <div style={{ fontSize: '0.75rem', color: '#06D6A0' }}>✓ Score: {s.score}</div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }}>
                  Book Now <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '3rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          {stats.map(({ value, suffix, label, icon: Icon }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#FF5A1F', marginBottom: '0.3rem' }}>
                <AnimatedNumber end={value} suffix={suffix} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Icon size={14} />
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: '1rem' }}>
              Everything your MSME needs <br /><span style={{ background: 'linear-gradient(135deg, #3A86FF, #00F0FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>to ship smarter</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '500px', margin: '0 auto' }}>No more manual freight brokers. No more dead-load costs. BharatLCL automates every stage of your export journey.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {features.map(f => (
              <div key={f.title} className="glass-card" style={{ borderTop: `3px solid ${f.color}` }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 2rem', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: 'clamp(1.8rem, 3vw, 2.3rem)' }}>
            Trusted by India's <span style={{ color: '#FF5A1F' }}>Leading Exporters</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {testimonials.map(t => (
              <div key={t.name} className="glass-card">
                <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="#FF5A1F" color="#FF5A1F" />)}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.2rem' }}>"{t.text}"</p>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{t.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '1rem' }}>Ready to ship <span style={{ color: '#FF5A1F' }}>smarter?</span></h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '2rem', fontSize: '1.05rem' }}>Join 2,400+ MSMEs already saving on freight costs with BharatLCL.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-primary" style={{ height: '52px', fontSize: '1.05rem', padding: '0 2rem' }}>
              Start Free Today <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}
