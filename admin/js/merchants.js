// Merchant Management & Vyapar Mandal Commission Desk
let activeEditingMerchantId = null;

function renderMerchantsTable() {
  const tbody = document.getElementById("merchantsTableBody");
  if (!tbody) return;

  const currentTown = document.getElementById("townSelect")?.value || "solan";
  const merchants = PahadiMockDB.merchants.filter(m => m.town === currentTown);

  tbody.innerHTML = merchants.map(m => {
    return (
      '<tr>' +
        '<td>' +
          '<div style="font-weight:700; color:var(--slate-100); font-size:13.5px;">' + m.name + '</div>' +
          '<div style="font-size:11px; color:var(--slate-400);">👤 ' + m.owner + ' &bull; ' + m.phone + '</div>' +
          '<div style="font-size:10.5px; color:var(--slate-500); margin-top:2px;">🏦 ' + m.bankAccount + '</div>' +
          '<div style="font-size:10px; color:var(--primary-300); margin-top:2px;">GSTIN: ' + m.gstin + '</div>' +
        '</td>' +
        '<td>' +
          '<span style="background:var(--slate-800); border:var(--glass-border); padding:3px 8px; border-radius:6px; font-size:11.5px; font-weight:600;">' +
            m.category +
          '</span>' +
          (m.strikeCount > 0 ? '<div style="color:var(--amber-400); font-size:10.5px; margin-top:4px;">⚠️ ' + m.strikeCount + ' Stockout Strike</div>' : '') +
        '</td>' +
        '<td>' +
          '<div style="display:flex; align-items:center; gap:6px;">' +
            '<span style="font-weight:800; color:var(--primary-400); font-size:14px;">' + m.commissionRate + '%</span>' +
            '<button class="btn btn-sm btn-secondary" onclick="openCommissionModal(\'' + m.id + '\')" title="Edit Rate" style="padding:2px 6px; min-height:24px; font-size:10px;">Edit</button>' +
          '</div>' +
          '<div style="font-size:10.5px; color:var(--slate-500);">Platform Cut</div>' +
        '</td>' +
        '<td>' +
          '<div style="font-weight:700; color:var(--slate-100);">₹' + m.todaySales.toLocaleString('en-IN') + '</div>' +
          '<div style="font-size:11px; color:var(--slate-500);">' + m.todayOrders + ' orders today</div>' +
        '</td>' +
        '<td>' +
          '<div style="font-weight:700; color:var(--amber-400);">₹' + m.pendingPayout.toLocaleString('en-IN') + '</div>' +
          '<div style="font-size:10.5px; color:var(--slate-400);">Earned: ₹' + m.platformCutEarned + '</div>' +
        '</td>' +
        '<td>' +
          (m.vyaparMandalVerified 
            ? '<span class="status-badge status-delivered" style="font-size:10.5px;">Verified Mandal</span>' 
            : '<span class="status-badge status-preparing" style="font-size:10.5px;">KYC Pending</span>') +
          '<div style="margin-top:4px;"><button class="btn btn-sm btn-secondary" onclick="downloadTcsCertificate(\'' + m.name + '\')" style="padding:2px 6px; font-size:10px; min-height:22px;">1% TCS Certificate</button></div>' +
        '</td>' +
        '<td>' +
          '<div style="display:flex; gap:6px;">' +
            (m.status === 'approved' 
              ? '<button class="btn btn-sm btn-danger" onclick="toggleMerchantStatus(\'' + m.id + '\')" style="min-height:30px;">Suspend</button>'
              : '<button class="btn btn-sm btn-primary" onclick="toggleMerchantStatus(\'' + m.id + '\')" style="min-height:30px;">Approve</button>') +
            (m.pendingPayout > 0 ? '<button class="btn btn-sm btn-secondary" onclick="payoutSingleMerchant(\'' + m.id + '\')" style="min-height:30px;" title="Send UPI Bank Payout">Pay</button>' : '') +
          '</div>' +
        '</td>' +
      '</tr>'
    );
  }).join('');
}

function downloadTcsCertificate(merchantName) {
  alert('Generating Official 1% TCS Deduction Certificate (Form 27D) for ' + merchantName + ' for Vyapar Mandal tax filing.');
  showToast('✓ 1% TCS Certificate downloaded for ' + merchantName);
}

function payoutSingleMerchant(merchantId) {
  const m = PahadiMockDB.merchants.find(x => x.id === merchantId);
  if (!m) return;
  alert('Initiating automated RazorpayX UPI Bank Transfer of ₹' + m.pendingPayout.toLocaleString('en-IN') + ' to ' + m.name + ' (' + m.bankAccount + ')');
  showToast('Payout of ₹' + m.pendingPayout.toLocaleString('en-IN') + ' sent to ' + m.name + '!');
  m.pendingPayout = 0;
  renderMerchantsTable();
}

function openCommissionModal(merchantId) {
  activeEditingMerchantId = merchantId;
  const merchant = PahadiMockDB.merchants.find(m => m.id === merchantId);
  if (!merchant) return;

  document.getElementById("modalShopName").textContent = merchant.name;
  document.getElementById("modalCategory").textContent = merchant.category;
  document.getElementById("commissionInput").value = merchant.commissionRate;
  
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
  if (isNaN(newRate) || newRate < 1 || newRate > 30) {
    alert("Please enter a realistic commission between 1% and 30%");
    return;
  }

  const merchant = PahadiMockDB.merchants.find(m => m.id === activeEditingMerchantId);
  if (merchant) {
    merchant.commissionRate = newRate;
    showToast("Commission for " + merchant.name + " updated to " + newRate + "%!");
    renderMerchantsTable();
  }
  closeCommissionModal();
}

function toggleMerchantStatus(merchantId) {
  const merchant = PahadiMockDB.merchants.find(m => m.id === merchantId);
  if (!merchant) return;

  merchant.status = merchant.status === 'approved' ? 'suspended' : 'approved';
  showToast(merchant.name + " is now " + merchant.status.toUpperCase() + "!");
  renderMerchantsTable();
  initGodViewMap(document.getElementById("townSelect")?.value || "solan");
}
