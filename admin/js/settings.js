/**
 * PahadiCart Super Admin - System Settings & PRD Decisions Manager
 * Configurable unresolved PRD parameters, fee structures, and versioned changes.
 */

window.SettingsService = (function() {
  const currentConfig = {
    merchantAcceptanceTimeout: 75,
    etaAlpha: 1.45,
    vBaseKmh: 24,
    hairpinPenalty: 0.035,
    staircasePenaltyMins: 10,
    weatherRainBufferMins: 15,
    weatherFogBufferMins: 25,
    weatherSnowBufferMins: 35,
    platformFee: 5.0,
    packagingFeeDefault: 10.0,
    settlementCycle: 'T+1',
    mapProvider: 'Leaflet (Free OpenStreetMap)',
    routingProvider: 'OSRM Hill Engine (Open Source)',
    paymentGateway: 'Cashfree & RazorpayX Abstracted'
  };

  function renderSettingsForm() {
    const container = document.getElementById('settingsFormContainer');
    if (!container) return;
    container.innerHTML = '<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">' +
      '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(245,158,11,0.3); border-radius:14px; padding:20px;">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">' +
          '<div><h4 style="margin:0; color:#fff; font-size:16px;">Merchant Order Acceptance Timer</h4>' +
          '<p style="margin:4px 0 0 0; font-size:12px; color:var(--slate-400);">Countdown before auto-escalating unaccepted orders.</p></div>' +
          '<span style="background:rgba(245,158,11,0.2); border:1px solid #f59e0b; color:#f59e0b; font-size:10px; font-weight:800; padding:3px 8px; border-radius:12px;">PRD DECISION #1</span>' +
        '</div>' +
        '<div style="padding:10px; background:rgba(245,158,11,0.08); border-left:3px solid #f59e0b; font-size:12px; color:#fde68a; margin-bottom:16px;">' +
          '<b>Notice:</b> PRD Sec 4.2 states 60s vs Sec 7.1 states 90s. Dynamically configurable.' +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:16px;">' +
          '<input type="range" id="settingMerchantTimeout" min="30" max="180" step="5" value="' + currentConfig.merchantAcceptanceTimeout + '" oninput="document.getElementById(\'timeoutValDisplay\').innerText = this.value + \' sec\'" style="flex:1; accent-color:#f59e0b;">' +
          '<span id="timeoutValDisplay" style="font-family:var(--font-mono); font-size:16px; font-weight:800; color:#f59e0b; min-width:65px;">' + currentConfig.merchantAcceptanceTimeout + ' sec</span>' +
        '</div>' +
        '<div style="display:flex; justify-content:space-between; font-size:11px; color:var(--slate-500); margin-top:4px;">' +
          '<span>30s Fast</span>' +
          '<span style="color:#f59e0b; cursor:pointer;" onclick="window.SettingsService.setTimerQuick(60)">[Set 60s PRD-A]</span>' +
          '<span style="color:#f59e0b; cursor:pointer;" onclick="window.SettingsService.setTimerQuick(90)">[Set 90s PRD-B]</span>' +
          '<span>180s Relaxed</span>' +
        '</div>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(14,165,233,0.3); border-radius:14px; padding:20px;">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">' +
          '<div><h4 style="margin:0; color:#fff; font-size:16px;">Terrain & ETA Gradient Parameters</h4>' +
          '<p style="margin:4px 0 0 0; font-size:12px; color:var(--slate-400);">Configures Alpha (gradient multiplier) and Base Speed (V_base).</p></div>' +
          '<span style="background:rgba(14,165,233,0.2); border:1px solid #0ea5e9; color:#0ea5e9; font-size:10px; font-weight:800; padding:3px 8px; border-radius:12px;">PRD DECISION #2,3</span>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:14px;">' +
          '<div><label style="font-size:11px; color:var(--slate-400); display:block; margin-bottom:4px;">Gradient Alpha (α)</label><input type="number" id="settingAlpha" step="0.05" min="0.5" max="3.0" value="' + currentConfig.etaAlpha + '" style="background:#091220; border:1px solid rgba(255,255,255,0.15); color:#38bdf8; font-family:var(--font-mono); font-weight:700; width:100%; padding:8px; border-radius:6px;"></div>' +
          '<div><label style="font-size:11px; color:var(--slate-400); display:block; margin-bottom:4px;">Base Speed V_base (km/h)</label><input type="number" id="settingVBase" step="1" min="10" max="50" value="' + currentConfig.vBaseKmh + '" style="background:#091220; border:1px solid rgba(255,255,255,0.15); color:#38bdf8; font-family:var(--font-mono); font-weight:700; width:100%; padding:8px; border-radius:6px;"></div>' +
        '</div>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(16,185,129,0.3); border-radius:14px; padding:20px;">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">' +
          '<div><h4 style="margin:0; color:#fff; font-size:16px;">Map & Routing Infrastructure</h4>' +
          '<p style="margin:4px 0 0 0; font-size:12px; color:var(--slate-400);">Abstracted map engine & mountain router.</p></div>' +
          '<span style="background:rgba(16,185,129,0.2); border:1px solid #10b981; color:#10b981; font-size:10px; font-weight:800; padding:3px 8px; border-radius:12px;">PRD DECISION #4</span>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:14px;">' +
          '<div><label style="font-size:11px; color:var(--slate-400); display:block; margin-bottom:4px;">Map Provider</label><select id="settingMapProvider" style="background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fff; width:100%; padding:8px; border-radius:6px;"><option selected>Leaflet (OpenStreetMap)</option><option>Mapbox GL JS</option></select></div>' +
          '<div><label style="font-size:11px; color:var(--slate-400); display:block; margin-bottom:4px;">Routing Provider</label><select id="settingRoutingProvider" style="background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fff; width:100%; padding:8px; border-radius:6px;"><option selected>OSRM Hill Router</option><option>Mapbox Directions</option></select></div>' +
        '</div>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,0.03); border:1px solid rgba(168,85,247,0.3); border-radius:14px; padding:20px;">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">' +
          '<div><h4 style="margin:0; color:#fff; font-size:16px;">Settlement Cycle & Platform Fee</h4>' +
          '<p style="margin:4px 0 0 0; font-size:12px; color:var(--slate-400);">Payout cadence & platform take.</p></div>' +
          '<span style="background:rgba(168,85,247,0.2); border:1px solid #a855f7; color:#a855f7; font-size:10px; font-weight:800; padding:3px 8px; border-radius:12px;">PRD DECISION #5</span>' +
        '</div>' +
        '<div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:14px;">' +
          '<div><label style="font-size:11px; color:var(--slate-400); display:block; margin-bottom:4px;">Settlement Cadence</label><select id="settingSettlementCycle" style="background:#091220; border:1px solid rgba(255,255,255,0.15); color:#a855f7; font-weight:700; width:100%; padding:8px; border-radius:6px;"><option selected>T+1 Working Day</option><option>T+2 Batch Settlement</option></select></div>' +
          '<div><label style="font-size:11px; color:var(--slate-400); display:block; margin-bottom:4px;">Platform Surcharge (₹)</label><input type="number" id="settingPlatformFee" step="0.5" min="0" max="30" value="' + currentConfig.platformFee + '" style="background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fff; font-family:var(--font-mono); font-weight:700; width:100%; padding:8px; border-radius:6px;"></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div style="margin-top:24px; display:flex; justify-content:flex-end; gap:12px;">' +
      '<button class="btn btn-secondary" onclick="window.SettingsService.resetToDefaults()">Reset to Defaults</button>' +
      '<button class="btn btn-primary" onclick="window.SettingsService.saveConfiguration()" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);">💾 Save & Audit Configuration</button>' +
    '</div>';
  }

  function setTimerQuick(sec) {
    const slider = document.getElementById('settingMerchantTimeout');
    const disp = document.getElementById('timeoutValDisplay');
    if (slider && disp) { slider.value = sec; disp.innerText = sec + ' sec'; }
  }

  function saveConfiguration() {
    if (window.RbacService && !window.RbacService.canPerform('SETTINGS', 'UPDATE')) {
      alert('Permission Denied: Only SUPER_ADMIN can modify platform settings.');
      return;
    }
    const timeout = parseInt(document.getElementById('settingMerchantTimeout').value, 10);
    const alpha = parseFloat(document.getElementById('settingAlpha').value);
    const vBase = parseInt(document.getElementById('settingVBase').value, 10);
    const cycle = document.getElementById('settingSettlementCycle').value;
    const fee = parseFloat(document.getElementById('settingPlatformFee').value);
    const oldConfig = { ...currentConfig };
    currentConfig.merchantAcceptanceTimeout = timeout;
    currentConfig.etaAlpha = alpha;
    currentConfig.vBaseKmh = vBase;
    currentConfig.settlementCycle = cycle;
    currentConfig.platformFee = fee;
    if (window.AdminApiService) {
      window.AdminApiService.createAuditLog('SYSTEM_SETTINGS_UPDATED', 'SETTINGS', 'GLOBAL_CONFIG', oldConfig, currentConfig);
    }
    if (window.showToast) window.showToast('Configuration saved and audited.', 'success');
  }

  function resetToDefaults() {
    renderSettingsForm();
    if (window.showToast) window.showToast('Reset to default values.', 'info');
  }

  function init() { renderSettingsForm(); }

  return { init, getConfig: () => currentConfig, saveConfiguration, resetToDefaults, setTimerQuick };
})();
