// Rider COD Cash-in-Hand Defense & Hill SOS Emergency Center

function renderSafetyAndCashDesk() {
  const cashContainer = document.getElementById("riderCashLimitBody");
  const sosContainer = document.getElementById("riderSosAlertContainer");

  const currentTown = document.getElementById("townSelect")?.value || "solan";
  const riders = PahadiMockDB.riders.filter(r => r.town === currentTown);

  // 1. Emergency SOS Alert Banner
  if (sosContainer) {
    const activeSosRider = riders.find(r => r.sosActive);
    if (activeSosRider) {
      sosContainer.innerHTML = `
        <div style="background:linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(15,23,42,0.95) 100%); border:2px solid var(--rose-500); border-radius:var(--radius-lg); padding:16px 20px; box-shadow:0 0 25px rgba(244,63,94,0.3); margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="font-size:28px; animation:pulse 1s infinite;">🚨</div>
            <div>
              <div style="font-size:11px; font-weight:800; color:var(--rose-400); text-transform:uppercase; letter-spacing:1px;">
                CRITICAL HILL SOS EMERGENCY ACTIVE!
              </div>
              <div style="font-size:16px; font-weight:800; color:var(--white); margin-top:2px;">
                ${activeSosRider.name} &bull; Scooty Puncture / Breakdown on Steep Curve
              </div>
              <div style="font-size:12px; color:var(--slate-300); margin-top:2px;">
                📍 GPS Coordinates: <b>${activeSosRider.coords[0]}, ${activeSosRider.coords[1]}</b> (Near Tara Hall Ridge) &bull; Order: <b>${activeSosRider.activeOrder}</b>
              </div>
            </div>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-primary" onclick="dispatchRescueRider('${activeSosRider.id}')" style="background:var(--rose-500); border-color:var(--rose-400);">
              🛵 Dispatch Rescue Rider
            </button>
            <button class="btn btn-secondary" onclick="callRiderPrompt('${activeSosRider.name}', '${activeSosRider.phone}')">
              📞 Call Rider
            </button>
          </div>
        </div>
      `;
    } else {
      sosContainer.innerHTML = `
        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:var(--radius-lg); padding:12px 18px; margin-bottom:20px; font-size:12.5px; color:var(--primary-300); display:flex; align-items:center; gap:8px;">
          <span>✓ All ${riders.length} riders reporting safe. Zero active hill breakdowns.</span>
        </div>
      `;
    }
  }

  // 2. Rider COD Floating Cash Limit Table
  if (cashContainer) {
    cashContainer.innerHTML = riders.map(r => {
      const pct = Math.min(100, Math.round((r.cashInHand / r.maxCashLimit) * 100));
      const isLocked = r.isCashLocked || r.cashInHand >= r.maxCashLimit;

      let barColor = "var(--primary-500)";
      if (pct > 70) barColor = "var(--amber-500)";
      if (pct >= 100) barColor = "var(--rose-500)";

      return `
        <tr>
          <td>
            <div style="font-weight:700; color:var(--slate-100); font-size:13px;">${r.name}</div>
            <div style="font-size:11px; color:var(--slate-400);">${r.vehicle} &bull; Reg: ${r.vehicleNumber}</div>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-weight:800; font-size:14px; color:${isLocked ? 'var(--rose-400)' : 'var(--white)'};">
                ₹${r.cashInHand}
              </span>
              <span style="font-size:11px; color:var(--slate-500);">/ ₹${r.maxCashLimit}</span>
            </div>
            <div style="background:var(--slate-900); width:120px; height:6px; border-radius:3px; overflow:hidden; margin-top:4px;">
              <div style="width:${pct}%; height:100%; background:${barColor}; border-radius:3px;"></div>
            </div>
          </td>
          <td>
            ${isLocked ? `
              <span class="status-badge status-cancelled" style="font-size:10.5px;">
                🔒 COD Orders Locked
              </span>
            ` : `
              <span class="status-badge status-delivered" style="font-size:10.5px;">
                ✓ Active Under Limit
              </span>
            `}
          </td>
          <td>
            ${r.thermalKitIssued ? `
              <span style="color:var(--primary-400); font-size:11px; font-weight:600;">✓ Thermal Jacket Issued</span>
            ` : `
              <span style="color:var(--amber-400); font-size:11px; font-weight:600;">⚠️ Thermal Kit Pending</span>
            `}
          </td>
          <td>
            ${r.cashInHand > 0 ? `
              <button class="btn btn-sm btn-primary" onclick="settleRiderCashDeposit('${r.id}')" style="min-height:28px; font-size:11px;">
                Deposit Cash & Unlock
              </button>
            ` : `
              <span style="color:var(--slate-500); font-size:11px;">Zero Balance</span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }
}

function dispatchRescueRider(brokenRiderId) {
  const rider = PahadiMockDB.riders.find(r => r.id === brokenRiderId);
  if (!rider) return;

  rider.sosActive = false;
  alert(`Rescue Rider assigned! Aman Thakur dispatched to collect order ${rider.activeOrder} from Tara Hall curve.`);
  showToast(`Rescue Rider dispatched to rescue order ${rider.activeOrder}!`);
  renderSafetyAndCashDesk();
}

function settleRiderCashDeposit(riderId) {
  const rider = PahadiMockDB.riders.find(r => r.id === riderId);
  if (!rider) return;

  const deposited = rider.cashInHand;
  rider.cashInHand = 0;
  rider.isCashLocked = false;
  showToast(`₹${deposited} cash deposited by ${rider.name} to platform account. COD Lock cleared!`);
  renderSafetyAndCashDesk();
  renderRidersView();
}
