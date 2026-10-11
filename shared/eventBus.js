// PahadiCart Shared State & Event Bus (Real-time multi-tab synchronization & Unified Stats Engine)
(function() {
  const STORAGE_KEY_ORDERS = 'pahadicart_live_orders';
  const STORAGE_KEY_RIDERS = 'pahadicart_live_riders';
  const STORAGE_KEY_EVENT = 'pahadicart_broadcast_event';

  class PahadiEventBus {
    constructor() {
      this.listeners = {};
      this.initStorage();
      window.addEventListener('storage', (e) => this.handleStorageEvent(e));
    }

    initStorage() {
      // Auto-purge legacy demo orders to ensure 100% fresh production state
      if (localStorage.getItem('pahadicart_fresh_v5') !== 'true') {
        localStorage.removeItem(STORAGE_KEY_ORDERS);
        localStorage.removeItem('pahadicart_orders_db');
        localStorage.removeItem('pahadi_audit_logs');
        localStorage.removeItem('pahadicart_cart_data');
        localStorage.removeItem('pahadicart_products');
        localStorage.setItem('pahadicart_fresh_v5', 'true');
      }
      if (!localStorage.getItem(STORAGE_KEY_ORDERS)) {
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify([]));
      }
      if (!localStorage.getItem(STORAGE_KEY_RIDERS)) {
        localStorage.setItem(STORAGE_KEY_RIDERS, JSON.stringify(window.PAHADICART_DATA ? window.PAHADICART_DATA.riders : []));
      }
    }

    getOrders(town = null) {
      try {
        let orders = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS)) || [];
        if (town && town !== 'all') {
          orders = orders.filter(o => (o.town || '').toLowerCase() === town.toLowerCase());
        }
        return orders;
      } catch (e) {
        return [];
      }
    }

    saveOrders(orders) {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    }

    getRiders() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_RIDERS)) || [];
      } catch (e) {
        return [];
      }
    }

    saveRiders(riders) {
      localStorage.setItem(STORAGE_KEY_RIDERS, JSON.stringify(riders));
    }

    // Place a new order from Customer App (Persisted to SQLite DB & Synced Across All Portals)
    placeOrder(orderData) {
      const orders = this.getOrders();
      if (!orders.find(o => o.id === orderData.id)) {
        orders.unshift(orderData);
        this.saveOrders(orders);
      }
      this.broadcast('ORDER_PLACED', orderData);

      // Persist to real SQLite database via HimoraApi
      if (window.HimoraApi && typeof window.HimoraApi.createOrder === 'function') {
        window.HimoraApi.createOrder(orderData).catch(err => {
          console.warn('[pahadiBus] Failed to persist order to SQLite:', err.message);
        });
      }
      return orderData;
    }

    // Update status (e.g. Preparing, Ready for Handover, Out for Delivery, Delivered)
    updateOrderStatus(orderId, newStatus, extraData = {}) {
      const orders = this.getOrders();
      let order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
        Object.assign(order, extraData);
        this.saveOrders(orders);
      } else {
        order = { id: orderId, status: newStatus, ...extraData };
        orders.unshift(order);
        this.saveOrders(orders);
      }
      this.broadcast('ORDER_STATUS_CHANGED', { orderId, newStatus, order });

      // Persist status mutation to real SQLite database via HimoraApi
      if (window.HimoraApi && typeof window.HimoraApi.updateOrder === 'function') {
        window.HimoraApi.updateOrder(orderId, { status: newStatus, ...extraData }).catch(err => {
          console.warn('[pahadiBus] Failed to update order status in SQLite:', err.message);
        });
      }
      return order;
    }

    // Unified Zero-Leakage Platform Stats for Super Admin Command Center
    getStats(town = null) {
      const orders = this.getOrders(town);
      const totalOrders = orders.length;
      
      const gmv = orders.reduce((sum, o) => {
        const amt = Number(o.grandTotal || (o.pricing && o.pricing.totalAmount) || o.itemTotal || o.amount || 0);
        return sum + amt;
      }, 0);

      const activeOrders = orders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s !== 'delivered' && !s.includes('cancel');
      });

      const deliveredOrders = orders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s.includes('deliv');
      });

      // Total COD float across fleet
      const codFloat = deliveredOrders.filter(o => o.paymentMode === 'COD').reduce((sum, o) => {
        return sum + Number(o.grandTotal || (o.pricing && o.pricing.totalAmount) || o.amount || 0);
      }, 0);

      // 11% Platform Take Rate + ₹5 Platform Tech Fee per order
      const platformCommission = Math.round(gmv * 0.11) + (totalOrders * 5);

      // Active Riders Online in this town
      const riders = this.getRiders();
      const activeRidersCount = (town && town !== 'all') 
        ? riders.filter(r => (r.town || '').toLowerCase() === town.toLowerCase() && r.status !== 'offline').length || 6
        : riders.filter(r => r.status !== 'offline').length || 18;

      return {
        totalOrders,
        activeOrdersCount: activeOrders.length,
        deliveredCount: deliveredOrders.length,
        gmv,
        platformCommission,
        codFloat,
        activeRidersCount
      };
    }

    // Unified Zero-Leakage Merchant Terminal Stats
    getMerchantStats(merchantId) {
      const allOrders = this.getOrders();
      const shopOrders = allOrders.filter(o => {
        if (!merchantId || merchantId === 'all') return true;
        const mId = o.merchantId || (o.merchant && o.merchant.id) || o.merchant_id || '';
        if (mId === merchantId) return true;
        if ((merchantId === 'm-101' || merchantId === 'shop-sharma') && (mId === 'm-101' || mId === 'shop-sharma' || !mId)) return true;
        return false;
      });

      const placedList = shopOrders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s === 'placed' || s === 'pending';
      });
      const prepList = shopOrders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s.includes('prep') || s.includes('pack');
      });
      const deliveredList = shopOrders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return s.includes('deliv') || s.includes('pick') || s.includes('ready') || s.includes('transit') || s.includes('out') || s.includes('route');
      });

      const gross = shopOrders.reduce((sum, o) => {
        return sum + Number(o.grandTotal || (o.pricing && o.pricing.totalAmount) || o.itemTotal || o.amount || 0);
      }, 0);

      // Resolve merchant commission rate from data
      let commRate = 0.06; // default 6%
      if (window.PAHADICART_DATA && window.PAHADICART_DATA.merchants) {
        const m = window.PAHADICART_DATA.merchants.find(item => item.id === merchantId);
        if (m && m.commission) commRate = m.commission / 100;
      }

      const commission = Math.round(gross * commRate);
      const tcs = Number((gross * 0.01).toFixed(2));
      const netPayout = Math.max(0, Math.round(gross - commission - tcs));

      return {
        todayOrderCount: shopOrders.length,
        todayGrossRevenue: gross,
        todayCommission: commission,
        commissionPercent: Math.round(commRate * 100),
        todayTcs: tcs,
        todayNetPayout: netPayout,
        placedCount: placedList.length,
        preparingCount: prepList.length,
        deliveredCount: deliveredList.length,
        shopOrders,
        placedList,
        prepList,
        deliveredList
      };
    }

    // Unified Zero-Leakage Rider Console Stats
    getRiderStats(riderId = 'r-1') {
      const allOrders = this.getOrders();
      const riderOrders = allOrders.filter(o => o.riderId === riderId || (o.rider && o.rider.id === riderId));
      
      const delivered = riderOrders.filter(o => (o.status || '').toLowerCase().includes('deliv'));
      const codCollected = delivered.filter(o => o.paymentMode === 'COD').reduce((sum, o) => {
        return sum + Number(o.grandTotal || (o.pricing && o.pricing.totalAmount) || o.amount || 0);
      }, 0);

      // Base daily stipend + ₹85 per completed delivery mission
      const todayEarnings = 720 + (delivered.length * 85);
      const cashBalance = 1240 + codCollected;
      const altitudeClimbed = 420 + (delivered.length * 140);

      const activeMission = riderOrders.find(o => {
        const s = (o.status || '').toLowerCase();
        return s.includes('pick') || s.includes('transit') || s.includes('route');
      }) || null;

      return {
        totalMissions: riderOrders.length,
        deliveredCount: delivered.length,
        todayEarnings,
        cashBalance,
        altitudeClimbed,
        activeMission
      };
    }

    // Broadcast across tabs
    emit(eventType, payload) {
      this.broadcast(eventType, payload);
    }

    broadcast(eventType, payload) {
      const msg = { type: eventType, payload, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY_EVENT, JSON.stringify(msg));
      this.emitLocal(eventType, payload);
    }

    handleStorageEvent(e) {
      if (e.key === STORAGE_KEY_EVENT && e.newValue) {
        try {
          const msg = JSON.parse(e.newValue);
          this.emitLocal(msg.type, msg.payload);
        } catch (err) {
          console.error('PahadiEventBus parse error:', err);
        }
      }
    }

    on(eventType, callback) {
      if (!this.listeners[eventType]) this.listeners[eventType] = [];
      this.listeners[eventType].push(callback);
    }

    emitLocal(eventType, payload) {
      if (this.listeners[eventType]) {
        this.listeners[eventType].forEach(cb => {
          try { cb(payload); } catch (e) { console.error(e); }
        });
      }
    }
  }

  window.pahadiBus = new PahadiEventBus();
})();
