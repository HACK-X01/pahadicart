// Live Order Feed & Audio Chime Engine
let chimeAudioContext = null;
let isChimeEnabled = true;

// Web Audio API Synthesizer (Pahadi Temple / Mountain Bell Sound)
function playPahadiChime() {
  if (!isChimeEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!chimeAudioContext) chimeAudioContext = new AudioContext();
    if (chimeAudioContext.state === 'suspended') chimeAudioContext.resume();

    const now = chimeAudioContext.currentTime;
    const freq = [523.25, 659.25, 783.99, 1046.50];
    
    freq.forEach((f, idx) => {
      const osc = chimeAudioContext.createOscillator();
      const gain = chimeAudioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.9);

      osc.connect(gain);
      gain.connect(chimeAudioContext.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.0);
    });
  } catch(e) {
    console.log("Audio chime error:", e);
  }
}

function toggleChime() {
  isChimeEnabled = !isChimeEnabled;
  const btn = document.getElementById("chimeBtn");
  if (btn) {
    btn.classList.toggle("active", isChimeEnabled);
    btn.innerHTML = isChimeEnabled 
      ? '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg> <span>Ghanti Sound: ON</span>'
      : '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg> <span>Ghanti Sound: MUTED</span>';
  }
  showToast(isChimeEnabled ? "Pahadi Order Chime Activated!" : "Chime Muted");
}

