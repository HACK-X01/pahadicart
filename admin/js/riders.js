// Pahadi Riders Fleet Management & Hill Telemetry Controller

function renderRidersView() {
  const container = document.getElementById("ridersGridContainer");
  const statsContainer = document.getElementById("riderStatsContainer");
  if (!container) return;

  const currentTown = document.getElementById("townSelect")?.value || "solan";
  const riders = PahadiMockDB.riders.filter(r => r.town === currentTown);

  const onlineCount = riders.filter(r => r.status !== 'offline').length;
  const inTransitCount = riders.filter(r => r.status === 'in_transit').length;
  const totalEarnedToday = riders.reduce((sum, r) => sum + r.earningsToday + r.customerTips, 0);

  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="metric-card">
        <div class="metric-title">Active Riders Online</div>
        <div class="metric-value" style="color:var(--primary-400);">${onlineCount} / ${riders.length}</div>
        <div class="metric-footer">${inTransitCount} currently climbing on deliveries</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Riders Today's Earnings</div>
        <div class="metric-value" style="color:var(--sky-400);">₹${totalEarnedToday.toLocaleString('en-IN')}</div>
        <div class="metric-footer">Includes hill distance + elevation climb bonus</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Avg Hill Deliveries / Rider</div>
        <div class="metric-value" style="color:var(--amber-400);">8.2</div>
        <div class="metric-footer">Target: 10–12 per shift</div>
      </div>
      <div class="metric-card">
        <div class="metric-title">Fleet Rating</div>
        <div class="metric-value" style="color:var(--white);">⭐ 4.88</div>
        <div class="metric-footer">Across Solan, Shimla & McLeod</div>
      </div>
    `;
  }

  container.innerHTML = riders.map(r => {
    const isBusy = r.status === 'in_transit';
    const isOffline = r.status === 'offline';

    let statusBadge = `<span class="status-badge status-delivered">Available</span>`;
    if (isBusy) statusBadge = `<span class="status-badge status-in_transit">Climbing (${r.activeOrder})</span>`;
    if (isOffline) statusBadge = `<span class="status-badge status-cancelled">Offline</span>`;

    return `
      <div class="panel-card" style="padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:15px; font-weight:800; color:var(--slate-50);">${r.name}</span>
              ${statusBadge}
            </div>
            <div style="font-size:11.5px; color:var(--slate-400); margin-top:2px;">
              📱 ${r.phone} &bull; Reg: ${r.vehicleNumber}
            </div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:11px; background:rgba(255,255,255,0.06); padding:3px 7px; border-radius:4px; font-weight:600; color:var(--primary-300);">
              🔋 ${r.batteryPercent}%
            </span>
          </div>
        </div>

        <div style="font-size:12px; color:var(--slate-300); background:var(--slate-900); padding:8px 12px; border-radius:8px; margin-bottom:12px; border:1px solid rgba(255,255,255,0.05);">
          <div>🛵 <b>Vehicle:</b> ${r.vehicle}</div>
          <div style="margin-top:3px;">🏦 <b>UPI VPA:</b> <span style="font-family:var(--font-mono); color:var(--slate-400);">${r.bankUPI}</span></div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:12px; font-size:11.5px;">
          <div style="background:rgba(255,255,255,0.02); padding:6px; border-radius:6px; text-align:center;">
            <div style="color:var(--slate-400);">Deliveries</div>
            <div style="font-weight:700; color:var(--slate-100); font-size:13px;">${r.todayDeliveries}</div>
          </div>
          <div style="background:rgba(255,255,255,0.02); padding:6px; border-radius:6px; text-align:center;">
            <div style="color:var(--slate-400);">Hill Climbed</div>
            <div style="font-weight:700; color:var(--primary-400); font-size:13px;">${r.elevationClimbedMeters} m</div>
          </div>
          <div style="background:rgba(255,255,255,0.02); padding:6px; border-radius:6px; text-align:center;">
            <div style="color:var(--slate-400);">Earnings</div>
            <div style="font-weight:700; color:var(--sky-400); font-size:13px;">₹${r.earningsToday + r.customerTips}</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:10px;">
          <span style="font-size:11.5px; color:var(--slate-400);">
            ⭐ <b>${r.rating}</b> Rating
          </span>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-sm btn-secondary" onclick="callRiderPrompt('${r.name}', '${r.phone}')">📞 Call</button>
            <button class="btn btn-sm ${isOffline ? 'btn-primary' : 'btn-danger'}" onclick="toggleRiderShift('${r.id}')">
              ${isOffline ? 'Activate Shift' : 'End Shift'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function callRiderPrompt(name, phone) {
  alert(`Connecting masked VoIP call to Rider: ${name} (${phone})`);
}

function toggleRiderShift(riderId) {
  const rider = PahadiMockDB.riders.find(r => r.id === riderId);
  if (!rider) return;

  rider.status = rider.status === 'offline' ? 'available' : 'offline';
  showToast(`${rider.name} is now ${rider.status.toUpperCase()}`);
  renderRidersView();
  initGodViewMap(document.getElementById("townSelect")?.value || "solan");
}
