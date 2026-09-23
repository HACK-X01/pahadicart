// PahadiCart Walking Runner Partner Management (Vehicle-Restricted Zones)
(function() {
  const MOCK_RUNNERS = [];

  window.PahadiMockDB = window.PahadiMockDB || {};
  window.PahadiMockDB.runners = MOCK_RUNNERS;

  function renderRunnersView() {
    const container = document.getElementById('runnersTableBody');
    if (!container) return;

    const currentTown = document.getElementById('townSelect')?.value || 'solan';
    const list = (window.PahadiMockDB.runners || []).filter(r => currentTown === 'all' || r.town === currentTown);

    if (list.length === 0) {
      container.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:32px; color:var(--slate-400);">No walking runner partners registered yet. Clean launch state.</td></tr>';
      return;
    }
    container.innerHTML = list.map(r => `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:32px; height:32px; border-radius:50%; background:#059669; color:#fff; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:bold;">👟</div>
            <div>
              <strong style="color:#fff;">${r.name}</strong>
              <div style="font-size:11px; color:var(--slate-400);">${r.phone}</div>
            </div>
          </div>
        </td>
        <td><span style="font-size:12px; color:#38bdf8;">${r.zone}</span></td>
        <td><strong>${r.elevation} m</strong></td>
        <td>
          <span class="status-badge ${r.availability === 'ONLINE' ? 'status-delivered' : 'status-cancelled'}">
            ${r.availability}
          </span>
        </td>
        <td>⭐ ${r.rating}</td>
        <td>${r.completedJobsToday} Stair Deliveries</td>
        <td><strong style="color:var(--primary-400);">₹${r.walletBalance}</strong></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="showRunnerAuditModal('${r.id}')" style="font-size:11px; padding:4px 8px;">Relay Audit</button>
        </td>
      </tr>
    `).join('');
  }

  window.showRunnerAuditModal = function(runnerId) {
    const runner = (window.PahadiMockDB.runners || []).find(r => r.id === runnerId);
    if (!runner) return;

    alert('👟 Runner Relay Performance Audit:\n\nName: ' + runner.name + '\nZone: ' + runner.zone + '\nToday Deliveries: ' + runner.completedJobsToday + '\nAltitude Climbed: +' + runner.totalClimbMeters + 'm\nWallet Earnings: ₹' + runner.walletBalance + '\nStatus: ' + runner.status);
  };

  window.renderRunnersView = renderRunnersView;
})();
