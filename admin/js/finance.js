// Financial Accounting & P&L Profit Engine for PahadiCart Admin

function renderFinancialLedger() {
  const container = document.getElementById("transactionLedgerBody");
  const pnlBox = document.getElementById("executivePnlContainer");
  const townCompBox = document.getElementById("townComparisonContainer");
  const categoryBox = document.getElementById("categoryBreakdownContainer");

  const currentTown = document.getElementById("townSelect")?.value || "solan";
  const townOrders = PahadiMockDB.orders.filter(o => o.town === currentTown);

  const totalGMV = townOrders.reduce((sum, o) => sum + o.amount, 0) + 18450;
  const merchantPayouts = Math.round(totalGMV * 0.885);
  const riderPayouts = townOrders.reduce((sum, o) => sum + o.riderPayout, 0) + 1420;
  const gatewayAndSms = Math.round(totalGMV * 0.018);
  const netFounderProfit = totalGMV - merchantPayouts - (riderPayouts - townOrders.reduce((sum, o) => sum + o.deliveryFee, 0)) - gatewayAndSms;

  // 1. Executive P&L Box
  if (pnlBox) {
    pnlBox.innerHTML = `
      <div style="background:linear-gradient(135deg, rgba(6,78,59,0.4) 0%, rgba(15,23,42,0.9) 100%); border:1px solid rgba(16,185,129,0.3); border-radius:var(--radius-lg); padding:20px; box-shadow:var(--glow-emerald); margin-bottom:24px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
          <div>
            <span style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--primary-400); font-weight:700;">
              Executive Real-Time P&L Statement (Today)
            </span>
            <h3 style="font-size:22px; font-weight:800; color:var(--slate-50); margin-top:2px;">
              Net Founder Profit: <span style="color:var(--primary-400);">+₹${netFounderProfit.toLocaleString('en-IN')}</span> 
              <span style="font-size:13px; font-weight:600; color:var(--primary-300); background:rgba(16,185,129,0.15); padding:2px 8px; border-radius:999px; margin-left:6px;">
                ${((netFounderProfit / totalGMV) * 100).toFixed(1)}% Net Margin
              </span>
            </h3>
          </div>
          <button class="btn btn-primary" onclick="exportTransactionsCSV()">
            📥 Export Report (CSV / Excel)
          </button>
        </div>

        <!-- Rupee Flow Waterfall -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; background:rgba(2,6,23,0.6); padding:16px; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.06);">
          <div>
            <div style="font-size:11px; color:var(--slate-400); font-weight:600;">1. Total Customer Cash (GMV)</div>
            <div style="font-size:17px; font-weight:800; color:var(--white);">₹${totalGMV.toLocaleString('en-IN')}</div>
            <div style="font-size:10.5px; color:var(--slate-400);">100% Cash Flow</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--slate-400); font-weight:600;">2. Paid to Local Merchants</div>
            <div style="font-size:17px; font-weight:800; color:var(--slate-200);">-₹${merchantPayouts.toLocaleString('en-IN')}</div>
            <div style="font-size:10.5px; color:var(--slate-400);">~88.5% of product sales</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--slate-400); font-weight:600;">3. Paid to Pahadi Riders</div>
            <div style="font-size:17px; font-weight:800; color:var(--sky-300);">-₹${riderPayouts.toLocaleString('en-IN')}</div>
            <div style="font-size:10.5px; color:var(--slate-400);">Funded by delivery fees</div>
          </div>
          <div>
            <div style="font-size:11px; color:var(--slate-400); font-weight:600;">4. Gateway & SMS Cost</div>
            <div style="font-size:17px; font-weight:800; color:var(--rose-400);">-₹${gatewayAndSms.toLocaleString('en-IN')}</div>
            <div style="font-size:10.5px; color:var(--slate-400);">1.8% UPI / SMS infra</div>
          </div>
          <div style="background:rgba(16,185,129,0.12); padding:8px 12px; border-radius:6px; border:1px solid rgba(16,185,129,0.3);">
            <div style="font-size:11px; color:var(--primary-300); font-weight:700;">5. YOUR NET PROFIT</div>
            <div style="font-size:19px; font-weight:900; color:var(--primary-400);">+₹${netFounderProfit.toLocaleString('en-IN')}</div>
            <div style="font-size:10.5px; color:var(--primary-200);">Direct Founder Cashflow</div>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Transaction Audit Ledger Table
  if (container) {
    container.innerHTML = townOrders.map(o => `
      <tr>
        <td>
          <div style="font-family:var(--font-mono); font-weight:700; color:var(--slate-100);">${o.id}</div>
          <div style="font-size:10.5px; color:var(--slate-500);">${o.time}</div>
        </td>
        <td>
          <div style="font-weight:600; color:var(--slate-200);">${o.merchantName}</div>
          <div style="font-size:11px; color:var(--slate-400);">Customer: ${o.customerName}</div>
        </td>
        <td style="font-weight:700; color:var(--white);">
          ₹${o.total}
          <div style="font-size:10.5px; font-weight:normal; color:var(--slate-400);">${o.paymentMode}</div>
        </td>
        <td style="color:var(--slate-300);">
          ₹${o.merchantPayout.toFixed(2)}
          <div style="font-size:10.5px; color:var(--slate-500);">(Net of Comm)</div>
        </td>
        <td style="color:var(--sky-400);">
          ₹${o.riderPayout}
          <div style="font-size:10.5px; color:var(--slate-500);">Base + Hill</div>
        </td>
        <td style="color:var(--slate-400);">
          ₹${o.gatewayFee.toFixed(2)}
        </td>
        <td style="font-weight:800; color:var(--primary-400); font-size:14px; background:rgba(16,185,129,0.06);">
          +₹${o.netProfit.toFixed(2)}
        </td>
        <td>
          <span class="status-badge ${o.status === 'delivered' ? 'status-delivered' : 'status-in_transit'}" style="font-size:10px;">
            ${o.status.toUpperCase()}
          </span>
        </td>
      </tr>
    `).join('');
  }

  // 3. Town Comparison Container
  if (townCompBox) {
    townCompBox.innerHTML = `
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">Himachal Town Performance Comparison</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px; font-size:12.5px;">
          ${PahadiMockDB.towns.map(t => `
            <div style="background:var(--slate-900); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-weight:700; color:var(--slate-100);">${t.name}</span>
                <span style="color:var(--primary-400); font-weight:800;">₹${t.todayGMV.toLocaleString('en-IN')} GMV</span>
              </div>
              <div style="display:flex; justify-content:space-between; color:var(--slate-400); font-size:11.5px;">
                <span>Orders: <b>${t.todayOrders}</b> &bull; Altitude: <b>${t.elevation}</b></span>
                <span style="color:var(--primary-300);">Net Profit: <b>+₹${t.todayProfit}</b></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 4. Category Revenue Distribution
  if (categoryBox) {
    categoryBox.innerHTML = `
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">Category Revenue Distribution</div>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${PahadiMockDB.categoryShare.map(c => `
            <div>
              <div style="display:flex; justify-content:space-between; font-size:12.5px; font-weight:600; color:var(--slate-200); margin-bottom:4px;">
                <span>${c.name} (Avg Comm: ${c.avgComm})</span>
                <span>₹${c.gmv.toLocaleString('en-IN')} (${c.percent}%)</span>
              </div>
              <div style="background:var(--slate-900); height:8px; border-radius:4px; overflow:hidden;">
                <div style="width:${c.percent}%; height:100%; background:linear-gradient(90deg, var(--primary-600), var(--primary-400)); border-radius:4px;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

// Function to generate and trigger instant CSV download
function exportTransactionsCSV() {
  const currentTown = document.getElementById("townSelect")?.value || "solan";
  const townOrders = PahadiMockDB.orders.filter(o => o.town === currentTown);

  let csvRows = [];
  csvRows.push(["Order ID", "Time", "Town", "Merchant", "Customer", "Customer Total (INR)", "Merchant Net Payout (INR)", "Rider Payout (INR)", "Gateway Fee (INR)", "Founder Net Profit (INR)", "Status"]);

  townOrders.forEach(o => {
    csvRows.push([
      o.id,
      o.time,
      o.town,
      '"' + o.merchantName + '"',
      '"' + o.customerName + '"',
      o.total,
      o.merchantPayout.toFixed(2),
      o.riderPayout,
      o.gatewayFee.toFixed(2),
      o.netProfit.toFixed(2),
      o.status
    ]);
  });

  const csvString = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvString);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute("download", "PahadiCart_" + currentTown + "_Ledger_" + dateStr + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("📊 Financial Ledger CSV downloaded successfully!");
}
