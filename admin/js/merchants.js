// Merchant Management & Vyapar Mandal Commission Desk (Admin Control Center Enhanced)
let activeEditingMerchantId = null;

// Hydrate merchants from localStorage if available (demo data purged)
(function initMerchantPersistence() {
  try {
    const saved = localStorage.getItem('pahadicart_merchants');
    if (saved && window.PahadiMockDB) {
      const parsed = JSON.parse(saved);
      // Filter out legacy mock demo shops (m1..m5)
      const realMerchants = parsed.filter(function(m) {
        return m.id && !['m1', 'm2', 'm3', 'm4', 'm5'].includes(m.id);
      });
      window.PahadiMockDB.merchants = realMerchants;
      localStorage.setItem('pahadicart_merchants', JSON.stringify(realMerchants));
    } else if (window.PahadiMockDB) {
      window.PahadiMockDB.merchants = [];
    }
  } catch (e) {
    console.error('Error hydrating merchants:', e);
  }
})();

function saveMerchantsToStorage() {
  try {
    if (window.PahadiMockDB && window.PahadiMockDB.merchants) {
      localStorage.setItem('pahadicart_merchants', JSON.stringify(window.PahadiMockDB.merchants));
      if (window.pahadiBus) {
        window.pahadiBus.emit('MERCHANT_STATUS_CHANGED', { merchants: window.PahadiMockDB.merchants });
      }
    }
  } catch (e) {
    console.error('Error saving merchants:', e);
  }
}

