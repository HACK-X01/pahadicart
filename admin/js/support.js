// Customer Support, Instant Wallet Refund & Proof of Delivery (POD) Desk

function renderSupportDesk() {
  const container = document.getElementById("supportTicketsBody");
  if (!container) return;

  const tickets = PahadiMockDB.supportTickets;

  container.innerHTML = tickets.map(t => {
    const isOpen = t.status === 'open';

    return `
      <tr>
        <td>
          <div style="font-family:var(--font-mono); font-weight:700; color:var(--slate-100);">${t.id}</div>
          <div style="font-size:11px; color:var(--slate-400);">${t.createdTime}</div>
        </td>
        <td>
          <div style="font-weight:700; color:var(--slate-200);">${t.customerName}</div>
          <div style="font-size:11px; color:var(--slate-400);">📱 ${t.customerPhone}</div>
        </td>
        <td>
          <span style="font-family:var(--font-mono); font-size:12px; color:var(--sky-400); font-weight:600;">${t.orderId}</span>
          <button class="btn btn-sm btn-secondary" onclick="viewOrderPodPhoto('${t.orderId}')" style="padding:2px 6px; font-size:10px; min-height:22px; margin-left:4px;">View POD</button>
        </td>
        <td>
          <div style="font-weight:600; color:var(--amber-400); font-size:12.5px;">${t.issueType}</div>
          <div style="font-size:11.5px; color:var(--slate-300); margin-top:2px;">${t.description}</div>
        </td>
        <td style="font-weight:800; color:var(--white); font-size:14px;">
          ₹${t.refundAmount}
        </td>
        <td>
          <span class="status-badge ${isOpen ? 'status-placed' : 'status-delivered'}" style="font-size:10px;">
            ${t.status.toUpperCase()}
          </span>
        </td>
        <td>
          ${isOpen ? `
            <button class="btn btn-sm btn-primary" onclick="issueInstantRefund('${t.id}', ${t.refundAmount})" style="min-height:30px; font-size:11px;">
              ⚡ 1-Click Refund
            </button>
          ` : `
            <span style="color:var(--primary-400); font-weight:600; font-size:11.5px;">✓ Refunded to Wallet</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

function issueInstantRefund(ticketId, amount) {
  const t = PahadiMockDB.supportTickets.find(x => x.id === ticketId);
  if (!t) return;

  t.status = "refunded";
  showToast(`⚡ Instant Refund of ₹${amount} credited to ${t.customerName}'s in-app wallet!`);
  renderSupportDesk();
}

function viewOrderPodPhoto(orderId) {
  const order = PahadiMockDB.orders.find(o => o.id === orderId) || PahadiMockDB.orders[0];
  const photoUrl = order.podPhoto || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";

  document.getElementById("modalPodOrderId").textContent = order.id;
  document.getElementById("modalPodAddress").textContent = order.deliveryAddress;
  document.getElementById("modalPodImg").src = photoUrl;

  const modal = document.getElementById("podPhotoModal");
  if (modal) modal.classList.add("open");
}

function closePodModal() {
  const modal = document.getElementById("podPhotoModal");
  if (modal) modal.classList.remove("open");
}
