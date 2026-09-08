// PahadiCart Shared State & Event Bus (Real-time multi-tab synchronization)
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
      if (!localStorage.getItem(STORAGE_KEY_ORDERS)) {
        localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(window.PAHADICART_DATA ? window.PAHADICART_DATA.initialOrders : []));
      }
      if (!localStorage.getItem(STORAGE_KEY_RIDERS)) {
        localStorage.setItem(STORAGE_KEY_RIDERS, JSON.stringify(window.PAHADICART_DATA ? window.PAHADICART_DATA.riders : []));
      }
    }

    getOrders() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS)) || [];
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

    // Place a new order from Customer App
    placeOrder(orderData) {
      const orders = this.getOrders();
      orders.unshift(orderData);
      this.saveOrders(orders);
      this.broadcast('ORDER_PLACED', orderData);
      return orderData;
    }

    // Update status (e.g. Preparing, Ready, Picked, Delivered)
    updateOrderStatus(orderId, newStatus, extraData = {}) {
      const orders = this.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
        Object.assign(order, extraData);
        this.saveOrders(orders);
        this.broadcast('ORDER_STATUS_CHANGED', { orderId, newStatus, order });
        return order;
      }
      return null;
    }

    // Broadcast across tabs
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
