// PahadiCart Merchant Partner Terminal Controller (Live Dynamic Metrics & Sync)
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
          if (window.pahadiAudio) {
            window.pahadiAudio.playGharKiGhanti();
          }
          this.renderOrders();
        });

        window.pahadiBus.on('ORDER_STATUS_CHANGED', () => {
          this.renderOrders();
        });
      }

      // Bind store switcher if present
      const switcher = document.getElementById('merchantSwitch');
      if (switcher) {
        switcher.onchange = (e) => {
          this.switchMerchant(e.target.value);
        };
      }
    }

    switchMerchant(merchantId) {
      this.currentMerchantId = merchantId;
      this.updateShopProfileUI();
      this.renderOrders();
    }

    updateShopProfileUI() {
      let merchant = null;
      if (window.PAHADICART_DATA && window.PAHADICART_DATA.merchants) {
        merchant = window.PAHADICART_DATA.merchants.find(m => m.id === this.currentMerchantId);
      }
      if (!merchant) {
        merchant = {
          name: 'Sharma Kirana & Fresh Produce',
          image: '🏪',
          vyaparMandalId: 'VM-SOL-2024-089',
          area: 'Lower Bazaar Solan',
          commission: 6
        };
      }

      const elTitle = document.getElementById('shopTitle');
      const elAvatar = document.getElementById('shopAvatar');
      const elVyapar = document.getElementById('shopVyaparId');

      if (elTitle) elTitle.innerText = merchant.name;
      if (elAvatar) elAvatar.innerText = merchant.image || '🏪';
      if (elVyapar) elVyapar.innerText = `Reg: ${merchant.vyaparMandalId || 'VM-01'} (${merchant.area || 'Solan'})`;
    }

    testChime() {
      if (window.pahadiAudio) {
        window.pahadiAudio.playGharKiGhanti();
      }
    }

    toggleStoreOnline() {
      this.isOnline = !this.isOnline;
      const btn = document.getElementById('shopStatusBtn');
      if (btn) {
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
    }

    renderOrders() {
      if (!window.pahadiBus) return;

      const stats = window.pahadiBus.getMerchantStats(this.currentMerchantId);

      // Update all 5 Top Metric Cards dynamically!
      const elOrderCount = document.getElementById('todayOrderCount');
      const elGross = document.getElementById('todayGrossRevenue');
      const elComm = document.getElementById('todayCommission');
      const elTcs = document.getElementById('todayTcs');
      const elPayout = document.getElementById('todayNetPayout');

      if (elOrderCount) elOrderCount.innerText = stats.todayOrderCount;
      if (elGross) elGross.innerText = '₹' + stats.todayGrossRevenue.toLocaleString('en-IN');
      if (elComm) elComm.innerText = '₹' + stats.todayCommission.toLocaleString('en-IN') + ' (' + stats.commissionPercent + '%)';
      if (elTcs) elTcs.innerText = '₹' + stats.todayTcs.toFixed(2);
      if (elPayout) elPayout.innerText = '₹' + stats.todayNetPayout.toLocaleString('en-IN');

      const colPlaced = document.getElementById('colPlaced');
      const colPreparing = document.getElementById('colPreparing');
      const colDelivered = document.getElementById('colDelivered');
      if (!colPlaced) return;

      const placedList = stats.placedList;
      const prepList = stats.prepList;
      const deliveredList = stats.deliveredList;

      const countPlaced = document.getElementById('countPlaced');
      const countPreparing = document.getElementById('countPreparing');
      const countDelivered = document.getElementById('countDelivered');

      if (countPlaced) countPlaced.innerText = stats.placedCount;
      if (countPreparing) countPreparing.innerText = stats.preparingCount;
      if (countDelivered) countDelivered.innerText = stats.deliveredCount;

      // Render Placed
      colPlaced.innerHTML = placedList.length === 0 ? `
        <div style="text-align: center; color: var(--text-dim); padding: 40px 10px;">
          <div style="font-size: 32px; margin-bottom: 8px;">⏳</div>
          <p>Naya order aate hi "Ghar Ki Ghanti" bajegi.</p>
        </div>
      ` : placedList.map(o => {
        const grandTotal = o.grandTotal || (o.pricing && o.pricing.totalAmount) || o.itemTotal || 0;
        const custName = o.customerName || (o.customer && o.customer.name) || 'Customer';
        const custPhone = o.customerPhone || (o.customer && o.customer.phone) || '';
        const colony = o.colony || (o.customer && o.customer.colony) || 'Town Sector';
        const stairs = o.staircaseNotes || (o.customer && o.customer.staircaseDetails) || 'Direct road access';
        const items = o.items || [];
        const payMode = o.paymentMode || 'COD';

        return `
        <div class="order-card incoming" id="mcard-${o.id}">
          <div class="order-top">
            <span class="order-id">#${o.id}</span>
            <span class="order-time">⏰ ${o.time || 'Live Shift'}</span>
          </div>
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 4px; color: #f8fafc;">
            ${custName} ${custPhone ? '(' + custPhone + ')' : ''}
          </div>
          <div class="stairAlert">
            <strong>🪜 Staircase Note:</strong> ${stairs}
          </div>
          <div class="item-list-box">
            ${items.map(i => `
              <div class="item-line">
                <span>${i.name}</span>
                <strong>× ${i.qty || i.quantity || 1}</strong>
              </div>
            `).join('')}
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px;">
            <span>Bill: <strong>₹${grandTotal}</strong></span>
            <span style="color: ${payMode === 'COD' ? '#f59e0b' : '#10b981'}; font-weight: 700;">${payMode}</span>
          </div>
          <div class="action-row">
            <button class="btn-action" onclick="window.pahadiPrinter && window.pahadiPrinter.printReceipt({ id: '${o.id}', customer: { name: '${custName}', colony: '${colony}', staircaseDetails: '${stairs}', phone: '${custPhone}' }, merchant: { name: '${o.merchantName || 'Store'}' }, items: ${JSON.stringify(items).replace(/"/g, '&quot;')}, pricing: { itemTotal: ${grandTotal} - 50, deliveryFee: 25, staircaseFee: 25, totalAmount: ${grandTotal} } })" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#cbd5e1; padding:6px 10px; border-radius:6px; font-size:11px; cursor:pointer;">🖨️ KOT Slip</button>
            <button class="btn-action btn-reject" onclick="window.merchantApp.rejectOrder('${o.id}')">Reject</button>
            <button class="btn-action btn-accept" onclick="window.merchantApp.acceptOrder('${o.id}')">
              <span>✅ Accept & Prepare</span>
            </button>
          </div>
        </div>
        `;
      }).join('');

      // Render Preparing
      colPreparing.innerHTML = prepList.length === 0 ? `
        <div style="text-align: center; color: var(--text-dim); padding: 40px 10px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🍳</div>
          <p>Abhi koi order packing me nahi hai.</p>
        </div>
      ` : prepList.map(o => {
        const items = o.items || [];
        const riderName = o.riderName || (o.rider && o.rider.name) || 'Vikas Thakur';

        return `
        <div class="order-card" id="mcard-${o.id}">
          <div class="order-top">
            <span class="order-id">#${o.id}</span>
            <span style="font-size: 12px; color: #38bdf8; font-weight: 600;">👨‍🍳 Packing Chal Rahi Hai</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
            Assigned Rider: <strong style="color: #fff;">${riderName}</strong> (Arriving soon)
          </div>
          <div class="item-list-box">
            ${items.map(i => `
              <div class="item-line">
                <span>${i.name}</span>
                <strong>× ${i.qty || i.quantity || 1}</strong>
              </div>
            `).join('')}
          </div>
          <button class="btn-action btn-ready" onclick="window.merchantApp.markReady('${o.id}')">
            <span>📦 Order Ready for Rider Pickup</span>
          </button>
        </div>
        `;
      }).join('');

      // Render Delivered / Dispatched
      colDelivered.innerHTML = deliveredList.length === 0 ? `
        <div style="text-align: center; color: var(--text-dim); padding: 40px 10px;">
          <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
          <p>Handed over & completed orders yahan dikhenge.</p>
        </div>
      ` : deliveredList.map(o => {
        const grandTotal = o.grandTotal || (o.pricing && o.pricing.totalAmount) || o.itemTotal || 0;
        const riderName = o.riderName || (o.rider && o.rider.name) || 'Vikas Thakur';
        const net = Math.round(grandTotal * 0.93);

        return `
        <div class="order-card" id="mcard-${o.id}">
          <div class="order-top">
            <span class="order-id">#${o.id}</span>
            <span style="font-size: 11px; color: #10b981; font-weight: 700;">${(o.status || 'DELIVERED').toUpperCase()}</span>
          </div>
          <div style="font-size: 12px; color: var(--text-muted);">
            Rider: ${riderName} | OTP: <strong style="color: #fbbf24;">${o.otp || '****'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; border-top: 1px solid var(--border-color); padding-top: 6px;">
            <span>Sales: ₹${grandTotal}</span>
            <span style="color: #38bdf8;">Your Net: ₹${net}</span>
          </div>
        </div>
        `;
      }).join('');
    }

    acceptOrder(orderId) {
      if (window.pahadiAudio) window.pahadiAudio.stopRepeatChime();
      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(orderId, 'Preparing');
        if (window.pahadiAudio) window.pahadiAudio.playSuccessTune();
      }
      this.renderOrders();
    }

    rejectOrder(orderId) {
      if (window.pahadiAudio) window.pahadiAudio.stopRepeatChime();
      if (confirm('Kya aap is order ko cancel karna chahte hain?')) {
        if (window.pahadiBus) {
          window.pahadiBus.updateOrderStatus(orderId, 'Cancelled (Merchant Unavailable)');
        }
        this.renderOrders();
      }
    }

    markReady(orderId) {
      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(orderId, 'Ready for Handover');
        if (window.pahadiAudio) window.pahadiAudio.playRiderPing();
      }
      this.renderOrders();
    }

    openStockModal() {
      const modal = document.getElementById('stockModal');
      const list = document.getElementById('stockItemsList');
      if (!modal || !list) return;

      const items = (window.PAHADICART_DATA && window.PAHADICART_DATA.products) 
        ? window.PAHADICART_DATA.products.filter(p => p.merchantId === this.currentMerchantId)
        : [];

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
      const modal = document.getElementById('stockModal');
      if (modal) modal.style.display = 'none';
    }
  }

  window.merchantApp = new PahadiMerchantApp();
})();
