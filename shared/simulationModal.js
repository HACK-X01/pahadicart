// PahadiCart 1-Click Live Lifecycle Simulation Modal Component
(function() {
  function injectSimulationModal() {
    if (document.getElementById('pahadiSimModal')) return;

    const modalHtml = `
      <div id="pahadiSimModal" class="sim-modal-backdrop" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(2,6,23,0.85); backdrop-filter:blur(10px); z-index:999999; align-items:center; justify-content:center; padding:20px; font-family:var(--font-sans, sans-serif);">
        <div class="sim-modal-container" style="background:var(--slate-900, #0a1122); border:1px solid rgba(16,185,129,0.3); box-shadow:0 25px 60px -15px rgba(0,0,0,0.8), 0 0 40px rgba(16,185,129,0.18); border-radius:20px; width:100%; max-width:680px; overflow:hidden; color:#f1f5f9; display:flex; flex-direction:column;">
          
          <!-- Modal Header -->
          <div style="background:linear-gradient(135deg, rgba(6,78,59,0.5), rgba(15,26,51,0.9)); padding:20px 24px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:space-between;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:24px;">🏔️⚡</span>
              <div>
                <h3 style="font-family:var(--font-display, sans-serif); font-size:18px; font-weight:800; color:#ffffff; margin:0;">Live Mountain Lifecycle Simulator</h3>
                <p style="font-size:12px; color:#34d399; margin:2px 0 0;">Automated End-to-End Mountain Order &amp; Proximity Routing Engine</p>
              </div>
            </div>
            <button onclick="window.closeSimModal()" style="background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center;">✕</button>
          </div>

          <!-- Controls Bar -->
          <div style="padding:16px 24px; background:rgba(2,6,23,0.6); border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:12px; font-weight:700; color:#94a3b8;">Simulate Town:</span>
              <select id="simTownSelect" style="background:#0f1a33; border:1px solid rgba(255,255,255,0.12); color:#ffffff; padding:6px 14px; border-radius:8px; font-size:12.5px; font-weight:700; outline:none; cursor:pointer;">
                <option value="solan">📍 Solan (Mushroom City &bull; 1,502m)</option>
                <option value="shimla">📍 Shimla (The Ridge &bull; 2,206m)</option>
                <option value="dharamshala">📍 Dharamshala (McLeod Ganj &bull; 1,457m)</option>
              </select>
            </div>
            <button id="simRunBtn" onclick="window.triggerSimRun()" style="background:linear-gradient(135deg, #10b981 0%, #047857 100%); color:#ffffff; border:none; padding:8px 20px; border-radius:10px; font-weight:800; font-size:13px; cursor:pointer; box-shadow:0 0 20px rgba(16,185,129,0.35); display:flex; align-items:center; gap:8px;">
              <span>▶ Run Live Simulation</span>
            </button>
          </div>

          <!-- 5-Step Roadmap Body -->
          <div style="padding:24px; display:flex; flex-direction:column; gap:14px; max-height:480px; overflow-y:auto;">
            
            <!-- Step 1 -->
            <div id="simCard1" class="sim-step-card" style="padding:14px 18px; background:rgba(15,26,51,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:12px; transition:all 0.3s ease;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span id="simIcon1" style="width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">1</span>
                  <strong style="font-size:13.5px; color:#e2e8f0;">Step 1: Customer Places Mountain Order</strong>
                </div>
                <span id="simBadge1" style="font-size:10.5px; font-weight:700; padding:3px 10px; border-radius:12px; background:rgba(255,255,255,0.05); color:#94a3b8;">Pending</span>
              </div>
              <div id="simDesc1" style="font-size:12px; color:#94a3b8; margin-top:6px; line-height:1.4;">Customer adds local items and specifies 35-staircase descent instructions.</div>
            </div>

            <!-- Step 2 -->
            <div id="simCard2" class="sim-step-card" style="padding:14px 18px; background:rgba(15,26,51,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:12px; transition:all 0.3s ease;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span id="simIcon2" style="width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">2</span>
                  <strong style="font-size:13.5px; color:#e2e8f0;">Step 2: Proximity Routing &amp; "Ghar Ki Ghanti" Chime</strong>
                </div>
                <span id="simBadge2" style="font-size:10.5px; font-weight:700; padding:3px 10px; border-radius:12px; background:rgba(255,255,255,0.05); color:#94a3b8;">Pending</span>
              </div>
              <div id="simDesc2" style="font-size:12px; color:#94a3b8; margin-top:6px; line-height:1.4;">Closest in-stock shop auto-selected. Authentic brass bell chime sounds on merchant app.</div>
            </div>

            <!-- Step 3 -->
            <div id="simCard3" class="sim-step-card" style="padding:14px 18px; background:rgba(15,26,51,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:12px; transition:all 0.3s ease;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span id="simIcon3" style="width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">3</span>
                  <strong style="font-size:13.5px; color:#e2e8f0;">Step 3: Rider Auto-Assignment &amp; Elevation Climb</strong>
                </div>
                <span id="simBadge3" style="font-size:10.5px; font-weight:700; padding:3px 10px; border-radius:12px; background:rgba(255,255,255,0.05); color:#94a3b8;">Pending</span>
              </div>
              <div id="simDesc3" style="font-size:12px; color:#94a3b8; margin-top:6px; line-height:1.4;">Closest rider with cash &lt; ₹2,500 picks up cargo. Live GPS climb telemetry tracks altitude gain.</div>
              <div id="simTelemetryBox" style="display:none; margin-top:10px; padding:10px 14px; background:rgba(2,6,23,0.7); border-radius:8px; border:1px dashed rgba(56,189,248,0.3); font-size:11.5px; color:#38bdf8;">
                🏔️ Altitude Telemetry: <strong>1,480m ➔ 1,620m (+140m climb)</strong> &bull; Grade: 14.2% &bull; Walking/Switchback Mode
              </div>
            </div>

            <!-- Step 4 -->
            <div id="simCard4" class="sim-step-card" style="padding:14px 18px; background:rgba(15,26,51,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:12px; transition:all 0.3s ease;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span id="simIcon4" style="width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">4</span>
                  <strong style="font-size:13.5px; color:#e2e8f0;">Step 4: Doorstep OTP Handover &amp; Staircase POD</strong>
                </div>
                <span id="simBadge4" style="font-size:10.5px; font-weight:700; padding:3px 10px; border-radius:12px; background:rgba(255,255,255,0.05); color:#94a3b8;">Pending</span>
              </div>
              <div id="simDesc4" style="font-size:12px; color:#94a3b8; margin-top:6px; line-height:1.4;">Customer presents 4-digit OTP. Delivery marked complete with geo-stamped proof.</div>
            </div>

            <!-- Step 5 -->
            <div id="simCard5" class="sim-step-card" style="padding:14px 18px; background:rgba(15,26,51,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:12px; transition:all 0.3s ease;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span id="simIcon5" style="width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800;">5</span>
                  <strong style="font-size:13.5px; color:#e2e8f0;">Step 5: Admin P&amp;L Settlement &amp; Rupee Waterfall</strong>
                </div>
                <span id="simBadge5" style="font-size:10.5px; font-weight:700; padding:3px 10px; border-radius:12px; background:rgba(255,255,255,0.05); color:#94a3b8;">Pending</span>
              </div>
              <div id="simDesc5" style="font-size:12px; color:#94a3b8; margin-top:6px; line-height:1.4;">Platform Net Margin booked. Merchant settlement &amp; 1% TCS credited to ledger with green flash.</div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div style="padding:14px 24px; background:rgba(2,6,23,0.8); border-top:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:space-between; font-size:12px; color:#94a3b8;">
            <div id="simStatusNote">Ready to launch end-to-end mountain order simulation.</div>
            <button onclick="window.closeSimModal()" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:#cbd5e1; padding:6px 14px; border-radius:8px; font-size:12px; cursor:pointer;">Close</button>
          </div>

        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div.firstElementChild);

    // Register simulation listener
    if (window.pahadiSimulator) {
      window.pahadiSimulator.onStep((step, data) => {
        updateStepUI(step, data);
      });
    }
  }

  function updateStepUI(step, data) {
    const card = document.getElementById('simCard' + step);
    const badge = document.getElementById('simBadge' + step);
    const icon = document.getElementById('simIcon' + step);
    const desc = document.getElementById('simDesc' + step);
    const note = document.getElementById('simStatusNote');

    if (card && badge && icon) {
      card.style.background = 'rgba(16,185,129,0.12)';
      card.style.borderColor = 'rgba(16,185,129,0.4)';
      badge.innerText = 'Completed ✓';
      badge.style.background = '#10b981';
      badge.style.color = '#040813';
      icon.style.background = '#10b981';
      icon.style.color = '#040813';
      icon.innerText = '✓';
      if (desc && data.desc) desc.innerText = data.desc;
    }

    if (step === 3) {
      const telem = document.getElementById('simTelemetryBox');
      if (telem) telem.style.display = 'block';
    }

    if (note) {
      note.innerHTML = '<span style="color:#34d399; font-weight:700;">Active: ' + data.title + '</span>';
    }

    if (step === 5) {
      const btn = document.getElementById('simRunBtn');
      if (btn) {
        btn.innerHTML = '<span>✓ Simulation Complete! Run Again</span>';
        btn.style.background = 'linear-gradient(135deg, #0ea5e9, #0284c7)';
      }
    }
  }

  function resetSimCards() {
    for (let i = 1; i <= 5; i++) {
      const card = document.getElementById('simCard' + i);
      const badge = document.getElementById('simBadge' + i);
      const icon = document.getElementById('simIcon' + i);
      if (card && badge && icon) {
        card.style.background = 'rgba(15,26,51,0.5)';
        card.style.borderColor = 'rgba(255,255,255,0.06)';
        badge.innerText = 'Pending';
        badge.style.background = 'rgba(255,255,255,0.05)';
        badge.style.color = '#94a3b8';
        icon.style.background = 'rgba(255,255,255,0.08)';
        icon.style.color = '#ffffff';
        icon.innerText = String(i);
      }
    }
    const telem = document.getElementById('simTelemetryBox');
    if (telem) telem.style.display = 'none';
  }

  window.openSimModal = function() {
    injectSimulationModal();
    const modal = document.getElementById('pahadiSimModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  };

  window.closeSimModal = function() {
    const modal = document.getElementById('pahadiSimModal');
    if (modal) modal.style.display = 'none';
  };

  window.triggerSimRun = function() {
    resetSimCards();
    const town = document.getElementById('simTownSelect')?.value || 'solan';
    const btn = document.getElementById('simRunBtn');
    if (btn) {
      btn.innerHTML = '<span>⚡ Running Simulation...</span>';
    }
    if (window.pahadiSimulator) {
      window.pahadiSimulator.startSimulation(town);
    }
  };

  // Inject when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSimulationModal);
  } else {
    injectSimulationModal();
  }
})();
