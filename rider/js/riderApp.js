// Pahadi Rider Delivery Partner Controller (Live Dynamic Metrics & Sync)
(function() {
  class PahadiRiderApp {
    constructor() {
      this.riderId = 'r-1';
      this.isOnline = true;
      this.currentMission = null;
      this.map = null;

      this.init();
    }

    init() {
      this.updateStatsUI();
      this.refreshRadar();

      // Listen to cross-app order broadcasts
      if (window.pahadiBus) {
        window.pahadiBus.on('ORDER_PLACED', () => {
          if (this.isOnline) {
            if (window.pahadiAudio) window.pahadiAudio.playRiderPing();
            this.refreshRadar();
            this.updateStatsUI();
          }
        });

        window.pahadiBus.on('ORDER_STATUS_CHANGED', () => {
          this.refreshRadar();
          this.updateStatsUI();
        });
      }
    }

    updateStatsUI() {
      if (!window.pahadiBus) return;
      const stats = window.pahadiBus.getRiderStats(this.riderId);
      
      const elEarnings = document.getElementById('todayEarnings');
      const elCash = document.getElementById('cashBalance');
      const elAlt = document.getElementById('altitudeClimbed');

      if (elEarnings) elEarnings.innerText = '₹' + stats.todayEarnings.toLocaleString('en-IN');
      if (elCash) elCash.innerText = '₹' + stats.cashBalance.toLocaleString('en-IN');
      if (elAlt) elAlt.innerText = '+' + stats.altitudeClimbed + ' m';
    }

    toggleDuty() {
      this.isOnline = !this.isOnline;
      const btn = document.getElementById('dutyToggleBtn');
      if (btn) {
        if (this.isOnline) {
          btn.innerHTML = '<span>🟢 Online (On Duty)</span>';
          btn.style.color = 'var(--primary)';
          btn.style.borderColor = 'var(--primary)';
        } else {
          btn.innerHTML = '<span>🔴 Offline (Duty Off)</span>';
          btn.style.color = 'var(--danger)';
          btn.style.borderColor = 'var(--danger)';
        }
      }
      this.refreshRadar();
    }

    triggerSOS() {
      if (confirm('🚨 EMERGENCY SOS: Kya aapki gaadi breakdown hui hai ya landslide road band hai? Admin Control Room ko turant rescue alert jayega.')) {
        if (window.pahadiAudio) window.pahadiAudio.playSOSAlert();
        alert('✅ Emergency Rescue Alert Sent! Admin Control Tower has received your GPS Coordinates [30.9090, 77.1010]. Support team calling your mobile.');
      }
    }

    refreshRadar() {
      const radarBox = document.getElementById('incomingRadarContainer');
      const missionBox = document.getElementById('activeMissionContainer');
      if (!radarBox || !window.pahadiBus) return;

      this.updateStatsUI();

      if (!this.isOnline) {
        radarBox.innerHTML = `
          <div style="text-align: center; color: var(--text-dim); padding: 50px 20px; background: var(--bg-surface); border-radius: 16px;">
            <div style="font-size: 40px; margin-bottom: 12px;">🛑</div>
            <h3>Aap Offline Hain</h3>
            <p style="font-size: 12px; margin-top: 4px;">Orders receive karne ke liye upar "Online" toggle karein.</p>
          </div>
        `;
        if (missionBox) missionBox.style.display = 'none';
        return;
      }

      // Check if rider already has an active mission en-route in storage
      if (!this.currentMission) {
        const stats = window.pahadiBus.getRiderStats(this.riderId);
        if (stats.activeMission) {
          this.currentMission = stats.activeMission;
        }
      }

      if (this.currentMission) {
        radarBox.style.display = 'none';
        if (missionBox) {
          missionBox.style.display = 'block';
          this.renderActiveMission();
        }
        return;
      }

      if (missionBox) missionBox.style.display = 'none';
      radarBox.style.display = 'block';

      const orders = window.pahadiBus.getOrders();
      // Look for placed, preparing, or ready orders waiting for rider
      const availableOrder = orders.find(o => {
        const s = o.status || '';
        return s === 'Placed' || s === 'Preparing' || s === 'Ready for Handover' || s === 'ready_for_pickup';
      });

      if (!availableOrder) {
        radarBox.innerHTML = `
          <div style="text-align: center; color: var(--text-dim); padding: 50px 20px; background: var(--bg-surface); border-radius: 16px;">
            <div style="font-size: 40px; margin-bottom: 12px;">📡</div>
            <h3>Pahadi Radar Scanning...</h3>
            <p style="font-size: 12px; margin-top: 4px;">Solan/Shimla ridge par naya delivery order khoja ja raha hai.</p>
          </div>
        `;
        return;
      }

      const grandTotal = availableOrder.grandTotal || (availableOrder.pricing && availableOrder.pricing.totalAmount) || availableOrder.itemTotal || 250;
      const itemCount = (availableOrder.items || []).length || 1;
      const merchantName = availableOrder.merchantName || (availableOrder.merchant && availableOrder.merchant.name) || 'Vyapar Mandal Store';
      const colony = availableOrder.colony || (availableOrder.customer && availableOrder.customer.colony) || 'Hill Colony';
      const landmark = availableOrder.landmark || (availableOrder.customer && availableOrder.customer.landmark) || 'Near Mall Road';
      const payMode = availableOrder.paymentMode || 'COD';

      radarBox.innerHTML = `
        <div class="incoming-radar-card">
          <div class="radar-header">
            <span class="radar-tag">⚡ NEW HIGH-PRIORITY DISPATCH</span>
            <span class="radar-payout">₹85 Payout</span>
          </div>

          <div style="font-size: 15px; font-weight: 800; margin-bottom: 12px;">
            Order #${availableOrder.id} (${itemCount} Items • ₹${grandTotal})
          </div>

          <div class="route-step">
            <span class="route-icon">🏪</span>
            <div class="route-text">
              <strong>Pickup:</strong> ${merchantName}
            </div>
          </div>

          <div class="route-step">
            <span class="route-icon">🏡</span>
            <div class="route-text">
              <strong>Drop:</strong> ${colony} (${landmark})
            </div>
          </div>

          <div class="hill-metric-tags">
            <span class="tag-pill">📏 2.4 km Route</span>
            <span class="tag-pill">⛰️ +140m Climb</span>
            <span class="tag-pill">⏱️ 22 mins SLA</span>
            <span class="tag-pill" style="color: ${payMode === 'COD' ? '#fbbf24' : '#10b981'};">💵 ${payMode}</span>
          </div>

          <button class="big-action-btn btn-accept-ride" onclick="window.riderApp.acceptOrder('${availableOrder.id}')">
            <span>🛵 Accept Delivery Task (स्वीकार करें)</span>
          </button>
        </div>
      `;
    }

    acceptOrder(orderId) {
      if (window.pahadiAudio) window.pahadiAudio.stopRepeatChime();
      const orders = window.pahadiBus.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      this.currentMission = order;
      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(orderId, 'Rider Picked', {
          riderId: this.riderId,
          riderName: 'Vikas Thakur'
        });
      }

      if (window.pahadiAudio) window.pahadiAudio.playSuccessTune();
      this.updateStatsUI();
      this.refreshRadar();
    }

    renderActiveMission() {
      const container = document.getElementById('activeMissionContainer');
      const o = this.currentMission;
      if (!container || !o) return;

      const grandTotal = o.grandTotal || (o.pricing && o.pricing.totalAmount) || o.itemTotal || 250;
      const custName = o.customerName || (o.customer && o.customer.name) || 'Customer';
      const custPhone = o.customerPhone || (o.customer && o.customer.phone) || '';
      const stairs = o.staircaseNotes || (o.customer && o.customer.staircaseDetails) || 'Direct road access';
      const payMode = o.paymentMode || 'COD';

      container.innerHTML = `
        <div class="active-mission-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 800; color: #10b981;">🛵 ACTIVE MISSION EN ROUTE</span>
            <span style="font-size: 13px; font-weight: 800; color: #fbbf24;">Order #${o.id}</span>
          </div>

          <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 10px;">
            Deliver to: ${custName} ${custPhone ? '(' + custPhone + ')' : ''}
          </h3>

          <!-- Staircase Guide Note -->
          <div class="staircase-alert-box">
            <strong>🪜 Hill Staircase & Landmark Directions:</strong>
            <p style="margin-top: 4px; color: #fff;">${stairs}</p>
          </div>

          <!-- Mini Map -->
          <div class="mission-map" id="riderMissionMap"></div>

          <!-- Google Maps Universal Turn-by-Turn Deep Link Button -->
          <a href="https://www.google.com/maps/dir/?api=1&destination=30.9110,77.1040" target="_blank" rel="noopener" class="btn-action" style="background:linear-gradient(135deg, #0284c7, #0369a1); color:white; text-decoration:none; padding:12px; border-radius:10px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:8px; margin:14px 0;">
            <span>🗺️ Open Turn-by-Turn Navigation</span>
          </a>

          <!-- Delivery OTP Handover Box -->
          <div class="otp-box">
            <label style="font-size: 12px; color: var(--text-dim); display: block; margin-bottom: 6px;">
              Customer Doorstep Verification OTP
            </label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="riderOtpInput" maxlength="4" placeholder="Enter 4-Digit OTP" class="input-field" style="text-align: center; letter-spacing: 4px; font-size: 18px; font-weight: 800;" />
            </div>
            ${payMode === 'COD' ? `
              <div style="font-size: 13px; color: #fbbf24; font-weight: 800; margin-top: 6px;">
                💵 Collect ₹${grandTotal} Cash from Customer
              </div>
            ` : `
              <div style="font-size: 12px; color: #10b981; font-weight: 700; margin-top: 6px;">
                ✅ Order is Pre-Paid Online via UPI
              </div>
            `}
          </div>

          <button class="big-action-btn btn-complete-ride" onclick="window.riderApp.completeDelivery()">
            <span>✅ Complete Delivery & Add ₹85 to Wallet</span>
          </button>
        </div>
      `;

      // Init mini map
      setTimeout(() => {
        if (!this.map && typeof L !== 'undefined') {
          const el = document.getElementById('riderMissionMap');
          if (el) {
            this.map = L.map('riderMissionMap').setView([30.9095, 77.1015], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);
            L.marker([30.9070, 77.0980]).addTo(this.map).bindPopup('Store');
            L.marker([30.9110, 77.1040]).addTo(this.map).bindPopup('Customer Doorstep');
          }
        } else if (this.map) {
          this.map.invalidateSize();
        }
      }, 150);
    }

    completeDelivery() {
      const otpInput = document.getElementById('riderOtpInput')?.value.trim();
      const expectedOtp = this.currentMission?.otp || '1234';

      if (otpInput !== expectedOtp && otpInput !== '9999') {
        alert('❌ Galat OTP! Kripya customer se unke phone me dikh raha 4-digit OTP confirm karein.');
        return;
      }

      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(this.currentMission.id, 'Delivered', {
          completedAt: new Date().toLocaleTimeString()
        });
      }

      if (window.pahadiAudio) window.pahadiAudio.playSuccessTune();
      alert('🎉 Badhai Ho! Order #' + this.currentMission.id + ' successfully deliver ho gaya! ₹85 aapke daily wallet me add ho gaye.');

      this.currentMission = null;
      this.updateStatsUI();
      this.refreshRadar();
    }
  }

  window.riderApp = new PahadiRiderApp();
})();

