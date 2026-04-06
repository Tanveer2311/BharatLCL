/**
 * BharatLCL — Frontend Application Logic
 * Handles UI interactions, API calls, and dynamic content
 */

// ============================================
// Sample Data
// ============================================

const SAMPLE_SLOTS = [
  {
    id: 1, transporter: 'Gujarat Freight Movers', verified: true,
    origin: 'Jaipur ICD Sanganer', destination: 'Mundra Port (Adani)',
    totalCBM: 30, availableCBM: 18, pricePerCBM: 1800,
    departureDate: '2026-04-15', vehicle: 'GJ01AB1234',
    cargoTypes: ['Textile', 'Handicraft'], status: 'available'
  },
  {
    id: 2, transporter: 'Rajasthan Express Cargo', verified: true,
    origin: 'Jaipur ICD Sanganer', destination: 'Mundra Port (Adani)',
    totalCBM: 25, availableCBM: 8, pricePerCBM: 2200,
    departureDate: '2026-04-12', vehicle: 'RJ14GA5678',
    cargoTypes: ['Textile', 'Stone'], status: 'partial'
  },
  {
    id: 3, transporter: 'Kutch Logistics Ltd', verified: true,
    origin: 'Jaipur ICD Kanakpura', destination: 'Mundra Port (Adani)',
    totalCBM: 25, availableCBM: 25, pricePerCBM: 1650,
    departureDate: '2026-04-18', vehicle: 'GJ12CD9012',
    cargoTypes: ['Textile', 'Handicraft', 'Stone'], status: 'available'
  },
  {
    id: 4, transporter: 'Marwar Transport Co.', verified: false,
    origin: 'Jaipur ICD Sanganer', destination: 'Mundra Port (Adani)',
    totalCBM: 20, availableCBM: 14, pricePerCBM: 1950,
    departureDate: '2026-04-14', vehicle: 'RJ19EF3456',
    cargoTypes: ['Handicraft'], status: 'available'
  },
  {
    id: 5, transporter: 'Saurashtra Cargo Services', verified: true,
    origin: 'Jaipur ICD Kanakpura', destination: 'Mundra Port (Adani)',
    totalCBM: 30, availableCBM: 5, pricePerCBM: 2400,
    departureDate: '2026-04-11', vehicle: 'GJ06GH7890',
    cargoTypes: ['Stone', 'General'], status: 'partial'
  },
  {
    id: 6, transporter: 'NH-15 Express Freight', verified: true,
    origin: 'Jaipur ICD Sanganer', destination: 'Mundra Port (Adani)',
    totalCBM: 28, availableCBM: 22, pricePerCBM: 1750,
    departureDate: '2026-04-20', vehicle: 'RJ27IJ1234',
    cargoTypes: ['Textile', 'Handicraft', 'General'], status: 'available'
  }
];

const API_ENDPOINTS = [
  { name: 'Health Check', url: '/api/health', method: 'GET' },
  { name: 'Authentication', url: '/api/auth/login', method: 'POST' },
  { name: 'Capacity Slots', url: '/api/capacity/slots', method: 'GET' },
  { name: 'Shipments', url: '/api/shipments', method: 'GET' },
  { name: 'Payments', url: '/api/payments/history', method: 'GET' },
  { name: 'Documents', url: '/api/documents/shipment/demo', method: 'GET' },
  { name: 'Verification', url: '/api/verify/transporter/demo', method: 'GET' }
];

// ============================================
// DOM Ready
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroStats();
  renderCapacityCards();
  initSearch();
  initVerification();
  checkApiStatus();
  initAuth();
  initScrollAnimations();
});

// ============================================
// Navbar
// ============================================

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    });
  }
}

// ============================================
// Hero Stats Counter Animation
// ============================================

function initHeroStats() {
  const counters = document.querySelectorAll('.stat-number[data-target]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.dataset.target);
  const duration = 2000;
  const start = Date.now();

  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(target * eased).toLocaleString();

    if (progress < 1) requestAnimationFrame(update);
    else element.textContent = target.toLocaleString();
  }
  requestAnimationFrame(update);
}

// ============================================
// Capacity Cards
// ============================================

