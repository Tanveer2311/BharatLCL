import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Mail, Phone, Building2, Hash, Lock, Save, Eye, EyeOff } from 'lucide-react';

export default function ProfilePage() {
  const { user, authFetch } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    mobileNumber: user?.mobileNumber || '',
    businessName: user?.businessName || '',
    gstNumber: user?.gstNumber || ''
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const roleColors = { exporter: '#FF5A1F', transporter: '#3A86FF', admin: '#06D6A0' };
  const roleColor = roleColors[user?.role] || '#888';

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authFetch('/api/auth/profile', { method: 'PUT', body: JSON.stringify(form) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message);
      toast.success('Profile updated successfully!');
    } catch (err) { toast.error(err.message); }
    finally { setSavingProfile(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('New passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      const res = await authFetch('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message);
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.message); }
    finally { setSavingPw(false); }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>My Profile</h1>

      {/* User card */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `${roleColor}15`, border: `3px solid ${roleColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={32} color={roleColor} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>{user?.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{user?.email}</div>
          <span style={{ fontSize: '0.78rem', padding: '3px 10px', background: `${roleColor}15`, color: roleColor, borderRadius: '20px', border: `1px solid ${roleColor}40` }}>
            {user?.role?.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Profile form */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <User size={16} color="#FF5A1F" /> Account Information
          </h3>
          <form onSubmit={saveProfile}>
            {[
              { key: 'name', label: 'Full Name', icon: User, placeholder: 'Ramesh Kumar' },
              { key: 'mobileNumber', label: 'Mobile', icon: Phone, placeholder: '+91 98765 43210' },
              { key: 'businessName', label: 'Business Name', icon: Building2, placeholder: 'Your company' },
              { key: 'gstNumber', label: 'GST Number', icon: Hash, placeholder: '27AAPFU0939F1ZV' },
            ].map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key} className="input-group">
                <label className="input-label"><Icon size={13} style={{ marginRight: '4px' }} />{label}</label>
                <input className="input-field" type="text" placeholder={placeholder} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} style={{ padding: '0.75rem' }} />
              </div>
            ))}
            <div className="input-group">
              <label className="input-label"><Mail size={13} style={{ marginRight: '4px' }} />Email (read-only)</label>
              <input className="input-field" type="email" value={user?.email} disabled style={{ padding: '0.75rem', opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Save size={16} />{savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password change */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <Lock size={16} color="#3A86FF" /> Change Password
          </h3>
          <form onSubmit={changePassword}>
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key} className="input-group" style={{ position: 'relative' }}>
                <label className="input-label">{label}</label>
                <input
                  className="input-field"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={pwForm[key]}
                  onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                  required
                  style={{ padding: '0.75rem', paddingRight: '2.8rem' }}
                />
                {key === 'currentPassword' && (
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '0.8rem', top: '2.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            ))}
            <button type="submit" className="btn btn-secondary" disabled={savingPw} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Lock size={16} />{savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
