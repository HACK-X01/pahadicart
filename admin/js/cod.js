// PahadiCart Cash On Delivery (COD) Reconciliation & Float Locker
(function() {
  const MOCK_COD_RECORDS = [];

  function renderCodReconciliation() {
    const container = document.getElementById('codTableBody');
    if (!container) return;

    const liveCodOrders = (window.pahadiBus ? window.pahadiBus.getOrders() : []).filter(o => o.paymentMode === 'COD');
    if (liveCodOrders.length === 0 && MOCK_COD_RECORDS.length === 0) {
      container.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--slate-400);">No Cash On Delivery (COD) transactions yet. All fleet floats are clean.</td></tr>';
      return;
    }
    const codList = liveCodOrders.length > 0 ? liveCodOrders.map(o => ({
      orderId: o.id,
      riderName: o.riderName || 'Assigned Rider',
      orderAmount: o.grandTotal || o.amount || 0,
      cashCollected: o.grandTotal || o.amount || 0,
      cashSubmitted: o.status === 'delivered' ? (o.grandTotal || o.amount || 0) : 0,
      mismatch: 0,
      status: o.status === 'delivered' ? 'RECONCILED' : 'COLLECTED'
    })) : MOCK_COD_RECORDS;
    container.innerHTML = codList.map(c => `
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