function renderCapacityCards(slots = SAMPLE_SLOTS) {
  const grid = document.getElementById('capacityGrid');
  if (!grid) return;

  grid.innerHTML = slots.map(slot => {
    const usedPct = Math.round(((slot.totalCBM - slot.availableCBM) / slot.totalCBM) * 100);
    const barClass = usedPct > 70 ? 'red' : usedPct > 40 ? 'yellow' : 'green';
    const statusBadge = slot.status === 'partial'
      ? '<span class="slot-badge partial">Filling Fast</span>'
      : '<span class="slot-badge available">Available</span>';

    return `
      <div class="capacity-card" data-id="${slot.id}">
        <div class="cap-header">
          <div>
            <div class="cap-transporter">🚛 ${slot.transporter}</div>
            <div class="cap-verified">${slot.verified ? '✅ ULIP Verified' : '⏳ Pending Verification'}</div>
          </div>
          ${statusBadge}
        </div>
        <div class="cap-route">
          <span class="cap-city">📍 ${slot.origin.split(' ').slice(0, 2).join(' ')}</span>
          <span class="cap-arrow">→</span>
          <span class="cap-city">🏗️ ${slot.destination.split(' ').slice(0, 2).join(' ')}</span>
        </div>
        <div class="cap-details">
          <div class="cap-detail">
            <span class="cap-detail-label">Price/CBM</span>
            <span class="cap-detail-value">₹${slot.pricePerCBM.toLocaleString()}</span>
          </div>
          <div class="cap-detail">
            <span class="cap-detail-label">Available</span>
            <span class="cap-detail-value">${slot.availableCBM} of ${slot.totalCBM} CBM</span>
          </div>
          <div class="cap-detail">
            <span class="cap-detail-label">Departure</span>
            <span class="cap-detail-value">${formatDate(slot.departureDate)}</span>
          </div>
          <div class="cap-detail">
            <span class="cap-detail-label">Vehicle</span>
            <span class="cap-detail-value">${slot.vehicle}</span>
          </div>
        </div>
        <div class="cap-bar">
          <div class="cap-bar-fill ${barClass}" style="width: ${usedPct}%"></div>
        </div>
        <div class="cap-footer">
          <div class="cap-cargo-types">
            ${slot.cargoTypes.map(t => `<span class="cap-cargo-tag">${t}</span>`).join('')}
          </div>
          <button class="cap-book-btn" onclick="handleBook(${slot.id})">Book Now</button>
        </div>
      </div>
    `;
  }).join('');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ============================================
// Search
// ============================================

function initSearch() {
  const btn = document.getElementById('searchBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const cbm = parseFloat(document.getElementById('searchCBM')?.value) || 0;
    const cargo = document.getElementById('searchCargo')?.value || '';

    let filtered = [...SAMPLE_SLOTS];

    if (cbm > 0) {
      filtered = filtered.filter(s => s.availableCBM >= cbm);
    }
    if (cargo) {
      filtered = filtered.filter(s => s.cargoTypes.includes(cargo));
    }

    renderCapacityCards(filtered);

    if (filtered.length === 0) {
      document.getElementById('capacityGrid').innerHTML =
        '<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--text-muted);">No slots match your criteria. Try adjusting filters.</div>';
    }

    showToast(`Found ${filtered.length} available slot${filtered.length !== 1 ? 's' : ''}`, 'info');
  });
}

// ============================================
// Booking
// ============================================

function handleBook(slotId) {
  const slot = SAMPLE_SLOTS.find(s => s.id === slotId);
  if (!slot) return;

  const total = slot.pricePerCBM * 5; // Assume 5 CBM booking
  const fee = Math.round(total * 0.04);

  showToast(
    `🎉 Booking initiated! ${slot.transporter} — ₹${(total + fee).toLocaleString()} for 5 CBM`,
    'success'
  );

  // Call backend API
  fetch('/api/capacity/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      containerId: slot.id,
      cargoDimensions: { length: 2, width: 1.5, height: 1.67 },
      cargoWeight: 400,
      cargoType: slot.cargoTypes[0]
    })
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        showToast(`✅ Booking ${data.data.shipment.bookingId} confirmed!`, 'success');
      }
    })
    .catch(() => {});
}

// ============================================
// Verification Demo
// ============================================

