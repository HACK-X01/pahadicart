/**
 * Jeevanix Local — Universal Real-Time Cloud Sync Engine
 * Enables multi-phone synchronization across Customer, Merchant, Rider, and Founder Admin.
 * Uses native Server-Sent Events (SSE) with automatic fallback to offline local cache.
 */

(function() {
  'use strict';

  const STORAGE_KEY_ORDERS = 'pahadicart_live_orders';
  const STORAGE_KEY_SETTINGS = 'jeevanix_upi_settings';

  class JeevanixCloudSync {
    constructor() {
      this.isConnected = false;
      this.eventSource = null;
      this.reconnectTimer = null;
      this.apiBase = window.location.origin;

      this.init();
    }

    init() {
      this.fetchInitialSettings();
      this.fetchInitialOrders();
      this.connectSse();
      this.listenToWindowEvents();
    }

    // Connect to Server-Sent Events for instant cross-device updates
    connectSse() {
      if (typeof EventSource === 'undefined') return;
      if (this.eventSource) {
        try { this.eventSource.close(); } catch(e) {}
      }

      try {
        this.eventSource = new EventSource(this.apiBase + '/api/sync/stream');

        this.eventSource.addEventListener('connected', () => {
          this.isConnected = true;
          this.broadcastStatus(true);
        });

        this.eventSource.addEventListener('ORDER_CREATED', (e) => {
          try {
            const newOrder = JSON.parse(e.data);
            this.handleIncomingOrder(newOrder);
          } catch(err) {
            console.warn('[CloudSync] Error parsing ORDER_CREATED:', err);
          }
        });

        this.eventSource.addEventListener('ORDER_UPDATED', (e) => {
          try {
            const updatedOrder = JSON.parse(e.data);
            this.handleOrderUpdated(updatedOrder);
          } catch(err) {
            console.warn('[CloudSync] Error parsing ORDER_UPDATED:', err);
          }
        });

        this.eventSource.addEventListener('SETTINGS_UPDATED', (e) => {
          try {
            const settings = JSON.parse(e.data);
            localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
            if (window.pahadiBus) {
              window.pahadiBus.broadcast('UPI_SETTINGS_UPDATED', settings);
            }
          } catch(err) {
            console.warn('[CloudSync] Error parsing SETTINGS_UPDATED:', err);
          }
        });

        this.eventSource.onerror = () => {
          this.isConnected = false;
          this.broadcastStatus(false);
          try { this.eventSource.close(); } catch(e) {}
          // Reconnect after 4s (hill network resilience)
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => this.connectSse(), 4000);
        };
      } catch (err) {
        console.warn('[CloudSync] SSE connection error:', err);
      }
    }

    broadcastStatus(isOnline) {
      const indicator = document.getElementById('cloudSyncIndicator');
      if (indicator) {
        indicator.style.background = isOnline ? '#10b981' : '#f59e0b';
        indicator.title = isOnline ? 'Cloud Sync: Connected' : 'Cloud Sync: Local Offline Cache';
      }
    }

    // Handle new order received from server
    handleIncomingOrder(order) {
      if (!order || !order.id) return;

      // Update local storage
      try {
        let orders = [];
        const raw = localStorage.getItem(STORAGE_KEY_ORDERS) || localStorage.getItem('pahadicart_orders_db');
        if (raw) orders = JSON.parse(raw);
        if (!orders.find(o => o.id === order.id)) {
          orders.unshift(order);
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
          localStorage.setItem('pahadicart_orders_db', JSON.stringify(orders));
        }
      } catch(e) {}

      // Play chime on Merchant & Admin dashboards
      this.playOrderAlertSound();

      // Show toast if available
      if (typeof window.showToast === 'function') {
        window.showToast('🔔 Naya Order: #' + order.id + ' (₹' + (order.total || order.grandTotal || '') + ')', 'success');
      }

      // Notify in-page event systems
      if (window.pahadiBus) {
        window.pahadiBus.broadcast('ORDER_PLACED', order);
      }
      if (window.eventBus && window.eventBus.emit) {
        window.eventBus.emit('ORDER_PLACED', order);
      }

      // If on payments desk, re-render
      if (window.PaymentsDesk && typeof window.PaymentsDesk.render === 'function') {
        window.PaymentsDesk.render();
      }
    }

    // Handle order updates (status, payment verification, dispatch)
    handleOrderUpdated(order) {
      if (!order || !order.id) return;

      try {
        let orders = [];
        const raw = localStorage.getItem(STORAGE_KEY_ORDERS) || localStorage.getItem('pahadicart_orders_db');
        if (raw) orders = JSON.parse(raw);
        const idx = orders.findIndex(o => o.id === order.id);
        if (idx !== -1) {
          orders[idx] = Object.assign(orders[idx], order);
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
          localStorage.setItem('pahadicart_orders_db', JSON.stringify(orders));
        }
      } catch(e) {}

      if (window.pahadiBus) {
        window.pahadiBus.broadcast('ORDER_STATUS_CHANGED', { orderId: order.id, newStatus: order.status, order });
      }

      // Re-render UI components if visible
      if (window.PaymentsDesk && typeof window.PaymentsDesk.render === 'function') {
        window.PaymentsDesk.render();
      }
      if (window.DbExplorer && typeof window.DbExplorer.render === 'function') {
        window.DbExplorer.render();
      }
    }

    playOrderAlertSound() {
      try {
        if (window.PahadiAudio && typeof window.PahadiAudio.playChime === 'function') {
          window.PahadiAudio.playChime('order_placed');
          return;
        }
        // Fallback Web Audio API chime
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } catch(e) {}
    }

    // Initial server fetch to ensure device has freshest data
    async fetchInitialOrders() {
      try {
        const res = await fetch(this.apiBase + '/api/orders');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(data.orders));
          localStorage.setItem('pahadicart_orders_db', JSON.stringify(data.orders));
          console.log('[CloudSync] Synced ' + data.orders.length + ' orders from cloud server.');
        }
      } catch(e) {}
    }

    async fetchInitialSettings() {
      try {
        const res = await fetch(this.apiBase + '/api/settings');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.settings) {
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data.settings));
        }
      } catch(e) {}
    }

    // Public method: Create order in cloud
    async createOrder(order) {
      try {
        const res = await fetch(this.apiBase + '/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
        if (res.ok) {
          const result = await res.json();
          return result.order || order;
        }
      } catch(err) {
        console.warn('[CloudSync] Server unreachable, using local fallback:', err);
      }
      // Fallback local save
      this.handleIncomingOrder(order);
      return order;
    }

    // Public method: Update order status
    async updateOrderStatus(orderId, updates) {
      try {
        const res = await fetch(this.apiBase + '/api/orders/' + encodeURIComponent(orderId), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (res.ok) {
          const result = await res.json();
          return result.order;
        }
      } catch(err) {
        console.warn('[CloudSync] Server update failed, saving locally:', err);
      }
      this.handleOrderUpdated(Object.assign({ id: orderId }, updates));
      return Object.assign({ id: orderId }, updates);
    }

    // Public method: Update Founder UPI settings
    async saveUpiSettings(vpa, businessName) {
      const payload = {
        upiVpa: vpa.trim(),
        businessName: businessName.trim()
      };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(payload));
      try {
        await fetch(this.apiBase + '/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch(e) {}
      if (window.pahadiBus) {
        window.pahadiBus.broadcast('UPI_SETTINGS_UPDATED', payload);
      }
      return payload;
    }

    getUpiSettings() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (saved) return JSON.parse(saved);
      } catch(e) {}
      return {
        upiVpa: 'jeevanix@okhdfcbank',
        businessName: 'Jeevanix Local'
      };
    }

    listenToWindowEvents() {
      window.addEventListener('online', () => {
        this.connectSse();
        this.fetchInitialOrders();
      });
      window.addEventListener('offline', () => {
        this.broadcastStatus(false);
      });
    }
  }

  window.JeevanixCloudSync = new JeevanixCloudSync();
})();