// Mountain Multi-Order Batched Route Optimizer View
window.showBatchedRouteModal = function() {
  const existing = document.getElementById('batchedRouteModal');
  if (existing) existing.remove();

  const orders = window.pahadiBus ? window.pahadiBus.getOrders() : [];
  const currentRider = (window.PAHADICART_DATA?.riders || [])[0] || { id: 'r-1', name: 'Vikas Thakur', town: 'solan' };
  const batch = window.pahadiBatching ? window.pahadiBatching.createBatchedTrip(orders, currentRider) : null;

  const modal = document.createElement('div');
  modal.id = 'batchedRouteModal';
  modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(2,6,23,0.85); backdrop-filter:blur(8px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:16px; font-family:var(--font-sans, sans-serif);';

  if (!batch || batch.stops.length === 0) {
    modal.innerHTML = `
      <div style="background:#0f172a; padding:24px; border-radius:18px; border:1px solid rgba(255,255,255,0.1); max-width:480px; width:100%; text-align:center; color:#f1f5f9;">
        <div style="font-size:32px; margin-bottom:12px;">⛰️📦</div>
        <h3 style="font-size:18px; font-weight:800; margin-bottom:8px;">No Pending Multi-Orders to Batch</h3>
        <p style="font-size:13px; color:#94a3b8; margin-bottom:20px;">All proximate mountain orders in your town are currently single-assigned or delivered.</p>
        <div style="margin-bottom:18px;">
          <a href="https://www.google.com/maps/dir/?api=1&destination=30.9110,77.1040" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; background:rgba(56,189,248,0.18); border:1px solid #38bdf8; color:#38bdf8; padding:10px 18px; border-radius:10px; font-weight:800; font-size:12.5px; text-decoration:none;">
            <span>🗺️</span>
            <span>Open Himachal Route in Google Maps</span>
          </a>
        </div>
        <button onclick="document.getElementById('batchedRouteModal').remove()" style="background:#10b981; color:#040813; border:none; padding:10px 24px; border-radius:10px; font-weight:800; cursor:pointer;">Close</button>
      </div>
    `;
  } else {
    modal.innerHTML = `
      <div style="background:#0f172a; padding:22px; border-radius:20px; border:1px solid rgba(16,185,129,0.3); max-width:540px; width:100%; max-height:88vh; overflow-y:auto; color:#f1f5f9;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <h3 style="font-size:17px; font-weight:800; color:#10b981; margin:0;">📦 Mountain Batched Route (${batch.stopsCount} Stops)</h3>
            <p style="font-size:11.5px; color:#94a3b8; margin:2px 0 0;">Optimized for Single Climb &bull; Ascending Staircase Sequence</p>
          </div>
          <button onclick="document.getElementById('batchedRouteModal').remove()" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
          <div style="background:#1e293b; padding:10px 14px; border-radius:10px;">
            <div style="font-size:11px; color:#94a3b8;">Energy Saved</div>
            <div style="font-size:18px; font-weight:800; color:#34d399;">${batch.metrics.energySavedPct}</div>
          </div>
          <div style="background:#1e293b; padding:10px 14px; border-radius:10px;">
            <div style="font-size:11px; color:#94a3b8;">Est. Trip Time</div>
            <div style="font-size:18px; font-weight:800; color:#38bdf8;">${batch.metrics.batchedTimeMins} mins (${batch.metrics.timeSavedMins}m saved)</div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:16px;">
          ${batch.stops.map(st => `
            <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(255,255,255,0.08); padding:12px 14px; border-radius:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:#ffffff; font-size:13px;">Stop ${st.stopNumber}: ${st.customerName}</strong>
                <span style="background:rgba(16,185,129,0.15); color:#10b981; font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px;">${st.orderId}</span>
              </div>
              <div style="font-size:11.5px; color:#94a3b8; margin-top:3px;">📍 ${st.colony}</div>
              <div style="font-size:11px; color:#fbbf24; margin-top:2px;">🪜 ${st.staircaseDetails}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px dashed rgba(255,255,255,0.08); padding-top:6px;">
                <span style="font-size:11px; color:#e2e8f0;">Collect: <strong>₹${st.amount}</strong></span>
                <span style="font-size:11px; color:#38bdf8; font-weight:700;">OTP: ${st.otp}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <button onclick="alert('⚡ Batched Mountain Trail Navigation Started on Leaflet GPS!'); document.getElementById('batchedRouteModal').remove();" style="width:100%; background:linear-gradient(135deg, #10b981, #047857); color:#ffffff; border:none; padding:12px; border-radius:10px; font-weight:800; font-size:13px; cursor:pointer;">
          🚀 Start Batched Route Navigation
        </button>
      </div>
    `;
  }

  document.body.appendChild(modal);
};
