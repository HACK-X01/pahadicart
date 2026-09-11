// PahadiCart Universal Profile Sidebar & Logout Engine
// Exactly styled as user reference: Profile Drawer, Role-Tailored Cards & One-Click Logout
(function() {
  // Do not mount on login gateway
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    return;
  }

  // Detect Active Role
  let currentRole = 'customer';
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/rider/')) currentRole = 'rider';
  else if (path.includes('/merchant/')) currentRole = 'merchant';
  else if (path.includes('/admin/')) currentRole = 'admin';

  // Read Session
  let session = null;
  try {
    const raw = localStorage.getItem('pahadicart_user_session');
    if (raw) session = JSON.parse(raw);
  } catch (e) {}

  // Fallback defaults per role
  const DEFAULTS = {
    customer: {
      name: session && session.name ? session.name : 'Pooja Chandel',
      phone: session && session.phone ? '+91 ' + session.phone : '+91 98164 55443',
      town: session && session.town ? session.town.toUpperCase() : 'SOLAN (1,502M)',
      avatarBg: '#8b5cf6',
      badge: 'Himachal Shopper'
    },
    rider: {
      name: session && session.name ? session.name : 'Aman Thakur (Rider #01)',
      phone: session && session.phone ? '+91 ' + session.phone : '+91 98051 11223',
      town: session && session.town ? session.town.toUpperCase() : 'SOLAN HILL SECTOR',
      avatarBg: '#0ea5e9',
      badge: 'Verified Hill Pilot'
    },
    merchant: {
      name: session && session.name ? session.name : 'Anand Sweet Shop & Bakers',
      phone: session && session.phone ? '+91 ' + session.phone : '+91 98160 12345',
      town: session && session.town ? session.town.toUpperCase() : 'UPPER MALL, SOLAN',
      avatarBg: '#f59e0b',
      badge: 'Vyapar Mandal Merchant'
    },
    admin: {
      name: 'Super Admin Commander',
      phone: '+91 98000 11111',
      town: 'SHIMLA HQ (2,205M)',
      avatarBg: '#10b981',
      badge: 'Full Operations Access'
    }
  };

  const user = DEFAULTS[currentRole] || DEFAULTS.customer;

  // 1. Inject Stylesheet
  const style = document.createElement('style');
  style.id = 'pahadiProfileDrawerStyles';
  style.textContent = `
    /* Top Profile Trigger Button */
    .pahadi-profile-trigger-btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #ffffff;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    .pahadi-profile-trigger-btn:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: #10b981;
    }
    .pahadi-avatar-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${user.avatarBg};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
      font-weight: 800;
    }

    /* Backdrop Overlay */
    .pahadi-drawer-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 100000000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s;
    }
    .pahadi-drawer-backdrop.active {
      opacity: 1;
      visibility: visible;
    }

    /* Slide-out Profile Panel (Matching User Screenshots Exactly) */
    .pahadi-profile-drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      max-width: 440px;
      background: #f8fafc;
      color: #0f172a;
      z-index: 100000001;
      box-shadow: 20px 0 50px rgba(0, 0, 0, 0.5);
      transform: translateX(-100%);
      transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      -webkit-overflow-scrolling: touch;
    }
    .pahadi-profile-drawer.active {
      transform: translateX(0);
    }

    /* Top Navigation Header */
    .drawer-top-nav {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: #ffffff;
      border-bottom: 1px solid #f1f5f9;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .drawer-back-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #334155;
      font-size: 16px;
      font-weight: 800;
      transition: all 0.15s;
    }
    .drawer-back-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .drawer-nav-title {
      font-family: 'Outfit', sans-serif;
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
    }

    /* User Profile Header Card */
    .drawer-user-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #ffffff;
    }
    .drawer-big-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${user.avatarBg};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #ffffff;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    }
    .drawer-user-meta h2 {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
    }
    .drawer-user-meta p {
      font-size: 13.5px;
      color: #64748b;
      margin-top: 3px;
      font-weight: 600;
    }
    .drawer-badge {
      display: inline-block;
      margin-top: 5px;
      padding: 2px 8px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 9999px;
      font-size: 10.5px;
      font-weight: 700;
      color: #475569;
    }

    /* 3 Quick Action Cards Row (Exact Match to User Screenshots) */
    .drawer-quick-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      padding: 4px 20px 16px;
      background: #ffffff;
      border-bottom: 1px solid #f1f5f9;
    }
    .quick-action-card {
      background: #ffffff;
      border: 1.5px solid #f1f5f9;
      border-radius: 14px;
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: all 0.2s;
    }
    .quick-action-card:hover {
      border-color: #cbd5e1;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }
    .quick-card-icon {
      font-size: 24px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .quick-card-label {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      line-height: 1.3;
    }

    /* Update Available Banner */
    .drawer-banner-box {
      margin: 14px 20px;
      padding: 12px 14px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }
    .banner-gear-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .banner-text-wrap {
      flex: 1;
      min-width: 0;
    }
    .banner-title {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }
    .banner-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 1px;
    }
    .badge-new-pill {
      background: #10b981;
      color: #ffffff;
      padding: 3px 8px;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 2px;
    }

    /* Section Groups (Your Information & Other Information) */
    .drawer-section-title {
      padding: 12px 20px 6px;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    .drawer-info-group {
      margin: 4px 20px 14px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }
    .drawer-list-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: background 0.15s;
    }
    .drawer-list-item:last-child {
      border-bottom: none;
    }
    .drawer-list-item:hover {
      background: #f8fafc;
    }
    .item-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .item-icon {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      color: #334155;
    }
    .item-label {
      font-size: 13.5px;
      font-weight: 700;
      color: #1e293b;
    }
    .item-subtext {
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
      margin-top: 1px;
    }
    .item-chevron {
      color: #94a3b8;
      font-size: 14px;
      font-weight: 700;
    }

    /* Bottom Log Out Section */
    .drawer-bottom-wrap {
      margin-top: auto;
      padding: 20px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .btn-drawer-logout {
      width: 100%;
      padding: 14px;
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 9999px;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 800;
      color: #ef4444;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-drawer-logout:hover {
      background: #fef2f2;
      border-color: #fca5a5;
    }
    .btn-drawer-switch {
      width: 100%;
      padding: 10px;
      background: transparent;
      border: 1px solid #cbd5e1;
      border-radius: 9999px;
      font-size: 12.5px;
      font-weight: 700;
      color: #475569;
      cursor: pointer;
    }
    .btn-drawer-switch:hover {
      background: #f1f5f9;
    }
    .drawer-version-tag {
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 4px;
    }
  `;
  document.head.appendChild(style);

  // 2. Generate Role-Specific Drawer HTML
  function getRoleSectionsHtml() {
    if (currentRole === 'customer') {
      // Customer: E-gift cards, rewards, zepto cash REMOVED as requested!
      return `
        <!-- 3 Quick Cards -->
        <div class="drawer-quick-row">
          <div class="quick-action-card" onclick="window.pahadiProfile.handleAction('orders')">
            <div class="quick-card-icon">👜</div>
            <div class="quick-card-label">Your Orders</div>
          </div>
          <div class="quick-action-card" onclick="window.pahadiProfile.handleAction('support')">
            <div class="quick-card-icon">💬</div>
            <div class="quick-card-label">Help & Support</div>
          </div>
          <div class="quick-action-card" onclick="window.pahadiProfile.handleAction('addresses')">
            <div class="quick-card-icon">📍</div>
            <div class="quick-card-label">Saved Addresses</div>
          </div>
        </div>

        <!-- Update Available Banner -->
        <div class="drawer-banner-box" onclick="window.pahadiProfile.handleAction('update')">
          <div class="banner-gear-icon">⚙️</div>
          <div class="banner-text-wrap">
            <div class="banner-title">Update Available</div>
            <div class="banner-sub">Enjoy a more seamless hill shopping experience</div>
          </div>
          <div class="badge-new-pill">New ➔</div>
        </div>

        <!-- Section 1: Your Information -->
        <div class="drawer-section-title">Your Information</div>
        <div class="drawer-info-group">
          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('refunds')">
            <div class="item-left">
              <div class="item-icon">₹</div>
              <div>
                <div class="item-label">Your Refunds</div>
                <div class="item-subtext">Instant hill settlement balance</div>
              </div>
            </div>
            <div class="item-chevron">➔</div>
          </div>

          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('support')">
            <div class="item-left">
              <div class="item-icon">💬</div>
              <div class="item-label">Help & Support</div>
            </div>
            <div class="item-chevron">➔</div>
          </div>

          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('addresses')">
            <div class="item-left">
              <div class="item-icon">📍</div>
              <div>
                <div class="item-label">Saved Addresses</div>
                <div class="item-subtext">Doorstep stairway count & landmarks</div>
              </div>
            </div>
            <div class="item-chevron">➔</div>
          </div>

          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('profile')">
            <div class="item-left">
              <div class="item-icon">👤</div>
              <div class="item-label">Profile Details</div>
            </div>
            <div class="item-chevron">➔</div>
          </div>

          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('payments')">
            <div class="item-left">
              <div class="item-icon">💳</div>
              <div class="item-label">Payment Management</div>
            </div>
            <div class="item-chevron">➔</div>
          </div>
        </div>

        <!-- Section 2: Other Information -->
        <div class="drawer-section-title">Other Information</div>
        <div class="drawer-info-group">
          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('suggest')">
            <div class="item-left">
              <div class="item-icon">⭐</div>
              <div class="item-label">Suggest Products</div>
            </div>
            <div class="item-chevron">➔</div>
          </div>
          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('notifications')">
            <div class="item-left">
              <div class="item-icon">🔔</div>
              <div class="item-label">Notifications</div>
            </div>
            <div class="item-chevron">➔</div>
          </div>
          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('general')">
            <div class="item-left">
              <div class="item-icon">ℹ️</div>
              <div class="item-label">General Info & Hill SLA</div>
            </div>
            <div class="item-chevron">➔</div>
          </div>
        </div>
      `;
    } else if (currentRole === 'rider') {
      // Rider Partner
      return `
        <!-- 3 Quick Cards -->
        <div class="drawer-quick-row">
          <div class="quick-action-card" onclick="window.pahadiProfile.handleAction('rider_missions')">
            <div class="quick-card-icon">🛵</div>
            <div class="quick-card-label">Active Missions</div>
          </div>
          <div class="quick-action-card" onclick="window.pahadiProfile.handleAction('rider_earnings')">
            <div class="quick-card-icon">💰</div>
            <div class="quick-card-label">Cash Float</div>
          </div>
          <div class="quick-action-card" onclick="window.pahadiProfile.handleAction('rider_sos')">
            <div class="quick-card-icon">🆘</div>
            <div class="quick-card-label">Hill SOS</div>
          </div>
        </div>

        <div class="drawer-section-title">Rider Information</div>
        <div class="drawer-info-group">
          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('rider_kyc')">
            <div class="item-left">
              <div class="item-icon">🪪</div>
              <div>
                <div class="item-label">Aadhaar & PAN Verification</div>
                <div class="item-subtext">UIDAI & NSDL Verified ✅</div>
              </div>
            </div>
            <div class="item-chevron">➔</div>
          </div>

          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('rider_vehicle')">
            <div class="item-left">
              <div class="item-icon">🏍️</div>
              <div>
                <div class="item-label">Driving License & Vehicle RC</div>
                <div class="item-subtext">Permanent MCWG Valid ✅</div>
              </div>
            </div>
            <div class="item-chevron">➔</div>
          </div>

          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('rider_stairs')">
            <div class="item-left">
              <div class="item-icon">🧗</div>
              <div>
                <div class="item-label">Stair Climbs & Elevation</div>
                <div class="item-subtext">420 Steps Climbed Today</div>
              </div>
            </div>
            <div class="item-chevron">➔</div>
          </div>

          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('payments')">
            <div class="item-left">
              <div class="item-icon">💳</div>
              <div class="item-label">Payout Bank Account / UPI</div>
            </div>
            <div class="item-chevron">➔</div>
          </div>
        </div>

        <div class="drawer-section-title">Work & Protocols</div>
        <div class="drawer-info-group">
          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('weather')">
            <div class="item-left">
              <div class="item-icon">🌧️</div>
              <div class="item-label">Weather Surge & Anti-Skid Chains</div>
            </div>
            <div class="item-chevron">➔</div>
          </div>
          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('notifications')">
            <div class="item-left">
              <div class="item-icon">🔔</div>
              <div class="item-label">Order Broadcast Notifications</div>
            </div>
            <div class="item-chevron">➔</div>
          </div>
        </div>
      `;
    } else {
      // Merchant / Vyapar Mandal
      return `
        <!-- 3 Quick Cards -->
        <div class="drawer-quick-row">
          <div class="quick-action-card" onclick="window.pahadiProfile.handleAction('merchant_orders')">
            <div class="quick-card-icon">🛍️</div>
            <div class="quick-card-label">Live Orders</div>
          </div>
          <div class="quick-action-card" onclick="window.pahadiProfile.handleAction('merchant_wallet')">
            <div class="quick-card-icon">💵</div>
            <div class="quick-card-label">T+1 Wallet</div>
          </div>
          <div class="quick-action-card" onclick="window.pahadiProfile.handleAction('merchant_catalog')">
            <div class="quick-card-icon">📦</div>
            <div class="quick-card-label">Store Inventory</div>
          </div>
        </div>

        <div class="drawer-section-title">Store & Compliance</div>
        <div class="drawer-info-group">
          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('merch_fssai')">
            <div class="item-left">
              <div class="item-icon">🥗</div>
              <div>
                <div class="item-label">FSSAI License & Certificate</div>
                <div class="item-subtext">14-Digit Active License ✅</div>
              </div>
            </div>
            <div class="item-chevron">➔</div>
          </div>

          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('merch_gst')">
            <div class="item-left">
              <div class="item-icon">🏛️</div>
              <div>
                <div class="item-label">GSTIN Himachal Certificate</div>
                <div class="item-subtext">State Code 02 Active ✅</div>
              </div>
            </div>
            <div class="item-chevron">➔</div>
          </div>

          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('merch_pan')">
            <div class="item-left">
              <div class="item-icon">💳</div>
              <div>
                <div class="item-label">Business PAN Card</div>
                <div class="item-subtext">Verified Enterprise ✅</div>
              </div>
            </div>
            <div class="item-chevron">➔</div>
          </div>

          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('merch_photos')">
            <div class="item-left">
              <div class="item-icon">🏪</div>
              <div class="item-label">Store Facade & Counter Images</div>
            </div>
            <div class="item-chevron">➔</div>
          </div>
        </div>

        <div class="drawer-section-title">Store Settings</div>
        <div class="drawer-info-group">
          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('timings')">
            <div class="item-left">
              <div class="item-icon">⏰</div>
              <div class="item-label">Store Operating Hours & Surge Lock</div>
            </div>
            <div class="item-chevron">➔</div>
          </div>
          <div class="drawer-list-item" onclick="window.pahadiProfile.handleAction('notifications')">
            <div class="item-left">
              <div class="item-icon">🔔</div>
              <div class="item-label">Order Chime & WhatsApp Broadcast</div>
            </div>
            <div class="item-chevron">➔</div>
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
      <div class="drawer-nav-title">Profile</div>
    </div>

    <!-- User Meta -->
    <div class="drawer-user-card">
      <div class="drawer-big-avatar">👤</div>
      <div class="drawer-user-meta">
        <h2>${user.name}</h2>
        <p>${user.phone}</p>
        <div class="drawer-badge">🏔️ ${user.town} &bull; ${user.badge}</div>
      </div>
    </div>

    <!-- Dynamic Sections -->
    ${getRoleSectionsHtml()}

    <!-- Bottom Actions: Logout -->
    <div class="drawer-bottom-wrap">
      <button class="btn-drawer-logout" onclick="window.pahadiProfile.logout()">
        <span>🚪</span>
        <span>Log Out</span>
      </button>
      <button class="btn-drawer-switch" onclick="window.PahadiAuth.switchRole()">
        🔄 Switch Role / Portal
      </button>
      <div class="drawer-version-tag">
        PahadiCart PWA v3.0 &bull; Build 26.8.6 v206-8
      </div>
    </div>
  `;

  backdrop.appendChild(drawer);
  document.body.appendChild(backdrop);

  // Close when clicking outside drawer
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
        refunds: 'Refunds Balance: ₹0.00 (All orders settled smoothly).',
        profile: 'Profile Details: Name: ' + user.name + ' • Phone: ' + user.phone,
        payments: 'Payment Management: UPI AutoPay, Cash on Delivery (COD) Active.',
        suggest: 'Opening suggestion box for local Himachal organic items...',
        notifications: 'Push notifications are ACTIVE for hill delivery alerts.',
        general: 'PahadiCart: Himachal 2-Hour Hyperlocal Network (Solan, Shimla, Dharamshala).',
        update: 'Your app is already running the latest PWA v3.0 build!',
        rider_missions: 'Showing active hill delivery missions...',
        rider_earnings: 'Today Earnings: ₹840 • Cash Collected: ₹1,250.',
        rider_sos: '🚨 Hill SOS Activated: Emergency response notified.',
        rider_kyc: 'Aadhaar & PAN are verified and active on file.',
        rider_vehicle: 'Vehicle HP 14 B 4210: Permanent MCWG License Valid.',
        rider_stairs: 'Staircase Climb: 420 steps logged today across Upper Bazaar.',
        weather: 'Current weather condition: Rain Alert (+15 min buffer active).',
        merchant_orders: 'Switching to live orders board...',
        merchant_wallet: 'T+1 Settlement Balance: ₹14,280 ready for payout.',
        merchant_catalog: 'Opening store inventory & item pricing...',
        merch_fssai: 'FSSAI License: 10924001004210 (Valid until 2029).',
        merch_gst: 'GSTIN: 02AAACH1234F1Z8 (Himachal Pradesh).',
        merch_pan: 'Business PAN: AAACH1234F verified on record.',
        merch_photos: 'Store front & shelf photos are uploaded.',
        timings: 'Store hours: 07:30 AM to 09:30 PM.'
      };

      alert(messages[actionKey] || 'PahadiCart: ' + actionKey);
    }
  };

  // 5. Inject Profile Button into Navigation Bar
  function injectNavProfileButton() {
    // Look for top navbar
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

    // Also attach to any existing profile button
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
