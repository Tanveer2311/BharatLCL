import React from 'react';
import { Truck, Mail, Phone, MapPin } from 'lucide-react';

const GithubIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
const TwitterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);
const LinkedinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '3rem 2rem 2rem', marginTop: '4rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #FF5A1F, #FF8A00)', borderRadius: '8px', padding: '5px 7px', display: 'flex' }}>
                <Truck size={18} color="white" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Bharat<span style={{ color: '#FF5A1F' }}>LCL</span></span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              India's first real-time LCL capacity marketplace, solving freight consolidation for Jaipur-Mundra MSMEs.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.2rem' }}>
              {[GithubIcon, TwitterIcon, LinkedinIcon].map((Icon, i) => (
                <a key={i} href="#" style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Platform</h4>
            {['Capacity Discovery', 'Shipment Tracking', 'Escrow Payments', 'Document Generation', 'ULIP Verification'].map(l => (
              <div key={l} style={{ marginBottom: '0.6rem' }}>
                <a href="#" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', textDecoration: 'none' }}>{l}</a>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>For Business</h4>
            {['Exporters', 'Transporters', 'Pricing Plans', 'API Access', 'Partner Program'].map(l => (
              <div key={l} style={{ marginBottom: '0.6rem' }}>
                <a href="#" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', textDecoration: 'none' }}>{l}</a>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>Contact</h4>
            {[
              { icon: Mail, text: 'support@bharatlcl.in' },
              { icon: Phone, text: '+91 98765 43210' },
              { icon: MapPin, text: 'Jaipur, Rajasthan 302001' }
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Icon size={14} color="rgba(255,255,255,0.3)" />
                <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem' }}>© 2024 BharatLCL. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
              <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
