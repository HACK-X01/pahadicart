// PahadiCart Walking Runner Partner Management (Vehicle-Restricted Zones)
(function() {
  const MOCK_RUNNERS = [
    {
      id: 'run-1',
      name: 'Rohan Dogra',
      phone: '+91 98160-55441',
      town: 'solan',
      zone: 'Upper Mall Road Pedestrian Alley',
      coordinates: [30.9088, 77.0995],
      elevation: 1520,
      availability: 'ONLINE',
      rating: 4.9,
      completedJobsToday: 11,
      totalClimbMeters: 640,
      walletBalance: 825,
      status: 'ACTIVE'
    },
    {
      id: 'run-2',
      name: 'Pooja Verma',
      phone: '+91 98161-99882',
      town: 'shimla',
      zone: 'The Ridge & Lakkar Bazaar Steps',
      coordinates: [31.1052, 77.1740],
      elevation: 2210,
      availability: 'ONLINE',
      rating: 4.85,
      completedJobsToday: 8,
      totalClimbMeters: 510,
      walletBalance: 610,
      status: 'ACTIVE'
    },
    {
      id: 'run-3',
      name: 'Karam Chand',
      phone: '+91 98162-33441',
      town: 'dharamshala',
      zone: 'McLeod Ganj Temple Trail',
      coordinates: [32.2215, 76.3248],
      elevation: 1470,
      availability: 'OFFLINE',
      rating: 4.95,
      completedJobsToday: 5,
      totalClimbMeters: 380,
      walletBalance: 375,
      status: 'ACTIVE'
    }
  ];

  window.PahadiMockDB = window.PahadiMockDB || {};
  window.PahadiMockDB.runners = MOCK_RUNNERS;

  function renderRunnersView() {
    const container = document.getElementById('runnersTableBody');
    if (!container) return;

    const currentTown = document.getElementById('townSelect')?.value || 'solan';
    const list = (window.PahadiMockDB.runners || []).filter(r => currentTown === 'all' || r.town === currentTown);

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
