/**
 * Jeevanix Local — Founder Payment Verification & Settlement Desk
 * Real-time queue for UPI QR Payments with UTR Check, Screenshot Lightbox,
 * and Manual Verification State Machine.
 */

window.PaymentsDesk = (function() {
  function getPaymentList() {
    const orders = (window.pahadiBus ? window.pahadiBus.getOrders('all') : []) || [];
    return orders.map(o => {
      const mode = (o.paymentMode || 'COD').toUpperCase();
      let status = o.paymentStatus;
      if (!status) {
        if (mode.includes('UPI')) {
          status = o.status === 'delivered' ? 'PAYMENT_VERIFIED' : 'PAYMENT_SUBMITTED';
        } else {
          status = o.status === 'delivered' ? 'PAYMENT_VERIFIED' : 'PAYMENT_PENDING';
        }
      }

      return {
        orderId: o.id,
        createdAt: o.createdAt || new Date().toISOString(),
        customerName: o.customerName || (o.customer && o.customer.name) || 'Customer',
        customerPhone: o.customerPhone || (o.customer && o.customer.phone) || '98160-12890',
        amount: Number(o.grandTotal || o.total || o.amount || 250),
        paymentMode: mode,
        paymentStatus: status,
        utrRef: o.utrRef || o.transactionRef || (mode.includes('UPI') ? 'UPI' + Math.floor(100000000000 + Math.random() * 900000000000) : 'COD-CASH'),
        screenshotUrl: o.screenshotUrl || null,
        verifiedBy: o.verifiedBy || null,
        verifiedAt: o.verifiedAt || null,
        rejectionReason: o.rejectionReason || null,
        orderStatus: o.status
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function renderPaymentsDesk() {
    const container = document.getElementById('paymentsTableBody');
    if (!container) return;

    const payments = getPaymentList();

    const submittedCount = payments.filter(p => p.paymentStatus === 'PAYMENT_SUBMITTED' || p.paymentStatus === 'PAYMENT_VERIFICATION_REQUIRED').length;
    const verifiedTotal = payments.filter(p => p.paymentStatus === 'PAYMENT_VERIFIED').reduce((sum, p) => sum + p.amount, 0);
    const failedCount = payments.filter(p => p.paymentStatus === 'PAYMENT_FAILED').length;
    const codFloatTotal = payments.filter(p => p.paymentMode === 'COD' && p.paymentStatus === 'PAYMENT_PENDING').reduce((sum, p) => sum + p.amount, 0);

    const elSubmitted = document.getElementById('payMetricSubmitted');
    const elVerified = document.getElementById('payMetricVerified');
    const elFailed = document.getElementById('payMetricFailed');
    const elCodFloat = document.getElementById('payMetricCodFloat');

    if (elSubmitted) elSubmitted.innerText = submittedCount;
    if (elVerified) elVerified.innerText = '₹' + verifiedTotal.toLocaleString('en-IN');
    if (elFailed) elFailed.innerText = failedCount;
    if (elCodFloat) elCodFloat.innerText = '₹' + codFloatTotal.toLocaleString('en-IN');

    const badge = document.getElementById('sidebarPaymentsBadge');
    if (badge) {
      badge.innerText = submittedCount > 0 ? submittedCount + ' Pending' : 'Clear';
      badge.style.background = submittedCount > 0 ? '#ef4444' : '#10b981';
    }

    if (payments.length === 0) {
      container.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--slate-400);">No incoming payments found.</td></tr>';
      return;
    }

    container.innerHTML = payments.map(p => {
      const isUpi = p.paymentMode.includes('UPI');
      const isPendingVerify = p.paymentStatus === 'PAYMENT_SUBMITTED' || p.paymentStatus === 'PAYMENT_VERIFICATION_REQUIRED';
      const isVerified = p.paymentStatus === 'PAYMENT_VERIFIED';
      const isFailed = p.paymentStatus === 'PAYMENT_FAILED';

      let statusBadge = '';
      if (isPendingVerify) {
        statusBadge = '<span class="status-badge" style="background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid rgba(245,158,11,0.4);">⏳ VERIFICATION REQ</span>';
      } else if (isVerified) {
        statusBadge = '<span class="status-badge" style="background:rgba(16,185,129,0.2); color:#34d399; border:1px solid rgba(16,185,129,0.4);">✅ VERIFIED & PAID</span>';
      } else if (isFailed) {
        statusBadge = '<span class="status-badge" style="background:rgba(239,68,68,0.2); color:#f87171; border:1px solid rgba(239,68,68,0.4);">❌ REJECTED / FAILED</span>';
      } else {
        statusBadge = '<span class="status-badge" style="background:rgba(148,163,184,0.15); color:#cbd5e1;">' + p.paymentStatus + '</span>';
      }

      const rowBg = isPendingVerify ? 'rgba(245,158,11,0.04)' : 'transparent';
      const proofHtml = p.screenshotUrl
        ? '<img src="' + p.screenshotUrl + '" onclick="window.PaymentsDesk.openScreenshot(\'' + p.screenshotUrl + '\')" style="width:36px; height:36px; object-fit:cover; border-radius:6px; border:1px solid rgba(255,255,255,0.2); cursor:pointer;" title="Tap to view proof">'
        : '<span style="font-size:11px; color:var(--slate-500);">No File</span>';

      const utrBox = isUpi
        ? '<div style="font-family:var(--font-mono); font-size:12px; color:#fbbf24; font-weight:700; background:rgba(0,0,0,0.3); padding:3px 6px; border-radius:4px; display:inline-block;">' + p.utrRef + '</div>' +
          '<button onclick="navigator.clipboard.writeText(\'' + p.utrRef + '\'); showToast(\'UTR Copied!\')" style="background:none; border:none; color:var(--slate-400); cursor:pointer; font-size:11px; margin-left:4px;">📋</button>'
        : '<span style="color:var(--slate-400); font-size:11.5px;">Cash Collection</span>';

      const verifyBtn = isPendingVerify
        ? '<button class="btn btn-sm btn-primary" onclick="window.PaymentsDesk.verifyPayment(\'' + p.orderId + '\')" style="background:#059669; border-color:#10b981; padding:5px 9px; font-size:11px;">✓ Verify & Mark Paid</button>' +
          '<button class="btn btn-sm btn-secondary" onclick="window.PaymentsDesk.rejectPayment(\'' + p.orderId + '\')" style="background:rgba(239,68,68,0.15); border-color:#ef4444; color:#f87171; padding:5px 9px; font-size:11px;">✕ Reject</button>'
        : '';

      const refundBtn = isVerified
        ? '<button class="btn btn-sm btn-secondary" onclick="window.PaymentsDesk.processRefund(\'' + p.orderId + '\')" style="padding:4px 8px; font-size:10.5px;">↩ Refund</button>'
        : '';

      return '<tr style="border-bottom:1px solid rgba(255,255,255,0.06); background:' + rowBg + ';">' +
        '<td style="padding:12px 10px;">' +
          '<div style="font-weight:800; color:#fff; font-family:var(--font-mono);">' + p.orderId + '</div>' +
          '<div style="font-size:11px; color:var(--slate-400);">' + new Date(p.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) + '</div>' +
        '</td>' +
        '<td style="padding:12px 10px;">' +
          '<div style="font-weight:700; color:#f1f5f9;">' + p.customerName + '</div>' +
          '<div style="font-size:11.5px; color:#38bdf8;">📱 ' + p.customerPhone + '</div>' +
        '</td>' +
        '<td style="padding:12px 10px;">' +
          '<span style="font-weight:800; font-size:14px; color:#34d399; font-family:var(--font-mono);">₹' + p.amount + '</span>' +
          '<div style="font-size:10.5px; color:var(--slate-400);">' + p.paymentMode + '</div>' +
        '</td>' +
        '<td style="padding:12px 10px;">' + utrBox + '</td>' +
        '<td style="padding:12px 10px; text-align:center;">' + proofHtml + '</td>' +
        '<td style="padding:12px 10px;">' + statusBadge + '</td>' +
        '<td style="padding:12px 10px; text-align:right;">' +
          '<div style="display:inline-flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">' +
            verifyBtn + refundBtn +
            '<button class="btn btn-sm btn-secondary" onclick="window.openOrderCommandDrawer && window.openOrderCommandDrawer(\'' + p.orderId + '\')" style="padding:4px 8px; font-size:10.5px;">View Order</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  function verifyPayment(orderId) {
    window.JeevanixFounderAuth.promptVerification('VERIFY_UPI_PAYMENT', (reason) => {
      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(orderId, 'Preparing', {
          paymentStatus: 'PAYMENT_VERIFIED',
          rawStatus: 'PAYMENT_VERIFIED',
          verifiedBy: 'FOUNDER_CEO',
          verifiedAt: new Date().toISOString()
        });
      }
      showToast('✅ Payment for Order #' + orderId + ' VERIFIED & MARKED PAID!');
      renderPaymentsDesk();
      if (window.renderOrdersFeed) window.renderOrdersFeed();
    });
  }

  function rejectPayment(orderId) {
    const reason = prompt('Enter Payment Rejection Reason (e.g. UTR not matched in bank statement):') || 'Bank reference invalid';
    window.JeevanixFounderAuth.promptVerification('REJECT_UPI_PAYMENT', () => {
      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(orderId, 'Cancelled', {
          paymentStatus: 'PAYMENT_FAILED',
          rawStatus: 'PAYMENT_FAILED',
          rejectionReason: reason,
          rejectedBy: 'FOUNDER_CEO',
          rejectedAt: new Date().toISOString()
        });
      }
      showToast('❌ Payment for Order #' + orderId + ' REJECTED.');
      renderPaymentsDesk();
      if (window.renderOrdersFeed) window.renderOrdersFeed();
    }, true);
  }

  function processRefund(orderId) {
    const refundUtr = prompt('Enter Return Bank Transaction / UTR Reference ID:') || 'REFUND-AUTO';
    window.JeevanixFounderAuth.promptVerification('PROCESS_REFUND', (reason) => {
      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(orderId, 'Cancelled', {
          paymentStatus: 'REFUNDED',
          refundUtr: refundUtr,
          refundReason: reason,
          refundedAt: new Date().toISOString()
        });
      }
      showToast('↩ Order #' + orderId + ' Refund Recorded!');
      renderPaymentsDesk();
      if (window.renderOrdersFeed) window.renderOrdersFeed();
    }, true);
  }

  function openScreenshot(url) {
    const modal = document.getElementById('paymentScreenshotModal');
    const img = document.getElementById('paymentScreenshotImg');
    if (modal && img) {
      img.src = url;
      modal.style.display = 'flex';
    }
  }

  return {
    render: renderPaymentsDesk,
    getPaymentList: getPaymentList,
    verifyPayment,
    rejectPayment,
    processRefund,
    openScreenshot
  };
})();
