/**
 * PahadiCart Universal Portal Switcher
 * Allows 1-tap switching between Customer, Rider, Merchant, and Admin portals.
 */
(function() {
  if (window.PahadiPortalSwitcher) return;

  const PORTALS = [
    {
      id: 'customer',
      name: 'Pahadi Customer Store',
      shortName: 'Customer',
      icon: '🛍️',
      url: '/customer/',
      desc: 'Local shopping, taaza groceries & 2-hr hill delivery',
      color: '#10b981',
      cls: 'role-customer'
    },
    {
      id: 'rider',
      name: 'Pahadi Rider Cockpit',
      shortName: 'Rider',
      icon: '🛵',
      url: '/rider/',
      desc: 'Hill missions, staircase maps & live dispatch duty',
      color: '#0284c7',
      cls: 'role-rider'
    },
    {
      id: 'merchant',
      name: 'Vyapar Mandal Merchant',
      shortName: 'Merchant',
      icon: '🏪',
      url: '/merchant/',
      desc: 'Store terminal, order receipts, KOT printer & stock',
      color: '#d97706',
      cls: 'role-merchant'
    },
    {
      id: 'admin',
      name: 'Super Admin Dispatch Tower',
      shortName: 'Admin',
      icon: '🏢',
      url: '/admin/',
      desc: 'Central dispatcher, fleet telemetry & cross-portal sync',
      color: '#8b5cf6',
      cls: 'role-admin'
    },
    {
      id: 'hub',
      name: 'Main Hub / Role Login',
      shortName: 'Main Hub',
      icon: '🏠',
      url: '/',
      desc: 'Role selection, onboarding & town settings',
      color: '#64748b',
      cls: 'role-hub'
    }
  ];

  function detectCurrentPortal() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/rider')) return 'rider';
    if (path.includes('/merchant')) return 'merchant';
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/customer')) return 'customer';
    return 'hub';
  }

  class PortalSwitcherManager {
    constructor() {
      this.currentRole = detectCurrentPortal();
      this.init();
    }

    init() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.buildUI());
      } else {
        this.buildUI();
      }
    }

    buildUI() {
      if (document.getElementById('pahadiPortalOverlay')) return;

      // Create Modal Overlay
      const overlay = document.createElement('div');
      overlay.id = 'pahadiPortalOverlay';
      overlay.className = 'portal-modal-overlay';
      overlay.onclick = (e) => {
        if (e.target === overlay) this.close();
      };

      const curr = PORTALS.find(p => p.id === this.currentRole) || PORTALS[0];

      overlay.innerHTML = `
        <div class="portal-modal-sheet" onclick="event.stopPropagation()">
          <div class="portal-sheet-header">
            <div class="portal-sheet-title">
              <span>🔄</span>
              <span>Switch PahadiCart Portal</span>
            </div>
            <button class="portal-sheet-close" onclick="window.PahadiPortalSwitcher.close()" title="Close">&times;</button>
          </div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 14px;">
            Tap any portal to switch instantly. All data syncs in real-time.
          </div>
          <div class="portal-roles-grid">
            ${PORTALS.map(portal => {
              const isCurrent = portal.id === this.currentRole;
              return `
                <div class="portal-role-card ${portal.cls} ${isCurrent ? 'active' : ''}" onclick="window.PahadiPortalSwitcher.switchTo('${portal.id}')">
                  <div class="portal-role-icon">${portal.icon}</div>
                  <div class="portal-role-info">
                    <div class="portal-role-name">
                      ${portal.name}
                      ${isCurrent ? '<span style="font-size:10px; background:#10b981; color:#064e3b; padding:2px 6px; border-radius:6px;">Current</span>' : ''}
                    </div>
                    <div class="portal-role-desc">${portal.desc}</div>
                  </div>
                  <div class="portal-role-tag ${isCurrent ? 'current' : 'action'}">
                    ${isCurrent ? 'Active' : 'Open ➔'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Add Floating Trigger Pill on customer, rider, merchant if not already on hub
      if (this.currentRole !== 'hub' && !document.getElementById('portalFloatingPill')) {
        const floatBtn = document.createElement('button');
        floatBtn.id = 'portalFloatingPill';
        floatBtn.className = 'portal-floating-pill';
        floatBtn.innerHTML = `<span>${curr.icon}</span> <span>Switch Portal ▾</span>`;
        floatBtn.onclick = () => this.open();
        document.body.appendChild(floatBtn);
      }
    }

    open() {
      const overlay = document.getElementById('pahadiPortalOverlay');
      if (overlay) {
        overlay.classList.add('open');
        overlay.style.display = 'flex';
      }
    }

    close() {
      const overlay = document.getElementById('pahadiPortalOverlay');
      if (overlay) {
        overlay.classList.remove('open');
        setTimeout(() => { overlay.style.display = 'none'; }, 250);
      }
    }

    switchTo(roleId) {
      const target = PORTALS.find(p => p.id === roleId);
      if (!target) return;

      // Update session storage so appropriate credentials exist
      const sessionMap = {
        customer: { role: 'customer', name: 'Pooja Chandel', phone: '9816455443', town: 'solan' },
        rider: { role: 'rider', name: 'Aman Thakur (#01)', phone: '9805111223', town: 'solan' },
        merchant: { role: 'merchant', name: 'Anand Sweet Shop & Bakers', phone: '9816012345', town: 'solan' },
        admin: { role: 'admin', name: 'Super Admin', phone: '9816000000', town: 'solan' },
        hub: { role: 'guest', name: 'Pahadi User', phone: '', town: 'solan' }
      };

      if (sessionMap[roleId]) {
        try {
          const s = sessionMap[roleId];
          s.loggedInAt = Date.now();
          localStorage.setItem('pahadicart_user_session', JSON.stringify(s));
          sessionStorage.setItem('pahadicart_auth_role', roleId);
        } catch (e) {}
      }

      window.location.href = target.url;
    }
  }

  window.PahadiPortalSwitcher = new PortalSwitcherManager();
})();
