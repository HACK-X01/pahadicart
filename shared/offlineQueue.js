// PahadiCart Deep Mountain Valley & Tunnel Offline Queue Engine
(function() {
  const OFFLINE_STORAGE_KEY = 'pahadicart_offline_orders';
  const SIMULATED_OFFLINE_KEY = 'pahadicart_sim_offline';

  class PahadiOfflineQueue {
    constructor() {
      this.isSimulatedOffline = localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
      this.initListeners();
      this.checkAndRenderBanner();
    }

    isOnline() {
      if (this.isSimulatedOffline) return false;
      return navigator.onLine;
    }

    toggleSimulatedTunnel() {
      this.isSimulatedOffline = !this.isSimulatedOffline;
      localStorage.setItem(SIMULATED_OFFLINE_KEY, this.isSimulatedOffline ? 'true' : 'false');
      this.checkAndRenderBanner();
      
      if (this.isOnline()) {
        this.flushQueue();
      }
      return !this.isSimulatedOffline;
    }

    initListeners() {
      window.addEventListener('online', () => {
        if (!this.isSimulatedOffline) {
          this.checkAndRenderBanner();
          this.flushQueue();
        }
      });

      window.addEventListener('offline', () => {
        this.checkAndRenderBanner();
      });
    }

    getQueue() {
      try {
        return JSON.parse(localStorage.getItem(OFFLINE_STORAGE_KEY)) || [];
      } catch (e) {
        return [];
      }
    }

    saveQueue(queue) {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue));
      this.updateBadge();
    }

    enqueueOrder(orderData) {
      const queue = this.getQueue();
      orderData.offlineQueuedAt = new Date().toISOString();
      orderData.status = 'queued_offline';
      queue.push(orderData);
      this.saveQueue(queue);
      this.showToast('📶 Order queued offline! Will auto-sync when cell signal returns.');
      return orderData;
    }

    flushQueue() {
      const queue = this.getQueue();
      if (queue.length === 0) return;

      console.log('📶 Flushing ' + queue.length + ' offline orders to PahadiCart network...');
      
      queue.forEach(order => {
        order.status = 'placed';
        order.syncedAt = new Date().toLocaleTimeString();
        if (window.pahadiBus) {
          window.pahadiBus.placeOrder(order);
        }
      });

      const count = queue.length;
      this.saveQueue([]);
      
      if (window.hillAudio && window.hillAudio.playMerchantChime) {
        window.hillAudio.playMerchantChime();
      }

      this.showToast('⚡ Mountain Signal Restored! ' + count + ' offline order(s) successfully synced to nearest shops!');
      
      // Notify customer app if open
      if (window.customerApp && typeof window.customerApp.renderProducts === 'function') {
        window.customerApp.renderProducts();
      }
    }

    checkAndRenderBanner() {
      let banner = document.getElementById('deepValleyOfflineBanner');
      const online = this.isOnline();

      if (!online) {
        if (!banner) {
          banner = document.createElement('div');
          banner.id = 'deepValleyOfflineBanner';
          banner.style.cssText = 'position:fixed; top:0; left:0; right:0; z-index:99999; background:linear-gradient(90deg, #991b1b, #b45309); color:#ffffff; padding:10px 20px; font-size:12.5px; font-weight:700; display:flex; align-items:center; justify-content:space-between; box-shadow:0 4px 14px rgba(0,0,0,0.5); font-family:var(--font-sans, sans-serif);';
          banner.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:16px;">🌲⛰️</span>
              <span><strong>Deep Mountain Valley / Tunnel Mode:</strong> Cellular internet offline. Orders placed now will be safely queued on your device and auto-dispatched once signal returns.</span>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              <span id="offlineQueueCounter" style="background:rgba(0,0,0,0.3); padding:4px 10px; border-radius:12px; font-size:11.5px;">Queue: ${this.getQueue().length} Orders</span>
              <button onclick="window.pahadiOffline.toggleSimulatedTunnel()" style="background:#ffffff; color:#0f172a; border:none; padding:4px 12px; border-radius:6px; font-weight:800; cursor:pointer; font-size:11px;">Exit Tunnel</button>
            </div>
          `;
          document.body.prepend(banner);
        } else {
          banner.style.display = 'flex';
          this.updateBadge();
        }
      } else {
        if (banner) banner.style.display = 'none';
      }
    }

    updateBadge() {
      const counter = document.getElementById('offlineQueueCounter');
      if (counter) counter.innerText = 'Queue: ' + this.getQueue().length + ' Orders';
    }

    showToast(msg) {
      if (typeof showToast === 'function') {
        showToast(msg);
      } else if (window.customerApp && typeof window.customerApp.showToast === 'function') {
        window.customerApp.showToast(msg);
      } else {
        console.log('TOAST:', msg);
      }
    }
  }

  window.pahadiOffline = new PahadiOfflineQueue();
})();
