// PahadiCart Universal Profile Sidebar Drawer & Account Manager
(function() {
  'use strict';

  // 1. Resolve Active Session
  const session = (window.PahadiAuth && window.PahadiAuth.getSession()) || 
                  JSON.parse(localStorage.getItem('pahadicart_user_session') || '{}');

  const role = session.role || (function() {
    const p = window.location.pathname;
    if (p.includes('/rider')) return 'rider';
    if (p.includes('/merchant')) return 'merchant';
    if (p.includes('/admin')) return 'admin';
    return 'customer';
  })();

  const defaultProfiles = {
    customer: {
      name: 'Pooja Chandel',
      phone: '+91 98164 55443',
      town: (session.town || 'Solan').toUpperCase(),
      badge: 'Solan Resident (Upper Mall)'
    },
    rider: {
      name: 'Karan Negi',
      phone: '+91 98160 88990',
      town: (session.town || 'Solan').toUpperCase(),
      badge: 'Hill Pro Rider (MCWG Active)'
    },
    merchant: {
      name: 'Rajesh Sharma',
      phone: '+91 98160 77889',
      town: (session.town || 'Solan').toUpperCase(),
      badge: 'Vyapar Mandal Member (Mall Road)'
    },
    admin: {
      name: 'Pahadi Admin Command',
      phone: '+91 98160 00001',
      town: 'STATE COMMAND (HIMACHAL)',
      badge: 'Central Dispatch Tower'
    }
  };

  const user = {
    name: session.name || defaultProfiles[role]?.name || 'Pahadi User',
    phone: session.phone ? ('+91 ' + session.phone.replace('+91', '').trim()) : defaultProfiles[role]?.phone,
    town: (session.town || defaultProfiles[role]?.town || 'SOLAN').toUpperCase(),
    badge: defaultProfiles[role]?.badge || 'Verified Member'
  };

  // 2. Inject CSS Styles
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .pahadi-drawer-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(3, 7, 18, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 999999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .pahadi-drawer-backdrop.active {
      opacity: 1;
      visibility: visible;
    }
    .pahadi-profile-drawer {
      position: fixed;
      top: 0;
      right: -380px;
      width: 100%;
      max-width: 360px;
      height: 100%;
      background: #0b1329;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: -15px 0 35px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      z-index: 1000000;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
      box-sizing: border-box;
      padding-top: max(0px, env(safe-area-inset-top));
      padding-bottom: max(0px, env(safe-area-inset-bottom));
    }
    .pahadi-profile-drawer.active {
      transform: translateX(-380px);
    }

    @media (max-width: 380px) {
      .pahadi-profile-drawer {
        max-width: 100%;
        right: -100vw;
      }
      .pahadi-profile-drawer.active {
        transform: translateX(-100vw);
      }
    }

    /* Top Nav */
    .drawer-top-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: #090f1f;
    }
    .drawer-nav-title {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
    }
    .drawer-back-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .drawer-back-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }

    /* User Profile Card */
    .drawer-user-card {
      padding: 20px;
      background: linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(11, 19, 41, 0) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .drawer-big-avatar {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #022c22;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 900;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
      flex-shrink: 0;
    }
    .drawer-user-meta h2 {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      line-height: 1.25;
    }
    .drawer-user-meta p {
      font-size: 13px;
      color: #94a3b8;
      margin: 3px 0 0;
      font-weight: 600;
    }
    .drawer-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 6px;
      padding: 3px 9px;
      background: rgba(16, 185, 129, 0.18);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
      font-size: 10.5px;
      font-weight: 800;
      border-radius: 9999px;
    }

    /* Scrollable Drawer List */
    .drawer-scroll-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px 16px;
      -webkit-overflow-scrolling: touch;
    }
    .drawer-section-title {
      font-size: 11px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin: 14px 4px 8px;
    }
    .drawer-info-group {
      background: #111c38;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 12px;
    }
    .drawer-list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: background 0.15s;
    }
    .drawer-list-item:last-child {
      border-bottom: none;
    }
    .drawer-list-item:hover, .drawer-list-item:active {
      background: rgba(255, 255, 255, 0.04);
    }
    .item-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .item-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }
    .item-label {
      font-size: 13px;
      font-weight: 600;
      color: #f1f5f9;
    }
    .item-subtext {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 1px;
    }
    .item-chevron {
      color: #64748b;
      font-size: 14px;
      font-weight: 800;
    }

    /* Bottom Actions */
    .drawer-bottom-wrap {
      padding: 14px 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: #090f1f;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .btn-drawer-install {
      width: 100%;
      padding: 11px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.25) 100%);
      border: 1px solid rgba(16, 185, 129, 0.45);
      border-radius: 12px;
      color: #34d399;
      font-size: 13px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }
    .btn-drawer-install:hover {
      background: rgba(16, 185, 129, 0.3);
    }
    .btn-drawer-logout {
      width: 100%;
      padding: 11px;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      color: #fca5a5;
      font-size: 13px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-drawer-logout:hover {
      background: rgba(239, 68, 68, 0.22);
      color: #ffffff;
    }
    .btn-drawer-switch {
      width: 100%;
      padding: 8px;
      background: transparent;
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
    }
    .btn-drawer-switch:hover {
      color: #ffffff;
      border-color: #10b981;
    }
    .drawer-version-tag {
      text-align: center;
      font-size: 10.5px;
      color: #475569;
      margin-top: 2px;
    }

    /* Top Nav Trigger Pill */
    .pahadi-profile-trigger-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      font-family: inherit;
      font-size: 12px;
      font-weight: 800;
      padding: 5px 10px;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .pahadi-profile-trigger-btn:hover {
      background: rgba(16, 185, 129, 0.25);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
    }
    .pahadi-avatar-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #10b981;
      color: #022c22;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 900;
    }
  `;
  document.head.appendChild(styleEl);

  // Role-Specific Section Content
  function getRoleSectionsHtml() {
    if (role === 'customer') {
      return `
        <div class="drawer-scroll-body">
          <div class="drawer-section-title">My Himachal Account</div>
          <div class="drawer-info-group">
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('orders')">
              <div class="item-left">
                <div class="item-icon">🛍️</div>
                <div class="item-label">My Orders & Live Hill Tracker</div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="item-list-item drawer-list-item" onclick="window.pahadiProfile.handleAction('addresses')">
              <div class="item-left">
                <div class="item-icon">📍</div>
                <div>
                  <div class="item-label">Delivery Addresses & Staircases</div>
                  <div class="item-subtext">Solan Mall Road • 42 Steps</div>
                </div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('refunds')">
              <div class="item-left">
                <div class="item-icon">💰</div>
                <div class="item-label">Refunds & Hill Weather Adjustments</div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('profile')">
              <div class="item-left">
                <div class="item-icon">👤</div>
                <div class="item-label">Profile Information</div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('payments')">
              <div class="item-left">
                <div class="item-icon">💳</div>
                <div class="item-label">Payment Methods & UPI COD</div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
          </div>

          <div class="drawer-section-title">Help & Services</div>
          <div class="drawer-info-group">
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('support')">
              <div class="item-left">
                <div class="item-icon">💬</div>
                <div>
                  <div class="item-label">Himachal Customer Support</div>
                  <div class="item-subtext">24x7 Hill Incident Desk</div>
                </div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('suggest')">
              <div class="item-left">
                <div class="item-icon">💡</div>
                <div class="item-label">Suggest Local Pahadi Products</div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('notifications')">
              <div class="item-left">
                <div class="item-icon">🔔</div>
                <div class="item-label">Push Notification Preferences</div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
          </div>
        </div>
      `;
    } else if (role === 'rider') {
      return `
        <div class="drawer-scroll-body">
          <div class="drawer-section-title">Rider Cockpit & Shifts</div>
          <div class="drawer-info-group">
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('rider_missions')">
              <div class="item-left">
                <div class="item-icon">🏍️</div>
                <div class="item-label">Active Missions & Dispatch Queue</div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('rider_earnings')">
              <div class="item-left">
                <div class="item-icon">💵</div>
                <div>
                  <div class="item-label">Today Earnings & COD Cash Ledger</div>
                  <div class="item-subtext">Direct UPI Payouts</div>
                </div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('rider_sos')">
              <div class="item-left">
                <div class="item-icon">🚨</div>
                <div>
                  <div class="item-label">Hill Emergency SOS Center</div>
                  <div class="item-subtext">108 & Highway Patrol Linked</div>
                </div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
          </div>

          <div class="drawer-section-title">Verified Documents & Bike</div>
          <div class="drawer-info-group">
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('rider_kyc')">
              <div class="item-left">
                <div class="item-icon">🪪</div>
                <div>
                  <div class="item-label">Aadhaar & PAN Verification</div>
                  <div class="item-subtext">100% Verified Active</div>
                </div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('rider_vehicle')">
              <div class="item-left">
                <div class="item-icon">🛵</div>
                <div>
                  <div class="item-label">DL, RC & Insurance Policy</div>
                  <div class="item-subtext">Valid 2-Wheeler Commercial</div>
                </div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('rider_stairs')">
              <div class="item-left">
                <div class="item-icon">🪜</div>
                <div class="item-label">Mountain Staircase Climb Log</div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="drawer-scroll-body">
          <div class="drawer-section-title">Merchant Vyapar Store</div>
          <div class="drawer-info-group">
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('merchant_orders')">
              <div class="item-left">
                <div class="item-icon">📦</div>
                <div class="item-label">Live Incoming Orders Board</div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('merchant_wallet')">
              <div class="item-left">
                <div class="item-icon">🏦</div>
                <div>
                  <div class="item-label">Vyapar Settlement Wallet</div>
                  <div class="item-subtext">T+1 Auto Payouts</div>
                </div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('merchant_catalog')">
              <div class="item-left">
                <div class="item-icon">📋</div>
                <div class="item-label">Item Catalog & Live Inventory</div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
          </div>

          <div class="drawer-section-title">Verified Store Documents</div>
          <div class="drawer-info-group">
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('merch_fssai')">
              <div class="item-left">
                <div class="item-icon">📄</div>
                <div>
                  <div class="item-label">FSSAI Food License</div>
                  <div class="item-subtext">Active License Verified</div>
                </div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('merch_gst')">
              <div class="item-left">
                <div class="item-icon">🏛️</div>
                <div>
                  <div class="item-label">GSTIN Himachal Certificate</div>
                  <div class="item-subtext">State Code 02 Active</div>
                </div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
            <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('merch_pan')">
              <div class="item-left">
                <div class="item-icon">💳</div>
                <div>
                  <div class="item-label">Business PAN Card</div>
                  <div class="item-subtext">Verified Enterprise</div>
                </div>
              </div>
              <div class="item-chevron">&rsaquo;</div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // 3. Mount Drawer in DOM
  const backdrop = document.createElement('div');
  backdrop.className = 'pahadi-drawer-backdrop';
  backdrop.id = 'pahadiDrawerBackdrop';

  const drawer = document.createElement('div');
  drawer.className = 'pahadi-profile-drawer';
  drawer.id = 'pahadiProfileDrawer';

  drawer.innerHTML = `
    <!-- Top Nav -->
    <div class="drawer-top-nav">
      <button class="drawer-back-btn" onclick="window.pahadiProfile.close()">&larr;</button>
      <div class="drawer-nav-title">My Account & Profile</div>
      <div style="width: 32px;"></div>
    </div>

    <!-- User Meta -->
    <div class="drawer-user-card">
      <div class="drawer-big-avatar">👤</div>
      <div class="drawer-user-meta">
        <h2>${user.name}</h2>
        <p>${user.phone}</p>
        <div class="drawer-badge">📍 ${user.town} • ${user.badge}</div>
      </div>
    </div>

    <!-- Dynamic Sections -->
    ${getRoleSectionsHtml()}

    <!-- Bottom Actions: Install, Logout & Switch -->
    <div class="drawer-bottom-wrap">
      <button class="btn-drawer-install" onclick="window.pahadiProfile.handleInstall()">
        <span>📲</span>
        <span>Download / Install App</span>
      </button>
      <button class="btn-drawer-logout" onclick="window.pahadiProfile.logout()">
        <span>🚪</span>
        <span>Log Out</span>
      </button>
      <button class="btn-drawer-switch" onclick="window.PahadiAuth.switchRole()">
        🔄 Switch Role / Portal
      </button>
      <div class="drawer-version-tag">
        PahadiCart PWA v4.0 • Himachal Hyperlocal
      </div>
    </div>
  `;

  backdrop.appendChild(drawer);
  document.body.appendChild(backdrop);

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) window.pahadiProfile.close();
  });

  // 4. Global Controller Object
  window.pahadiProfile = {
    open() {
      backdrop.classList.add('active');
      drawer.classList.add('active');
    },
    close() {
      backdrop.classList.remove('active');
      drawer.classList.remove('active');
    },
    handleInstall() {
      if (window.PahadiPWA && window.PahadiPWA.promptInstall) {
        window.PahadiPWA.promptInstall();
      } else {
        alert('PahadiCart App installer is ready.');
      }
    },
    logout() {
      if (confirm('Kya aap PahadiCart se logout karna chahte hain?')) {
        if (window.PahadiAuth && window.PahadiAuth.logout) {
          window.PahadiAuth.logout();
        } else {
          localStorage.removeItem('pahadicart_user_session');
          sessionStorage.removeItem('pahadicart_auth_role');
          window.location.href = '/';
        }
      }
    },
    handleAction(actionKey) {
      const messages = {
        orders: 'Opening active order queue & staircase tracking...',
        support: 'Connecting with PahadiCart Solan-Shimla WhatsApp Support...',
        addresses: 'Saved Addresses: 4 hill drop locations configured (Staircase count: 42 steps).',
        refunds: 'Refunds Balance: Rs 0.00 (All orders settled smoothly).',
        profile: 'Profile Details: Name: ' + user.name + ' • Phone: ' + user.phone,
        payments: 'Payment Management: UPI AutoPay, Cash on Delivery (COD) Active.',
        suggest: 'Opening suggestion box for local Himachal organic items...',
        notifications: 'Push notifications are ACTIVE for hill delivery alerts.',
        general: 'PahadiCart: Himachal 2-Hour Hyperlocal Network (Solan, Shimla, Dharamshala).',
        rider_missions: 'Showing active hill delivery missions...',
        rider_earnings: 'Today Earnings: Rs 1,840 • Cash Collected: Rs 11,250.',
        rider_sos: '🚨 Hill SOS Activated: Emergency response notified.',
        rider_kyc: 'Aadhaar & PAN are verified and active on file.',
        rider_vehicle: 'Vehicle HP 14 B 4210: Permanent MCWG License Valid.',
        rider_stairs: 'Staircase Climb: 420 steps logged today across Upper Bazaar.',
        merchant_orders: 'Switching to live orders board...',
        merchant_wallet: 'T+1 Settlement Balance: Rs 14,280 ready for payout.',
        merchant_catalog: 'Opening store inventory & item pricing...',
        merch_fssai: 'FSSAI License: 10924001004210 (Valid until 2029).',
        merch_gst: 'GSTIN: 02AAACH1234F1Z8 (Himachal Pradesh).',
        merch_pan: 'Business PAN: AAACH1234F verified on record.'
      };

      alert(messages[actionKey] || 'PahadiCart: ' + actionKey);
    }
  };

  // 5. Inject Profile Trigger in Navbars
  function injectNavProfileButton() {
    const navActions = document.querySelector('.nav-actions') || 
                       document.querySelector('.header-right') || 
                       document.querySelector('.top-bar-right') ||
                       document.querySelector('header');

    if (navActions && !document.getElementById('btnNavProfileTrigger')) {
      const btn = document.createElement('button');
      btn.id = 'btnNavProfileTrigger';
      btn.className = 'pahadi-profile-trigger-btn';
      btn.title = 'Open Profile & Logout';
      btn.onclick = () => window.pahadiProfile.open();

      const shortName = user.name.split(' ')[0] || 'User';
      btn.innerHTML = `
        <div class="pahadi-avatar-dot">👤</div>
        <span>${shortName}</span>
      `;
      navActions.prepend(btn);
    }

    document.querySelectorAll('[data-action="profile"], #btnProfile, .profile-icon-btn').forEach(el => {
      el.onclick = (e) => {
        e.preventDefault();
        window.pahadiProfile.open();
      };
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavProfileButton);
  } else {
    injectNavProfileButton();
  }
})();
