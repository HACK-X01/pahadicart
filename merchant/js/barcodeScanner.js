// PahadiCart Merchant Camera Barcode & Quick Inventory Scanner
(function() {
  class PahadiBarcodeScanner {
    constructor() {
      this.barcodeItems = [
        { barcode: '8901234001', id: 'p-1', name: 'Kinnaur Crisp Royal Delicious Apples (1 kg)', price: 140, stock: 45, icon: '🍎' },
        { barcode: '8901234002', id: 'p-2', name: 'Fresh Siddu Dough & Roasted Walnut Kit', price: 180, stock: 20, icon: '🥟' },
        { barcode: '8901234003', id: 'p-3', name: 'Kangra Valley Organic Green Tea (250g)', price: 220, stock: 35, icon: '🍵' },
        { barcode: '8901234004', id: 'p-4', name: 'Solan Fresh White Button Mushrooms (400g)', price: 90, stock: 60, icon: '🍄' },
        { barcode: '8901234005', id: 'p-5', name: 'Traditional Chamba Red Rajma (1 kg)', price: 165, stock: 40, icon: '🫘' },
        { barcode: '8901234007', id: 'p-7', name: 'Steamed Pahadi Veggie Momos (8 pcs)', price: 110, stock: 25, icon: '🥟' }
      ];
    }

    openScannerModal() {
      const existing = document.getElementById('barcodeScannerModal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'barcodeScannerModal';
      modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(2,6,23,0.85); backdrop-filter:blur(8px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:16px; font-family:var(--font-sans, sans-serif);';

      const itemsHtml = this.barcodeItems.map(item => {
        return [
          '<div onclick="window.pahadiScanner.triggerScan(\'' + item.barcode + '\')" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); padding:10px 14px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; transition:background 0.15s;">',
            '<div style="display:flex; align-items:center; gap:10px;">',
              '<span style="font-size:22px;">' + item.icon + '</span>',
              '<div>',
                '<div style="font-size:12.5px; font-weight:700; color:#f1f5f9;">' + item.name + '</div>',
                '<div style="font-size:10.5px; color:#94a3b8; font-family:monospace;">BARCODE: ' + item.barcode + ' &bull; ₹' + item.price + '</div>',
              '</div>',
            '</div>',
            '<button style="background:rgba(16,185,129,0.15); border:1px solid #10b981; color:#34d399; font-size:11px; font-weight:800; padding:4px 10px; border-radius:6px; cursor:pointer;">',
              '+1 Stock',
            '</button>',
          '</div>'
        ].join('');
      }).join('');

      modal.innerHTML = [
        '<div style="background:#0f172a; border:1px solid rgba(16,185,129,0.3); border-radius:24px; max-width:480px; width:100%; max-height:90vh; overflow-y:auto; color:#f8fafc; box-shadow:0 25px 50px rgba(0,0,0,0.8); display:flex; flex-direction:column; position:relative;">',
          '<!-- Header -->',
          '<div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">',
            '<div style="display:flex; align-items:center; gap:8px;">',
              '<span style="font-size:22px;">📷</span>',
              '<div>',
                '<strong style="font-size:15px; color:#10b981;">Merchant Camera Barcode Scanner</strong>',
                '<div style="font-size:11px; color:#94a3b8;">Instant 1-Second Stock Counter &amp; POS Lookup</div>',
              '</div>',
            '</div>',
            '<button onclick="window.pahadiScanner.closeModal()" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">✕</button>',
          '</div>',

          '<!-- Camera Viewfinder with Laser Scanner Line -->',
          '<div style="position:relative; height:220px; background:#000; display:flex; align-items:center; justify-content:center; overflow:hidden; border-bottom:1px solid rgba(255,255,255,0.08);">',
            '<div style="position:absolute; width:180px; height:120px; border:2px dashed #10b981; border-radius:12px; display:flex; align-items:center; justify-content:center;">',
              '<span style="font-size:11px; color:#34d399; font-weight:700;">ALIGN BARCODE HERE</span>',
            '</div>',
            '<div id="scannerLaser" style="position:absolute; width:220px; height:2px; background:#ef4444; box-shadow:0 0 12px #ef4444; animation:laserSweep 1.8s infinite alternate;"></div>',
            '<div style="position:absolute; bottom:10px; font-size:11px; color:#94a3b8; background:rgba(0,0,0,0.6); padding:2px 10px; border-radius:10px;">',
              'Point camera at product packaging barcode',
            '</div>',
          '</div>',

          '<!-- Scan Feedback Notification Result Area -->',
          '<div id="scanResultArea" style="padding:14px 20px; background:#1e293b; border-bottom:1px solid rgba(255,255,255,0.06);">',
            '<div style="font-size:11px; color:#94a3b8; font-weight:700;">LAST SCANNED PRODUCT:</div>',
            '<div id="scannedProductTitle" style="font-size:14px; font-weight:800; color:#38bdf8; margin-top:2px;">',
              'Scan a barcode below or tap to simulate',
            '</div>',
            '<div id="scannedProductMeta" style="font-size:11.5px; color:#94a3b8; margin-top:2px;">',
              'Ready for camera detection',
            '</div>',
          '</div>',

          '<!-- 1-Click Barcode Clickers -->',
          '<div style="padding:16px 20px; flex:1;">',
            '<div style="font-size:11px; color:#94a3b8; font-weight:700; margin-bottom:10px;">',
              'STORE BARCODE PRESETS (TAP TO SCAN &amp; ADD STOCK):',
            '</div>',
            '<div style="display:flex; flex-direction:column; gap:8px;">',
              itemsHtml,
            '</div>',
          '</div>',

          '<!-- Footer -->',
          '<div style="padding:12px 20px; background:#0b1322; text-align:right;">',
            '<button onclick="window.pahadiScanner.closeModal()" style="background:#334155; color:#f1f5f9; border:none; padding:8px 18px; border-radius:8px; font-weight:700; font-size:12px; cursor:pointer;">',
              'Close Scanner',
            '</button>',
          '</div>',
        '</div>'
      ].join('');

      if (!document.getElementById('laserStyles')) {
        const style = document.createElement('style');
        style.id = 'laserStyles';
        style.innerHTML = '@keyframes laserSweep { 0% { top: 50px; } 100% { top: 170px; } }';
        document.head.appendChild(style);
      }

      document.body.appendChild(modal);
    }

    triggerScan(barcode) {
      const item = this.barcodeItems.find(b => b.barcode === barcode);
      if (!item) return;

      this.playLaserBeep();
      item.stock += 1;

      const titleEl = document.getElementById('scannedProductTitle');
      const metaEl = document.getElementById('scannedProductMeta');
      if (titleEl) {
        titleEl.innerText = item.icon + ' ' + item.name;
        titleEl.style.color = '#34d399';
      }
      if (metaEl) {
        metaEl.innerText = '✅ Barcode ' + item.barcode + ' Matched! New Stock: ' + item.stock + ' units (₹' + item.price + ')';
      }

      if ('speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(
          item.name.split('(')[0] + ' ka stock ek badha diya gaya hai.'
        );
        speech.lang = 'hi-IN';
        speech.rate = 1.05;
        window.speechSynthesis.speak(speech);
      }
    }

    playLaserBeep() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } catch(e) {
        console.log('AudioContext not allowed without interaction:', e);
      }
    }

    closeModal() {
      const modal = document.getElementById('barcodeScannerModal');
      if (modal) modal.remove();
    }
  }

  window.pahadiScanner = new PahadiBarcodeScanner();
})();
