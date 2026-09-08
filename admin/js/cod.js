// PahadiCart Cash On Delivery (COD) Reconciliation & Float Locker
(function() {
  const MOCK_COD_RECORDS = [
    {
      orderId: 'PC-8924',
      riderName: 'Vikas Thakur',
      riderId: 'r-1',
      town: 'solan',
      orderAmount: 520,
      cashCollected: 520,
      cashSubmitted: 0,
      mismatch: 0,
      status: 'COLLECTED',
      timestamp: 'Today 12:40 PM',
      riskScore: 'LOW'
    },
    {
      orderId: 'PC-8921',
      riderName: 'Sunil Kumar',
      riderId: 'r-2',
      town: 'shimla',
      orderAmount: 640,
      cashCollected: 640,
      cashSubmitted: 640,
      mismatch: 0,
      status: 'RECONCILED',
      timestamp: 'Today 11:15 AM',
      riskScore: 'CLEAN'
    },
    {
      orderId: 'PC-8890',
      riderName: 'Pankaj Negi',
      riderId: 'r-4',
      town: 'solan',
      orderAmount: 480,
      cashCollected: 450,
      cashSubmitted: 450,
      mismatch: -30,
      status: 'MISMATCH',
      timestamp: 'Yesterday 06:20 PM',
      riskScore: 'FLAGGED'
    }
  ];

  function renderCodReconciliation() {
    const container = document.getElementById('codTableBody');
    if (!container) return;

    container.innerHTML = MOCK_COD_RECORDS.map(c => `
      <tr>
        <td><strong>#${c.orderId}</strong></td>
        <td>${c.riderName}</td>
        <td>₹${c.orderAmount}</td>
        <td><strong style="color:#10b981;">₹${c.cashCollected}</strong></td>
        <td>₹${c.cashSubmitted}</td>
        <td>
          <span style="font-weight:800; color:${c.mismatch === 0 ? 'var(--primary-400)' : 'var(--rose-400)'};">
            ${c.mismatch === 0 ? '₹0.00' : '-₹' + Math.abs(c.mismatch) + ' MISMATCH'}
          </span>
        </td>
        <td>
          <span class="status-badge ${c.status === 'RECONCILED' ? 'status-delivered' : (c.status === 'MISMATCH' ? 'status-cancelled' : 'status-preparing')}">
            ${c.status}
          </span>
        </td>
        <td>
          ${c.status === 'MISMATCH' ? `
            <button class="btn btn-sm btn-primary" onclick="investigateCodMismatch('${c.orderId}')" style="background:#dc2626; border:none; font-size:11px; padding:4px 8px;">Investigate</button>
          ` : `
            <span style="font-size:11px; color:var(--slate-400);">Audit Clean</span>
          `}
        </td>
      </tr>
    `).join('');
  }

  window.investigateCodMismatch = function(orderId) {
    const reason = prompt('COD Cash Mismatch Investigation for #' + orderId + ':\nEnter resolution note (e.g. Customer change shortage waived / Rider salary deducted):');
    if (reason) {
      if (window.PahadiAdminApi) {
        window.PahadiAdminApi.recordAudit('COD_MISMATCH_RESOLVED', 'CODRecord', orderId, 'MISMATCH (-₹30)', 'RECONCILED', reason);
      }
      showToast('✓ COD Mismatch resolved and logged into Financial Audit Trail.');
      const item = MOCK_COD_RECORDS.find(c => c.orderId === orderId);
      if (item) item.status = 'RECONCILED';
      renderCodReconciliation();
    }
  };

  window.renderCodReconciliation = renderCodReconciliation;
})();
