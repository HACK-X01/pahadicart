// PahadiCart Vyapar Mandal 58mm/80mm Thermal Receipt & Hindi KOT Generator
(function() {
  class PahadiThermalPrinter {
    constructor() {}

    generateSlipHtml(order) {
      const shop = order.merchant || {
        name: 'Sharma Kirana & Fresh Produce',
        area: 'Mall Road Lower Bazaar',
        vyaparMandalId: 'VM-SOL-2024-089',
        phone: '98160-22110'
      };

      const customer = order.customer || {
        name: 'Aarav Sharma',
        phone: '98160-12890',
        colony: 'Shamti Upper Pine Lane',
        staircaseDetails: 'Descend 35 stone steps from road level, green gate'
      };

      const items = order.items || [
        { name: 'Kinnaur Crisp Royal Delicious Apples (1 kg)', qty: 1, price: 140 },
        { name: 'Fresh Siddu Dough & Roasted Walnut Kit', qty: 2, price: 180 }
      ];

      const pricing = order.pricing || {
        itemTotal: 500,
        deliveryFee: 25,
        staircaseFee: 25,
        totalAmount: 550,
        tcsTax: 5.0
      };

      return `
        <div class="thermal-slip" style="width:280px; background:#ffffff; color:#000000; font-family:'Courier New', monospace; padding:12px; margin:0 auto; box-shadow:0 10px 25px rgba(0,0,0,0.5); font-size:11px; line-height:1.35; text-align:left;">
          <!-- Shop Header -->
          <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:8px; margin-bottom:8px;">
            <div style="font-size:14px; font-weight:bold;">🏔️ PAHADICART 🏔️</div>
            <div style="font-size:10px;">VYAPAR MANDAL PARTNER KOT</div>
            <div style="font-size:12px; font-weight:bold; margin-top:4px;">${shop.name}</div>
            <div style="font-size:9.5px;">${shop.area}</div>
            <div style="font-size:9px;">VM-REG: ${shop.vyaparMandalId || 'VM-HP-2024'} &bull; Ph: ${shop.phone || '98160-00000'}</div>
          </div>

          <!-- Order Info -->
          <div style="margin-bottom:8px; font-size:10px;">
            <div><strong>ORDER ID:</strong> ${order.id}</div>
            <div><strong>TIME:</strong> ${new Date().toLocaleTimeString()} &bull; ${new Date().toLocaleDateString()}</div>
            <div><strong>CUSTOMER:</strong> ${customer.name} (${customer.phone})</div>
            <div><strong>COLONY:</strong> ${customer.colony}</div>
          </div>

          <!-- Staircase Delivery Box -->
          <div style="border:1px solid #000; padding:6px; margin-bottom:8px; background:#f4f4f4;">
            <div style="font-weight:bold; font-size:9.5px;">🪜 STAIRCASE DROP GUIDANCE:</div>
            <div style="font-size:9.5px; font-weight:bold;">${customer.staircaseDetails || 'Doorstep delivery'}</div>
          </div>

          <!-- Items Table -->
          <div style="border-bottom:1px dashed #000; border-top:1px dashed #000; padding:6px 0; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; font-weight:bold; margin-bottom:4px;">
              <span>ITEM</span>
              <span>QTY</span>
              <span>AMT</span>
            </div>
            ${items.map(it => `
              <div style="display:flex; justify-content:space-between; margin-bottom:3px; font-size:10px;">
                <span style="flex:2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${it.name.split('(')[0]}</span>
                <span style="flex:0.5; text-align:center;">${it.qty}</span>
                <span style="flex:1; text-align:right;">₹${(it.price * it.qty)}</span>
              </div>
            `).join('')}
          </div>

          <!-- Pricing Totals -->
          <div style="margin-bottom:8px; font-size:10px;">
            <div style="display:flex; justify-content:space-between;">
              <span>Item Subtotal:</span>
              <span>₹${pricing.itemTotal}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Hill Delivery Fee:</span>
              <span>₹${pricing.deliveryFee}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Staircase Doorstep Climb:</span>
              <span>₹${pricing.staircaseFee || 25}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:12px; border-top:1px solid #000; padding-top:4px; margin-top:4px;">
              <span>NET TOTAL PAYABLE:</span>
              <span>₹${pricing.totalAmount}</span>
            </div>
            <div style="font-size:8.5px; color:#555; margin-top:4px;">
              *Section 194-O TCS 1% (₹${pricing.tcsTax || 5.0}) deducted at settlement.
            </div>
          </div>

          <!-- Dynamic UPI QR -->
          <div style="text-align:center; border-top:1px dashed #000; padding-top:8px; margin-top:6px;">
            <div style="font-size:9.5px; font-weight:bold; margin-bottom:4px;">SCAN UPI QR TO PAY ON DELIVERY</div>
            <svg width="85" height="85" viewBox="0 0 100 100" style="background:#fff; border:1px solid #000; padding:2px;">
              <rect width="30" height="30" fill="#000" x="10" y="10"/>
              <rect width="20" height="20" fill="#fff" x="15" y="15"/>
              <rect width="10" height="10" fill="#000" x="20" y="20"/>
              <rect width="30" height="30" fill="#000" x="60" y="10"/>
              <rect width="20" height="20" fill="#fff" x="65" y="15"/>
              <rect width="10" height="10" fill="#000" x="70" y="20"/>
              <rect width="30" height="30" fill="#000" x="10" y="60"/>
              <rect width="20" height="20" fill="#fff" x="15" y="65"/>
              <rect width="10" height="10" fill="#000" x="20" y="70"/>
              <rect width="8" height="8" fill="#000" x="48" y="22"/>
              <rect width="8" height="8" fill="#000" x="48" y="48"/>
              <rect width="8" height="8" fill="#000" x="22" y="48"/>
              <rect width="8" height="8" fill="#000" x="70" y="55"/>
              <rect width="8" height="8" fill="#000" x="55" y="75"/>
            </svg>
            <div style="font-size:8.5px; margin-top:4px;">UPI ID: ${shop.upi || 'pahadicart@okhdfcbank'}</div>
            <div style="font-size:8px; margin-top:6px; color:#555;">Shuddh Himachal Se Seedhe Aapke Dwar</div>
            <div style="font-size:8px; font-weight:bold;">*** THANK YOU ***</div>
          </div>
        </div>
      `;
    }

    printReceipt(order) {
      const existingModal = document.getElementById('thermalSlipModal');
      if (existingModal) existingModal.remove();

      const modal = document.createElement('div');
      modal.id = 'thermalSlipModal';
      modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(2,6,23,0.85); backdrop-filter:blur(8px); z-index:999999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px;';

      const content = this.generateSlipHtml(order);

      modal.innerHTML = `
        <div style="background:#0f172a; padding:16px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); max-height:90vh; overflow-y:auto; display:flex; flex-direction:column; align-items:center; gap:14px;">
          <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
            <strong style="color:#f1f5f9; font-size:13.5px;">🖨️ 58mm/80mm Thermal KOT Preview</strong>
            <button onclick="document.getElementById('thermalSlipModal').remove()" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
          </div>
          
          <div id="printableSlipArea">
            ${content}
          </div>

          <div style="display:flex; gap:10px; width:100%;">
            <button onclick="window.print()" style="flex:1; background:#10b981; color:#040813; border:none; padding:10px; border-radius:8px; font-weight:800; cursor:pointer; font-size:12px;">🖨️ Print Slip Now</button>
            <button onclick="document.getElementById('thermalSlipModal').remove()" style="flex:1; background:#334155; color:#f1f5f9; border:none; padding:10px; border-radius:8px; font-weight:700; cursor:pointer; font-size:12px;">Close</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    }
  }

  window.pahadiPrinter = new PahadiThermalPrinter();
})();
