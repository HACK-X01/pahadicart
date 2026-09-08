// PahadiCart Mountain Dispatch Center & Relay Management
(function() {
  function renderDispatchConsole() {
    const container = document.getElementById('dispatchContentContainer');
    if (!container) return;

    const currentTown = document.getElementById('townSelect')?.value || 'solan';
    const orders = (window.PahadiMockDB?.orders || []).filter(o => o.town === currentTown && (o.status === 'placed' || o.status === 'preparing' || o.status === 'in_transit'));
    const riders = (window.PahadiMockDB?.riders || []).filter(r => r.town === currentTown);

    container.innerHTML = `
      <div class="dispatch-grid-deck" style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; margin-top: 16px;">
        <!-- Left: Pending Orders Dispatch Queue -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="panel-title">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>Active Dispatch Queue (Priority Mountain Matching)</span>
            </div>
            <span class="status-badge status-placed">${orders.length} Orders In Queue</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
            ${orders.length === 0 ? `
              <div style="text-align: center; padding: 40px 10px; color: var(--slate-400);">
                <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
                <h4>Zero Dispatch Bottlenecks</h4>
                <p style="font-size: 12px;">All mountain orders currently assigned or delivered on-time.</p>
              </div>
            ` : orders.map(o => `
              <div class="dispatch-order-row" style="background: var(--slate-900); border: 1px solid rgba(255,255,255,0.08); padding: 14px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: #fff; font-size: 14px;">#${o.id}</strong>
                    <span class="status-badge status-${o.status}">${o.status.toUpperCase()}</span>
                    <span style="font-size: 11px; color: var(--amber-400); font-weight: 700;">₹${o.total}</span>
                  </div>
                  <div style="font-size: 12px; color: var(--slate-300); margin-top: 4px;">
                    Pickup: <b>${o.merchantName}</b> ➔ Drop: <b>${o.deliveryAddress}</b>
                  </div>
                  <div style="font-size: 11px; color: var(--slate-400); margin-top: 3px;">
                    🏔️ Terrain Complexity: <b style="color: var(--primary-400);">Medium (+25 Stairs, +80m Climb)</b> &bull; SLA: ${o.eta}
                  </div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-sm btn-secondary" onclick="window.PahadiLiveServices && window.PahadiLiveServices.openOrderInGoogleMaps('${o.id}', '${(o.deliveryAddress||'').replace(/'/g, '')}')" style="font-size: 11px; padding: 5px 10px;">🗺️ Route</button>
                  <button class="btn btn-sm btn-primary" onclick="openManualDispatchModal('${o.id}')" style="font-size: 11px; padding: 5px 12px;">⚡ Assign Rider</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: Fleet Availability & Runner Relay -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="panel-title">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <span>Available Couriers &amp; Runners</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px;">
            ${riders.map(r => `
              <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 12px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 34px; height: 34px; border-radius: 50%; background: ${r.status === 'in_transit' ? '#a855f7' : '#0ea5e9'}; display: flex; align-items: center; justify-content: center; font-size: 15px; color: #fff;">
                    ${r.vehicle.includes('Walking') ? '👟' : '🛵'}
                  </div>
                  <div>
                    <div style="font-weight: 700; font-size: 13px; color: #fff;">${r.name}</div>
                    <div style="font-size: 11px; color: var(--slate-400);">${r.vehicle} &bull; Rating: ⭐ ${r.rating}</div>
                  </div>
                </div>
                <span class="status-badge ${r.status === 'in_transit' ? 'status-in_transit' : 'status-delivered'}">
                  ${r.status.toUpperCase()}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  window.openManualDispatchModal = function(orderId) {
    const order = (window.PahadiMockDB?.orders || []).find(o => o.id === orderId);
    if (!order) return;

    const availableRiders = (window.PahadiMockDB?.riders || []).filter(r => r.town === order.town);
    const modalHtml = `
      <div id="manualDispatchModal" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(2,6,23,0.85); backdrop-filter:blur(8px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:16px;">
        <div style="background:#0f172a; border:1px solid rgba(16,185,129,0.4); border-radius:20px; max-width:500px; width:100%; padding:24px; color:#fff;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="font-size:18px; font-weight:800; color:#10b981;">⚡ Manual Dispatch Override: #${order.id}</h3>
            <button onclick="document.getElementById('manualDispatchModal').remove()" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">&times;</button>
          </div>
          <p style="font-size:12.5px; color:#cbd5e1; margin-bottom:14px;">Select rider or Mall Road walking runner to assign order with audit trail:</p>
          <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
            ${availableRiders.map(r => `
              <label style="display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.04); padding:10px 14px; border-radius:10px; cursor:pointer;">
                <input type="radio" name="dispatchRiderChoice" value="${r.id}" checked>
                <div style="flex-grow:1;">
                  <strong>${r.name}</strong> (${r.vehicle})
                  <div style="font-size:11px; color:#94a3b8;">Status: ${r.status} &bull; Proximity: 850m</div>
                </div>
              </label>
            `).join('')}
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-secondary" onclick="document.getElementById('manualDispatchModal').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="confirmManualDispatch('${order.id}')">Confirm Assignment & Log Audit</button>
          </div>
        </div>
      </div>
    `;
    const existing = document.getElementById('manualDispatchModal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  };

  window.confirmManualDispatch = function(orderId) {
    const selected = document.querySelector('input[name="dispatchRiderChoice"]:checked')?.value;
    const rider = (window.PahadiMockDB?.riders || []).find(r => r.id === selected);
    const order = (window.PahadiMockDB?.orders || []).find(o => o.id === orderId);

    if (order && rider) {
      order.status = 'in_transit';
      rider.status = 'in_transit';
      rider.activeOrder = order.id;

      if (window.PahadiAdminApi) {
        window.PahadiAdminApi.recordAudit('MANUAL_DISPATCH_ASSIGNMENT', 'Order', orderId, 'UNASSIGNED', rider.name, 'Admin manual override on Dispatch Console');
      }

      showToast('⚡ Order #' + orderId + ' assigned to ' + rider.name + '!');
      document.getElementById('manualDispatchModal')?.remove();
      renderDispatchConsole();
      if (typeof renderOrdersFeed === 'function') renderOrdersFeed();
      if (typeof initGodViewMap === 'function') initGodViewMap(order.town);
    }
  };

  window.renderDispatchConsole = renderDispatchConsole;
})();
