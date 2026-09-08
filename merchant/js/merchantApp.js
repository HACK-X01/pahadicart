// PahadiCart Merchant Partner Terminal Controller
(function() {
  class PahadiMerchantApp {
    constructor() {
      this.currentMerchantId = 'm-101';
      this.isOnline = true;
      this.init();
    }

    init() {
      this.updateShopProfileUI();
      this.renderOrders();

      // Listen to real-time events across tabs
      if (window.pahadiBus) {
        window.pahadiBus.on('ORDER_PLACED', (order) => {
          if (order.merchantId === this.currentMerchantId) {
            if (window.pahadiAudio) {
              window.pahadiAudio.playGharKiGhanti();
            }
            this.renderOrders();
          }
        });

        window.pahadiBus.on('ORDER_STATUS_CHANGED', () => {
          this.renderOrders();
        });
      }
    }

    switchMerchant(merchantId) {
      this.currentMerchantId = merchantId;
      this.updateShopProfileUI();
      this.renderOrders();
    }

    updateShopProfileUI() {
      const merchant = window.PAHADICART_DATA.merchants.find(m => m.id === this.currentMerchantId);
      if (!merchant) return;

      document.getElementById('shopTitle').innerText = merchant.name;
      document.getElementById('shopAvatar').innerText = merchant.image || '🏪';
      document.getElementById('shopVyaparId').innerText = `Reg: ${merchant.vyaparMandalId} (${merchant.area})`;
      document.getElementById('todayCommission').innerText = `₹385 (${merchant.commission}%)`;
    }

    testChime() {
      if (window.pahadiAudio) {
        window.pahadiAudio.playGharKiGhanti();
      }
    }

    toggleStoreOnline() {
      this.isOnline = !this.isOnline;
      const btn = document.getElementById('shopStatusBtn');
      if (this.isOnline) {
        btn.innerHTML = '<span>🟢 Dukan Khuli Hai (Live)</span>';
        btn.style.color = 'var(--primary-light)';
        btn.style.borderColor = 'var(--primary-light)';
      } else {
        btn.innerHTML = '<span>🔴 Dukan Band Hai (Paused)</span>';
        btn.style.color = 'var(--danger)';
        btn.style.borderColor = 'var(--danger)';
      }
    }

    renderOrders() {
      const colPlaced = document.getElementById('colPlaced');
      const colPreparing = document.getElementById('colPreparing');
      const colDelivered = document.getElementById('colDelivered');
      if (!colPlaced || !window.pahadiBus) return;

      const allOrders = window.pahadiBus.getOrders();
      const shopOrders = allOrders.filter(o => o.merchantId === this.currentMerchantId);

      const placedList = shopOrders.filter(o => o.status === 'Placed');
      const prepList = shopOrders.filter(o => o.status === 'Preparing');
      const deliveredList = shopOrders.filter(o => o.status === 'Rider Picked' || o.status === 'Delivered');

      document.getElementById('countPlaced').innerText = placedList.length;
      document.getElementById('countPreparing').innerText = prepList.length;
      document.getElementById('countDelivered').innerText = deliveredList.length;

      // Render Placed
      colPlaced.innerHTML = placedList.length === 0 ? `
        <div style="text-align: center; color: var(--text-dim); padding: 40px 10px;">
          <div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
          <p>Naya order aate hi "Ghar Ki Ghanti" bajegi.</p>
        </div>
      ` : placedList.map(o => `
        <div class="order-card incoming" id="mcard-${o.id}">
          <div class="order-top">
            <span class="order-id">#${o.id}</span>
            <span class="order-time">⏰ ${o.time}</span>
          </div>
          <div class="stairAlert">
            <strong>🪜 Staircase Note:</strong> ${o.staircaseNotes}
          </div>
          <div class="item-list-box">
            ${o.items.map(i => `
              <div class="item-line">
                <span>${i.name}</span>
                <strong>× ${i.qty}</strong>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px;">
            <span>Bill: <strong>₹${o.grandTotal}</strong></span>
            <span style="color: ${o.paymentMode === 'COD' ? '#f59e0b' : '#10b981'}; font-weight: 700;">${o.paymentMode}</span>
          </div>
          <div class="action-row">
      <button class="btn-action" onclick="window.pahadiPrinter && window.pahadiPrinter.printReceipt({ id: '${o.id}', customer: { name: '${o.customerName}', colony: '${o.colony}', staircaseDetails: '${o.staircaseNotes}', phone: '${o.customerPhone}' }, merchant: { name: '${o.merchantName}' }, items: ${JSON.stringify(o.items)}, pricing: { itemTotal: ${o.grandTotal} - 50, deliveryFee: 25, staircaseFee: 25, totalAmount: ${o.grandTotal} } })" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#cbd5e1; padding:6px 10px; border-radius:6px; font-size:11px; cursor:pointer;">🖨️ KOT Slip</button>
            <button class="btn-action btn-reject" onclick="window.merchantApp.rejectOrder('${o.id}')">Reject</button>
            <button class="btn-action btn-accept" onclick="window.merchantApp.acceptOrder('${o.id}')">
              <span>✅ Accept (15m)</span>
            </button>
          </div>
        </div>
      `).join('');

      // Render Preparing
      colPreparing.innerHTML = prepList.length === 0 ? `
        <div style="text-align: center; color: var(--text-dim); padding: 40px 10px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🍳</div>
          <p>Abhi koi order packing me nahi hai.</p>
        </div>
      ` : prepList.map(o => `
        <div class="order-card" id="mcard-${o.id}">
          <div class="order-top">
            <span class="order-id">#${o.id}</span>
            <span style="font-size: 12px; color: #38bdf8; font-weight: 600;">👨‍🍳 Packing Chal Rahi Hai</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
            Assigned Rider: <strong style="color: #fff;">${o.riderName || 'Vikas Thakur'}</strong> (Arriving in 4m)
          </div>
          <div class="item-list-box">
            ${o.items.map(i => `
              <div class="item-line">
                <span>${i.name}</span>
                <strong>× ${i.qty}</strong>
              </div>
            `).join('')}
          </div>
          <button class="btn-action btn-ready" onclick="window.merchantApp.markReady('${o.id}')">
            <span>📦 Order Ready for Rider Pickup</span>
          </button>
        </div>
      `).join('');

      // Render Delivered
      colDelivered.innerHTML = deliveredList.length === 0 ? `
        <div style="text-align: center; color: var(--text-dim); padding: 40px 10px;">
          <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
          <p>Handed over orders yahan dikhenge.</p>
        </div>
      ` : deliveredList.map(o => `
        <div class="order-card" id="mcard-${o.id}">
          <div class="order-top">
            <span class="order-id">#${o.id}</span>
            <span style="font-size: 11px; color: #10b981; font-weight: 700;">${o.status.toUpperCase()}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted);">
            Rider: ${o.riderName} | OTP: <strong style="color: #fbbf24;">${o.otp}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; border-top: 1px solid var(--border-color); padding-top: 6px;">
            <span>Sales: ₹${o.grandTotal}</span>
            <span style="color: #38bdf8;">Your Net: ₹${Math.round(o.grandTotal * 0.93)}</span>
          </div>
        </div>
      `).join('');
    }

    acceptOrder(orderId) {
      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(orderId, 'Preparing');
        if (window.pahadiAudio) window.pahadiAudio.playSuccessTune();
      }
    }

    rejectOrder(orderId) {
      if (confirm('Kya aap is order ko cancel karna chahte hain?')) {
        if (window.pahadiBus) {
          window.pahadiBus.updateOrderStatus(orderId, 'Cancelled (Merchant Unavailable)');
        }
      }
    }

    markReady(orderId) {
      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(orderId, 'Rider Picked');
        if (window.pahadiAudio) window.pahadiAudio.playRiderPing();
      }
    }

    openStockModal() {
      const modal = document.getElementById('stockModal');
      const list = document.getElementById('stockItemsList');
      const items = window.PAHADICART_DATA.products.filter(p => p.merchantId === this.currentMerchantId);

      list.innerHTML = items.map(p => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color);">
          <div>
            <div style="font-size: 13px; font-weight: 700;">${p.name}</div>
            <div style="font-size: 11px; color: var(--text-dim);">₹${p.price} per ${p.unit}</div>
          </div>
          <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer;">
            <input type="checkbox" checked style="accent-color: #10b981; transform: scale(1.2);">
            <span>In Stock</span>
          </label>
        </div>
      `).join('');

      modal.style.display = 'flex';
    }

    closeStockModal() {
      document.getElementById('stockModal').style.display = 'none';
    }
  }

  window.merchantApp = new PahadiMerchantApp();
})();
