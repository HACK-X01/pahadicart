/**
 * PahadiCart Super Admin — Platform Settings & Business Rules Control Center
 * Manages Commission %, Delivery Fees, Min Orders, Payment Gateways (COD/UPI), Towns, and PRD Parameters.
 */

window.SettingsService = (function() {
  function getBusinessRules() {
    const defaults = {
      defaultCommissionPercent: 8,
      baseDeliveryFee: 25,
      staircaseDeliveryFee: 25,
      minOrderValue: 99,
      deliveryPromiseText: 'Under 2 Hours Hyperlocal Delivery (Himachal Hills)',
      serviceTowns: ['solan', 'shimla', 'dharamshala'],
      codEnabled: true,
      upiEnabled: true,
      requireShopApproval: true,
      requireProductApproval: false,
      activeCoupons: [
        { code: 'PAHADI50', discountPercent: 20, maxDiscount: 50, minOrder: 199, active: true },
        { code: 'WELCOME10', discountPercent: 10, maxDiscount: 30, minOrder: 99, active: true }
      ]
    };
    try {
      const stored = localStorage.getItem('pahadicart_business_rules');
      if (stored) {
        return Object.assign({}, defaults, JSON.parse(stored));
      }
    } catch(e) {}
    return defaults;
  }

  function saveBusinessRules(rules) {
    if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
    window.PAHADICART_DATA.businessRules = rules;
    try {
      localStorage.setItem('pahadicart_business_rules', JSON.stringify(rules));
    } catch (e) {
      console.error('Failed to save business rules:', e);
    }
    if (window.pahadiBus) {
      window.pahadiBus.emit('BUSINESS_RULES_UPDATED', rules);
    }
  }

  // PRD Parameters
  const prdConfig = {
    merchantAcceptanceTimeout: 75,
    etaAlpha: 1.45,
    vBaseKmh: 24,
    hairpinPenalty: 0.035,
    staircasePenaltyMins: 10,
    weatherRainBufferMins: 15,
    weatherFogBufferMins: 25,
    weatherSnowBufferMins: 35
  };

  let activeSubTab = 'business_rules'; // 'business_rules' | 'prd_algorithms'

  function renderSettingsForm() {
    const container = document.getElementById('settingsFormContainer');
    if (!container) return;

    const rules = getBusinessRules();

    container.innerHTML = `
      <!-- Sub-Tab Navigation Header -->
      <div style="display:flex; gap:12px; margin-bottom:24px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">
        <button class="btn ${activeSubTab === 'business_rules' ? 'btn-primary' : 'btn-secondary'}" onclick="window.SettingsService.switchSubTab('business_rules')" style="font-weight:700; font-size:13px; display:flex; align-items:center; gap:8px;">
          <span>⚙️ Business Rules & Operating Controls</span>
          <span style="background:rgba(255,255,255,0.2); font-size:10px; padding:2px 6px; border-radius:10px;">CORE</span>
        </button>
        <button class="btn ${activeSubTab === 'prd_algorithms' ? 'btn-primary' : 'btn-secondary'}" onclick="window.SettingsService.switchSubTab('prd_algorithms')" style="font-weight:700; font-size:13px; display:flex; align-items:center; gap:8px;">
          <span>🏔️ Hill Transit & ETA Algorithms</span>
        </button>
      </div>

      ${activeSubTab === 'business_rules' ? renderBusinessRulesSection(rules) : renderPrdAlgorithmsSection()}
    `;
  }

  function renderBusinessRulesSection(rules) {
    return `
      <form id="businessRulesForm" onsubmit="window.SettingsService.handleSaveRules(event)">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">

          <!-- Card 1: Commission & Financial Rules -->
          <div style="background:rgba(15,23,42,0.7); border:1px solid rgba(16,185,129,0.3); border-radius:14px; padding:20px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
              <span style="font-size:20px;">💰</span>
              <div>
                <h4 style="margin:0; color:#fff; font-size:15px; font-weight:800;">Platform Commission & Fee Structure</h4>
                <p style="margin:2px 0 0 0; font-size:11px; color:var(--slate-400);">Vyapar Mandal store commission & order charges</p>
              </div>
            </div>

            <div style="margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <label style="font-size:12px; font-weight:700; color:#e2e8f0;">Default Store Commission (%)</label>
                <span id="displayCommVal" style="font-weight:800; color:#10b981; font-family:var(--font-mono); font-size:14px;">${rules.defaultCommissionPercent}%</span>
              </div>
              <input type="range" id="ruleCommission" min="2" max="25" step="1" value="${rules.defaultCommissionPercent}" oninput="document.getElementById('displayCommVal').innerText = this.value + '%'" style="width:100%; accent-color:#10b981;">
              <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--slate-500); margin-top:2px;">
                <span>2% (Bare Cost)</span>
                <span>8% (Himachal Standard)</span>
                <span>25% (High Margin)</span>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px;">
              <div>
                <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Base Delivery Fee (₹)</label>
                <input type="number" id="ruleBaseDelivery" min="0" max="200" value="${rules.baseDeliveryFee}" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#38bdf8; font-weight:700; font-family:var(--font-mono); padding:8px 10px; border-radius:6px; font-size:13px;">
              </div>
              <div>
                <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Staircase Porterage Fee (₹)</label>
                <input type="number" id="ruleStaircaseFee" min="0" max="100" value="${rules.staircaseDeliveryFee}" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#38bdf8; font-weight:700; font-family:var(--font-mono); padding:8px 10px; border-radius:6px; font-size:13px;">
              </div>
            </div>

            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Minimum Order Value (₹)</label>
              <input type="number" id="ruleMinOrder" min="0" max="500" value="${rules.minOrderValue}" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fbbf24; font-weight:700; font-family:var(--font-mono); padding:8px 10px; border-radius:6px; font-size:13px;">
              <p style="font-size:10px; color:var(--slate-500); margin-top:3px;">Is amount se kam ka order customer checkout nahi kar sakega.</p>
            </div>
          </div>

          <!-- Card 2: Payment Gateways (COD & UPI) -->
          <div style="background:rgba(15,23,42,0.7); border:1px solid rgba(56,189,248,0.3); border-radius:14px; padding:20px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
              <span style="font-size:20px;">💳</span>
              <div>
                <h4 style="margin:0; color:#fff; font-size:15px; font-weight:800;">Payment Gateway Controls</h4>
                <p style="margin:2px 0 0 0; font-size:11px; color:var(--slate-400);">Enable / Disable Cash on Delivery & UPI instantly</p>
              </div>
            </div>

            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:13px; font-weight:700; color:#fff;">💵 Cash on Delivery (COD)</div>
                <div style="font-size:11px; color:var(--slate-400);">Ghar pahunchne par cash payment</div>
              </div>
              <label style="display:flex; align-items:center; cursor:pointer;">
                <input type="checkbox" id="ruleCodSwitch" ${rules.codEnabled !== false ? 'checked' : ''} style="accent-color:#10b981; transform:scale(1.4);">
              </label>
            </div>

            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:13px; font-weight:700; color:#fff;">📱 UPI & Online Payment</div>
                <div style="font-size:11px; color:var(--slate-400);">Instant QR & Netbanking Gateway</div>
              </div>
              <label style="display:flex; align-items:center; cursor:pointer;">
                <input type="checkbox" id="ruleUpiSwitch" ${rules.upiEnabled !== false ? 'checked' : ''} style="accent-color:#10b981; transform:scale(1.4);">
              </label>
            </div>

            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Delivery Promise / Banner Text</label>
              <input type="text" id="ruleDeliveryPromise" value="${rules.deliveryPromiseText || ''}" placeholder="e.g. Under 2 Hours Hyperlocal Delivery" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">
            </div>
          </div>

          <!-- Card 3: Service Areas & Town Expansion -->
          <div style="background:rgba(15,23,42,0.7); border:1px solid rgba(245,158,11,0.3); border-radius:14px; padding:20px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
              <span style="font-size:20px;">🏔️</span>
              <div>
                <h4 style="margin:0; color:#fff; font-size:15px; font-weight:800;">Service Areas / Town Activation</h4>
                <p style="margin:2px 0 0 0; font-size:11px; color:var(--slate-400);">Active delivery network cities across Himachal</p>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:10px;">
              ${['solan', 'shimla', 'dharamshala'].map(t => {
                const isChecked = (rules.serviceTowns || []).includes(t);
                const title = t === 'solan' ? '📍 Solan (Mushroom City - 1,502m)' : t === 'shimla' ? '📍 Shimla (The Ridge & Sanjauli - 2,206m)' : '📍 Dharamshala & McLeod Ganj (1,457m)';
                return `
                  <label style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.03); padding:10px 14px; border-radius:8px; cursor:pointer;">
                    <span style="font-size:12.5px; font-weight:700; color:#fff;">${title}</span>
                    <input type="checkbox" name="serviceTown" value="${t}" ${isChecked ? 'checked' : ''} style="accent-color:#10b981; transform:scale(1.2);">
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Card 4: Governance Approvals & Compliance -->
          <div style="background:rgba(15,23,42,0.7); border:1px solid rgba(168,85,247,0.3); border-radius:14px; padding:20px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
              <span style="font-size:20px;">🛡️</span>
              <div>
                <h4 style="margin:0; color:#fff; font-size:15px; font-weight:800;">Governance & Approval Modes</h4>
                <p style="margin:2px 0 0 0; font-size:11px; color:var(--slate-400);">Strict Vyapar Mandal & Ayush compliance gatekeeping</p>
              </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:12px;">
              <label style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; cursor:pointer;">
                <div>
                  <div style="font-size:12.5px; font-weight:700; color:#fff;">Shop Onboarding Approval</div>
                  <div style="font-size:11px; color:var(--slate-400);">Admin manual approval required before store goes live</div>
                </div>
                <input type="checkbox" id="ruleShopApproval" ${rules.requireShopApproval !== false ? 'checked' : ''} style="accent-color:#a855f7; transform:scale(1.3);">
              </label>

              <label style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; cursor:pointer;">
                <div>
                  <div style="font-size:12.5px; font-weight:700; color:#fff;">Health/Jeevanix Product Approval</div>
                  <div style="font-size:11px; color:var(--slate-400);">Strict Ayush/FSSAI verification before supplements launch</div>
                </div>
                <input type="checkbox" id="ruleProdApproval" ${rules.requireProductApproval ? 'checked' : ''} style="accent-color:#a855f7; transform:scale(1.3);">
              </label>
            </div>
          </div>

        </div>

        <!-- Coupons & Offers Manager -->
        <div style="margin-top:20px; background:rgba(15,23,42,0.7); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">🎟️</span>
              <div>
                <h4 style="margin:0; color:#fff; font-size:15px; font-weight:800;">Active Coupons & Customer Discount Codes</h4>
                <p style="margin:2px 0 0 0; font-size:11px; color:var(--slate-400);">Promo codes applicable at Customer Checkout</p>
              </div>
            </div>
            <button type="button" class="btn btn-primary" onclick="window.SettingsService.openAddCouponPrompt()" style="font-size:11.5px; padding:5px 12px;">+ Add New Coupon</button>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px;" id="couponsListContainer">
            ${(rules.activeCoupons || []).map((cp, idx) => `
              <div style="background:rgba(255,255,255,0.04); border:1px dashed ${cp.active ? '#10b981' : 'rgba(255,255,255,0.15)'}; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-family:var(--font-mono); font-weight:800; color:#fff; font-size:14px;">${cp.code}</div>
                  <div style="font-size:11px; color:#38bdf8; margin-top:2px;">${cp.discountPercent}% OFF (Up to ₹${cp.maxDiscount})</div>
                  <div style="font-size:10px; color:var(--slate-400);">Min Order: ₹${cp.minOrder}</div>
                </div>
                <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
                  <button type="button" onclick="window.SettingsService.toggleCoupon('${cp.code}')" style="background:none; border:none; color:${cp.active ? '#34d399' : '#f87171'}; font-size:11px; cursor:pointer; font-weight:700;">
                    ${cp.active ? '🟢 ACTIVE' : '🔴 OFF'}
                  </button>
                  <button type="button" onclick="window.SettingsService.deleteCoupon('${cp.code}')" style="background:none; border:none; color:#f87171; font-size:11px; cursor:pointer;" title="Delete">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="margin-top:24px; display:flex; justify-content:flex-end; gap:12px;">
          <button type="button" class="btn btn-secondary" onclick="window.SettingsService.resetDefaults()">Reset to Defaults</button>
          <button type="submit" class="btn btn-primary" style="background:#10b981; font-weight:800; font-size:14px; padding:10px 24px;">
            💾 Save All Business Rules
          </button>
        </div>
      </form>
    `;
  }

  function renderPrdAlgorithmsSection() {
    return `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(245,158,11,0.3); border-radius:14px; padding:20px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <h4 style="margin:0; color:#fff; font-size:16px;">Merchant Order Acceptance Timer</h4>
              <p style="margin:4px 0 0 0; font-size:12px; color:var(--slate-400);">Countdown before auto-escalating unaccepted orders.</p>
            </div>
            <span style="background:rgba(245,158,11,0.2); border:1px solid #f59e0b; color:#f59e0b; font-size:10px; font-weight:800; padding:3px 8px; border-radius:12px;">PRD #1</span>
          </div>
          <div style="display:flex; align-items:center; gap:16px;">
            <input type="range" min="30" max="180" step="5" value="${prdConfig.merchantAcceptanceTimeout}" oninput="document.getElementById('timeoutValDisplay').innerText = this.value + ' sec'" style="flex:1; accent-color:#f59e0b;">
            <span id="timeoutValDisplay" style="font-family:var(--font-mono); font-size:16px; font-weight:800; color:#f59e0b; min-width:65px;">${prdConfig.merchantAcceptanceTimeout} sec</span>
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(14,165,233,0.3); border-radius:14px; padding:20px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <h4 style="margin:0; color:#fff; font-size:16px;">Terrain & ETA Gradient Parameters</h4>
              <p style="margin:4px 0 0 0; font-size:12px; color:var(--slate-400);">Gradient Alpha multiplier and base hill speed.</p>
            </div>
            <span style="background:rgba(14,165,233,0.2); border:1px solid #0ea5e9; color:#0ea5e9; font-size:10px; font-weight:800; padding:3px 8px; border-radius:12px;">PRD #2,3</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:14px;">
            <div>
              <label style="font-size:11px; color:var(--slate-400); display:block; margin-bottom:4px;">Gradient Alpha (α)</label>
              <input type="number" step="0.05" min="0.5" max="3.0" value="${prdConfig.etaAlpha}" style="background:#091220; border:1px solid rgba(255,255,255,0.15); color:#38bdf8; font-family:var(--font-mono); font-weight:700; width:100%; padding:8px; border-radius:6px;">
            </div>
            <div>
              <label style="font-size:11px; color:var(--slate-400); display:block; margin-bottom:4px;">Base Speed V_base (km/h)</label>
              <input type="number" step="1" min="10" max="50" value="${prdConfig.vBaseKmh}" style="background:#091220; border:1px solid rgba(255,255,255,0.15); color:#38bdf8; font-family:var(--font-mono); font-weight:700; width:100%; padding:8px; border-radius:6px;">
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function handleSaveRules(e) {
    if (e) e.preventDefault();
    const comm = parseInt(document.getElementById('ruleCommission').value, 10) || 8;
    const baseDelivery = parseFloat(document.getElementById('ruleBaseDelivery').value) || 25;
    const staircaseFee = parseFloat(document.getElementById('ruleStaircaseFee').value) || 25;
    const minOrder = parseFloat(document.getElementById('ruleMinOrder').value) || 99;
    const cod = document.getElementById('ruleCodSwitch').checked;
    const upi = document.getElementById('ruleUpiSwitch').checked;
    const promise = document.getElementById('ruleDeliveryPromise').value.trim();
    const shopAppr = document.getElementById('ruleShopApproval').checked;
    const prodAppr = document.getElementById('ruleProdApproval').checked;

    const towns = [];
    document.querySelectorAll('input[name="serviceTown"]:checked').forEach(cb => {
      towns.push(cb.value);
    });

    const current = getBusinessRules();
    const updated = {
      ...current,
      defaultCommissionPercent: comm,
      baseDeliveryFee: baseDelivery,
      staircaseDeliveryFee: staircaseFee,
      minOrderValue: minOrder,
      codEnabled: cod,
      upiEnabled: upi,
      deliveryPromiseText: promise,
      serviceTowns: towns.length > 0 ? towns : ['solan'],
      requireShopApproval: shopAppr,
      requireProductApproval: prodAppr
    };

    saveBusinessRules(updated);
    renderSettingsForm();
    if (window.showToast) window.showToast('✅ All Business Rules & Payment Controls Saved Successfully!');
  }

  function openAddCouponPrompt() {
    const code = prompt('Naya Coupon Code Dalein (e.g. MONSOON20):');
    if (!code) return;
    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const disc = parseInt(prompt('Discount Percentage (e.g. 15 for 15%):', '15'), 10) || 10;
    const max = parseInt(prompt('Maximum Discount Limit in ₹ (e.g. 50):', '50'), 10) || 50;
    const min = parseInt(prompt('Minimum Order Value in ₹ (e.g. 199):', '199'), 10) || 99;

    const rules = getBusinessRules();
    if (!rules.activeCoupons) rules.activeCoupons = [];
    rules.activeCoupons.push({
      code: cleanCode,
      discountPercent: disc,
      maxDiscount: max,
      minOrder: min,
      active: true
    });

    saveBusinessRules(rules);
    renderSettingsForm();
    if (window.showToast) window.showToast(`Coupon "${cleanCode}" added!`);
  }

  function toggleCoupon(code) {
    const rules = getBusinessRules();
    const c = (rules.activeCoupons || []).find(item => item.code === code);
    if (c) {
      c.active = !c.active;
      saveBusinessRules(rules);
      renderSettingsForm();
      if (window.showToast) window.showToast(`Coupon ${code} ${c.active ? 'Activated' : 'Paused'}`);
    }
  }

  function deleteCoupon(code) {
    if (confirm(`Kya aap Coupon "${code}" ko delete karna chahte hain?`)) {
      const rules = getBusinessRules();
      rules.activeCoupons = (rules.activeCoupons || []).filter(item => item.code !== code);
      saveBusinessRules(rules);
      renderSettingsForm();
      if (window.showToast) window.showToast(`Coupon ${code} removed.`);
    }
  }

  function switchSubTab(tab) {
    activeSubTab = tab;
    renderSettingsForm();
  }

  function resetDefaults() {
    if (confirm('Kya aap sabhi business rules ko default settings par reset karna chahte hain?')) {
      localStorage.removeItem('pahadicart_business_rules');
      renderSettingsForm();
      if (window.showToast) window.showToast('Reset to default rules.');
    }
  }

  function init() {
    renderSettingsForm();
  }

  return {
    init,
    renderSettingsForm,
    switchSubTab,
    handleSaveRules,
    openAddCouponPrompt,
    toggleCoupon,
    deleteCoupon,
    resetDefaults,
    getBusinessRules
  };
})();
