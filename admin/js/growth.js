// Growth, Colony Density Heatmap & Automated WhatsApp Marketing Desk

function renderGrowthAnalytics() {
  const heatmapContainer = document.getElementById("colonyHeatmapContainer");
  const couponContainer = document.getElementById("couponRoiContainer");
  const inactiveContainer = document.getElementById("inactiveCustomerBody");

  // 1. Colony & Ridge Density Heatmap
  if (heatmapContainer) {
    heatmapContainer.innerHTML = PahadiMockDB.colonyHeatmap.map(c => `
      <div style="background:var(--slate-900); padding:14px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-weight:700; color:var(--slate-100); font-size:13.5px;">📍 ${c.colony}</span>
          <span style="font-weight:800; color:var(--primary-400);">${c.repeatRate} Repeat Orders</span>
        </div>
        <div style="display:flex; justify-content:space-between; color:var(--slate-400); font-size:11.5px;">
          <span>Volume: <b>${c.totalOrders} orders</b> &bull; Avg SLA: <b>${c.avgEta}</b></span>
          <span style="color:var(--sky-400); font-weight:700;">Growth: ${c.growthTrend}</span>
        </div>
      </div>
    `).join('');
  }

  // 2. Coupon Burn vs ROI
  if (couponContainer) {
    couponContainer.innerHTML = PahadiMockDB.coupons.map(cp => `
      <div style="background:var(--slate-900); padding:14px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-family:var(--font-mono); font-weight:800; color:var(--amber-400); font-size:14px; background:rgba(245,158,11,0.1); padding:2px 8px; border-radius:4px;">
            ${cp.code}
          </span>
          <span style="font-weight:800; color:var(--primary-400); font-size:13.5px;">${cp.roiMultiple} ROI Multiple</span>
        </div>
        <div style="font-size:12px; color:var(--slate-300); margin-bottom:6px;">${cp.discount}</div>
        <div style="display:flex; justify-content:space-between; font-size:11.5px; color:var(--slate-400);">
          <span>Discount Burn: <b style="color:var(--rose-400);">-₹${cp.burnAmount.toLocaleString('en-IN')}</b></span>
          <span>GMV Generated: <b style="color:var(--white);">₹${cp.gmvGenerated.toLocaleString('en-IN')}</b></span>
        </div>
      </div>
    `).join('');
  }

  // 3. Inactive Customer WhatsApp Re-engagement
  if (inactiveContainer) {
    inactiveContainer.innerHTML = PahadiMockDB.inactiveCustomers.map(u => `
      <tr>
        <td>
          <div style="font-weight:700; color:var(--slate-100);">${u.name}</div>
          <div style="font-size:11px; color:var(--slate-400);">📍 ${u.town}</div>
        </td>
        <td style="font-family:var(--font-mono); font-size:12px; color:var(--slate-300);">${u.phone}</td>
        <td>
          <span style="color:var(--rose-400); font-weight:700; font-size:12px;">${u.lastOrderDays} days ago</span>
        </td>
        <td style="font-weight:700; color:var(--white);">₹${u.totalSpent.toLocaleString('en-IN')}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="sendWhatsAppReengage('${u.name}', '${u.phone}')" style="min-height:30px; font-size:11px;">
            💬 Send WhatsApp Voucher
          </button>
        </td>
      </tr>
    `).join('');
  }
}

function sendWhatsAppReengage(name, phone) {
  const msg = `Namaste ${name} ji! Solan mein mausam suhana hai 🏔️ PahadiCart par aapke liye exclusive ₹50 off voucher 'WAPAS50' active hai. Garma-garam Siddu ya Chai-Pakode mangwayein!`;
  alert(`WhatsApp API Triggered to ${phone}:\n\n"${msg}"`);
  showToast(`💬 WhatsApp Re-engagement Voucher sent to ${name}!`);
}
