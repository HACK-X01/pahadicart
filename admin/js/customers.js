/**
 * PahadiCart Super Admin - Customer Management Module
 * Production-ready customer directory, masked PII, hill drop metadata, and audited actions.
 */

window.CustomerService = (function() {
  const mockCustomers = [
    {
      id: 'CUST-801',
      name: 'Ananya Sharma',
      phone: '+91 98*** 42109',
      town: 'shimla',
      townName: 'Shimla (The Ridge)',
      address: 'Flat 3B, Woodville Estate, Near Christ Church',
      elevation: 2205,
      stairCount: 42,
      landmark: 'Green gate opposite state library',
      ordersCount: 18,
      totalSpend: 14250,
      lastOrderDate: 'Today, 02:15 PM',
      status: 'ACTIVE',
      rating: 4.9,
      tags: ['VIP', 'Hill Resident']
    },
    {
      id: 'CUST-802',
      name: 'Vikram Thakur',
      phone: '+91 94*** 88312',
      town: 'solan',
      townName: 'Solan (Mall Road)',
      address: 'House 12, Pine View Colony, Rajgarh Road',
      elevation: 1550,
      stairCount: 18,
      landmark: 'Beside Mohan Park stairway',
      ordersCount: 9,
      totalSpend: 6840,
      lastOrderDate: 'Yesterday',
      status: 'ACTIVE',
      rating: 4.7,
      tags: ['Regular']
    },
    {
      id: 'CUST-803',
      name: 'Rohit Sen',
      phone: '+91 82*** 91044',
      town: 'dharamshala',
      townName: 'Dharamshala & McLeodGanj',
      address: 'Cottage 4, Upper Bhagsu Road, McLeodGanj',
      elevation: 1820,
      stairCount: 65,
      landmark: 'Narrow trail 50m past German Bakery',
      ordersCount: 23,
      totalSpend: 21900,
      lastOrderDate: '2 days ago',
      status: 'ACTIVE',
      rating: 4.8,
      tags: ['Steep Route', 'Runner Required']
    },
    {
      id: 'CUST-804',
      name: 'Pooja Verma',
      phone: '+91 70*** 11290',
      town: 'shimla',
      townName: 'Shimla (Sanjauli)',
      address: 'Navbahar Chowk, Block C-2',
      elevation: 2140,
      stairCount: 12,
      landmark: 'Near Sanjauli petrol pump',
      ordersCount: 4,
      totalSpend: 2310,
      lastOrderDate: '3 days ago',
      status: 'SUSPENDED',
      suspensionReason: 'Repeated COD doorstep refusals',
      rating: 3.2,
      tags: ['COD Risk']
    },
    {
      id: 'CUST-805',
      name: 'Dr. Rajesh Chandel',
      phone: '+91 98*** 77201',
      town: 'solan',
      townName: 'Solan (Chambaghat)',
      address: 'Orchid Villa, Mushroom City Enclave',
      elevation: 1480,
      stairCount: 6,
      landmark: 'Opposite ICAR Directorate',
      ordersCount: 31,
      totalSpend: 28400,
      lastOrderDate: 'Today, 11:30 AM',
      status: 'ACTIVE',
      rating: 5.0,
      tags: ['Priority Customer']
    }
  ];

  let currentCustomers = [...mockCustomers];
  let filterTown = 'all';
  let filterStatus = 'all';
  let searchQuery = '';

  function renderCustomersTable() {
    const container = document.getElementById('customersTableBody');
    if (!container) return;

    let filtered = currentCustomers.filter(c => {
      if (filterTown !== 'all' && c.town !== filterTown) return false;
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.phone.includes(q);
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--slate-400);">No customers match current filter criteria.</td></tr>';
      return;
    }

    container.innerHTML = filtered.map(c => (
      '<tr>' +
        '<td>' +
          '<div style="display:flex; align-items:center; gap:10px;">' +
            '<div style="width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px;">' +
              c.name.split(' ').map(n=>n[0]).join('') +
            '</div>' +
            '<div>' +
              '<div style="font-weight:700; color:#fff;">' + c.name + '</div>' +
              '<div style="font-size:11px; color:var(--slate-400); font-family:var(--font-mono);">' + c.id + '</div>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td style="font-family:var(--font-mono); font-size:12px; color:var(--sky-400);">' + c.phone + '</td>' +
        '<td>' +
          '<span style="font-size:12px; color:#e2e8f0;">' + c.townName + '</span>' +
          '<div style="font-size:11px; color:var(--slate-400); display:flex; gap:6px; align-items:center; margin-top:2px;">' +
            '<span>⛰️ ' + c.elevation + 'm</span><span>•</span><span>🪜 ' + c.stairCount + ' steps</span>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<span style="font-weight:700; color:#fff;">' + c.ordersCount + '</span>' +
          '<span style="font-size:11px; color:var(--slate-400); display:block;">' + c.lastOrderDate + '</span>' +
        '</td>' +
        '<td style="font-weight:700; color:var(--emerald-400); font-family:var(--font-mono);">₹' + c.totalSpend.toLocaleString() + '</td>' +
        '<td><span style="color:#f59e0b; font-weight:700;">★ ' + c.rating + '</span></td>' +
        '<td><span class="badge ' + (c.status === 'ACTIVE' ? 'badge-success' : 'badge-danger') + '">' + c.status + '</span></td>' +
        '<td>' +
          '<div style="display:flex; gap:6px;">' +
            '<button class="btn btn-secondary btn-sm" onclick="window.CustomerService.openCustomerDetail(\'' + c.id + '\')" style="padding:4px 8px; font-size:11px;">View Profile</button>' +
            '<button class="btn btn-secondary btn-sm" onclick="window.CustomerService.toggleCustomerStatus(\'' + c.id + '\')" style="padding:4px 8px; font-size:11px; color:' + (c.status === 'ACTIVE' ? 'var(--rose-400)' : 'var(--emerald-400)') + ';">' + (c.status === 'ACTIVE' ? 'Suspend' : 'Activate') + '</button>' +
          '</div>' +
        '</td>' +
      '</tr>'
    )).join('');

    const countElem = document.getElementById('customerCountBadge');
    if (countElem) countElem.innerText = filtered.length + ' Customers';
  }

  function openCustomerDetail(custId) {
    const c = currentCustomers.find(x => x.id === custId);
    if (!c) return;
    const modal = document.getElementById('customerDetailModal');
    const content = document.getElementById('customerModalContent');
    if (!modal || !content) {
      alert('Customer: ' + c.name + '\nID: ' + c.id + '\nElevation: ' + c.elevation + 'm\nStairs: ' + c.stairCount + ' steps\nSpend: ₹' + c.totalSpend);
      return;
    }
    content.innerHTML = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">' +
      '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">' +
        '<h4 style="color:var(--sky-400); margin-top:0;">Customer Profile</h4>' +
        '<div style="margin-bottom:8px;"><span style="color:var(--slate-400);">Name:</span> <b>' + c.name + '</b></div>' +
        '<div style="margin-bottom:8px;"><span style="color:var(--slate-400);">ID:</span> <code style="color:#38bdf8;">' + c.id + '</code></div>' +
        '<div style="margin-bottom:8px;"><span style="color:var(--slate-400);">Phone:</span> <b>' + c.phone + '</b></div>' +
        '<div style="margin-bottom:8px;"><span style="color:var(--slate-400);">Town:</span> <b>' + c.townName + '</b></div>' +
        '<div style="margin-bottom:8px;"><span style="color:var(--slate-400);">Status:</span> <span class="badge ' + (c.status === 'ACTIVE' ? 'badge-success' : 'badge-danger') + '">' + c.status + '</span></div>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:16px;">' +
        '<h4 style="color:var(--emerald-400); margin-top:0;">Pahadi Coordinates</h4>' +
        '<div style="margin-bottom:8px;"><span style="color:var(--slate-400);">Address:</span><br><b>' + c.address + '</b></div>' +
        '<div style="display:flex; gap:16px; margin-top:12px;">' +
          '<div style="background:rgba(14,165,233,0.1); border:1px solid rgba(14,165,233,0.3); border-radius:8px; padding:10px; flex:1; text-align:center;">' +
            '<div style="font-size:11px; color:var(--sky-400);">ELEVATION</div><div style="font-size:18px; font-weight:800; color:#fff;">' + c.elevation + ' m</div>' +
          '</div>' +
          '<div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:10px; flex:1; text-align:center;">' +
            '<div style="font-size:11px; color:#f59e0b;">STAIRWAYS</div><div style="font-size:18px; font-weight:800; color:#fff;">' + c.stairCount + ' steps</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
    modal.style.display = 'flex';
  }

  function toggleCustomerStatus(custId) {
    if (window.RbacService && !window.RbacService.canPerform('CUSTOMERS', 'UPDATE')) {
      alert('Permission Denied: Only SUPER_ADMIN, OPERATIONS_ADMIN, and SUPPORT_ADMIN can modify customer status.');
      return;
    }
    const c = currentCustomers.find(x => x.id === custId);
    if (!c) return;
    const newStatus = c.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const reason = prompt('Enter reason for updating customer ' + c.name + ':', newStatus === 'SUSPENDED' ? 'Policy violation' : 'Verified');
    if (!reason) return;
    const oldStatus = c.status;
    c.status = newStatus;
    if (window.AdminApiService) {
      window.AdminApiService.createAuditLog(newStatus === 'SUSPENDED' ? 'CUSTOMER_SUSPENDED' : 'CUSTOMER_ACTIVATED', 'CUSTOMER', c.id, { status: oldStatus }, { status: newStatus, reason: reason });
    }
    renderCustomersTable();
    if (window.showToast) window.showToast('Customer ' + c.name + ' is now ' + newStatus + '.', 'info');
  }

  function init() {
    renderCustomersTable();
    const searchInput = document.getElementById('customerSearchInput');
    if (searchInput) searchInput.addEventListener('input', e => { searchQuery = e.target.value; renderCustomersTable(); });
    const townSelect = document.getElementById('customerTownFilter');
    if (townSelect) townSelect.addEventListener('change', e => { filterTown = e.target.value; renderCustomersTable(); });
    const statusSelect = document.getElementById('customerStatusFilter');
    if (statusSelect) statusSelect.addEventListener('change', e => { filterStatus = e.target.value; renderCustomersTable(); });
  }

  return { init, renderCustomersTable, openCustomerDetail, toggleCustomerStatus };
})();