function renderOrdersFeed(filterStatus = "all") {
  const containers = [
    document.getElementById("ordersFeedContainer"),
    document.getElementById("fullOrdersFeed")
  ].filter(Boolean);
  if (containers.length === 0) return;

  const currentTown = document.getElementById("townSelect")?.value || "solan";
  let filtered = PahadiMockDB.orders.filter(o => o.town === currentTown);

  if (filterStatus !== "all") {
    filtered = filtered.filter(o => o.status === filterStatus);
  }

  if (filtered.length === 0) {
    containers.forEach(c => {
      c.innerHTML = '<div style="text-align:center; padding:30px 10px; color:var(--slate-500);"><p style="font-size:13px; font-weight:600;">No orders found</p></div>';
    });
    return;
  }

  const cardsHtml = filtered.map(order => {
    const statusMap = {
      placed: { label: "New Placed", class: "status-placed" },
      preparing: { label: "Packing in Shop", class: "status-preparing" },
      in_transit: { label: "Rider Climbing", class: "status-in_transit" },
      delivered: { label: "Delivered", class: "status-delivered" },
      cancelled: { label: "Cancelled", class: "status-cancelled" }
    };

    const statusInfo = statusMap[order.status] || { label: order.status, class: "status-placed" };

    return (
      '<div class="order-card" id="card-' + order.id + '">' +
        '<div class="order-card-header">' +
          '<span class="order-id">' + order.id + '</span>' +
          '<span class="status-badge ' + statusInfo.class + '">' +
            '<span class="map-legend-dot" style="background:currentColor; margin-right:4px;"></span>' +
            statusInfo.label +
          '</span>' +
        '</div>' +
        '<div class="order-meta">' +
          '<div class="order-merchant"><span>🏪 ' + order.merchantName + '</span></div>' +
          '<div class="order-hill-route"><span>🏔️ ' + order.eta + '</span></div>' +
        '</div>' +
        '<div style="font-size:12px; color:var(--slate-300);">' +
          order.items.map(i => i.qty + 'x ' + i.name).join(', ') +
        '</div>' +
        '<div style="font-size:11px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:6px 10px; border-radius:6px; color:var(--slate-400);">' +
          '📍 <b>Drop:</b> ' + order.deliveryAddress + ' <br>' +
          '🪜 <b>Hill Note:</b> <span style="color:var(--primary-400);">' + order.staircaseNote + '</span>' +
        '</div>' +
        '<div class="order-card-footer">' +
          '<div>' +
            '<span style="font-size:11px; color:var(--slate-500);">Bill: </span>' +
            '<span class="order-amount">₹' + order.total + '</span>' +
            '<span style="font-size:10.5px; color:var(--slate-400); margin-left:4px;">(' + order.paymentMode + ')</span>' +
          '</div>' +
          '<div style="display:flex; gap:6px; flex-wrap:wrap;">' +
            (order.status === 'placed' ? '<button class="btn btn-sm btn-primary" onclick="advanceOrderStatus(\'' + order.id + '\', \'preparing\')">Accept</button>' : '') +
            (order.status === 'preparing' ? '<button class="btn btn-sm btn-secondary" onclick="advanceOrderStatus(\'' + order.id + '\', \'in_transit\')">Dispatch</button>' : '') +
            (order.status === 'in_transit' ? '<button class="btn btn-sm btn-primary" onclick="advanceOrderStatus(\'' + order.id + '\', \'delivered\')">Verify OTP</button>' : '') +
            '<button class="btn btn-sm btn-secondary" onclick="window.PahadiLiveServices && window.PahadiLiveServices.openOrderInGoogleMaps(\'' + order.id + '\', \'' + (order.deliveryAddress || '').replace(/'/g, "") + '\')" style="background:rgba(56,189,248,0.15); border-color:#38bdf8; color:#38bdf8; font-weight:700;">🗺️ Google Maps</button>' +
            '<button class="btn btn-sm btn-secondary" onclick="window.showTriadAudit(\'' + order.id + '\')" style="background:rgba(16,185,129,0.15); border-color:#10b981; color:#10b981; font-weight:700;">🔍 Triad Audit</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  containers.forEach(c => {
    c.innerHTML = cardsHtml;
  });
}

function advanceOrderStatus(orderId, newStatus) {
  const order = PahadiMockDB.orders.find(o => o.id === orderId);
  if (!order) return;

  order.status = newStatus;
  if (newStatus === 'delivered') {
    order.eta = "Delivered (OTP: " + Math.floor(1000 + Math.random() * 9000) + ")";
  }

  playPahadiChime();
  showToast("Order " + orderId + " marked as " + newStatus.toUpperCase() + "!");
  renderOrdersFeed();
  updateMetricsDashboard();
}

function simulateIncomingOrder() {
  const currentTown = document.getElementById("townSelect")?.value || "solan";
  const newId = "PC-" + Math.floor(8925 + Math.random() * 500);
  
  const sampleItems = [
    { name: "Himachali Apple Murabba 500g", qty: 1, price: 210 },
    { name: "Solan Local Bakery Rusk", qty: 2, price: 140 },
    { name: "Maggi Hill Masala Pack", qty: 4, price: 96 }
  ];

  const newOrder = {
    id: newId,
    customerName: "Rohan Sharma",
    customerPhone: "+91 94183 " + Math.floor(10000 + Math.random() * 90000),
    merchantId: "m1",
    merchantName: "Anand Sweet Shop & Bakers",
    town: currentTown,
    items: sampleItems,
    amount: 446,
    deliveryFee: 35,
    platformFee: 5,
    total: 486,
    paymentMode: "UPI (Paid)",
    status: "placed",
    time: "Just now",
    riderId: null,
    deliveryAddress: "Near Sanjauli Tunnel / Shamti Road",
    staircaseNote: "Up 12 stairs near yellow water tank",
    eta: "45-55 mins"
  };

  PahadiMockDB.orders.unshift(newOrder);
  playPahadiChime();
  showToast("🔔 New Hill Order Received: " + newId + " (₹486)!");
  renderOrdersFeed();
  updateMetricsDashboard();
}



// =================================================================
// TRIAD TRACKER & AUDIT ENGINE (Cx ➔ Merchant ➔ Rider)
// =================================================================
window.closeTriadModal = function() {
  const modal = document.getElementById('triadModalBackdrop');
  if (modal) modal.style.display = 'none';
};

window.showTriadAudit = function(orderId) {
  const modal = document.getElementById('triadModalBackdrop');
  const content = document.getElementById('triadModalContent');
  if (!modal || !content) return;

  // Search in live eventBus or mock data
  let orders = [];
  if (window.pahadiBus) orders = window.pahadiBus.getOrders();
  if (orders.length === 0 && window.ordersData) orders = window.ordersData;

  let order = orders.find(o => o.id === orderId);
  if (!order && window.ordersData) order = window.ordersData.find(o => o.id === orderId);
  if (!order) {
    order = {
      id: orderId,
      customerName: 'Aarav Sharma',
      customerPhone: '98160-12890',
      town: 'solan',
      colony: 'Shamti, Upper Pine Lane',
      landmark: 'Near Durga Mandir Water Tank',
      staircaseNotes: 'Descend 35 stone steps from main road, 2nd green gate on left',
      merchantName: 'Sharma Kirana & Fresh Produce',
      merchantDistanceMeters: 850,
      riderName: 'Vikas Thakur',
      riderPhone: '98161-12345',
      riderVehicle: 'Hero Splendor (HP-14-B-8821)',
      riderDistanceMeters: 620,
      grandTotal: 485,
      paymentMode: 'COD',
      status: 'Delivered',
      otp: '4829',
      time: '11:20 AM'
    };
  }

  document.getElementById('triadOrderTitle').innerText = 'Order #' + order.id + ' • Proximity Triad Audit';
  document.getElementById('triadTownName').innerText = (order.town || 'Solan').toUpperCase() + ' HILL CLUSTER';

  const mDist = order.merchantDistanceMeters || 850;
  const rDist = order.riderDistanceMeters || 620;

  content.innerHTML = `
    <!-- Triad 3-Column Entity Chain -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
      
      <!-- Entity 1: Customer (Cx) -->
      <div style="background: #152238; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 14px; padding: 18px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 11px; font-weight: 800; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 3px 8px; border-radius: 4px;">1. CUSTOMER (Cx)</span>
          <span style="font-size: 20px;">👤</span>
        </div>
        <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 4px;">${order.customerName || 'Aarav Sharma'}</h3>
        <div style="font-size: 12px; color: #38bdf8; margin-bottom: 8px;">📱 ${order.customerPhone || '98160-12890'}</div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
          📍 <strong>Colony:</strong> ${order.colony || 'Shamti, Upper Pine Lane'}
        </div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 10px;">
          🏛️ <strong>Hill Landmark:</strong> ${order.landmark || 'Near Durga Mandir Tank'}
        </div>
        <div style="background: rgba(245, 158, 11, 0.12); border-left: 3px solid #f59e0b; padding: 8px 10px; border-radius: 4px; font-size: 11px; color: #fbbf24;">
          <strong>🪜 Staircase Footpath Note:</strong><br>
          ${order.staircaseNotes || 'Descend 35 stone steps from road level, 2nd green gate on left'}
        </div>
      </div>

      <!-- Entity 2: Nearest Merchant (Dukaan) -->
      <div style="background: #152238; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 18px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 11px; font-weight: 800; background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 3px 8px; border-radius: 4px;">2. NEAREST SHOP (Dukaan)</span>
          <span style="font-size: 20px;">🏪</span>
        </div>
        <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 4px;">${order.merchantName || 'Sharma Kirana & Fresh Produce'}</h3>
        <div style="font-size: 12px; color: #10b981; margin-bottom: 8px;">🛡️ Vyapar Mandal Reg: VM-SOL-2024-089</div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
          📏 <strong>Distance to Cx Doorstep:</strong> <strong style="color: #fff;">${mDist} meters</strong>
        </div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 10px;">
          ⏱️ <strong>Kitchen Packing Time:</strong> 11 mins (Spill-Proof Seal)
        </div>
        <div style="background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; padding: 8px 10px; border-radius: 4px; font-size: 11px; color: #34d399;">
          <strong>🎯 Auto-Routing Reason:</strong><br>
          Nearest verified store with 100% item inventory in stock (${mDist}m vs 1.8km competitor).
        </div>
      </div>

      <!-- Entity 3: Nearest Rider (Sawaari) -->
      <div style="background: #152238; border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 14px; padding: 18px; position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <span style="font-size: 11px; font-weight: 800; background: rgba(168, 85, 247, 0.15); color: #c084fc; padding: 3px 8px; border-radius: 4px;">3. NEAREST RIDER (Sawaari)</span>
          <span style="font-size: 20px;">🛵</span>
        </div>
        <h3 style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 4px;">${order.riderName || 'Vikas Thakur'}</h3>
        <div style="font-size: 12px; color: #c084fc; margin-bottom: 8px;">🛵 ${order.riderVehicle || 'Hero Splendor (HP-14-B-8821)'}</div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
          📏 <strong>Distance to Shop:</strong> <strong style="color: #fff;">${rDist} meters (ETA 4m)</strong>
        </div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 10px;">
          ⛰️ <strong>Elevation Climbed:</strong> +140 m &bull; Secret OTP: <strong style="color: #fbbf24;">${order.otp || '4829'}</strong>
        </div>
        <div style="background: rgba(168, 85, 247, 0.1); border-left: 3px solid #c084fc; padding: 8px 10px; border-radius: 4px; font-size: 11px; color: #e9d5ff;">
          <strong>🎯 Auto-Dispatch Reason:</strong><br>
          Closest active rider on duty with floating cash below ₹2,500 limit.
        </div>
      </div>

    </div>

    <!-- Timeline & SLA Milestone Bar -->
    <div style="background: #111b2d; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
        <h4 style="font-size: 14px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
          <span>⏱️ Order Lifecycle Timeline & Delivery Duration Audit</span>
        </h4>
        <span style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #10b981; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 20px;">
          TOTAL TIME: 28 MINS (Target SLA: 45 Mins • 17 Mins Ahead)
        </span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center;">
        <div style="background: #17243c; padding: 12px; border-radius: 10px;">
          <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">1. ORDER PLACED</div>
          <div style="font-size: 14px; font-weight: 900; color: #fff; margin-top: 4px;">${order.time || '11:20 AM'}</div>
          <div style="font-size: 11px; color: #38bdf8;">Auto-routed in 1.2s</div>
        </div>

        <div style="background: #17243c; padding: 12px; border-radius: 10px;">
          <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">2. SHOP ACCEPTED</div>
          <div style="font-size: 14px; font-weight: 900; color: #fff; margin-top: 4px;">+2m 15s</div>
          <div style="font-size: 11px; color: #10b981;">Ghar Ki Ghanti alert</div>
        </div>

        <div style="background: #17243c; padding: 12px; border-radius: 10px;">
          <div style="font-size: 11px; color: #94a3b8; font-weight: 700;">3. RIDER PICKED</div>
          <div style="font-size: 14px; font-weight: 900; color: #fff; margin-top: 4px;">+11m 40s</div>
          <div style="font-size: 11px; color: #c084fc;">Splendor dispatched</div>
        </div>

        <div style="background: #17243c; padding: 12px; border-radius: 10px; border: 1px solid #10b981;">
          <div style="font-size: 11px; color: #10b981; font-weight: 800;">4. DELIVERED (DOORSTEP)</div>
          <div style="font-size: 14px; font-weight: 900; color: #10b981; margin-top: 4px;">+14m 25s</div>
          <div style="font-size: 11px; color: #fbbf24;">OTP Verified & Complete</div>
        </div>
      </div>
    </div>

    <!-- Algorithmic Decision Comparison Diagnostics -->
    <div style="background: #111b2d; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <h4 style="font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 12px;">
        🧠 Algorithmic Proximity Decision Diagnostics (Engine Log)
      </h4>
      <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; text-align: left;">
            <th style="padding: 6px 8px;">Candidate Entity</th>
            <th style="padding: 6px 8px;">Role</th>
            <th style="padding: 6px 8px;">Hill Distance</th>
            <th style="padding: 6px 8px;">Status / Stock</th>
            <th style="padding: 6px 8px;">Algorithm Decision</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #34d399;">
            <td style="padding: 8px;">Sharma Kirana (Mall Rd)</td>
            <td style="padding: 8px;">Merchant</td>
            <td style="padding: 8px;">850 m</td>
            <td style="padding: 8px;">100% In Stock</td>
            <td style="padding: 8px;"><strong>SELECTED (Closest)</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8;">
            <td style="padding: 8px;">Him Fresh Store (Kotla)</td>
            <td style="padding: 8px;">Merchant</td>
            <td style="padding: 8px;">1,420 m</td>
            <td style="padding: 8px;">100% In Stock</td>
            <td style="padding: 8px;">Skipped (+570m further)</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: #c084fc;">
            <td style="padding: 8px;">Vikas Thakur (Hero Splendor)</td>
            <td style="padding: 8px;">Rider</td>
            <td style="padding: 8px;">620 m to shop</td>
            <td style="padding: 8px;">Available (Cash ₹1,240)</td>
            <td style="padding: 8px;"><strong>DISPATCHED (Closest Online)</strong></td>
          </tr>
          <tr style="color: #94a3b8;">
            <td style="padding: 8px;">Mohit Verma (Walker Runner)</td>
            <td style="padding: 8px;">Rider</td>
            <td style="padding: 8px;">1,350 m to shop</td>
            <td style="padding: 8px;">Available (Cash ₹650)</td>
            <td style="padding: 8px;">Standby (+730m further)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Rupee Waterfall Ledger -->
    <div style="background: rgba(6, 95, 70, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 14px; padding: 18px;">
      <h4 style="font-size: 13px; font-weight: 800; color: #10b981; margin-bottom: 10px;">
        💰 Order Financial Rupee Flow Audit
      </h4>
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
        <span>1. Total Customer Cash Collected:</span>
        <strong style="color: #fff;">₹${order.grandTotal} (${order.paymentMode})</strong>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #94a3b8;">
        <span>2. Settled to Sharma Kirana (Product Cost less 6% Commission):</span>
        <span style="color: #f87171;">-₹${Math.round(order.grandTotal * 0.88)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #94a3b8;">
        <span>3. Paid to Rider Vikas Thakur (Base + +140m Hill Climb Bonus):</span>
        <span style="color: #f87171;">-₹45.00</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; color: #34d399;">
        <span>4. YOUR NET FOUNDER PROFIT (Margin):</span>
        <span>+₹${Math.round(order.grandTotal * 0.12 - 5)} (100% Retained)</span>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
};
