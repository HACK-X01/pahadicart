
  // Invalidate stale caches to ensure 100% fresh demo-free catalog
  if ('caches' in window && localStorage.getItem('pahadi_sw_cleared_v7') !== 'true') {
    caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))));
    localStorage.setItem('pahadi_sw_cleared_v7', 'true');
  }
﻿// PahadiCart Universal Multi-Device PWA Engine & Service Worker Registration
(function() {
  'use strict';

  // 1. Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration failed:', err);
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

  // 3. Multi-Device Detection
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true || 
                       document.referrer.includes('android-app://');

  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt event captured');
    if (!isStandalone) {
      showInstallBanner();
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] PahadiCart app was successfully installed!');
    deferredPrompt = null;
    const banner = document.getElementById('pahadiPwaInstallBanner');
    if (banner) banner.remove();
    showConnectivityToast('🎉 PahadiCart App successfully installed on your phone!', '#10b981');
  });

  // 4. Universal PWA Interface
  window.PahadiPWA = {
    isInstalled: isStandalone,
    isIOS: isIOS,
    isAndroid: isAndroid,
    hasNativePrompt: () => !!deferredPrompt,
    
    async promptInstall() {
      const triggerDownload = () => {
        const a = document.createElement('a');
        a.href = '/PahadiCart.apk';
        a.download = 'PahadiCart.apk';
        a.setAttribute('download', 'PahadiCart.apk');
        document.body.appendChild(a);
        a.click();
        setTimeout(() => a.remove(), 400);
        showConnectivityToast('📲 PahadiCart App download shuru ho gaya hai! Downloads check karein.', '#10b981');
      };

      // 1. If native PWA prompt is ready, trigger native install dialog
      if (deferredPrompt) {
        try {
          deferredPrompt.prompt();
          const choice = await deferredPrompt.userChoice;
          console.log('[PWA] User choice outcome:', choice.outcome);
          if (choice.outcome === 'accepted') {
            deferredPrompt = null;
            const banner = document.getElementById('pahadiPwaInstallBanner');
            if (banner) banner.remove();
            showConnectivityToast('✅ PahadiCart App install ho raha hai!', '#10b981');
            return;
          }
        } catch (err) {
          console.warn('[PWA] deferredPrompt failed, proceeding to direct download:', err);
        }
      }

      // 2. If iOS Safari (does not support APK execution)
      if (isIOS) {
        openInstallModal('ios');
        return;
      }

      // 3. For Android and Desktop: Trigger immediate direct download!
      triggerDownload();

      const banner = document.getElementById('pahadiPwaInstallBanner');
      if (banner) {
        setTimeout(() => banner.remove(), 1500);
      }
    },

    openGuide(platform) {
      openInstallModal(platform);
    }
  };

  // 5. Build Universal Installation Modal
  function createModalDom() {
    if (document.getElementById('pahadiPwaInstallModal')) return;

    const modal = document.createElement('div');
    modal.id = 'pahadiPwaInstallModal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(3, 7, 18, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 9999999;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
      font-family: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
    `;

    const initialTab = isIOS ? 'ios' : (isAndroid ? 'android' : 'desktop');

    modal.innerHTML = `
      <div style="background: #0f172a; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 24px; max-width: 440px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(16, 185, 129, 0.15); overflow: hidden; animation: popPwaModal 0.25s ease-out;">
        <!-- Header -->
        <div style="padding: 18px 20px; background: linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0) 100%); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="/icons/icon-192.png" alt="PahadiCart" style="width: 42px; height: 42px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
            <div>
              <div style="font-size: 16px; font-weight: 800; color: #ffffff;">Download & Install App</div>
              <div style="font-size: 12px; color: #10b981; font-weight: 600;">Har Mobile me Chalta Hai • 100% Free</div>
            </div>
          </div>
          <button id="closePwaModalBtn" style="background: rgba(255,255,255,0.08); border: none; color: #94a3b8; width: 32px; height: 32px; border-radius: 50%; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">&times;</button>
        </div>

        <!-- Platform Tabs -->
        <div style="display: flex; padding: 10px 16px; gap: 6px; background: #090f1f; border-bottom: 1px solid rgba(255,255,255,0.06);">
          <button class="pwa-tab-btn" data-tab="ios" style="flex: 1; padding: 8px 6px; border-radius: 10px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; background: transparent; color: #94a3b8;">
            🍎 iPhone (iOS)
          </button>
          <button class="pwa-tab-btn" data-tab="android" style="flex: 1; padding: 8px 6px; border-radius: 10px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; background: transparent; color: #94a3b8;">
            🤖 Android
          </button>
          <button class="pwa-tab-btn" data-tab="desktop" style="flex: 1; padding: 8px 6px; border-radius: 10px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; background: transparent; color: #94a3b8;">
            💻 PC / Laptop
          </button>
        </div>

        <!-- Tab 1: iOS -->
        <div id="pwaTabContentIos" class="pwa-tab-body" style="padding: 20px; display: none;">
          <div style="font-size: 13.5px; font-weight: 700; color: #f8fafc; margin-bottom: 14px;">
            iPhone / iPad par PahadiCart install karne ke aasan steps:
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(16,185,129,0.2); color: #10b981; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px;">1</div>
              <div style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">
                Safari browser me neeche <b>Share icon</b> <span style="display: inline-block; background: rgba(255,255,255,0.15); padding: 2px 7px; border-radius: 6px; font-size: 14px;">⎋</span> par tap karein.
              </div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(16,185,129,0.2); color: #10b981; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px;">2</div>
              <div style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">
                Thoda neeche scroll karke <b>"Add to Home Screen"</b> <span style="display: inline-block; background: rgba(255,255,255,0.15); padding: 2px 7px; border-radius: 6px; font-size: 12px;">➕ Add to Home Screen</span> select karein.
              </div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(16,185,129,0.2); color: #10b981; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px;">3</div>
              <div style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">
                Upar right corner me <b>"Add"</b> dabayein. PahadiCart aapke iPhone ke Home Screen par app ban kar aa jayega!
              </div>
            </div>
          </div>
          <div style="margin-top: 16px; padding: 10px 12px; background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.25); border-radius: 12px; font-size: 11.5px; color: #38bdf8;">
            💡 Note: Yeh official Apple PWA standard hai. Bina App Store ke direct install ho jata hai!
          </div>
        </div>

        <!-- Tab 2: Android -->
        <div id="pwaTabContentAndroid" class="pwa-tab-body" style="padding: 20px; display: none;">
          <div id="pwaNativeAndroidSection" style="display: none; margin-bottom: 16px;">
            <button id="pwaDirectInstallBtn" style="width: 100%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; border: none; padding: 12px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 14px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center; gap: 8px;">
              📲 Direct Install Karein (1-Tap)
            </button>
            <div style="text-align: center; font-size: 11px; color: #64748b; margin-top: 8px;">— Ya phir neeche diye steps follow karein —</div>
          </div>

          <div style="font-size: 13.5px; font-weight: 700; color: #f8fafc; margin-bottom: 14px;">
            Kisi bhi Android Phone (Chrome, Samsung, Redmi, Vivo, Oppo) me:
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(16,185,129,0.2); color: #10b981; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px;">1</div>
              <div style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">
                Browser ke upar ya neeche <b>3 Dots Menu (⋮)</b> par click karein.
              </div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(16,185,129,0.2); color: #10b981; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px;">2</div>
              <div style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">
                Menu me <b>"Install app"</b> ya <b>"Add to Home screen"</b> (📲) option choose karein.
              </div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(16,185,129,0.2); color: #10b981; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px;">3</div>
              <div style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">
                Pop-up me <b>"Install"</b> confirm karein. App turant download ho kar home screen par aa jayega!
              </div>
            </div>
          </div>
          <div style="margin-top: 16px; padding: 10px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; font-size: 11.5px; color: #34d399;">
            ⚡ Faayda: Offline order status, battery saver GPS telemetry, aur tez mountain speed!
          </div>
        </div>

        <!-- Tab 3: Desktop -->
        <div id="pwaTabContentDesktop" class="pwa-tab-body" style="padding: 20px; display: none;">
          <div style="font-size: 13.5px; font-weight: 700; color: #f8fafc; margin-bottom: 14px;">
            Computer ya Laptop (Chrome / Edge / Brave):
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(16,185,129,0.2); color: #10b981; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px;">1</div>
              <div style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">
                Browser address bar (URL) ke right side me <b>Install icon</b> <span style="display: inline-block; background: rgba(255,255,255,0.15); padding: 2px 7px; border-radius: 6px; font-size: 12px;">⊕ Install</span> dekhein.
              </div>
            </div>
            <div style="display: flex; gap: 12px; align-items: flex-start;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(16,185,129,0.2); color: #10b981; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px;">2</div>
              <div style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">
                Ya 3 dots menu (⋮) me jaakar <b>"Install PahadiCart"</b> par click karein.
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 12px 20px; background: #090f1f; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: flex-end;">
          <button id="pwaModalGotItBtn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">
            Samajh Gaya (Got it)
          </button>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes popPwaModal {
        from { transform: scale(0.92); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .pwa-tab-btn.active {
        background: rgba(16, 185, 129, 0.2) !important;
        color: #10b981 !important;
        border: 1px solid rgba(16, 185, 129, 0.4) !important;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Tab switcher logic
    const tabBtns = modal.querySelectorAll('.pwa-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        selectTab(tab);
      });
    });

    function selectTab(tab) {
      tabBtns.forEach(b => {
        if (b.getAttribute('data-tab') === tab) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      document.getElementById('pwaTabContentIos').style.display = tab === 'ios' ? 'block' : 'none';
      document.getElementById('pwaTabContentAndroid').style.display = tab === 'android' ? 'block' : 'none';
      document.getElementById('pwaTabContentDesktop').style.display = tab === 'desktop' ? 'block' : 'none';
      
      const nativeSec = document.getElementById('pwaNativeAndroidSection');
      if (nativeSec) {
        nativeSec.style.display = (tab === 'android' && deferredPrompt) ? 'block' : 'none';
      }
    }

    selectTab(initialTab);

    // Direct Android 1-tap install if available
    const directBtn = document.getElementById('pwaDirectInstallBtn');
    if (directBtn) {
      directBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log('[PWA] Outcome:', outcome);
          deferredPrompt = null;
        }
        modal.style.display = 'none';
      });
    }

    const closeBtn = document.getElementById('closePwaModalBtn');
    const gotItBtn = document.getElementById('pwaModalGotItBtn');
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    if (gotItBtn) gotItBtn.onclick = () => modal.style.display = 'none';
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  }

  function openInstallModal(platform) {
    createModalDom();
    const modal = document.getElementById('pahadiPwaInstallModal');
    if (!modal) return;
    
    if (platform) {
      const btn = modal.querySelector(`.pwa-tab-btn[data-tab="${platform}"]`);
      if (btn) btn.click();
    }
    modal.style.display = 'flex';
  }

  // 6. Floating Smart Install Banner
  function showInstallBanner() {
    if (isStandalone) return;
    if (document.getElementById('pahadiPwaInstallBanner')) return;

    // Check if dismissed in last 6 hours
    const lastDismissed = localStorage.getItem('pahadi_pwa_banner_dismissed_at');
    if (lastDismissed && (Date.now() - parseInt(lastDismissed, 10)) < (6 * 3600 * 1000)) {
      return;
    }

    const banner = document.createElement('div');
    banner.id = 'pahadiPwaInstallBanner';
    banner.style.cssText = `
      position: fixed;
      bottom: max(16px, env(safe-area-inset-bottom, 16px));
      left: 50%;
      transform: translateX(-50%);
      z-index: 999998;
      background: rgba(11, 19, 41, 0.95);
      border: 1px solid rgba(16, 185, 129, 0.4);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.8), 0 0 24px rgba(16, 185, 129, 0.25);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-radius: 18px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 440px;
      width: calc(100% - 24px);
      box-sizing: border-box;
      color: #fff;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      animation: slideUpPwa 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    banner.innerHTML = `
      <img src="/icons/icon-192.png" alt="PahadiCart" style="width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.4);" />
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 13px; font-weight: 800; color: #fff; line-height: 1.25;">Install PahadiCart App</div>
        <div style="font-size: 11px; color: #34d399; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Direct APK Download & Fast Hill GPS</div>
      </div>
      <button id="pwaInstallNowBtn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; border: none; padding: 7px 12px; border-radius: 10px; font-size: 11.5px; font-weight: 800; cursor: pointer; white-space: nowrap; box-shadow: 0 4px 12px rgba(16,185,129,0.3); display: flex; align-items: center; gap: 4px;">
        📲 Download App</button>
      <button id="pwaDismissBannerBtn" style="background: transparent; border: none; color: #64748b; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1;" title="Dismiss">&times;</button>
    `;

    const animStyle = document.createElement('style');
    animStyle.textContent = `
      @keyframes slideUpPwa {
        from { transform: translate(-50%, 40px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
    `;
    document.head.appendChild(animStyle);
    document.body.appendChild(banner);

    document.getElementById('pwaInstallNowBtn').addEventListener('click', () => {
      window.PahadiPWA.promptInstall();
    });

    document.getElementById('pwaDismissBannerBtn').addEventListener('click', () => {
      localStorage.setItem('pahadi_pwa_banner_dismissed_at', Date.now().toString());
      banner.remove();
    });
  }

  // Auto trigger banner on non-standalone mobile devices after a short 2s engagement
  window.addEventListener('DOMContentLoaded', () => {
    if (!isStandalone) {
      setTimeout(() => {
        showInstallBanner();
      }, 2000);
    }
  });

  // 7. Offline / Online Connectivity Alerts
  window.addEventListener('offline', () => {
    showConnectivityToast('📡 Mountain Network Offline: Cached local orders active.', '#f59e0b');
  });

  window.addEventListener('online', () => {
    showConnectivityToast('🟢 Connected: Real-time Himachal Edge Gateway active.', '#10b981');
  });

  function showConnectivityToast(msg, color) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: max(16px, env(safe-area-inset-top, 16px));
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
      text-align: center;
      max-width: 90%;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
})();
