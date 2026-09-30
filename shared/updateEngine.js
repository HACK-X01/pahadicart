// PahadiCart & Himora Universal In-App Auto-Update Engine
// Provides instant detection, glowing "Update Available" banner & buttons, 1-tap activation, and cross-portal broadcasting

(function() {
  'use strict';

  class PahadiUpdateManager {
    constructor() {
      this.currentVersion = localStorage.getItem('pahadi_installed_version') || '4.2.0';
      this.serverVersion = '4.3.0';
      this.updatePending = false;
      this.waitingWorker = null;
      this.swRegistration = null;
      this.pollTimer = null;
      this.channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pahadi_app_updates') : null;

      this.init();
    }

    init() {
      // 1. Check if user just refreshed from an update
      if (sessionStorage.getItem('pahadi_just_updated') === 'true') {
        sessionStorage.removeItem('pahadi_just_updated');
        const ver = localStorage.getItem('pahadi_installed_version') || '4.3.0';
        setTimeout(() => {
          this.showCelebrationToast(`🎉 App safaltapoorvak update ho gaya hai (${ver})!`);
        }, 500);
      }

      // 2. Setup BroadcastChannel listener
      if (this.channel) {
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type === 'APP_UPDATE_AVAILABLE') {
            console.log('[UpdateEngine] Received broadcast update:', event.data);
            this.onUpdateDetected(event.data);
          }
        };
      }

      // 3. Setup localStorage cross-window listener
      window.addEventListener('storage', (e) => {
        if (e.key === 'pahadi_latest_broadcast_version') {
          console.log('[UpdateEngine] Storage update detected');
          this.checkForUpdates(false);
        }
      });

      // 4. Setup Service Worker listeners & registration
      this.setupServiceWorker();

      // 5. Periodic & Focus-based version checks
      this.setupPolling();

      // 6. Check once immediately after page load
      if (document.readyState === 'complete') {
        setTimeout(() => this.checkForUpdates(false), 800);
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => this.checkForUpdates(false), 800);
        });
      }

      // Inject styles
      this.injectStyles();
    }

    setupServiceWorker() {
      if (!('serviceWorker' in navigator)) return;

      navigator.serviceWorker.register('/sw.js').then((reg) => {
        this.swRegistration = reg;
        console.log('[UpdateEngine] SW registered with scope:', reg.scope);

        // Check if there is already a waiting service worker
        if (reg.waiting) {
          console.log('[UpdateEngine] Found waiting SW on load');
          this.waitingWorker = reg.waiting;
          this.onServiceWorkerUpdateReady(reg.waiting);
          return;
        }

        // Listen for updates found
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          console.log('[UpdateEngine] New SW installing...');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[UpdateEngine] New SW installed & waiting');
                this.waitingWorker = newWorker;
                this.onServiceWorkerUpdateReady(newWorker);
              } else {
                console.log('[UpdateEngine] SW pre-cached for first run');
              }
            }
          });
        });
      }).catch((err) => {
        console.warn('[UpdateEngine] SW registration failed:', err);
      });

      // Listen for controllerchange (when new worker takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[UpdateEngine] Service Worker controller changed');
      });
    }

    setupPolling() {
      // Check when user switches back to tab/app
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.checkForUpdates(false);
          if (this.swRegistration) {
            try { this.swRegistration.update(); } catch(e) {}
          }
        }
      });

      window.addEventListener('focus', () => {
        this.checkForUpdates(false);
      });

      // Check every 25 seconds
      this.pollTimer = setInterval(() => {
        this.checkForUpdates(false);
        if (this.swRegistration) {
          try { this.swRegistration.update(); } catch(e) {}
        }
      }, 25000);
    }

    async checkForUpdates(manual = false) {
      try {
        if (this.swRegistration) {
          try { await this.swRegistration.update(); } catch(e) {}
        }

        const res = await fetch('/version.json?_t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error('Version fetch returned status ' + res.status);
        const data = await res.json();
        this.serverVersion = data.version;

        const isNewer = this.compareVersions(data.version, this.currentVersion) > 0;
        const forceUpdate = localStorage.getItem('pahadi_simulate_update') === 'true';

        if (isNewer || forceUpdate) {
          console.log(`[UpdateEngine] Update available: v${data.version} (current: v${this.currentVersion})`);
          this.onUpdateDetected(data);
          return true;
        } else {
          console.log(`[UpdateEngine] App is up to date: v${this.currentVersion}`);
          if (manual) {
            this.showCelebrationToast(`✅ Aapka app sabse naye version par hai (v${this.currentVersion})!`);
          }
          return false;
        }
      } catch (err) {
        console.warn('[UpdateEngine] checkForUpdates error:', err);
        if (manual) {
          this.showCelebrationToast(`✅ App connect hai (v${this.currentVersion})`);
        }
        return false;
      }
    }

    compareVersions(v1, v2) {
      if (!v1 || !v2) return 0;
      const parts1 = v1.replace(/[^0-9.]/g, '').split('.').map(n => parseInt(n, 10) || 0);
      const parts2 = v2.replace(/[^0-9.]/g, '').split('.').map(n => parseInt(n, 10) || 0);
      for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const n1 = parts1[i] || 0;
        const n2 = parts2[i] || 0;
        if (n1 > n2) return 1;
        if (n1 < n2) return -1;
      }
      return 0;
    }

    onServiceWorkerUpdateReady(worker) {
      this.waitingWorker = worker;
      this.onUpdateDetected({
        version: this.serverVersion || '4.3.0',
        releaseNotes: 'Taaza features, instant sync aur performance upgrade!'
      });
    }

    onUpdateDetected(data) {
      this.updatePending = true;
      const version = data.version || this.serverVersion || '4.3.0';
      const notes = data.releaseNotes || 'Naye features aur tez mountain delivery engine jud chuka hai.';

      // Hide conflicting PWA install banner if active so they never clash
      const installBanner = document.getElementById('pahadiPwaInstallBanner');
      if (installBanner) installBanner.style.display = 'none';

      // Render Floating In-App Banner
      this.renderUpdateBanner(version, notes);

      // Render Header Button on all portals
      this.renderHeaderUpdateButtons(version);

      // Update Account screen badge if present
      const accountBadge = document.getElementById('accountUpdateBadge');
      if (accountBadge) {
        accountBadge.textContent = 'Update';
        accountBadge.style.display = 'inline-block';
      }

      // Trigger Hill Audio Chime alert if available
      if (window.hillAudio && typeof window.hillAudio.play === 'function') {
        try { window.hillAudio.play('chime'); } catch(e) {}
      }
    }

    renderUpdateBanner(version, notes) {
      let banner = document.getElementById('pahadiUpdateBanner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'pahadiUpdateBanner';
        banner.className = 'pahadi-update-banner';
        document.body.appendChild(banner);
      }

      banner.innerHTML = `
        <div class="update-banner-icon-box">
          <span class="update-rocket">🚀</span>
          <span class="update-beacon"></span>
        </div>
        <div class="update-banner-text">
          <div class="update-title-row">
            <span class="update-heading">Naya Update Aaya Hai!</span>
            <span class="update-badge-pill">v${version} Available</span>
          </div>
          <div class="update-subtext">${notes}</div>
        </div>
        <div class="update-actions">
          <button id="pahadiUpdateNowBtn" class="btn-update-action" onclick="window.PahadiUpdateManager.performUpdate()">
            <span class="btn-icon">⚡</span>
            <span class="btn-text">Update Now</span>
          </button>
          <button class="btn-update-close" onclick="window.PahadiUpdateManager.dismissBanner()" title="Baad me karein">✕</button>
        </div>
      `;

      banner.style.display = 'flex';
      banner.classList.add('visible');
    }

    renderHeaderUpdateButtons(version) {
      // Injects glowing header pill buttons across whatever portal is active
      const headerSelector = '.desktop-nav-right, .merchant-header .header-controls, .rider-top-bar, .top-header .header-right, .home-top-header';
      document.querySelectorAll(headerSelector).forEach((headerEl) => {
        if (!headerEl.querySelector('.header-update-btn')) {
          const btn = document.createElement('button');
          btn.className = 'header-update-btn';
          btn.title = `Naya Update Available (v${version}) - Click karke abhi update karein`;
          btn.innerHTML = `
            <span class="update-dot"></span>
            <span class="update-pill-text">⚡ Update v${version}</span>
          `;
          btn.onclick = () => this.performUpdate();

          // Prepend or insert
          if (headerEl.classList.contains('desktop-nav-right')) {
            headerEl.prepend(btn);
          } else {
            headerEl.insertBefore(btn, headerEl.firstChild);
          }
        }
      });
    }

    dismissBanner() {
      const banner = document.getElementById('pahadiUpdateBanner');
      if (banner) {
        banner.classList.remove('visible');
        setTimeout(() => { banner.style.display = 'none'; }, 300);
      }
    }

    async performUpdate() {
      console.log('[UpdateEngine] User tapped Update Now!');
      const updateBtn = document.getElementById('pahadiUpdateNowBtn');
      if (updateBtn) {
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<span class="update-spinner"></span> Updating...';
      }

      document.querySelectorAll('.header-update-btn').forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = '⏳ Updating...';
      });

      // 1. Tell waiting service worker to skip waiting
      if (this.waitingWorker) {
        this.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      }

      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }

      // 2. Clear all legacy caches
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
          console.log('[UpdateEngine] All local caches purged');
        } catch(e) {}
      }

      // 3. Mark update completed in localStorage & set flag for celebration
      const targetVersion = this.serverVersion || '4.3.0';
      localStorage.setItem('pahadi_installed_version', targetVersion);
      localStorage.removeItem('pahadi_simulate_update');
      sessionStorage.setItem('pahadi_just_updated', 'true');

      // 4. Smooth reload with hard fresh assets
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }

    // Admin trigger: Broadcast update to all connected screens
    broadcastUpdate(customVer = null) {
      const targetVersion = customVer || '4.3.0';
      localStorage.setItem('pahadi_latest_broadcast_version', JSON.stringify({
        version: targetVersion,
        timestamp: Date.now()
      }));

      if (this.channel) {
        this.channel.postMessage({
          type: 'APP_UPDATE_AVAILABLE',
          version: targetVersion,
          releaseNotes: 'PahadiCart Super Network Live Update - Naye features jud chuke hain!'
        });
      }

      this.showCelebrationToast(`📢 Live Update (v${targetVersion}) sabhi devices par broadcast kar diya gaya hai!`);
      this.checkForUpdates(false);
    }

    showCelebrationToast(msg) {
      const toast = document.createElement('div');
      toast.className = 'pahadi-update-toast';
      toast.innerHTML = `
        <span style="font-size: 16px;">🎉</span>
        <span>${msg}</span>
      `;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => toast.remove(), 400);
      }, 4500);
    }

    injectStyles() {
      if (document.getElementById('pahadiUpdateEngineStyles')) return;
      const style = document.createElement('style');
      style.id = 'pahadiUpdateEngineStyles';
      style.textContent = `
        /* Floating Update Banner */
        .pahadi-update-banner {
          position: fixed;
          bottom: max(82px, calc(82px + env(safe-area-inset-bottom, 0px)));
          left: 50%;
          transform: translate(-50%, 60px);
          opacity: 0;
          z-index: 99999999;
          display: none;
          align-items: center;
          gap: 14px;
          background: rgba(9, 14, 23, 0.95);
          border: 1.5px solid #10B981;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(16, 185, 129, 0.35);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 20px;
          padding: 12px 18px;
          max-width: 520px;
          width: calc(100% - 28px);
          box-sizing: border-box;
          color: #FFFFFF;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pahadi-update-banner.visible {
          transform: translate(-50%, 0);
          opacity: 1;
        }

        .update-banner-icon-box {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.15));
          border: 1px solid rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 22px;
        }

        .update-beacon {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 10px #10B981;
          animation: updatePulseRing 1.6s infinite ease-out;
        }

        @keyframes updatePulseRing {
          0% { transform: scale(0.9); opacity: 1; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .update-banner-text {
          flex: 1;
          min-width: 0;
        }

        .update-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .update-heading {
          font-size: 14px;
          font-weight: 800;
          color: #FFFFFF;
          letter-spacing: -0.2px;
        }

        .update-badge-pill {
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid #10B981;
          color: #34D399;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 9999px;
        }

        .update-subtext {
          font-size: 11.5px;
          color: #94A3B8;
          margin-top: 2px;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .update-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-update-action {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: #FFFFFF;
          border: none;
          padding: 9px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-update-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
        }

        .btn-update-action:active {
          transform: scale(0.96);
        }

        .btn-update-close {
          background: transparent;
          border: none;
          color: #64748B;
          font-size: 16px;
          cursor: pointer;
          padding: 6px;
          line-height: 1;
          transition: color 0.15s;
        }

        .btn-update-close:hover {
          color: #CBD5E1;
        }

        /* Top Header Glowing Update Pill */
        .header-update-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1));
          border: 1.5px solid #10B981;
          color: #34D399;
          animation: headerGlowPulse 2s infinite ease-in-out;
          transition: all 0.2s ease;
          user-select: none;
        }

        .header-update-btn:hover {
          background: #10B981;
          color: #FFFFFF;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.5);
        }

        .header-update-btn .update-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }

        @keyframes headerGlowPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); }
          50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); border-color: #34D399; }
        }

        /* Toast */
        .pahadi-update-toast {
          position: fixed;
          top: max(20px, env(safe-area-inset-top, 20px));
          left: 50%;
          transform: translateX(-50%);
          background: #0B131F;
          border: 1.5px solid #10B981;
          color: #FFFFFF;
          padding: 10px 22px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          z-index: 999999999;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          transition: all 0.4s ease;
        }

        .update-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.8s infinite linear;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  window.PahadiUpdateManager = new PahadiUpdateManager();
})();
