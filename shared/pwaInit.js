// PahadiCart Universal PWA Manager & Service Worker Registration
(function() {
  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('🏔️ [PWA] ServiceWorker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('⚠️ [PWA] ServiceWorker registration failed:', err);
        });
    });
  }

  // 2. Global Session Helpers
  window.PahadiAuth = {
    getSession() {
      try {
        const s = localStorage.getItem('pahadicart_user_session');
        return s ? JSON.parse(s) : null;
      } catch (e) {
        return null;
      }
    },
    setSession(data) {
      localStorage.setItem('pahadicart_user_session', JSON.stringify(data));
      sessionStorage.setItem('pahadicart_auth_role', data.role);
    },
    logout() {
      localStorage.removeItem('pahadicart_user_session');
      sessionStorage.removeItem('pahadicart_auth_role');
      window.location.href = '/';
    },
    switchRole() {
      window.location.href = '/';
    }
  };

  // 3. Floating PWA Install Prompt Banner
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  function showInstallBanner() {
    if (document.getElementById('pahadiPwaInstallBanner')) return;
    if (localStorage.getItem('pahadi_pwa_banner_dismissed')) return;

    const banner = document.createElement('div');
    banner.id = 'pahadiPwaInstallBanner';
    banner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      background: rgba(15, 23, 42, 0.94);
      border: 1px solid rgba(16, 185, 129, 0.4);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.8), 0 0 24px rgba(16, 185, 129, 0.25);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-radius: 18px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: 440px;
      width: calc(100% - 32px);
      color: #fff;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      animation: slideUpPwa 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    banner.innerHTML = `
      <img src="/icons/icon-192.png" alt="PahadiCart" style="width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.4);" />
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 13.5px; font-weight: 800; color: #fff; line-height: 1.3;">Install PahadiCart App</div>
        <div style="font-size: 11.5px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Faster hill GPS, offline orders & battery tracking</div>
      </div>
      <button id="pwaInstallNowBtn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; border: none; padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 800; cursor: pointer; white-space: nowrap; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">
        📲 Install
      </button>
      <button id="pwaDismissBannerBtn" style="background: transparent; border: none; color: #64748b; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1;">
        &times;
      </button>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUpPwa {
        from { transform: translate(-50%, 30px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(banner);

    document.getElementById('pwaInstallNowBtn').addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User choice outcome:', outcome);
        deferredPrompt = null;
      }
      banner.remove();
    });

    document.getElementById('pwaDismissBannerBtn').addEventListener('click', () => {
      localStorage.setItem('pahadi_pwa_banner_dismissed', 'true');
      banner.remove();
    });
  }

  // 4. Offline Connectivity Indicator
  window.addEventListener('offline', () => {
    showConnectivityToast('📡 Offline Mode: Mountain network disconnected. Cached local orders active.', '#f59e0b');
  });

  window.addEventListener('online', () => {
    showConnectivityToast('🟢 Back Online: Re-connected to Himachal Edge Gateway.', '#10b981');
  });

  function showConnectivityToast(msg, color) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      border: 1px solid ${color};
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      z-index: 9999999;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }
})();