function initVerification() {
  const btn = document.getElementById('verifyBtn');
  const input = document.getElementById('vehicleInput');
  const result = document.getElementById('verifyResult');

  if (!btn || !input || !result) return;

  btn.addEventListener('click', async () => {
    const vehicle = input.value.trim().toUpperCase();
    if (!vehicle) {
      showToast('Please enter a vehicle number', 'error');
      return;
    }

    btn.textContent = 'Verifying...';
    btn.disabled = true;

    try {
      const response = await fetch('/api/verify/vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transporterId: 'demo-transporter', vehicleNumber: vehicle })
      });
      const data = await response.json();

      if (data.success) {
        const v = data.data;
        result.style.display = 'block';
        result.innerHTML = `
          <div class="verify-header">
            <div>
              <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:4px;">Vehicle: ${vehicle}</div>
              <div class="verify-score high">${v.score}/100</div>
            </div>
            <span class="verify-status-badge verified">✅ ${v.overallStatus.toUpperCase()}</span>
          </div>
          <div class="verify-checks">
            <div class="verify-check">
              <span class="verify-check-icon">🏷️</span>
              <span class="verify-check-name">FASTag</span>
              <span class="verify-check-status">${v.fastagStatus.verified ? '✓ Active' : '✗ Inactive'}</span>
            </div>
            <div class="verify-check">
              <span class="verify-check-icon">🚗</span>
              <span class="verify-check-name">VAHAN</span>
              <span class="verify-check-status">${v.vahanStatus.verified ? '✓ Valid Registration' : '✗ Invalid'}</span>
            </div>
            <div class="verify-check">
              <span class="verify-check-icon">📊</span>
              <span class="verify-check-name">LDB Score</span>
              <span class="verify-check-status">${v.ldbScore.score}/100 (${v.ldbScore.shipmentHistory} shipments)</span>
            </div>
          </div>
        `;
        showToast(`Vehicle ${vehicle} verified: ${v.overallStatus}`, 'success');
      }
    } catch (error) {
      showToast('Verification failed — check server connection', 'error');
    }

    btn.textContent = 'Verify Vehicle';
    btn.disabled = false;
  });
}

// ============================================
// API Status Check
// ============================================

async function checkApiStatus() {
  const grid = document.getElementById('apiGrid');
  if (!grid) return;

  grid.innerHTML = API_ENDPOINTS.map(ep => `
    <div class="api-card">
      <div class="api-dot" id="dot-${ep.name.replace(/\s/g, '')}"></div>
      <div>
        <div class="api-name">${ep.name}</div>
        <div class="api-url">${ep.method} ${ep.url}</div>
      </div>
    </div>
  `).join('');

  for (const ep of API_ENDPOINTS) {
    const dot = document.getElementById(`dot-${ep.name.replace(/\s/g, '')}`);
    try {
      const response = await fetch(ep.url, { method: ep.method === 'GET' ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: ep.method !== 'GET' ? JSON.stringify({}) : undefined
      });
      dot.classList.add(response.ok ? 'online' : 'offline');
    } catch {
      dot.classList.add('offline');
    }
  }
}

// ============================================
// Authentication Modal
// ============================================

function initAuth() {
  const modal = document.getElementById('authModal');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const heroBtn = document.getElementById('heroGetStarted');
  const closeBtn = document.getElementById('modalClose');
  const switchLink = document.getElementById('authSwitchLink');
  const form = document.getElementById('authForm');

  let isSignup = false;

  function openModal(signup = false) {
    isSignup = signup;
    modal.classList.add('active');
    updateModalMode();
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  function updateModalMode() {
    document.getElementById('modalTitle').textContent = isSignup ? 'Create Account' : 'Welcome Back';
    document.getElementById('modalSubtitle').textContent = isSignup
      ? 'Join BharatLCL to start shipping'
      : 'Log in to access your dashboard';
    document.getElementById('nameGroup').style.display = isSignup ? 'block' : 'none';
    document.getElementById('roleGroup').style.display = isSignup ? 'block' : 'none';
    document.getElementById('authSubmit').textContent = isSignup ? 'Create Account' : 'Log In';
    document.getElementById('authSwitchText').textContent = isSignup
      ? 'Already have an account?'
      : "Don't have an account?";
    document.getElementById('authSwitchLink').textContent = isSignup ? 'Log In' : 'Sign Up';
  }

  if (loginBtn) loginBtn.addEventListener('click', () => openModal(false));
  if (signupBtn) signupBtn.addEventListener('click', () => openModal(true));
  if (heroBtn) heroBtn.addEventListener('click', () => openModal(true));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (switchLink) switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isSignup = !isSignup;
    updateModalMode();
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('authEmail').value;
      const password = document.getElementById('authPassword').value;

      const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
      const body = { email, password };

      if (isSignup) {
        body.name = document.getElementById('authName').value;
        body.role = document.getElementById('authRole').value;
        body.mobileNumber = '+919876543210';
      }

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await response.json();

        if (data.success) {
          showToast(`🎉 ${isSignup ? 'Account created' : 'Logged in'} successfully!`, 'success');
          closeModal();
        } else {
          showToast(data.error?.message || 'Something went wrong', 'error');
        }
      } catch {
        showToast('Server connection failed', 'error');
      }
    });
  }

  // Demo button
  const demoBtn = document.getElementById('heroDemo');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============================================
// Scroll Animations
// ============================================

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .problem-card, .step-card, .pricing-card, .capacity-card, .corridor-stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}
