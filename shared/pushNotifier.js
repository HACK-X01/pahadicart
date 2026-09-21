// PahadiCart Universal Web Push & Order Sound Chime Engine
(function() {
  'use strict';

  class PahadiPushNotifier {
    constructor() {
      this.isSupported = ('Notification' in window);
      this.swRegistration = null;
      this.activeAlertBanner = null;

      this.initServiceWorker();
      this.setupBusListeners();
      this.injectPermissionPrompt();
    }

    async initServiceWorker() {
      if ('serviceWorker' in navigator) {
        try {
          this.swRegistration = await navigator.serviceWorker.ready;
          console.log('[Notifier] SW Registration ready for Web Push');
        } catch (e) {
          console.warn('[Notifier] SW ready error:', e);
        }
      }
    }

    getPermission() {
      return this.isSupported ? Notification.permission : 'unsupported';
    }

    async requestPermission() {
      if (!this.isSupported) {
        alert('Web Notifications are not supported in this browser.');
        return 'unsupported';
      }

      // Initialize audio on user gesture
      if (window.pahadiAudio) {
        window.pahadiAudio.init();
      }

      try {
        const permission = await Notification.requestPermission();
        console.log('[Notifier] Permission result:', permission);

        if (permission === 'granted') {
          // Play test welcome chime
          if (window.pahadiAudio) {
            window.pahadiAudio.playSuccessTune();
          }

          // Send confirmation system notification
          this.dispatchSystemNotification(
            '🔔 Sound & Push Alerts Active!',
            'PahadiCart order chimes & push alerts are now live.',
            'test-welcome',
            window.location.pathname
          );

          // Remove permission prompt banner if present
          const prompt = document.getElementById('pahadiPushPermissionPrompt');
          if (prompt) prompt.remove();

          // Update any toggle buttons
          this.updateToggleButtons(true);
        }
        return permission;
      } catch (err) {
        console.warn('[Notifier] Permission request error:', err);
        return 'denied';
      }
    }

    // Dispatch Native System Notification
    async dispatchSystemNotification(title, body, tag, targetUrl) {
      if (this.getPermission() !== 'granted') return;

      const options = {
        body: body || 'New update from PahadiCart.',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: tag || 'pahadi-order-' + Date.now(),
        vibrate: [250, 100, 250, 100, 250],
        data: {
          url: targetUrl || window.location.pathname
        },
        actions: [
          { action: 'open', title: '👀 View Order' },
          { action: 'close', title: '✕ Dismiss' }
        ]
      };

      try {
        if (this.swRegistration && this.swRegistration.showNotification) {
          await this.swRegistration.showNotification(title, options);
        } else {
          new Notification(title, options);
        }
      } catch (e) {
        try {
          new Notification(title, options);
        } catch (err) {
          console.warn('[Notifier] Fallback notification failed:', err);
        }
      }
    }

    // Trigger Complete Order Alert (Sound Chime + Vibration + Push + In-App Card)
    sendOrderAlert(opts = {}) {
      const {
        role = 'merchant',
        title = '🔔 Naya Order Aaya!',
        body = 'Check incoming order details.',
        orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        amount = null,
        soundType = 'merchant', // 'merchant', 'rider', 'customer'
        repeat = true,
        targetUrl = window.location.pathname
      } = opts;

      // 1. Play Sound Chime
      if (window.pahadiAudio) {
        if (repeat) {
          window.pahadiAudio.startRepeatChime(soundType, soundType === 'rider' ? 5000 : 6500);
        } else {
          if (soundType === 'merchant') window.pahadiAudio.playGharKiGhanti();
          else if (soundType === 'rider') window.pahadiAudio.playRiderPing();
          else window.pahadiAudio.playCustomerUpdateChime();
        }
      }

      // 2. Vibrate Device
      if ('vibrate' in navigator) {
        navigator.vibrate([250, 100, 250, 100, 250]);
      }

      // 3. Dispatch Web Push System Notification
      this.dispatchSystemNotification(title, body, orderId, targetUrl);

      // 4. In-App Floating Visual Audio Card
      this.showFloatingAlertCard({
        title,
        body,
        orderId,
        amount,
        soundType,
        targetUrl
      });
    }

    // Floating Visual In-App Alert Card
    showFloatingAlertCard(data) {
      if (this.activeAlertBanner) {
        this.activeAlertBanner.remove();
      }

      const card = document.createElement('div');
      card.id = 'pahadiOrderAlertBanner';
      card.style.cssText = `
        position: fixed;
        top: max(16px, env(safe-area-inset-top, 16px));
        left: 50%;
        transform: translateX(-50%);
        max-width: 440px;
        width: calc(100% - 24px);
        background: rgba(13, 41, 36, 0.96);
        border: 2px solid #F28C28;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85), 0 0 30px rgba(242, 140, 40, 0.35);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-radius: 16px;
        padding: 14px 16px;
        z-index: 9999999;
        color: #fff;
        font-family: 'Inter', system-ui, sans-serif;
        animation: slideDownAlert 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      `;

      card.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; animation: pulseChimeIcon 1.2s infinite;">
            🔔
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 14px; font-weight: 800; color: #10b981; line-height: 1.2;">${data.title}</span>
              <span style="font-size: 10.5px; background: rgba(245,158,11,0.2); color: #f59e0b; border: 1px solid rgba(245,158,11,0.4); padding: 2px 6px; border-radius: 6px; font-weight: 800;">
                🔊 LIVE CHIME
              </span>
            </div>
            <div style="font-size: 12.5px; color: #e2e8f0; margin-top: 4px; font-weight: 600; line-height: 1.35;">
              ${data.body}
            </div>
            ${data.amount ? `<div style="font-size: 12px; color: #38bdf8; font-weight: 700; margin-top: 2px;">Total: ₹${data.amount}</div>` : ''}
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 10px;">
          <button id="btnAcknowledgeAlert" style="flex: 1; background: #F28C28; color: #fff; border: none; padding: 8px 12px; border-radius: 12px; font-size: 12.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(242,140,40,0.35);">
            ✓ Acknowledge / View
          </button>
          <button id="btnMuteAlert" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; padding: 8px 14px; border-radius: 12px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;">
            🔇 Mute
          </button>
        </div>
      `;

      const animStyle = document.createElement('style');
      animStyle.textContent = `
        @keyframes slideDownAlert {
          from { transform: translate(-50%, -40px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes pulseChimeIcon {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 8px #10b981); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(animStyle);
      document.body.appendChild(card);
      this.activeAlertBanner = card;

      const dismiss = () => {
        if (window.pahadiAudio) {
          window.pahadiAudio.stopRepeatChime();
        }
        if (card) card.remove();
        this.activeAlertBanner = null;
      };

      document.getElementById('btnAcknowledgeAlert').onclick = dismiss;
      document.getElementById('btnMuteAlert').onclick = () => {
        if (window.pahadiAudio) {
          window.pahadiAudio.stopRepeatChime();
        }
        document.getElementById('btnMuteAlert').innerText = '🔇 Muted';
      };

      // Auto dismiss banner after 30 seconds if unhandled
      setTimeout(() => {
        if (this.activeAlertBanner === card) {
          dismiss();
        }
      }, 30000);
    }

    // Permission Prompt Banner for Merchant & Rider
    injectPermissionPrompt() {
      if (!this.isSupported) return;
      if (Notification.permission === 'granted' || Notification.permission === 'denied') return;

      const path = window.location.pathname;
      const isTargetPortal = path.includes('/merchant') || path.includes('/rider') || path.includes('/customer');
      if (!isTargetPortal) return;

      window.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('pahadiPushPermissionPrompt')) return;

        const banner = document.createElement('div');
        banner.id = 'pahadiPushPermissionPrompt';
        banner.style.cssText = `
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(14, 165, 233, 0.14) 100%);
          border: 1px solid rgba(16, 185, 129, 0.4);
          border-radius: 14px;
          padding: 10px 16px;
          margin: 10px auto;
          max-width: 600px;
          width: calc(100% - 24px);
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #f8fafc;
          font-family: 'Inter', system-ui, sans-serif;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        `;

        banner.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
            <div style="font-size: 22px;">🔔</div>
            <div style="min-width: 0;">
              <div style="font-size: 13px; font-weight: 800; color: #fff;">Turn ON Sound & Order Alerts</div>
              <div style="font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                Live chimes even when your phone screen is locked
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 6px; flex-shrink: 0;">
            <button id="btnEnableNotificationsNow" style="background: #10b981; color: #022c22; border: none; padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer;">
              🔊 Enable Now
            </button>
            <button id="btnDismissNotifyPrompt" style="background: transparent; border: none; color: #64748b; font-size: 18px; cursor: pointer; padding: 0 4px;">
              &times;
            </button>
          </div>
        `;

        // Insert at top of main container
        const insertTarget = document.querySelector('.merchant-header') ||
                             document.querySelector('.rider-top-bar') ||
                             document.querySelector('.navbar') ||
                             document.body;

        if (insertTarget === document.body) {
          document.body.prepend(banner);
        } else {
          insertTarget.parentNode.insertBefore(banner, insertTarget.nextSibling);
        }

        document.getElementById('btnEnableNotificationsNow').onclick = () => {
          this.requestPermission();
        };
        document.getElementById('btnDismissNotifyPrompt').onclick = () => {
          banner.remove();
        };
      });
    }

    updateToggleButtons(isGranted) {
      document.querySelectorAll('.btn-chime-toggle, .chime-btn').forEach(btn => {
        btn.innerHTML = isGranted ? '🔔 Sound: ON' : '🔕 Sound: OFF';
        btn.classList.toggle('active', isGranted);
      });
    }

    // Inter-Portal Event Listeners via window.pahadiBus
    setupBusListeners() {
      const checkAndBind = () => {
        if (!window.pahadiBus) {
          setTimeout(checkAndBind, 300);
          return;
        }

        const path = window.location.pathname;

        // 1. Merchant Terminal Listener
        if (path.includes('/merchant')) {
          window.pahadiBus.on('ORDER_PLACED', (order) => {
            console.log('[Notifier] Merchant received ORDER_PLACED:', order);
            this.sendOrderAlert({
              role: 'merchant',
              title: `🔔 Naya Order #${order.id || 'NEW'} Aaya!`,
              body: `${order.customerName || 'Customer'} • ₹${order.total || 0} (${(order.town || 'Solan').toUpperCase()})`,
              orderId: order.id,
              amount: order.total,
              soundType: 'merchant',
              repeat: true,
              targetUrl: '/merchant/'
            });
          });
        }

        // 2. Rider Cockpit Listener
        if (path.includes('/rider')) {
          const handleRiderOrder = (order) => {
            console.log('[Notifier] Rider received Mission alert:', order);
            this.sendOrderAlert({
              role: 'rider',
              title: `🏍️ Naya Hill Mission #${order.id || 'NEW'}!`,
              body: `Pickup: ${order.storeName || 'Merchant'} ➔ Drop: ${order.dropAddress || 'Mall Road'} (₹85 Payout)`,
              orderId: order.id,
              amount: 85,
              soundType: 'rider',
              repeat: true,
              targetUrl: '/rider/'
            });
          };

          window.pahadiBus.on('ORDER_PLACED', handleRiderOrder);
          window.pahadiBus.on('ORDER_ASSIGNED', handleRiderOrder);
        }

        // 3. Customer Portal Listener
        if (path.includes('/customer')) {
          window.pahadiBus.on('ORDER_STATUS_CHANGED', (update) => {
            console.log('[Notifier] Customer received status update:', update);
            let title = '🛵 PahadiCart Order Update';
            let body = `Your order #${update.id || ''} status is now: ${update.status}`;

            if (update.status === 'PREPARING') {
              title = '👨‍🍳 Store Preparing Order!';
              body = 'Your food & groceries are being freshly packed.';
            } else if (update.status === 'OUT_FOR_DELIVERY') {
              title = '🏍️ Rider Is On The Way!';
              body = 'Hill rider is climbing stairs with your delivery.';
            } else if (update.status === 'DELIVERED') {
              title = '🎉 Order Delivered!';
              body = 'Enjoy your mountain-fresh delivery from PahadiCart.';
            }

            this.sendOrderAlert({
              role: 'customer',
              title,
              body,
              orderId: update.id,
              soundType: 'customer',
              repeat: false,
              targetUrl: '/customer/'
            });
          });
        }
      };

      checkAndBind();
    }
  }

  window.PahadiNotifier = new PahadiPushNotifier();
})();
