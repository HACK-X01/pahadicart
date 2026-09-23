// Pahadi Riders Fleet Management & Hill Telemetry Controller (Admin Control Center Enhanced)

// Hydrate riders from localStorage if available
(function initRidersPersistence() {
  try {
    const saved = localStorage.getItem('pahadicart_riders');
    if (saved && window.PahadiMockDB) {
      const parsed = JSON.parse(saved);
      // Clean out legacy demo numbers
      parsed.forEach(function(r) {
        if (r.cashInHand === 2150 || r.cashInHand === 1800 || r.cashInHand === 1100 || r.todayDeliveries > 0) {
          r.todayDeliveries = 0;
          r.todayDistanceKm = 0;
          r.elevationClimbedMeters = 0;
          r.earningsToday = 0;
          r.customerTips = 0;
          r.cashInHand = 0;
        }
      });
      window.PahadiMockDB.riders = parsed;
      localStorage.setItem('pahadicart_riders', JSON.stringify(parsed));
    }
  } catch (e) {
    console.error('Error hydrating riders:', e);
  }
})();

function saveRidersToStorage() {
  try {
    if (window.PahadiMockDB && window.PahadiMockDB.riders) {
      localStorage.setItem('pahadicart_riders', JSON.stringify(window.PahadiMockDB.riders));
      if (window.pahadiBus) {
        window.pahadiBus.emit('RIDER_STATUS_CHANGED', { riders: window.PahadiMockDB.riders });
      }
    }
  } catch (e) {
    console.error('Error saving riders:', e);
  }
}