function renderMerchantsTable() {
  const tbody = document.getElementById("merchantsTableBody");
  if (!tbody) return;

  const currentTown = document.getElementById("townSelect") ? document.getElementById("townSelect").value : "solan";
  const merchants = (PahadiMockDB.merchants || []).filter(function(m) {
    return m.town === currentTown || currentTown === 'all';
  });

  const countBadge = document.getElementById("merchantsCountBadge");
  if (countBadge) countBadge.textContent = merchants.length + " Registered";

  // Update Onboarding Applications Queue
  const pendingMerchants = merchants.filter(function(m) { return m.status === 'pending'; });
  const onboardingBadge = document.getElementById("merchantOnboardingBadge");
  const onboardingList = document.getElementById("merchantOnboardingList");

  if (onboardingBadge) {
    onboardingBadge.textContent = pendingMerchants.length + " Pending KYC";
    onboardingBadge.className = pendingMerchants.length > 0 ? "status-badge status-placed" : "status-badge status-secondary";
  }

  if (onboardingList) {
    if (pendingMerchants.length === 0) {
      onboardingList.innerHTML = '<div style="text-align:center; padding:32px 16px; color:var(--slate-400); background:var(--slate-900); border-radius:10px; border:1px solid rgba(255,255,255,0.05);">' +
        '<div style="font-size:26px; margin-bottom:6px;">📋</div>' +
        '<div style="font-weight:700; color:var(--slate-200); font-size:13.5px;">No Pending KYC Applications</div>' +
        '<div style="font-size:11.5px; color:var(--slate-400); margin-top:4px;">Nayi dukano ke onboarding verification aur KYC requests yaha dikhenge.</div>' +
      '</div>';
    } else {
      onboardingList.innerHTML = pendingMerchants.map(function(m) {
        return '<div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--slate-900); border-radius:10px; border:1px solid rgba(255,255,255,0.05);">' +
          '<div>' +
            '<strong style="color:var(--slate-100);">' + m.name + '</strong>' +
            '<div style="font-size:11px; color:var(--slate-400);">' + (m.town || 'Solan') + ' &bull; Owner: ' + (m.owner || 'Proprietor') + '</div>' +
            '<div style="font-size:10.5px; color:var(--amber-400);">⏳ KYC Documents Under Review</div>' +
          '</div>' +
          '<button class="btn btn-sm btn-primary" onclick="setShopApprovalStatus(\'' + m.id + '\', \'approved\')">Approve Store</button>' +
        '</div>';
      }).join('');
    }
  }

  // Update Batch Settlement Desk
  let totalNetPayable = 0;
  let totalPlatformCut = 0;
  merchants.forEach(function(m) {
    totalNetPayable += (m.pendingPayout || 0);
    totalPlatformCut += (m.platformCutEarned || 0);
  });
  const tcs1Pct = Math.round(totalNetPayable * 0.01);

  const netPayableEl = document.getElementById("dailyNetPayable");
  const commEl = document.getElementById("dailyCommissionDeducted");
  const tcsEl = document.getElementById("dailyTcsDeducted");
  const batchBtn = document.getElementById("btnBatchPayout");
  const batchBadge = document.getElementById("merchantPayoutBatchBadge");

  if (netPayableEl) netPayableEl.textContent = "₹" + totalNetPayable.toLocaleString('en-IN');
  if (commEl) commEl.textContent = "₹" + totalPlatformCut.toLocaleString('en-IN');
  if (tcsEl) tcsEl.textContent = "₹" + tcs1Pct.toLocaleString('en-IN');

  if (batchBadge) {
    batchBadge.textContent = totalNetPayable > 0 ? "Pending ₹" + totalNetPayable.toLocaleString('en-IN') : "No Pending Payouts";
    batchBadge.className = totalNetPayable > 0 ? "status-badge status-placed" : "status-badge status-secondary";
  }

  if (batchBtn) {
    if (totalNetPayable > 0) {
      batchBtn.disabled = false;
      batchBtn.style.opacity = "1";
      batchBtn.style.cursor = "pointer";
      batchBtn.className = "btn btn-primary";
      batchBtn.textContent = "🚀 Release IMPS Batch Payout (₹" + totalNetPayable.toLocaleString('en-IN') + ")";
    } else {
      batchBtn.disabled = true;
      batchBtn.style.opacity = "0.65";
      batchBtn.style.cursor = "not-allowed";
      batchBtn.className = "btn btn-secondary";
      batchBtn.textContent = "No Pending Batch Payouts";
    }
  }

  if (merchants.length === 0) {
    tbody.innerHTML = '<tr>' +
      '<td colspan="8" style="text-align:center; padding:40px 16px; color:var(--slate-400);">' +
        '<div style="font-size:32px; margin-bottom:8px;">🏪</div>' +
        '<div style="font-weight:700; color:#fff; font-size:14px;">Abhi koi dukan registered nahi hai</div>' +
        '<div style="font-size:12px; color:var(--slate-400); margin-top:4px;">Demo data band kar diya gaya hai. Upar "+ Add / Register New Shop" button se apni asli dukan jodein.</div>' +
      '</td>' +
    '</tr>';
    return;
  }

  tbody.innerHTML = merchants.map(function(m) {
    const isOpen = m.isOpen !== false;
    const isApproved = m.status === 'approved';
    const isRejected = m.status === 'rejected';

    return '<tr>' +
      '<td>' +
        '<div style="display:flex; align-items:center; gap:8px;">' +
          '<span style="font-size:18px;">' + (m.image || '🏪') + '</span>' +
          '<div>' +
            '<div style="font-weight:700; color:var(--slate-100); font-size:13.5px;">' + m.name + '</div>' +
            '<div style="font-size:11px; color:var(--slate-400);">👤 ' + (m.owner || 'Proprietor') + ' &bull; ' + (m.phone || 'N/A') + '</div>' +
            '<div style="font-size:10.5px; color:var(--slate-500); margin-top:2px;">🏦 ' + (m.bankAccount || 'Not Provided') + '</div>' +
            (m.gstin ? '<div style="font-size:10px; color:var(--primary-300); margin-top:2px;">GSTIN: ' + m.gstin + '</div>' : '') +
          '</div>' +
        '</div>' +
      '</td>' +
      '<td>' +
        '<span style="background:var(--slate-800); border:var(--glass-border); padding:3px 8px; border-radius:6px; font-size:11.5px; font-weight:600;">' +
          (m.category || 'General') +
        '</span>' +
        '<div style="margin-top:6px;">' +
          '<button class="btn btn-sm ' + (isOpen ? 'btn-success' : 'btn-secondary') + '" onclick="toggleShopOpenClose(\'' + m.id + '\')" style="padding:2px 8px; font-size:10px; min-height:22px; border-radius:12px;">' +
            (isOpen ? '🟢 Open Now' : '🔴 Closed') +
          '</button>' +
        '</div>' +
      '</td>' +
      '<td>' +
        '<div style="display:flex; align-items:center; gap:6px;">' +
          '<span style="font-weight:800; color:var(--primary-400); font-size:14px;">' + (m.commissionRate || 8) + '%</span>' +
          '<button class="btn btn-sm btn-secondary" onclick="openCommissionModal(\'' + m.id + '\')" title="Edit Rate" style="padding:2px 6px; min-height:24px; font-size:10px;">Edit</button>' +
        '</div>' +
        '<div style="font-size:10.5px; color:var(--slate-500);">Platform Cut</div>' +
      '</td>' +
      '<td>' +
        '<div style="font-weight:700; color:var(--slate-100);">₹' + (m.todaySales || 0).toLocaleString('en-IN') + '</div>' +
        '<div style="font-size:11px; color:var(--slate-500);">' + (m.todayOrders || 0) + ' orders today</div>' +
      '</td>' +
      '<td>' +
        '<div style="font-weight:700; color:var(--amber-400);">₹' + (m.pendingPayout || 0).toLocaleString('en-IN') + '</div>' +
        '<div style="font-size:10.5px; color:var(--slate-400);">Earned: ₹' + (m.platformCutEarned || 0) + '</div>' +
      '</td>' +
      '<td>' +
        (isApproved 
          ? '<span class="status-badge status-delivered" style="font-size:10.5px;">Approved</span>' 
          : isRejected 
            ? '<span class="status-badge status-danger" style="font-size:10.5px; background:rgba(239,68,68,0.2); color:#ef4444;">Rejected</span>' 
            : '<span class="status-badge status-preparing" style="font-size:10.5px;">Pending Approval</span>') +
        '<div style="margin-top:4px;"><button class="btn btn-sm btn-secondary" onclick="downloadTcsCertificate(\'' + (m.name || '').replace(/'/g, "") + '\')" style="padding:2px 6px; font-size:10px; min-height:22px;">1% TCS Certificate</button></div>' +
      '</td>' +
      '<td>' +
        '<div style="display:flex; flex-direction:column; gap:4px;">' +
          '<div style="display:flex; gap:4px;">' +
            (isApproved 
              ? '<button class="btn btn-sm btn-danger" onclick="setShopApprovalStatus(\'' + m.id + '\', \'rejected\')" style="min-height:26px; padding:2px 8px; font-size:11px;">Reject</button>'
              : '<button class="btn btn-sm btn-primary" onclick="setShopApprovalStatus(\'' + m.id + '\', \'approved\')" style="min-height:26px; padding:2px 8px; font-size:11px;">Approve</button>') +
            '<button class="btn btn-sm btn-secondary" onclick="openEditShopModal(\'' + m.id + '\')" style="min-height:26px; padding:2px 8px; font-size:11px;" title="Edit Shop Details">✏️ Edit</button>' +
          '</div>' +
          (m.pendingPayout > 0 ? '<button class="btn btn-sm btn-secondary" onclick="payoutSingleMerchant(\'' + m.id + '\')" style="min-height:24px; padding:2px 6px; font-size:10px;" title="Send UPI Bank Payout">💸 Pay ₹' + m.pendingPayout + '</button>' : '') +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');
}

function toggleShopOpenClose(merchantId) {
  const merchant = PahadiMockDB.merchants.find(function(m) { return m.id === merchantId; });
  if (!merchant) return;
  merchant.isOpen = merchant.isOpen === false ? true : false;
  saveMerchantsToStorage();
  renderMerchantsTable();
  if (window.showToast) window.showToast(merchant.name + ' is now ' + (merchant.isOpen ? 'OPEN' : 'CLOSED'));
}

function setShopApprovalStatus(merchantId, newStatus) {
  const merchant = PahadiMockDB.merchants.find(function(m) { return m.id === merchantId; });
  if (!merchant) return;
  merchant.status = newStatus;
  saveMerchantsToStorage();
  renderMerchantsTable();
  if (window.showToast) window.showToast(merchant.name + ' marked as ' + newStatus.toUpperCase());
  if (typeof initGodViewMap === 'function') {
    initGodViewMap(document.getElementById("townSelect") ? document.getElementById("townSelect").value : "solan");
  }
}

function downloadTcsCertificate(merchantName) {
  alert('Generating Official 1% TCS Deduction Certificate (Form 27D) for ' + merchantName + ' for Vyapar Mandal tax filing.');
  if (window.showToast) window.showToast('✓ 1% TCS Certificate downloaded for ' + merchantName);
}

function payoutSingleMerchant(merchantId) {
  const m = PahadiMockDB.merchants.find(function(x) { return x.id === merchantId; });
  if (!m) return;
  alert('Initiating automated RazorpayX UPI Bank Transfer of ₹' + (m.pendingPayout || 0).toLocaleString('en-IN') + ' to ' + m.name + ' (' + m.bankAccount + ')');
  if (window.showToast) window.showToast('Payout sent to ' + m.name + '!');
  m.pendingPayout = 0;
  saveMerchantsToStorage();
  renderMerchantsTable();
}

function openCommissionModal(merchantId) {
  activeEditingMerchantId = merchantId;
  const merchant = PahadiMockDB.merchants.find(function(m) { return m.id === merchantId; });
  if (!merchant) return;

  const modalName = document.getElementById("modalShopName");
  const modalCat = document.getElementById("modalCategory");
  const commInput = document.getElementById("commissionInput");
  if (modalName) modalName.textContent = merchant.name;
  if (modalCat) modalCat.textContent = merchant.category;
  if (commInput) commInput.value = merchant.commissionRate || 8;
  
  const modal = document.getElementById("commissionModal");
  if (modal) modal.classList.add("open");
}

function closeCommissionModal() {
  const modal = document.getElementById("commissionModal");
  if (modal) modal.classList.remove("open");
  activeEditingMerchantId = null;
}

function saveCommissionRate() {
  if (!activeEditingMerchantId) return;
  const newRate = parseFloat(document.getElementById("commissionInput").value);
  if (isNaN(newRate) || newRate < 1 || newRate > 50) {
    alert("Please enter a realistic commission between 1% and 50%");
    return;
  }

  const merchant = PahadiMockDB.merchants.find(function(m) { return m.id === activeEditingMerchantId; });
  if (merchant) {
    merchant.commissionRate = newRate;
    saveMerchantsToStorage();
    if (window.showToast) window.showToast("Commission for " + merchant.name + " updated to " + newRate + "%!");
    renderMerchantsTable();
  }
  closeCommissionModal();
}

function toggleMerchantStatus(merchantId) {
  const merchant = PahadiMockDB.merchants.find(function(m) { return m.id === merchantId; });
  if (!merchant) return;

  merchant.status = merchant.status === 'approved' ? 'suspended' : 'approved';
  saveMerchantsToStorage();
  if (window.showToast) window.showToast(merchant.name + " is now " + merchant.status.toUpperCase() + "!");
  renderMerchantsTable();
  if (typeof initGodViewMap === 'function') {
    initGodViewMap(document.getElementById("townSelect") ? document.getElementById("townSelect").value : "solan");
  }
}

// --- Shop Details Edit Modal ---
function openEditShopModal(merchantId) {
  let modal = document.getElementById('adminShopModal');
  if (!modal) {
    createShopModalDOM();
    modal = document.getElementById('adminShopModal');
  }

  const titleEl = document.getElementById('adminShopModalTitle');
  const idEl = document.getElementById('adminShopId');
  const nameEl = document.getElementById('adminShopName');
  const ownerEl = document.getElementById('adminShopOwner');
  const phoneEl = document.getElementById('adminShopPhone');
  const catEl = document.getElementById('adminShopCategory');
  const townEl = document.getElementById('adminShopTown');
  const commEl = document.getElementById('adminShopCommission');
  const openEl = document.getElementById('adminShopIsOpen');
  const statusEl = document.getElementById('adminShopStatus');

  if (merchantId) {
    const m = PahadiMockDB.merchants.find(function(x) { return x.id === merchantId; });
    if (!m) return;
    titleEl.innerText = '✏️ Edit Shop: ' + m.name;
    idEl.value = m.id;
    nameEl.value = m.name || '';
    ownerEl.value = m.owner || '';
    phoneEl.value = m.phone || '';
    catEl.value = m.category || 'Bakery & Sweets';
    townEl.value = m.town || 'solan';
    commEl.value = m.commissionRate || 8;
    openEl.checked = m.isOpen !== false;
    statusEl.value = m.status || 'approved';
  } else {
    titleEl.innerText = '➕ Nayi Dukan / Vyapar Mandal Store Jodein';
    idEl.value = '';
    nameEl.value = '';
    ownerEl.value = '';
    phoneEl.value = '';
    catEl.value = 'Bakery & Sweets';
    townEl.value = document.getElementById('townSelect') ? document.getElementById('townSelect').value : 'solan';
    commEl.value = 8;
    openEl.checked = true;
    statusEl.value = 'approved';
  }

  modal.style.display = 'flex';
}

function closeEditShopModal() {
  const modal = document.getElementById('adminShopModal');
  if (modal) modal.style.display = 'none';
}

function saveShopForm() {
  const id = document.getElementById('adminShopId').value;
  const name = document.getElementById('adminShopName').value.trim();
  const owner = document.getElementById('adminShopOwner').value.trim();
  const phone = document.getElementById('adminShopPhone').value.trim();
  const category = document.getElementById('adminShopCategory').value;
  const town = document.getElementById('adminShopTown').value;
  const commissionRate = parseFloat(document.getElementById('adminShopCommission').value) || 8;
  const isOpen = document.getElementById('adminShopIsOpen').checked;
  const status = document.getElementById('adminShopStatus').value;

  if (!name) {
    alert('Kripya dukan ka naam dalein.');
    return;
  }

  if (id) {
    // Edit existing
    const m = PahadiMockDB.merchants.find(function(x) { return x.id === id; });
    if (m) {
      m.name = name;
      m.owner = owner;
      m.phone = phone;
      m.category = category;
      m.town = town;
      m.commissionRate = commissionRate;
      m.isOpen = isOpen;
      m.status = status;
      if (window.showToast) window.showToast('Shop "' + name + '" details updated!');
    }
  } else {
    // Add new
    const newId = 'm_' + Date.now();
    const newShop = {
      id: newId,
      name: name,
      owner: owner,
      phone: phone,
      category: category,
      town: town,
      commissionRate: commissionRate,
      isOpen: isOpen,
      status: status,
      address: town.toUpperCase() + ' Main Bazaar',
      coords: town === 'shimla' ? [31.1048, 77.1734] : town === 'dharamshala' ? [32.2190, 76.3234] : [30.9084, 77.0999],
      vyaparMandalVerified: true,
      bankAccount: 'SBI (A/C: ****' + Math.floor(1000 + Math.random()*9000) + ')',
      todaySales: 0,
      todayOrders: 0,
      pendingPayout: 0,
      platformCutEarned: 0,
      strikeCount: 0
    };
    PahadiMockDB.merchants.push(newShop);
    if (window.showToast) window.showToast('New Shop "' + name + '" added successfully!');
  }

  saveMerchantsToStorage();
  renderMerchantsTable();
  closeEditShopModal();
}

function createShopModalDOM() {
  const modalHTML = '<div id="adminShopModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center; padding:16px;">' +
    '<div style="background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:16px; width:100%; max-width:520px; padding:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">' +
        '<h3 id="adminShopModalTitle" style="color:#fff; font-size:18px; margin:0; font-weight:800;">🏪 Edit Shop Details</h3>' +
        '<button onclick="closeEditShopModal()" style="background:none; border:none; color:#cbd5e1; font-size:22px; cursor:pointer;">&times;</button>' +
      '</div>' +
      '<input type="hidden" id="adminShopId">' +
      '<div style="margin-bottom:12px;">' +
        '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Shop / Store Name *</label>' +
        '<input type="text" id="adminShopName" placeholder="e.g. Anand Sweet Shop" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:13px;">' +
      '</div>' +
      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">' +
        '<div>' +
          '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Owner Name</label>' +
          '<input type="text" id="adminShopOwner" placeholder="e.g. Ramesh Anand" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">' +
        '</div>' +
        '<div>' +
          '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Phone Number</label>' +
          '<input type="text" id="adminShopPhone" placeholder="+91 98160 12345" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">' +
        '</div>' +
      '</div>' +
      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">' +
        '<div>' +
          '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Category</label>' +
          '<select id="adminShopCategory" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">' +
            '<option value="Bakery & Sweets">Bakery & Sweets</option>' +
            '<option value="Fresh Produce">Fresh Produce</option>' +
            '<option value="Kirana & Daily Essentials">Kirana & Daily Essentials</option>' +
            '<option value="Restaurants">Restaurants</option>' +
            '<option value="Specialty Tea">Specialty Tea</option>' +
            '<option value="Health & Wellness">Health & Wellness</option>' +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Town</label>' +
          '<select id="adminShopTown" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">' +
            '<option value="solan">Solan</option>' +
            '<option value="shimla">Shimla</option>' +
            '<option value="dharamshala">Dharamshala</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">' +
        '<div>' +
          '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Commission Percentage (%)</label>' +
          '<input type="number" id="adminShopCommission" value="8" min="1" max="50" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#10b981; font-weight:700; padding:8px 10px; border-radius:6px; font-size:13px;">' +
        '</div>' +
        '<div>' +
          '<label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Approval Status</label>' +
          '<select id="adminShopStatus" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">' +
            '<option value="approved">✅ Approved</option>' +
            '<option value="pending">⏳ Pending Approval</option>' +
            '<option value="rejected">❌ Rejected</option>' +
            '<option value="suspended">⚠️ Suspended</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div style="margin-bottom:20px; background:#1e293b; padding:10px 14px; border-radius:8px;">' +
        '<label style="display:flex; align-items:center; gap:8px; cursor:pointer;">' +
          '<input type="checkbox" id="adminShopIsOpen" style="accent-color:#10b981; transform:scale(1.2);">' +
          '<span style="color:#fff; font-size:12.5px; font-weight:600;">Shop Currently OPEN for Receiving Orders</span>' +
        '</label>' +
      '</div>' +
      '<div style="display:flex; justify-content:flex-end; gap:10px;">' +
        '<button type="button" onclick="closeEditShopModal()" class="btn btn-secondary">Cancel</button>' +
        '<button type="button" onclick="saveShopForm()" class="btn btn-primary" style="background:#10b981; font-weight:700;">Save Shop</button>' +
      '</div>' +
    '</div>' +
  '</div>';
  const div = document.createElement('div');
  div.innerHTML = modalHTML;
  document.body.appendChild(div.firstElementChild);
}

// Global exposure
window.renderMerchantsTable = renderMerchantsTable;
window.openCommissionModal = openCommissionModal;
window.closeCommissionModal = closeCommissionModal;
window.saveCommissionRate = saveCommissionRate;
window.toggleMerchantStatus = toggleMerchantStatus;
window.toggleShopOpenClose = toggleShopOpenClose;
window.setShopApprovalStatus = setShopApprovalStatus;
window.openEditShopModal = openEditShopModal;
window.closeEditShopModal = closeEditShopModal;
window.saveShopForm = saveShopForm;
