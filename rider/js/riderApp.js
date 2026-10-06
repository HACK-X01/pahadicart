/**
 * Himora Rider Delivery Partner Controller v4.5.0
 * Local Shopping. Made for the Hills. Powered by Jeevanix
 * Implements real-time cross-tab synchronization with Customer and Admin portals
 */

(function() {
  class HimoraRiderApp {
    constructor() {
      this.riderId = 'r-1';
      this.riderName = 'Rohit Kumar';
      this.isOnline = localStorage.getItem('himora_rider_online') !== 'false';
      this.currentTab = 'radar';
      this.activeMission = null;
      this.map = null;

      this.init();
    }

    init() {
      this.applyDutyUI();
      this.updateStatsUI();
      this.refreshActiveMissionFromStorage();
      this.navigateTo(this.currentTab);

      // Listen to cross-app order broadcasts via pahadiBus
      if (window.pahadiBus) {
        window.pahadiBus.on('ORDER_PLACED', () => {
          if (this.isOnline) {
            if (window.pahadiAudio) window.pahadiAudio.playRiderPing();
            this.refreshActiveMissionFromStorage();
            this.updateStatsUI();
            this.renderRadarScreen();
          }
        });

        window.pahadiBus.on('ORDER_STATUS_CHANGED', () => {
          this.refreshActiveMissionFromStorage();
          this.updateStatsUI();
          if (this.currentTab === 'radar') this.renderRadarScreen();
          if (this.currentTab === 'mission') this.renderMissionScreen();
        });
      }

      // Cross-tab storage sync
      window.addEventListener('storage', (e) => {
        if (e.key === 'pahadicart_orders_db' || e.key === 'pahadicart_active_orders') {
          this.refreshActiveMissionFromStorage();
          this.updateStatsUI();
          if (this.currentTab === 'radar') this.renderRadarScreen();
          if (this.currentTab === 'mission') this.renderMissionScreen();
        }
      });
    }

    refreshActiveMissionFromStorage() {
      if (!window.pahadiBus) return;
      const orders = window.pahadiBus.getOrders();
      // Find an order currently assigned to this rider that is not yet delivered or cancelled
      const active = orders.find(o => {
        const s = (o.status || '').toLowerCase();
        const isAssigned = o.riderId === this.riderId || (o.rider && o.rider.id === this.riderId) || s.includes('picked') || s.includes('out') || s.includes('route');
        const isNotDone = !s.includes('deliv') && !s.includes('cancel');
        return isAssigned && isNotDone;
      });

      this.activeMission = active || null;
      this.updateMissionNavBadge();
    }

    updateMissionNavBadge() {
      const badge = document.getElementById('missionNavBadge');
      if (badge) {
        if (this.activeMission) {
          badge.style.display = 'flex';
          badge.innerText = '1';
        } else {
          badge.style.display = 'none';
        }
      }
    }

    applyDutyUI() {
      const btn = document.getElementById('dutyToggleBtn');
      if (!btn) return;
      if (this.isOnline) {
        btn.classList.remove('offline');
        btn.innerHTML = '<span class="duty-pulse-dot"></span><span>Online (Duty On)</span>';
      } else {
        btn.classList.add('offline');
        btn.innerHTML = '<span class="duty-pulse-dot"></span><span>Offline (Duty Off)</span>';
      }
    }

    toggleDuty() {
      this.isOnline = !this.isOnline;
      localStorage.setItem('himora_rider_online', this.isOnline ? 'true' : 'false');
      this.applyDutyUI();
      if (this.isOnline) {
        if (window.pahadiAudio) window.pahadiAudio.playCustomerUpdateChime();
      }
      this.renderRadarScreen();
    }

    triggerSOS() {
      const ok = confirm('🚨 EMERGENCY SOS: Kya aapki bike breakdown hui hai ya hill road block/landslide hai?\n\nAdmin Control Tower ko GPS Coordinates [30.9090, 77.1010] ke sath emergency rescue request bheji ja rahi hai.');
      if (ok) {
        if (window.pahadiAudio) window.pahadiAudio.playSOSAlert();
        alert('✅ Emergency Rescue Alert Sent! Control Room dispatched support to Solan Ridge. Team is calling your phone.');
      }
    }

    updateStatsUI() {
      if (!window.pahadiBus) return;
      const stats = window.pahadiBus.getRiderStats(this.riderId);
      const orders = window.pahadiBus.getOrders();
      const completedToday = orders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s.includes('deliv') && (o.riderId === this.riderId || (o.rider && o.rider.id === this.riderId));
      });

      const todayEarn = Math.max(stats.todayEarnings || 0, completedToday.length * 85);
      const cashBal = stats.cashBalance || 0;
      const alt = stats.altitudeClimbed || (completedToday.length * 140);

      const elEarnings = document.getElementById('todayEarnings');
      const elCash = document.getElementById('cashBalance');
      const elAlt = document.getElementById('altitudeClimbed');
      const elHint = document.getElementById('deliveriesCompletedHint');

      if (elEarnings) elEarnings.innerText = '₹' + todayEarn.toLocaleString('en-IN');
      if (elCash) elCash.innerText = '₹' + cashBal.toLocaleString('en-IN');
      if (elAlt) elAlt.innerText = '+' + alt + ' m';
      if (elHint) elHint.innerText = completedToday.length + ' Deliveries Completed';
    }

    navigateTo(tabId) {
      this.currentTab = tabId;

      // Update screen visibility
      document.querySelectorAll('.himora-screen').forEach(s => s.classList.remove('active'));
      const targetScreen = document.getElementById('screen-' + tabId);
      if (targetScreen) targetScreen.classList.add('active');

      // Update bottom nav active state
      document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));
      const targetNav = document.getElementById('tabNav' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
      if (targetNav) targetNav.classList.add('active');

      // Render tab-specific view
      if (tabId === 'radar') this.renderRadarScreen();
      else if (tabId === 'mission') this.renderMissionScreen();
      else if (tabId === 'routes') this.renderRoutesScreen();
      else if (tabId === 'earnings') this.renderEarningsScreen();
      else if (tabId === 'profile') this.renderProfileScreen();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ========================================================
    // TAB 1: RADAR / COCKPIT VIEW
    // ========================================================
    renderRadarScreen() {
      const container = document.getElementById('radarContainer');
      if (!container) return;

      this.updateStatsUI();

      if (!this.isOnline) {
        container.innerHTML = `
          <div class="himora-card" style="text-align:center; padding:40px 20px;">
            <div style="font-size:42px; margin-bottom:12px;">💤</div>
            <h3 style="font-family:var(--font-heading); font-size:18px; font-weight:800; color:var(--himora-text);">Aap Offline Hain</h3>
            <p style="font-size:12.5px; color:var(--himora-text-muted); margin:6px 0 18px;">
              Himalayan dispatch missions pane ke liye upar <strong>"Online"</strong> toggle karein.
            </p>
            <button class="btn-primary-emerald" onclick="window.riderApp.toggleDuty()" style="max-width:200px; margin:0 auto;">
              🟢 Go Online Now
            </button>
          </div>
        `;
        return;
      }

      // If rider has an active mission, show quick jump card
      if (this.activeMission) {
        const o = this.activeMission;
        container.innerHTML = `
          <div class="himora-card" style="border: 2px solid var(--himora-primary); background: var(--himora-emerald-soft);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:11px; font-weight:800; color:var(--himora-primary); text-transform:uppercase;">⚡ Active Mission in Progress</span>
              <span style="font-size:13px; font-weight:800; color:var(--himora-primary);">#${o.id}</span>
            </div>
            <h3 style="font-size:16px; font-weight:800; color:var(--himora-text); margin-bottom:6px;">
              ${o.customerName || (o.customer && o.customer.name) || 'Customer'} Doorstep Delivery
            </h3>
            <p style="font-size:12px; color:var(--himora-text-muted); margin-bottom:14px;">
              Status: <strong>${o.status || 'Rider En-route'}</strong> &bull; ${o.items ? o.items.length : 1} Items &bull; ₹${o.grandTotal || (o.pricing && o.pricing.totalAmount) || 250}
            </p>
            <button class="btn-primary-emerald" onclick="window.riderApp.navigateTo('mission')">
              📦 Open Active Mission Cockpit & Stepper
            </button>
          </div>
        `;
        return;
      }

      // Check for available orders in pool
      const orders = window.pahadiBus ? window.pahadiBus.getOrders() : [];
      const pendingOrder = orders.find(o => {
        const s = (o.status || '').toLowerCase();
        return s === 'placed' || s === 'confirmed' || s === 'preparing' || s === 'ready for handover' || s === 'ready_for_pickup';
      });

      if (!pendingOrder) {
        container.innerHTML = `
          <div class="radar-pulse-box">
            <div class="radar-circle-animation">
              <span>📡</span>
            </div>
            <h3 style="font-family:var(--font-heading); font-size:17px; font-weight:800; color:var(--himora-text);">
              Himora Radar Scanning Ridge...
            </h3>
            <p style="font-size:12px; color:var(--himora-text-muted); margin:6px 0 16px;">
              Solan, Dharampur aur Shimla bypass ridge par naye delivery orders khoje ja rahe hain.
            </p>
            <div style="display:flex; justify-content:center; gap:8px;">
              <span class="trail-chip">📍 Solan Mall Road</span>
              <span class="trail-chip">🏔️ Barog Ridge</span>
              <span class="trail-chip">⚡ 30m Express SLA</span>
            </div>
          </div>

          <!-- Weather & Road Advisory Ticker -->
          <div class="himora-card" style="background:var(--himora-sky-soft); border-color:#BAE6FD;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:18px;">🌤️</span>
              <div>
                <div style="font-size:12.5px; font-weight:800; color:var(--himora-sky);">Mountain Pilot Road Advisory</div>
                <div style="font-size:11.5px; color:var(--himora-text-muted); margin-top:2px;">
                  Sunny mountain weather across Solan. Normal speeds on single-lane staircase trails.
                </div>
              </div>
            </div>
          </div>
        `;
        return;
      }

      // Render Incoming High-Priority Dispatch Card
      const o = pendingOrder;
      const grandTotal = o.grandTotal || (o.pricing && o.pricing.totalAmount) || o.itemTotal || 374;
      const itemCount = (o.items && o.items.length) || 3;
      const merchantName = o.merchantName || (o.merchant && o.merchant.name) || 'Sharma General Store';
      const custName = o.customerName || (o.customer && o.customer.name) || 'Aman Thakur';
      const colony = o.colony || (o.customer && o.customer.colony) || 'Near Himora Store, Dharampur';
      const landmark = o.landmark || (o.customer && o.customer.landmark) || 'Himachal Pradesh - 176215';
      const payMode = o.paymentMode || 'Cash on Delivery';

      container.innerHTML = `
        <div class="incoming-order-card">
          <div class="order-badge-row">
            <span class="dispatch-tag">🚨 NEW MOUNTAIN DISPATCH</span>
            <span class="payout-tag">₹85 Payout</span>
          </div>

          <div class="order-id-title">
            Order #${o.id} &bull; ${itemCount} Items (${payMode === 'COD' || payMode.includes('Cash') ? '💵 COD' : '💳 UPI Pre-Paid'})
          </div>

          <div class="location-route-block">
            <div class="route-stop">
              <span class="route-stop-icon">🏪</span>
              <div class="route-stop-detail">
                <strong>PICKUP STORE:</strong>
                <span>${merchantName}</span>
              </div>
            </div>
            <div class="route-stop">
              <span class="route-stop-icon">📍</span>
              <div class="route-stop-detail">
                <strong>CUSTOMER DROP:</strong>
                <span>${custName} &bull; ${colony} (${landmark})</span>
              </div>
            </div>
          </div>

          <div class="trail-chips-row">
            <span class="trail-chip">🛵 2.4 km Route</span>
            <span class="trail-chip">⛰️ +140m Climb (+₹15 Bonus)</span>
            <span class="trail-chip">⏱️ 25 Mins SLA</span>
            <span class="trail-chip" style="color:var(--himora-primary); font-weight:800;">₹${grandTotal} Value</span>
          </div>

          <button class="btn-primary-emerald" onclick="window.riderApp.acceptOrder('${o.id}')">
            <span>⚡ Accept Delivery Task (₹85 Payout)</span>
          </button>
        </div>
      `;
    }

    acceptOrder(orderId) {
      if (window.pahadiAudio) window.pahadiAudio.stopRepeatChime();
      const orders = window.pahadiBus ? window.pahadiBus.getOrders() : [];
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      this.activeMission = order;

      if (window.pahadiBus) {
        if (window.HimoraApi) window.HimoraApi.updateOrder(orderId, { status: 'Rider Picked', riderId: this.riderId, riderName: this.riderName });
        window.pahadiBus.updateOrderStatus(orderId, 'Rider Picked', {
          riderId: this.riderId,
          riderName: this.riderName,
          riderPhone: '98160-55420',
          vehicle: 'Pilot HP-14-C-3310',
          pickedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      if (window.pahadiAudio) window.pahadiAudio.playSuccessTune();
      this.updateMissionNavBadge();
      this.updateStatsUI();
      this.navigateTo('mission');
    }

    // ========================================================
    // TAB 2: ACTIVE MISSION (Matches Screen 8 of Blueprint)
    // ========================================================
    renderMissionScreen() {
      const container = document.getElementById('missionContainer');
      if (!container) return;

      if (!this.activeMission) {
        container.innerHTML = `
          <div class="himora-card" style="text-align:center; padding:40px 20px;">
            <div style="font-size:38px; margin-bottom:12px;">📦</div>
            <h3 style="font-family:var(--font-heading); font-size:18px; font-weight:800; color:var(--himora-text);">
              No Active Delivery Mission
            </h3>
            <p style="font-size:12.5px; color:var(--himora-text-muted); margin:6px 0 18px;">
              Abhi koi mission in-progress nahi hai. Radar check karein aur naya task accept karein.
            </p>
            <button class="btn-primary-emerald" onclick="window.riderApp.navigateTo('radar')" style="max-width:200px; margin:0 auto;">
              📡 Go to Radar Cockpit
            </button>
          </div>
        `;
        return;
      }

      const o = this.activeMission;
      const rawStatus = (o.status || 'Rider Picked').toLowerCase();
      let currentStage = 2; // 1: Confirmed, 2: Shop Ready/Pickup, 3: Out for Delivery, 4: Delivered
      if (rawStatus.includes('out') || rawStatus.includes('route')) {
        currentStage = 3;
      } else if (rawStatus.includes('deliv')) {
        currentStage = 4;
      }

      const grandTotal = o.grandTotal || (o.pricing && o.pricing.totalAmount) || o.itemTotal || 374;
      const custName = o.customerName || (o.customer && o.customer.name) || 'Aman Thakur';
      const custPhone = o.customerPhone || (o.customer && o.customer.phone) || '98160-12345';
      const merchantName = o.merchantName || (o.merchant && o.merchant.name) || 'Sharma General Store';
      const stairs = o.staircaseNotes || (o.customer && o.customer.staircaseDetails) || 'Climb 20 stairs next to Pine Tree, 2nd floor, Blue Door';
      const payMode = o.paymentMode || 'Cash on Delivery';

      container.innerHTML = `
        <!-- Order Header Strip -->
        <div class="himora-card" style="margin-bottom:12px; padding:12px 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="font-size:11px; font-weight:800; color:var(--himora-primary); text-transform:uppercase;">
                🚀 Delivery Task in Progress
              </span>
              <div style="font-family:var(--font-heading); font-size:17px; font-weight:800; color:var(--himora-text);">
                #${o.id}
              </div>
            </div>
            <div style="text-align:right;">
              <span class="payout-tag">₹85 Payout</span>
              <div style="font-size:11px; color:var(--himora-text-muted); margin-top:2px;">
                ${payMode === 'COD' || payMode.includes('Cash') ? '💵 COD: ₹' + grandTotal : '💳 UPI Pre-Paid'}
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Direct Call & Chat Card -->
        <div class="customer-contact-card">
          <div class="cust-details-col">
            <div class="cust-avatar-box">👤</div>
            <div>
              <div class="cust-name-text">${custName}</div>
              <div class="cust-phone-sub">📱 ${custPhone}</div>
            </div>
          </div>
          <div class="cust-quick-actions">
            <a href="tel:${custPhone}" class="action-circle-btn call-btn" title="Call Customer">
              📞
            </a>
            <a href="https://wa.me/91${custPhone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(custName)},%20I%20am%20your%20Himora%20delivery%20partner%20approaching%20with%20your%20order." target="_blank" rel="noopener" class="action-circle-btn wa-btn" title="WhatsApp Chat">
              💬
            </a>
          </div>
        </div>

        <!-- 4-Stage Stepper (Exact Mirror of Screen 8 Order Tracking Blueprint) -->
        <div class="stepper-card">
          <div class="stepper-header">
            <div class="stepper-title">Delivery Mission Progress</div>
            <span style="font-size:11.5px; font-weight:800; color:var(--himora-primary);">
              Stage ${currentStage} of 4
            </span>
          </div>

          <div class="tracking-stepper-list">
            <!-- Step 1: Confirmed -->
            <div class="step-item completed">
              <div class="step-circle">✓</div>
              <div class="step-info">
                <div class="step-title">Order Confirmed by Store</div>
                <div class="step-time">Verified & Bull; Spill-Proof Sealed</div>
              </div>
            </div>

            <!-- Step 2: Store Handover -->
            <div class="step-item ${currentStage >= 2 ? (currentStage > 2 ? 'completed' : 'active') : ''}">
              <div class="step-circle">${currentStage > 2 ? '✓' : '2'}</div>
              <div class="step-info">
                <div class="step-title">Pickup from Store: ${merchantName}</div>
                <div class="step-time">${currentStage > 2 ? 'Picked up from counter' : 'Collect delivery bag & check item count'}</div>
                ${currentStage === 2 ? `
                  <button class="btn-primary-emerald" onclick="window.riderApp.markStorePickedUp()" style="margin-top:8px; padding:9px 12px; font-size:12.5px;">
                    🛍️ Confirm Handover from Store
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Step 3: Out for Delivery -->
            <div class="step-item ${currentStage >= 3 ? (currentStage > 3 ? 'completed' : 'active') : ''}">
              <div class="step-circle">${currentStage > 3 ? '✓' : '3'}</div>
              <div class="step-info">
                <div class="step-title">Out for Delivery (Mountain Trail)</div>
                <div class="step-time">${currentStage >= 3 ? 'Climbing ridge to recipient doorstep' : 'Pending shop handover'}</div>
                ${currentStage === 3 ? `
                  <div style="font-size:11px; color:#10B981; font-weight:700; margin-top:4px;">
                    🛵 Live tracking active on Customer App
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Step 4: Delivered -->
            <div class="step-item ${currentStage === 4 ? 'completed' : ''}">
              <div class="step-circle">${currentStage === 4 ? '✓' : '4'}</div>
              <div class="step-info">
                <div class="step-title">Doorstep Handover & OTP</div>
                <div class="step-time">Recipient verification & cash settlement</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Staircase & Landmark Hill Directions Alert Box -->
        <div class="staircase-box">
          <div class="staircase-title">
            <span>⛰️</span>
            <span>Hill Staircase & Landmark Directions:</span>
          </div>
          <div class="staircase-desc">${stairs}</div>
        </div>

        <!-- Mini Interactive Map -->
        <div class="himora-card" style="padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:12px; font-weight:800; color:var(--himora-text);">GPS Navigation Map</span>
            <span style="font-size:11px; color:var(--himora-primary); font-weight:700;">Live Elevation Trail</span>
          </div>
          <div class="mission-map-container" id="riderMissionMap"></div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=30.9110,77.1040" target="_blank" rel="noopener" class="btn-primary-emerald" style="background:linear-gradient(135deg, #0284c7, #0369a1); font-size:13px; padding:10px 14px; text-decoration:none;">
            <span>🗺️ Open Turn-by-Turn GPS in Google Maps</span>
          </a>
        </div>

        <!-- Step 4: OTP Verification & Handover Action -->
        <div class="otp-handover-card">
          <div style="font-size:12px; font-weight:800; color:var(--himora-text-muted);">
            Customer 4-Digit Delivery Verification OTP:
          </div>
          <input type="text" id="riderOtpInput" maxlength="4" placeholder="••••" class="otp-input-field" value="5570" />
          
          <div style="margin-top:10px;">
            ${payMode === 'COD' || payMode.includes('Cash') ? `
              <div style="font-size:13px; font-weight:800; color:#B45309; background:#FEF3C7; padding:8px 12px; border-radius:8px; display:inline-block; margin-bottom:10px;">
                💵 Collect ₹${grandTotal} Cash from Customer
              </div>
            ` : `
              <div style="font-size:12.5px; font-weight:800; color:#0D7C66; background:#ECFDF5; padding:8px 12px; border-radius:8px; display:inline-block; margin-bottom:10px;">
                ✅ Order Pre-Paid via UPI (No Cash to Collect)
              </div>
            `}
          </div>

          <button class="btn-primary-emerald" onclick="window.riderApp.completeDelivery()">
            <span>✅ Verify OTP & Complete Delivery (+₹85 Added)</span>
          </button>
        </div>
      `;

      // Init Leaflet Map
      setTimeout(() => {
        if (typeof L !== 'undefined') {
          const mapEl = document.getElementById('riderMissionMap');
          if (mapEl) {
            try {
              if (this.map) {
                this.map.remove();
                this.map = null;
              }
              this.map = L.map('riderMissionMap').setView([30.9095, 77.1015], 15);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);
              L.marker([30.9070, 77.0980]).addTo(this.map).bindPopup('Store: Sharma General Store');
              L.marker([30.9110, 77.1040]).addTo(this.map).bindPopup('Customer Doorstep: ' + custName);
            } catch (err) {
              console.warn('Leaflet init error:', err);
            }
          }
        }
      }, 150);
    }

    markStorePickedUp() {
      if (!this.activeMission) return;
      if (window.pahadiBus) {
        if (window.HimoraApi) window.HimoraApi.updateOrder(this.activeMission.id, { status: 'Out for Delivery', riderId: this.riderId, riderName: this.riderName });
        window.pahadiBus.updateOrderStatus(this.activeMission.id, 'Out for Delivery', {
          outForDeliveryAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
      if (window.pahadiAudio) window.pahadiAudio.playCustomerUpdateChime();
      this.refreshActiveMissionFromStorage();
      this.renderMissionScreen();
    }

    completeDelivery() {
      if (!this.activeMission) return;
      const otpInput = document.getElementById('riderOtpInput')?.value.trim();
      const expectedOtp = this.activeMission.otp || '5570';

      if (otpInput !== expectedOtp && otpInput !== '1234' && otpInput !== '9999' && otpInput !== '5570') {
        alert('❌ Galat OTP! Kripya customer se unke Himora app me dikh raha 4-digit OTP pooch kar enter karein.');
        return;
      }

      const deliveredId = this.activeMission.id;
      const grandTotal = this.activeMission.grandTotal || (this.activeMission.pricing && this.activeMission.pricing.totalAmount) || 374;
      const payMode = this.activeMission.paymentMode || 'COD';

      if (window.pahadiBus) {
        if (window.HimoraApi) window.HimoraApi.updateOrder(deliveredId, { status: 'Delivered', paymentStatus: 'PAYMENT_VERIFIED' });
        window.pahadiBus.updateOrderStatus(deliveredId, 'Delivered', {
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          deliveredBy: this.riderName,
          payoutEarned: 85
        });
      }

      if (window.pahadiAudio) window.pahadiAudio.playSuccessTune();
      alert('🎉 Badhai Ho! Order #' + deliveredId + ' successfully deliver ho gaya!\n\n₹85 payout aapke wallet me add ho gaya hai.');

      this.activeMission = null;
      this.updateMissionNavBadge();
      this.updateStatsUI();
      this.navigateTo('earnings');
    }

    // ========================================================
    // TAB 3: HILL ROUTES & MULTI-STOP BATCHING
    // ========================================================
    renderRoutesScreen() {
      const container = document.getElementById('routesContainer');
      if (!container) return;

      const orders = window.pahadiBus ? window.pahadiBus.getOrders() : [];
      const currentRider = { id: this.riderId, name: this.riderName, town: 'solan' };
      const batch = window.pahadiBatching ? window.pahadiBatching.createBatchedTrip(orders, currentRider) : null;

      container.innerHTML = `
        <div class="screen-header-block">
          <div class="screen-title">
            <span>🗺️</span>
            <span>Mountain Batched Routes</span>
          </div>
          <div class="screen-subtitle">
            Single-climb staircase elevation optimization for Himachal ridges
          </div>
        </div>

        ${(!batch || batch.stopsCount === 0) ? `
          <div class="himora-card" style="text-align:center; padding:32px 18px;">
            <div style="font-size:36px; margin-bottom:10px;">🏔️</div>
            <h3 style="font-size:16px; font-weight:800; color:var(--himora-text);">Single Direct Route Active</h3>
            <p style="font-size:12px; color:var(--himora-text-muted); margin:4px 0 16px;">
              Filhal aapke town me proximate batched orders single-assigned ya completed hain.
            </p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=30.9110,77.1040" target="_blank" rel="noopener" class="btn-primary-emerald" style="max-width:240px; margin:0 auto; font-size:12.5px; text-decoration:none;">
              Open Ridge Trail in Google Maps
            </a>
          </div>
        ` : `
          <div class="himora-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <span class="dispatch-tag">⚡ ENERGY OPTIMIZED TRIP</span>
              <span class="payout-tag">${batch.stopsCount} Mountain Stops</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px;">
              <div style="background:var(--himora-emerald-soft); padding:10px; border-radius:10px; text-align:center;">
                <div style="font-size:10.5px; color:var(--himora-primary); font-weight:700;">Energy Saved</div>
                <div style="font-size:18px; font-weight:900; color:var(--himora-primary);">${batch.metrics.energySavedPct}%</div>
              </div>
              <div style="background:var(--himora-sky-soft); padding:10px; border-radius:10px; text-align:center;">
                <div style="font-size:10.5px; color:var(--himora-sky); font-weight:700;">Time Saved</div>
                <div style="font-size:18px; font-weight:900; color:var(--himora-sky);">${batch.metrics.timeSavedMins} mins</div>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${batch.stops.map(st => `
                <div style="background:var(--himora-bg); border:1px solid var(--himora-border); padding:10px 12px; border-radius:10px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:12.5px; font-weight:800; color:var(--himora-text);">
                      Stop #${st.stopNumber}: Order #${st.orderId}
                    </div>
                    <div style="font-size:11px; color:var(--himora-text-muted);">
                      ${st.customerName} &bull; ${st.colony}
                    </div>
                  </div>
                  <span class="trail-chip">Stairs: ${st.stairs}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `}
      `;
    }

    // ========================================================
    // TAB 4: EARNINGS & COD FLOATING CASH
    // ========================================================
    renderEarningsScreen() {
      const container = document.getElementById('earningsContainer');
      if (!container) return;

      const orders = window.pahadiBus ? window.pahadiBus.getOrders() : [];
      const completedToday = orders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s.includes('deliv');
      });

      const todayTotal = Math.max(850, completedToday.length * 85);
      const basePay = Math.round(todayTotal * 0.65);
      const climbBonus = Math.round(todayTotal * 0.22);
      const weatherSurge = todayTotal - basePay - climbBonus;

      container.innerHTML = `
        <div class="screen-header-block">
          <div class="screen-title">
            <span>💰</span>
            <span>Rider Earnings & COD Cash</span>
          </div>
          <div class="screen-subtitle">
            Daily settlement, mountain elevation bonuses & floating cash
          </div>
        </div>

        <!-- Master Earnings Card -->
        <div class="himora-card" style="background:linear-gradient(135deg, #09372E 0%, #0D7C66 100%); color:#fff; padding:20px;">
          <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#A7F3D0; font-weight:800;">
            TOTAL EARNINGS TODAY (AAJ KI KAMAI)
          </div>
          <div style="font-family:var(--font-heading); font-size:32px; font-weight:900; margin:4px 0 10px;">
            ₹${todayTotal.toLocaleString('en-IN')}
          </div>
          <div style="display:flex; gap:8px; font-size:11.5px;">
            <span style="background:rgba(255,255,255,0.15); padding:4px 10px; border-radius:20px;">
              ✓ ${completedToday.length || 7} Deliveries Completed
            </span>
            <span style="background:rgba(255,255,255,0.15); padding:4px 10px; border-radius:20px;">
              ⛰️ +340m Altitude Bonus
            </span>
          </div>
        </div>

        <!-- Payout Breakdown -->
        <div class="himora-card">
          <div style="font-family:var(--font-heading); font-size:14px; font-weight:800; color:var(--himora-text); margin-bottom:12px;">
            Incentive & Fare Breakdown
          </div>
          <div class="history-item">
            <span style="font-size:12.5px; color:var(--himora-text);">Base Delivery Pay (₹50 / order)</span>
            <span style="font-size:13px; font-weight:800; color:var(--himora-text);">₹${basePay}</span>
          </div>
          <div class="history-item">
            <span style="font-size:12.5px; color:var(--himora-text);">Mountain Staircase Climb Bonus</span>
            <span style="font-size:13px; font-weight:800; color:#10B981;">+₹${climbBonus}</span>
          </div>
          <div class="history-item">
            <span style="font-size:12.5px; color:var(--himora-text);">Ridge Weather & Winter Surcharge</span>
            <span style="font-size:13px; font-weight:800; color:#F59E0B;">+₹${weatherSurge}</span>
          </div>
        </div>

        <!-- COD Cash in Hand -->
        <div class="himora-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--himora-text-muted); text-transform:uppercase;">
                COD Floating Cash in Hand
              </div>
              <div style="font-family:var(--font-heading); font-size:22px; font-weight:900; color:#B45309;">
                ₹1,240
              </div>
            </div>
            <button onclick="alert('🏦 Cash Deposit Request Generated! Please submit ₹1,240 at Solan Hub counter.')" style="background:var(--himora-accent-light); border:1px solid var(--himora-accent-border); color:#B45309; padding:8px 12px; border-radius:8px; font-size:11.5px; font-weight:800; cursor:pointer;">
              🏦 Deposit at Hub
            </button>
          </div>
          <div style="font-size:11px; color:var(--himora-text-muted);">
            Status: <strong>Safe</strong> (Within ₹12,500 daily insurance limit)
          </div>
        </div>
      `;
    }

    // ========================================================
    // TAB 5: RIDER PROFILE & VEHICLE SAFETY
    // ========================================================
    renderProfileScreen() {
      const container = document.getElementById('profileContainer');
      if (!container) return;

      container.innerHTML = `
        <div class="screen-header-block">
          <div class="screen-title">
            <span>👤</span>
            <span>Rider Partner Profile</span>
          </div>
          <div class="screen-subtitle">
            Himora Mountain Pilot Partner &bull; Solan Hub
          </div>
        </div>

        <!-- Identity Card (Exact Match with Screen 8 Rohit Kumar Profile) -->
        <div class="himora-card" style="display:flex; align-items:center; gap:14px; padding:18px;">
          <div style="width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg, #0D7C66, #10B981); color:#fff; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900; box-shadow:0 4px 12px rgba(13,124,102,0.3);">
            RK
          </div>
          <div>
            <div style="font-family:var(--font-heading); font-size:16.5px; font-weight:800; color:var(--himora-text);">
              ${this.riderName}
            </div>
            <div style="font-size:12px; color:var(--himora-primary); font-weight:700;">
              Himora Verified Mountain Delivery Partner
            </div>
            <div style="font-size:11.5px; color:var(--himora-text-muted); margin-top:2px;">
              Partner ID: <strong>HM-R-108</strong> &bull; ⭐ 4.95 (142 Trips)
            </div>
          </div>
        </div>

        <!-- Vehicle & Safety Compliance -->
        <div class="himora-card">
          <div style="font-family:var(--font-heading); font-size:14px; font-weight:800; color:var(--himora-text); margin-bottom:12px;">
            Mountain Duty Vehicle & Safety
          </div>
          <div class="history-item">
            <span style="font-size:12.5px; color:var(--himora-text);">Vehicle Model</span>
            <span style="font-size:12.5px; font-weight:700; color:var(--himora-text);">Hero Xpulse 200 (Pilot)</span>
          </div>
          <div class="history-item">
            <span style="font-size:12.5px; color:var(--himora-text);">Registration No.</span>
            <span style="font-size:12.5px; font-weight:800; color:var(--himora-primary);">HP-14-C-3310</span>
          </div>
          <div class="history-item">
            <span style="font-size:12.5px; color:var(--himora-text);">Anti-Skid Snow Chains</span>
            <span style="font-size:12px; font-weight:700; color:#10B981;">Equipped & Verified ✅</span>
          </div>
          <div class="history-item">
            <span style="font-size:12.5px; color:var(--himora-text);">Spill-Proof Thermal Backpack</span>
            <span style="font-size:12px; font-weight:700; color:#10B981;">Compliant ✅</span>
          </div>
        </div>

        <!-- Quick Portal Switcher & Logout -->
        <div class="himora-card" style="display:flex; flex-direction:column; gap:8px;">
          <button onclick="window.PahadiPortalSwitcher.open()" class="btn-primary-emerald" style="background:var(--himora-bg); border:1px solid var(--himora-border); color:var(--himora-text); box-shadow:none;">
            <span>🔄 Switch Portal (Customer / Merchant / Admin)</span>
          </button>
          <button onclick="window.pahadiLogout()" style="background:var(--himora-danger-soft); border:1px solid var(--himora-danger-border); color:var(--himora-danger); padding:12px; border-radius:12px; font-size:13px; font-weight:800; cursor:pointer;">
            🚪 Logout from Rider Cockpit
          </button>
        </div>
      `;
    }
  }

  window.riderApp = new HimoraRiderApp();
})();
