// PahadiCart Customer App Controller
(function() {
  class PahadiCustomerApp {
    constructor() {
      this.currentTown = 'solan';
      this.selectedCategory = 'all';
      this.cart = {}; // { productId: qty }
      this.selectedPayMode = 'UPI';
      this.activeTrackingOrder = null;
      this.map = null;
      this.riderMarker = null;
      this.animInterval = null;

      this.init();
    }

    init() {
      this.loadCartFromStorage();
      this.renderCategories();
      this.renderProducts();
      this.updateCartUI();

      // Listen to cross-portal status changes
      if (window.pahadiBus) {
        window.pahadiBus.on('ORDER_STATUS_CHANGED', ({ orderId, newStatus }) => {
          if (this.activeTrackingOrder && this.activeTrackingOrder.id === orderId) {
            this.activeTrackingOrder.status = newStatus;
            this.updateTrackingUI();
          }
        });
      }
    }

    changeTown(townId) {
      this.currentTown = townId;
      this.renderProducts();
    }

    selectCategory(catId) {
      this.selectedCategory = catId;
      this.renderCategories();
      this.renderProducts();
    }

    renderCategories() {
      const container = document.getElementById('categoryPills');
      if (!container || !window.PAHADICART_DATA) return;

      container.innerHTML = window.PAHADICART_DATA.categories.map(c => `
        <button class="cat-pill ${this.selectedCategory === c.id ? 'active' : ''}" onclick="window.customerApp.selectCategory('${c.id}')">
          <span>${c.icon}</span>
          <span>${c.name}</span>
        </button>
      `).join('');
    }

    renderProducts() {
      const grid = document.getElementById('productsGrid');
      const titleEl = document.getElementById('currentCatTitle');
      const countEl = document.getElementById('productCount');
      if (!grid || !window.PAHADICART_DATA) return;

      const catObj = window.PAHADICART_DATA.categories.find(c => c.id === this.selectedCategory);
      if (titleEl) titleEl.innerText = catObj ? catObj.name : 'Sabhi Pahadi Products';

      const townMerchants = (window.PAHADICART_DATA.merchants || []).filter(m => m.town === this.currentTown);
      const merchantIds = new Set(townMerchants.map(m => m.id));
      let items = (window.PAHADICART_DATA.products || []).filter(p => merchantIds.has(p.merchantId));
      if (items.length === 0) {
        items = (window.PAHADICART_DATA.products || []).slice(0, 6);
      }
      if (this.selectedCategory !== 'all') {
        items = items.filter(p => p.category === this.selectedCategory);
      }

      if (countEl) countEl.innerText = `Showing ${items.length} items`;

      grid.innerHTML = items.map(p => {
        const qty = this.cart[p.id] || 0;
        const merchant = window.PAHADICART_DATA.merchants.find(m => m.id === p.merchantId);
        const merchantName = merchant ? merchant.name : 'Vyapar Mandal Store';

        return `
          <div class="product-card" id="card-${p.id}">
            <div>
              <div class="card-top">
                <span class="product-tag">${p.badge || p.tag || "Himachal Special"}</span>
                <span class="vyapar-badge">🛡️ Verified Vyapar Mandal</span>
              </div>
              <div class="card-body">
                <h3 class="product-title">${p.name}</h3>
                ${p.hindi ? `<p class="product-hindi">${p.hindi}</p>` : ""}
                <p class="product-desc">${p.desc}</p>
                <div class="product-merchant">
                  <span>🏪</span>
                  <span>${merchantName}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div class="price-box">
                <span class="price-current">₹${p.price}</span>
                ${p.mrp ? `<span class="price-mrp">₹${p.mrp} (${p.unit})</span>` : ""}
              </div>
              <div class="qty-control" id="qtyBox-${p.id}">
                ${qty === 0 ? `
                  <button class="add-btn" onclick="window.customerApp.addToCart('${p.id}')">+ Add to Cart</button>
                ` : `
                  <div class="qty-counter">
                    <button class="qty-btn" onclick="window.customerApp.changeQty('${p.id}', -1)">-</button>
                    <span class="qty-num">${qty}</span>
                    <button class="qty-btn" onclick="window.customerApp.changeQty('${p.id}', 1)">+</button>
                  </div>
                `}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    addToCart(productId) {
      this.cart[productId] = (this.cart[productId] || 0) + 1;
      this.saveCartToStorage();
      this.renderProducts();
      this.updateCartUI();
      if (window.pahadiAudio) window.pahadiAudio.playSuccessTune();
    }

    changeQty(productId, delta) {
      if (!this.cart[productId]) return;
      this.cart[productId] += delta;
      if (this.cart[productId] <= 0) {
        delete this.cart[productId];
      }
      this.saveCartToStorage();
      this.renderProducts();
      this.updateCartUI();
    }

    saveCartToStorage() {
      localStorage.setItem('pahadicart_cart_data', JSON.stringify(this.cart));
    }

    loadCartFromStorage() {
      try {
        this.cart = JSON.parse(localStorage.getItem('pahadicart_cart_data')) || {};
      } catch (e) {
        this.cart = {};
      }
    }

    toggleCart(open) {
      const drawer = document.getElementById('cartDrawer');
      const overlay = document.getElementById('cartOverlay');
      if (open) {
        this.updateCartUI();
        drawer.classList.add('active');
        overlay.classList.add('active');
      } else {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
      }
    }

    updateCartUI() {
      const badge = document.getElementById('cartBadge');
      const list = document.getElementById('cartItemsList');
      const addressBox = document.getElementById('addressBox');
      const billBox = document.getElementById('billBox');
      const footer = document.getElementById('drawerFooter');
      if (!badge || !list) return;

      const productIds = Object.keys(this.cart);
      const totalCount = productIds.reduce((sum, id) => sum + this.cart[id], 0);
      badge.innerText = totalCount;

      if (productIds.length === 0) {
        list.innerHTML = `
          <div class="empty-cart-view">
            <div class="empty-cart-icon">🛒</div>
            <h4>Aapka Jhola Khali Hai</h4>
            <p style="font-size: 12px; margin-top: 4px;">Pahadi se taaza apples, thali ya meds add karein.</p>
          </div>
        `;
        if (addressBox) addressBox.style.display = 'none';
        if (billBox) billBox.style.display = 'none';
        if (footer) footer.style.display = 'none';
        return;
      }

      if (addressBox) addressBox.style.display = 'block';
      if (billBox) billBox.style.display = 'block';
      if (footer) footer.style.display = 'block';

      let itemTotal = 0;
      list.innerHTML = productIds.map(id => {
        const p = window.PAHADICART_DATA.products.find(item => item.id === id);
        if (!p) return '';
        const qty = this.cart[id];
        const lineTotal = p.price * qty;
        itemTotal += lineTotal;

        return `
          <div class="cart-item-row">
            <div class="item-info">
              <div class="item-name">${p.name}</div>
              <div class="item-price">₹${p.price} × ${qty} = <strong>₹${lineTotal}</strong></div>
            </div>
            <div class="qty-counter">
              <button class="qty-btn" onclick="window.customerApp.changeQty('${p.id}', -1)">-</button>
              <span class="qty-num">${qty}</span>
              <button class="qty-btn" onclick="window.customerApp.changeQty('${p.id}', 1)">+</button>
            </div>
          </div>
        `;
      }).join('');

      const deliveryFee = itemTotal >= 499 ? 0 : 35;
      const packagingFee = 5;
      const grandTotal = itemTotal + deliveryFee + packagingFee;

      document.getElementById('billItemTotal').innerText = '₹' + itemTotal;
      document.getElementById('billDeliveryFee').innerText = deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee;
      document.getElementById('billGrandTotal').innerText = '₹' + grandTotal;
      document.getElementById('payModalAmount').innerText = '₹' + grandTotal;
    }

    openPaymentModal() {
      const modal = document.getElementById('paymentModal');
      modal.classList.add('active');
    }

    closePaymentModal() {
      const modal = document.getElementById('paymentModal');
      modal.classList.remove('active');
    }

    selectPayMode(mode) {
      this.selectedPayMode = mode;
      const btnUPI = document.getElementById('payModeUPI');
      const btnCOD = document.getElementById('payModeCOD');
      const upiBox = document.getElementById('upiQrContainer');
      const codBox = document.getElementById('codNoticeContainer');

      if (mode === 'UPI') {
        btnUPI.style.background = 'rgba(16, 185, 129, 0.2)';
        btnUPI.style.borderColor = '#10b981';
        btnUPI.style.color = '#fff';
        btnCOD.style.background = 'var(--bg-card)';
        btnCOD.style.color = 'var(--text-muted)';
        upiBox.style.display = 'block';
        codBox.style.display = 'none';
      } else {
        btnCOD.style.background = 'rgba(245, 158, 11, 0.2)';
        btnCOD.style.borderColor = '#f59e0b';
        btnCOD.style.color = '#fff';
        btnUPI.style.background = 'var(--bg-card)';
        btnUPI.style.color = 'var(--text-muted)';
        upiBox.style.display = 'none';
        codBox.style.display = 'block';
      }
    }

    confirmOrderPlacement() {
      // Check if offline
      if (window.pahadiOffline && !window.pahadiOffline.isOnline()) {
        const colony = document.getElementById('custColony')?.value || 'The Mall Road';
        const landmark = document.getElementById('custLandmark')?.value || 'Near Heritage Post Office';
        const staircase = document.getElementById('custStairs')?.value || 'Descend 35 stone steps from road level';
        const phone = document.getElementById('custPhone')?.value || '98160-12890';

        const productIds = Object.keys(this.cart);
        let itemTotal = 0;
        const orderItems = productIds.map(id => {
          const p = window.PAHADICART_DATA.products.find(item => item.id === id);
          const qty = this.cart[id];
          itemTotal += (p ? p.price : 100) * qty;
          return { name: p ? p.name : 'Mountain Item', qty: qty, price: p ? p.price : 100 };
        });

        const deliveryFee = 25;
        const grandTotal = itemTotal + deliveryFee + 25;
        const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
        const secretOtp = String(Math.floor(1000 + Math.random() * 9000));

        const offlineOrder = {
          id: orderId,
          town: this.currentTown,
          customer: { name: 'Aarav Sharma', phone, colony, landmark, staircaseDetails: staircase, hasStairs: true },
          merchant: { name: 'Nearest Vyapar Mandal Store', distanceMeters: 800 },
          rider: { name: 'Local Hill Fleet Partner', bike: 'Pahadi Fleet' },
          items: orderItems,
          pricing: { itemTotal, deliveryFee, totalAmount: grandTotal },
          status: 'queued_offline',
          otp: secretOtp
        };

        window.pahadiOffline.enqueueOrder(offlineOrder);
        this.cart = {};
        this.saveCartToStorage();
        this.updateCartUI();
        this.closePaymentModal();
        return;
      }
      const colony = document.getElementById('custColony').value || 'Shamti, Upper Pine Lane';
      const landmark = document.getElementById('custLandmark').value || 'Near Durga Mandir Tank';
      const staircase = document.getElementById('custStairs').value || 'Descend 35 stone steps from road level, 2nd green gate on left';
      const phone = document.getElementById('custPhone').value || '98160-12890';

      const productIds = Object.keys(this.cart);
      let itemTotal = 0;
      const orderItems = productIds.map(id => {
        const p = window.PAHADICART_DATA.products.find(item => item.id === id);
        const qty = this.cart[id];
        itemTotal += p.price * qty;
        return { name: p.name, qty: qty, price: p.price };
      });

      const deliveryFee = itemTotal >= 499 ? 0 : 35;
      const grandTotal = itemTotal + deliveryFee + 5;
      const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
      const secretOtp = Math.floor(1000 + Math.random() * 9000).toString();

      // Run Automated Hill Proximity Dispatch Algorithm
      let routing = null;
      if (window.pahadiDispatch) {
        routing = window.pahadiDispatch.autoRouteOrder(orderItems, {
          name: 'Aarav Sharma',
          phone: phone,
          colony: colony,
          landmark: landmark,
          staircaseNotes: staircase
        }, this.currentTown);
      }

      const assignedMerchant = routing ? routing.selectedMerchant : {
        merchantId: 'm-101',
        name: 'Sharma Kirana & Fresh Produce',
        distanceMeters: 850
      };

      const assignedRider = routing ? routing.selectedRider : {
        riderId: 'r-1',
        name: 'Vikas Thakur',
        phone: '98161-12345',
        vehicle: 'Hero Splendor (HP-14-B-8821)',
        distanceMeters: 620
      };

      const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newOrder = {
        id: orderId,
        customerName: 'Aarav Sharma',
        customerPhone: phone,
        town: this.currentTown,
        colony: colony,
        landmark: landmark,
        staircaseNotes: staircase,
        merchantId: assignedMerchant.merchantId,
        merchantName: assignedMerchant.name,
        merchantDistanceMeters: assignedMerchant.distanceMeters,
        items: orderItems,
        itemTotal: itemTotal,
        deliveryFee: deliveryFee,
        weatherSurge: 0,
        grandTotal: grandTotal,
        paymentMode: this.selectedPayMode === 'UPI' ? 'UPI_ONLINE' : 'COD',
        paymentStatus: this.selectedPayMode === 'UPI' ? 'Paid (Simulated UPI)' : 'Pending Cash Collection',
        status: 'Placed',
        otp: secretOtp,
        riderId: assignedRider.riderId,
        riderName: assignedRider.name,
        riderPhone: assignedRider.phone,
        riderVehicle: assignedRider.vehicle,
        riderDistanceMeters: assignedRider.distanceMeters,
        time: nowTimeStr,
        createdTimestamp: Date.now(),
        // Full Triad Lifecycle Timestamps & SLA Tracking
        timestamps: {
          placed: nowTimeStr,
          accepted: null,
          picked: null,
          delivered: null
        },
        // Complete Algorithmic Audit Details for Admin
        triadAudit: routing ? routing.auditTrail : null
      };

      // Broadcast through EventBus to Merchant, Rider, and Admin tabs!
      if (window.pahadiBus) {
        window.pahadiBus.placeOrder(newOrder);
      }

      // Reset Cart
      this.cart = {};
      this.saveCartToStorage();
      this.renderProducts();
      this.updateCartUI();
      this.closePaymentModal();
      this.toggleCart(false);

      if (window.pahadiAudio) {
        window.pahadiAudio.playSuccessTune();
      }

      // Open Live Tracking Radar
      this.openTrackingModal(newOrder);
    }

    openTrackingModal(order) {
      this.activeTrackingOrder = order;
      const modal = document.getElementById('trackModal');
      document.getElementById('trackOrderId').innerText = 'Order #' + order.id;
      document.getElementById('trackOtpCode').innerText = order.otp;
      document.getElementById('trackStairNote').innerText = order.staircaseNotes;
      document.getElementById('trackRiderName').innerText = order.riderName;
      modal.classList.add('active');

      this.updateTrackingUI();
      this.initTrackingMap();
    }

    closeTrackingModal() {
      const modal = document.getElementById('trackModal');
      modal.classList.remove('active');
      if (this.animInterval) clearInterval(this.animInterval);
    }

    updateTrackingUI() {
      if (!this.activeTrackingOrder) return;
      const status = this.activeTrackingOrder.status;

      const stepPlaced = document.getElementById('stepPlaced');
      const stepPrep = document.getElementById('stepPrep');
      const stepTransit = document.getElementById('stepTransit');
      const stepDelivered = document.getElementById('stepDelivered');

      [stepPlaced, stepPrep, stepTransit, stepDelivered].forEach(el => {
        el.classList.remove('active', 'done');
      });

      if (status === 'Placed') {
        stepPlaced.classList.add('active');
      } else if (status === 'Preparing') {
        stepPlaced.classList.add('done');
        stepPrep.classList.add('active');
      } else if (status === 'Rider Picked' || status === 'Out for Delivery') {
        stepPlaced.classList.add('done');
        stepPrep.classList.add('done');
        stepTransit.classList.add('active');
      } else if (status === 'Delivered') {
        stepPlaced.classList.add('done');
        stepPrep.classList.add('done');
        stepTransit.classList.add('done');
        stepDelivered.classList.add('active');
      }
    }

    initTrackingMap() {
      setTimeout(() => {
        if (!this.map) {
          this.map = L.map('trackMap').setView([30.9084, 77.0999], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(this.map);
        } else {
          this.map.invalidateSize();
        }

        // Shop Pin (Sharma Kirana)
        const shopIcon = L.divIcon({
          className: 'shop-pin',
          html: '<div style="background:#065f46; color:#fff; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; border:2px solid #34d399; font-size:18px; box-shadow:0 4px 10px rgba(0,0,0,0.5);">🏪</div>',
          iconSize: [34, 34]
        });
        L.marker([30.9070, 77.0980], { icon: shopIcon }).addTo(this.map).bindPopup('Sharma Kirana & Fresh Produce (Mall Road)');

        // Customer Staircase Pin
        const custIcon = L.divIcon({
          className: 'cust-pin',
          html: '<div style="background:#dc2626; color:#fff; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; font-size:18px; box-shadow:0 4px 10px rgba(0,0,0,0.5);">🏡</div>',
          iconSize: [34, 34]
        });
        L.marker([30.9110, 77.1040], { icon: custIcon }).addTo(this.map).bindPopup('Aapka Ghar (35 Stairs down, Shamti Pine Lane)');

        // Connecting hill trail line
        const hillTrail = [
          [30.9070, 77.0980],
          [30.9080, 77.0995],
          [30.9095, 77.1015],
          [30.9102, 77.1028],
          [30.9110, 77.1040]
        ];
        L.polyline(hillTrail, { color: '#10b981', weight: 4, dashArray: '6, 8' }).addTo(this.map);

        // Animated Rider Marker
        const riderIcon = L.divIcon({
          className: 'rider-anim-pin',
          html: '<div style="background:#f59e0b; color:#000; border-radius:50%; width:38px; height:38px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; font-size:20px; box-shadow:0 0 15px #f59e0b;">🛵</div>',
          iconSize: [38, 38]
        });

        if (this.riderMarker) this.map.removeLayer(this.riderMarker);
        this.riderMarker = L.marker([30.9070, 77.0980], { icon: riderIcon }).addTo(this.map);

        // Animate rider climbing hill
        let step = 0;
        if (this.animInterval) clearInterval(this.animInterval);
        this.animInterval = setInterval(() => {
          step = (step + 1) % hillTrail.length;
          const pt = hillTrail[step];
          this.riderMarker.setLatLng(pt);
        }, 2500);

      }, 200);
    }
  }

  window.customerApp = new PahadiCustomerApp();
})();


// HTML5 Live GPS Location Auto-Detection & Live Weather Sync for Customer App
window.detectCustomerLiveLocation = async function(preResolvedLoc, silent = false) {
  const btnText = document.getElementById('custGpsBtnText');
  if (btnText) btnText.textContent = 'Detecting GPS...';

  if (!window.PahadiLiveServices) {
    alert('Live services initializing, please tap again in a second.');
    if (btnText) btnText.textContent = 'Detect My Location';
    return;
  }

  try {
    let loc = preResolvedLoc || await window.PahadiLiveServices.detectUserLocation();
    if (!loc || typeof loc.lat !== 'number' || !Number.isFinite(loc.lat) || typeof loc.lng !== 'number' || !Number.isFinite(loc.lng)) {
      loc = { lat: 30.9084, lng: 77.0999, altitude: 1502, accuracy: 15, nearestTown: { name: 'Solan (Mushroom City)', id: 'solan', altitude: 1502 }, distanceKm: 0 };
    }
    const townName = (loc.nearestTown && loc.nearestTown.name) ? loc.nearestTown.name : 'Solan';
    if (btnText) btnText.textContent = '📍 ' + townName + ' (' + loc.lat.toFixed(2) + ', ' + loc.lng.toFixed(2) + ')';

    // Auto-switch to nearest Himachal Town
    const townSelect = document.getElementById('townSelect');
    if (townSelect && loc.nearestTown) {
      townSelect.value = loc.nearestTown.id;
      if (window.customerApp) {
        window.customerApp.changeTown(loc.nearestTown.id);
      }
    }

    // Auto-fetch real-time Open-Meteo weather
    const weather = await window.PahadiLiveServices.fetchRealtimeWeather(loc.lat, loc.lng);
    const weatherTextEl = document.getElementById('weatherStatusText');
    if (weatherTextEl) {
      weatherTextEl.innerText = loc.nearestTown.name + ' Weather: ' + weather.temp + '°C ' + weather.label + ' • 45m SLA';
    }

    if (!silent) alert('📍 Location Auto-Detected!\n\n' +
      'Coordinates: [' + loc.lat.toFixed(4) + ', ' + loc.lng.toFixed(4) + ']\n' +
      'Altitude: ' + loc.altitude + ' meters\n' +
      'Nearest Town Hub: ' + loc.nearestTown.name + ' (' + loc.distanceKm + ' km)\n' +
      'Live Weather: ' + weather.temp + '°C (' + weather.label + ')\n\n' +
      'Catalog auto-synced with nearest mountain merchants.');
  } catch (err) {
    console.error('Customer GPS Error:', err);
    if (btnText) btnText.textContent = 'Detect My Location';
    alert('⚠️ ' + (err.message || 'Could not detect device GPS. Defaulting to Solan Hub.'));
  }
};

// Auto-sync real-time weather for current town on customer load
setTimeout(async () => {
  if (window.PahadiLiveServices) {
    const weather = await window.PahadiLiveServices.fetchRealtimeWeather(30.9084, 77.0999);
    const weatherTextEl = document.getElementById('weatherStatusText');
    if (weatherTextEl) {
      weatherTextEl.innerText = 'Solan Weather: ' + weather.temp + '°C ' + weather.label + ' • Standard 45m SLA';
    }
  }
}, 1000);
