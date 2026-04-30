import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Truck, LayoutDashboard, Package, CreditCard, FileText,
  ShieldCheck, LogOut, Menu, X, ChevronDown, Bell, User
} from 'lucide-react';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['exporter', 'transporter', 'admin'] },
  { to: '/capacity', label: 'Capacity', icon: Package, roles: ['exporter', 'transporter', 'admin'] },
  { to: '/shipments', label: 'Shipments', icon: Truck, roles: ['exporter', 'transporter', 'admin'] },
  { to: '/payments', label: 'Payments', icon: CreditCard, roles: ['exporter', 'transporter', 'admin'] },
  { to: '/documents', label: 'Documents', icon: FileText, roles: ['exporter', 'admin'] },
  { to: '/verify', label: 'ULIP Verify', icon: ShieldCheck, roles: ['transporter', 'admin'] },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const visibleLinks = navLinks.filter(l => !user || l.roles.includes(user.role));

  const roleColors = { exporter: '#FF5A1F', transporter: '#3A86FF', admin: '#06D6A0' };
  const roleColor = user ? (roleColors[user.role] || '#aaa') : '#aaa';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: scrolled ? 'rgba(5, 5, 10, 0.95)' : 'transparent',
      backdropFilter: 'blur(20px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
      transition: 'all 0.3s ease',
      padding: '0 2rem'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #FF5A1F, #FF8A00)', borderRadius: '10px', padding: '6px 8px', display: 'flex' }}>
            <Truck size={22} color="white" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
            Bharat<span style={{ color: '#FF5A1F' }}>LCL</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        {isAuthenticated && (
          <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            {visibleLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 0.9rem', borderRadius: '10px', textDecoration: 'none',
                    fontSize: '0.9rem', fontWeight: 500,
                    color: active ? '#FF5A1F' : 'rgba(255,255,255,0.7)',
                    background: active ? 'rgba(255,90,31,0.1)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'transparent'; }}}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.95rem' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Get Started</Link>
            </>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '40px', padding: '0.4rem 0.4rem 0.4rem 0.8rem',
                  cursor: 'pointer', color: '#fff', transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user?.name?.split(' ')[0]}</span>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', background: `${roleColor}22`,
                  border: `2px solid ${roleColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <User size={16} color={roleColor} />
                </div>
                <ChevronDown size={14} color="rgba(255,255,255,0.5)" />
              </button>

              {dropOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
                  background: 'rgba(10,10,15,0.98)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                  padding: '0.75rem', minWidth: '200px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
                }}
                  onMouseLeave={() => setDropOpen(false)}
                >
                  <div style={{ padding: '0.5rem 0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{user?.email}</div>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: `${roleColor}22`, color: roleColor, borderRadius: '20px', border: `1px solid ${roleColor}44`, display: 'inline-block', marginTop: '0.4rem' }}>
                      {user?.role?.toUpperCase()}
                    </span>
                  </div>
                  <Link to="/profile" onClick={() => setDropOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.15s' }}>
                    <User size={15} />Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', borderRadius: '10px', color: '#FF4757', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.15s' }}
                  >
                    <LogOut size={15} />Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