function renderRidersView() {
  const container = document.getElementById("ridersGridContainer");
  const statsContainer = document.getElementById("riderStatsContainer");
  if (!container) return;

  const currentTown = document.getElementById("townSelect") ? document.getElementById("townSelect").value : "solan";
  const riders = (PahadiMockDB.riders || []).filter(function(r) {
    return r.town === currentTown || currentTown === 'all';
  });

  const onlineCount = riders.filter(function(r) { return r.status !== 'offline'; }).length;
  const inTransitCount = riders.filter(function(r) { return r.status === 'in_transit'; }).length;
  const totalEarnedToday = riders.reduce(function(sum, r) { return sum + (r.earningsToday || 0) + (r.customerTips || 0); }, 0);

  // Delivery & Payout Rules from Business Rules
  let baseFee = 25;
  let stairFee = 25;
  try {
    const rulesStr = localStorage.getItem('pahadicart_business_rules');
    if (rulesStr) {
      const parsed = JSON.parse(rulesStr);
      baseFee = parsed.baseDeliveryFee || 25;
      stairFee = parsed.staircaseDeliveryFee || 25;
    }
  } catch (e) {}

  if (statsContainer) {
    statsContainer.innerHTML = 
      '<div class="metric-card">' +
        '<div class="metric-title">Active Riders Online</div>' +
        '<div class="metric-value" style="color:var(--primary-400);">' + onlineCount + ' / ' + riders.length + '</div>' +
        '<div class="metric-footer">' + inTransitCount + ' currently climbing on deliveries</div>' +
      '</div>' +
      '<div class="metric-card">' +
        '<div class="metric-title">Riders Today\'s Earnings</div>' +
        '<div class="metric-value" style="color:var(--sky-400);">₹' + totalEarnedToday.toLocaleString('en-IN') + '</div>' +
        '<div class="metric-footer">Includes hill distance + elevation climb bonus</div>' +
      '</div>' +
      '<div class="metric-card">' +
        '<div class="metric-title">Delivery Fee Rules</div>' +
        '<div class="metric-value" style="color:var(--amber-400); font-size:18px;">₹' + baseFee + ' + ₹' + stairFee + ' stairs</div>' +
        '<div class="metric-footer">Configured in Business Rules</div>' +
      '</div>' +
      '<div class="metric-card">' +
        '<div class="metric-title">Payout Rule</div>' +
        '<div class="metric-value" style="color:#10b981; font-size:16px;">₹30 base + 100% Tips</div>' +
        '<div class="metric-footer">+ ₹15 per 100m elevation climbed</div>' +
      '</div>';
  }

  container.innerHTML = riders.map(function(r) {
    const isBusy = r.status === 'in_transit';
    const isOffline = r.status === 'offline';

    let statusBadge = '<span class="status-badge status-delivered">Available</span>';
    if (isBusy) statusBadge = '<span class="status-badge status-in_transit">Climbing (' + (r.activeOrder || 'Order') + ')</span>';
    if (isOffline) statusBadge = '<span class="status-badge status-cancelled">Offline</span>';

    return '<div class="panel-card" style="padding:16px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">' +
        '<div>' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            '<span style="font-size:15px; font-weight:800; color:var(--slate-50);">' + r.name + '</span>' +
            statusBadge +
          '</div>' +
          '<div style="font-size:11.5px; color:var(--slate-400); margin-top:2px;">' +
            '📱 ' + (r.phone || 'N/A') + ' &bull; Reg: ' + (r.vehicleNumber || 'HP-14-R-xxxx') +
          '</div>' +
        '</div>' +
        '<div style="text-align:right;">' +
          '<span style="font-size:11px; background:rgba(255,255,255,0.06); padding:3px 7px; border-radius:4px; font-weight:600; color:var(--primary-300);">' +
            '🔋 ' + (r.batteryPercent || 85) + '%' +
          '</span>' +
        '</div>' +
      '</div>' +

      '<div style="font-size:12px; color:var(--slate-300); background:var(--slate-900); padding:8px 12px; border-radius:8px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.05);">' +
        '<div>🛵 <b>Vehicle:</b> ' + (r.vehicle || 'Hero Electric Optima') + '</div>' +
        '<div style="margin-top:3px;">🏦 <b>UPI VPA:</b> <span style="font-family:var(--font-mono); color:var(--slate-400);">' + (r.bankUPI || 'rider@upi') + '</span></div>' +
      '</div>' +

      '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:12px; font-size:11.5px;">' +
        '<div style="background:rgba(255,255,255,0.02); padding:6px; border-radius:6px; text-align:center;">' +
          '<div style="color:var(--slate-400);">Deliveries</div>' +
          '<div style="font-weight:700; color:var(--slate-100); font-size:13px;">' + (r.todayDeliveries || 0) + '</div>' +
        '</div>' +
        '<div style="background:rgba(255,255,255,0.02); padding:6px; border-radius:6px; text-align:center;">' +
          '<div style="color:var(--slate-400);">Hill Climbed</div>' +
          '<div style="font-weight:700; color:var(--primary-400); font-size:13px;">' + (r.elevationClimbedMeters || 0) + ' m</div>' +
        '</div>' +
        '<div style="background:rgba(255,255,255,0.02); padding:6px; border-radius:6px; text-align:center;">' +
          '<div style="color:var(--slate-400);">Earnings</div>' +
          '<div style="font-weight:700; color:var(--sky-400); font-size:13px;">₹' + ((r.earningsToday || 0) + (r.customerTips || 0)) + '</div>' +
        '</div>' +
      '</div>' +

      '<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">' +
        '<span style="font-size:11.5px; color:var(--slate-400);">' +
          '⭐ <b>' + (r.rating || 4.8) + '</b> Rating' +
        '</span>' +
        '<div style="display:flex; gap:6px;">' +
          '<button class="btn btn-sm btn-secondary" onclick="callRiderPrompt(\'' + r.name + '\', \'' + r.phone + '\')">📞 Call</button>' +
          '<button class="btn btn-sm ' + (isOffline ? 'btn-primary' : 'btn-danger') + '" onclick="toggleRiderShift(\'' + r.id + '\')">' +
            (isOffline ? 'Activate Shift' : 'End Shift') +
          '</button>' +
          '<button class="btn btn-sm btn-secondary" onclick="removeRider(\'' + r.id + '\')" title="Remove Rider" style="color:#ef4444; padding:2px 6px;">✕</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function callRiderPrompt(name, phone) {
  alert('Connecting masked VoIP call to Rider: ' + name + ' (' + phone + ')');
}

function toggleRiderShift(riderId) {
  const rider = PahadiMockDB.riders.find(function(r) { return r.id === riderId; });
  if (!rider) return;

  rider.status = rider.status === 'offline' ? 'available' : 'offline';
  saveRidersToStorage();
  if (window.showToast) window.showToast(rider.name + ' is now ' + rider.status.toUpperCase());
  renderRidersView();
  if (typeof initGodViewMap === 'function') {
    initGodViewMap(document.getElementById("townSelect") ? document.getElementById("townSelect").value : "solan");
  }
}

function removeRider(riderId) {
  const rider = PahadiMockDB.riders.find(function(r) { return r.id === riderId; });
  if (!rider) return;
  if (confirm('Kya aap rider ' + rider.name + ' ko fleet se REMOVE karna chahte hain?')) {
    PahadiMockDB.riders = PahadiMockDB.riders.filter(function(r) { return r.id !== riderId; });
    saveRidersToStorage();
    renderRidersView();
    if (window.showToast) window.showToast('Rider ' + rider.name + ' removed from fleet.', 'info');
  }
}

// --- Add Rider Modal ---
function openAddRiderModal() {
  let modal = document.getElementById('adminRiderModal');
  if (!modal) {
    createRiderModalDOM();
    modal = document.getElementById('adminRiderModal');
  }

  document.getElementById('adminRiderName').value = '';
  document.getElementById('adminRiderPhone').value = '';
  document.getElementById('adminRiderVehicle').value = 'Electric EV Scooter';
  document.getElementById('adminRiderVehicleNo').value = '';
  document.getElementById('adminRiderTown').value = document.getElementById('townSelect') ? document.getElementById('townSelect').value : 'solan';

  modal.style.display = 'flex';
}

function closeRiderModal() {
  const modal = document.getElementById('adminRiderModal');
  if (modal) modal.style.display = 'none';
}

function saveRiderForm() {
  const name = document.getElementById('adminRiderName').value.trim();
  const phone = document.getElementById('adminRiderPhone').value.trim();
  const vehicle = document.getElementById('adminRiderVehicle').value;
  const vehicleNumber = document.getElementById('adminRiderVehicleNo').value.trim() || 'HP-14-R-5544';
  const town = document.getElementById('adminRiderTown').value;

  if (!name || !phone) {
    alert('Kripya rider ka naam aur phone number dalein.');
    return;
  }

  const newId = 'r_' + Date.now();
  const newRider = {
    id: newId,
    name: name,
    phone: phone,
    vehicle: vehicle,
    vehicleNumber: vehicleNumber,
    town: town,
    status: 'available',
    batteryPercent: 100,
    bankUPI: phone + '@paytm',
    todayDeliveries: 0,
    elevationClimbedMeters: 0,
    earningsToday: 0,
    customerTips: 0,
    rating: 5.0,
    activeOrder: null,
    coords: town === 'shimla' ? [31.1048, 77.1734] : town === 'dharamshala' ? [32.2190, 76.3234] : [30.9084, 77.0999]
  };

  if (!PahadiMockDB.riders) PahadiMockDB.riders = [];
  PahadiMockDB.riders.push(newRider);
  saveRidersToStorage();
  renderRidersView();
  closeRiderModal();
  if (window.showToast) window.showToast('New Delivery Partner ' + name + ' added to fleet!');
}

function createRiderModalDOM() {
  const modalHTML = '<div id="adminRiderModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center; padding:16px;">' +
    '<div style="background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:16px; width:100%; max-width:480px; padding:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">' +
        '<h3 style="color:#fff; font-size:18px; margin:0; font-weight:800;">🛵 Add New Delivery Partner</h3>' +
        '<button onclick="closeRiderModal()" style="background:none; border:none; color:#cbd5e1; font-size:22px; cursor:pointer;">&times;</button>' +
      '</div>' +
      '<div style="margin-bottom:12px;">' +
        '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Rider Full Name *</label>' +
        '<input type="text" id="adminRiderName" placeholder="e.g. Vikram Thakur" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:13px;">' +
      '</div>' +
      '<div style="margin-bottom:12px;">' +
        '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Phone Number (WhatsApp Active) *</label>' +
        '<input type="text" id="adminRiderPhone" placeholder="+91 94180 54321" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:13px;">' +
      '</div>' +
      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">' +
        '<div>' +
          '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Vehicle Type</label>' +
          '<select id="adminRiderVehicle" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">' +
            '<option value="Electric EV Scooter">⚡ Electric EV Scooter</option>' +
            '<option value="Honda Activa 6G">🛵 Honda Activa 6G</option>' +
            '<option value="Hero Splendor Hill Edition">🏍️ Hero Splendor</option>' +
            '<option value="Pedal Mountain Bicycle">🚲 Mountain Bicycle</option>' +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Vehicle Reg Number</label>' +
          '<input type="text" id="adminRiderVehicleNo" placeholder="HP-14-D-2101" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">' +
        '</div>' +
      '</div>' +
      '<div style="margin-bottom:20px;">' +
        '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Operating Town</label>' +
        '<select id="adminRiderTown" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">' +
          '<option value="solan">Solan Hills</option>' +
          '<option value="shimla">Shimla Ridge & Mall</option>' +
          '<option value="dharamshala">Dharamshala & McLeod</option>' +
        '</select>' +
      '</div>' +
      '<div style="display:flex; justify-content:flex-end; gap:10px;">' +
        '<button type="button" onclick="closeRiderModal()" class="btn btn-secondary">Cancel</button>' +
        '<button type="button" onclick="saveRiderForm()" class="btn btn-primary" style="background:#10b981; font-weight:700;">Add Rider</button>' +
      '</div>' +
    '</div>' +
  '</div>';
  const div = document.createElement('div');
  div.innerHTML = modalHTML;
  document.body.appendChild(div.firstElementChild);
}

// Global exposure
window.renderRidersView = renderRidersView;
window.callRiderPrompt = callRiderPrompt;
window.toggleRiderShift = toggleRiderShift;
window.removeRider = removeRider;
window.openAddRiderModal = openAddRiderModal;
window.closeRiderModal = closeRiderModal;
window.saveRiderForm = saveRiderForm;
