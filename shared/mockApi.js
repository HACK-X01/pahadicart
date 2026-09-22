/**
 * PahadiCart Unified Mock Engine & Local Simulation API
 * Provides 100% self-contained local & offline persistence, cross-tab real-time sync,
 * order lifecycle management, and mountain logistics telemetry.
 */
(function() {
  'use strict';

  const DB_KEY = 'pahadicart_orders_db';
  const SETTINGS_KEY = 'pahadicart_app_settings';

  // Cross-Tab Real-time Broadcast Channel
  const broadcastChannel = typeof BroadcastChannel !== 'undefined' 
    ? new BroadcastChannel('pahadicart_live_sync') 
    : null;

  // Default Seed Orders (Himachal Hyperlocal)
  const SEED_ORDERS = [
    {
      id: 'ORD-5192',
      town: 'solan',
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 'preparing',
      customer: {
        name: 'Sunita Verma',
        phone: '+91 98160 44321',
        colony: 'Upper Mall Road',
        landmark: 'Near Old DC Office',
        staircaseDetails: 'Climb 24 wooden steps, 1st floor balcony',
        stairsTotal: 24,
        stairsCompleted: 0
      },
      merchant: {
        id: 'mer_solan_1',
        name: 'Sharma Sweets & Hill Dairy',
        address: 'Mall Road, Solan'
      },
      rider: {
        id: 'rider_1',
        name: 'Karan Negi',
        phone: '+91 98160 88990',
        vehicle: 'Hero Splendor (HP-14-A-4432)'
      },
      items: [
        { name: 'Fresh Himachali Siddu (2 pcs)', qty: 2, price: 120 },
        { name: 'Desi Cow Ghee (500g)', qty: 1, price: 450 }
      ],
      pricing: {
        itemTotal: 690,
        deliveryFee: 25,
        weatherBufferFee: 0,
        totalAmount: 715
      },
      payMode: 'UPI',
      otp: '6291',
      etaMinutes: 28
    },
    {
      id: 'ORD-7821',
      town: 'solan',
      createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
      status: 'in_transit',
      customer: {
        name: 'Rohit Kaundal',
        phone: '+91 98161 77882',
        colony: 'Shamti Pine Valley',
        landmark: 'Near Forest Rest House',
        staircaseDetails: 'Descend 42 stone steps, green gate',
        stairsTotal: 42,
        stairsCompleted: 27
      },
      merchant: {
        id: 'mer_solan_2',
        name: 'Himalayan Organic Orchard Hub',
        address: 'Kotlan Nala, Solan'
      },
      rider: {
        id: 'rider_2',
        name: 'Vikas Thakur',
        phone: '+91 98161 12345',
        vehicle: 'Honda Activa 6G (HP-14-B-8821)'
      },
      items: [
        { name: 'Royal Delicious Kinnaur Apples (1 kg)', qty: 2, price: 180 },
        { name: 'Local Wild Pine Honey (250g)', qty: 1, price: 340 }
      ],
      pricing: {
        itemTotal: 700,
        deliveryFee: 25,
        weatherBufferFee: 15,
        totalAmount: 740
      },
      payMode: 'COD',
      otp: '4829',
      etaMinutes: 12
    }
  ];

  class PahadiMockApi {
    constructor() {
      this.initDatabase();
      this.setupBroadcastListener();
    }

    // Initialize or seed DB
    initDatabase() {
      try {
        const existing = localStorage.getItem(DB_KEY);
        if (!existing) {
          localStorage.setItem(DB_KEY, JSON.stringify(SEED_ORDERS));
        }
      } catch (e) {
        console.warn('[MockApi] Storage init error:', e);
      }
    }

    // Broadcast setup
    setupBroadcastListener() {
      if (broadcastChannel) {
        broadcastChannel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          this.handleIncomingBroadcast(type, payload);
        };
      }

      window.addEventListener('storage', (e) => {
        if (e.key === DB_KEY) {
          this.handleIncomingBroadcast('STORAGE_SYNC', null);
        }
      });
    }

    handleIncomingBroadcast(type, payload) {
      // Trigger appropriate in-page UI updates or chimes if listeners exist
      if (window.eventBus && window.eventBus.emit) {
        window.eventBus.emit(type, payload);
      }
    }

    broadcast(type, payload) {
      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({ type, payload });
        } catch (e) {
          console.warn('[MockApi] Broadcast error:', e);
        }
      }
    }

    // 1. ORDERS API
    getOrders(filters = {}) {
      try {
        const raw = localStorage.getItem(DB_KEY);
        let list = raw ? JSON.parse(raw) : [];

        if (filters.town && filters.town !== 'all') {
          list = list.filter(o => o.town === filters.town);
        }
        if (filters.status && filters.status !== 'all') {
          list = list.filter(o => o.status === filters.status);
        }
        if (filters.riderId) {
          list = list.filter(o => o.rider && o.rider.id === filters.riderId);
        }
        return list;
      } catch (e) {
        console.error('[MockApi] getOrders error:', e);
        return [];
      }
    }

    getOrderById(id) {
      const all = this.getOrders();
      return all.find(o => o.id === id) || null;
    }

    createOrder(orderData) {
      const all = this.getOrders();
      const newOrder = {
        id: orderData.id || ('ORD-' + Math.floor(1000 + Math.random() * 9000)),
        town: orderData.town || 'solan',
        createdAt: new Date().toISOString(),
        status: 'placed', // 'placed' -> 'accepted' -> 'preparing' -> 'ready' -> 'in_transit' -> 'delivered'
        customer: orderData.customer || {
          name: 'Pooja Chandel',
          phone: '+91 98164 55443',
          colony: 'The Mall Road',
          landmark: 'Heritage Post Office',
          staircaseDetails: '42 stairs from road level',
          stairsTotal: 42,
          stairsCompleted: 0
        },
        merchant: orderData.merchant || {
          id: 'mer_solan_1',
          name: 'Sharma Sweets & Hill Dairy',
          address: 'Upper Bazaar, Solan'
        },
        rider: orderData.rider || {
          id: 'rider_1',
          name: 'Karan Negi',
          phone: '+91 98160 88990',
          vehicle: 'Hero Splendor (MCWG)'
        },
        items: orderData.items || [],
        pricing: orderData.pricing || {
          itemTotal: 350,
          deliveryFee: 25,
          weatherBufferFee: 0,
          totalAmount: 375
        },
        payMode: orderData.payMode || 'UPI',
        otp: orderData.otp || String(Math.floor(1000 + Math.random() * 9000)),
        etaMinutes: 35,
        ...orderData
      };

      all.unshift(newOrder);
      localStorage.setItem(DB_KEY, JSON.stringify(all));

      // 1. Play alert sound in local context
      if (window.pahadiAudio && window.pahadiAudio.playSuccessTune) {
        window.pahadiAudio.playSuccessTune();
      }

      // 2. Broadcast to other tabs (Merchant POS, Rider Cockpit, Admin)
      this.broadcast('NEW_ORDER_PLACED', newOrder);

      // Bridge with window.pahadiBus if present
      if (window.pahadiBus) {
        if (typeof window.pahadiBus.addOrder === 'function') {
          window.pahadiBus.addOrder(newOrder);
        } else if (typeof window.pahadiBus.emit === 'function') {
          window.pahadiBus.emit('ORDER_PLACED', newOrder);
        }
      }


      // 3. Dispatch native web push / system notification
      if (window.pahadiNotifier && window.pahadiNotifier.sendOrderAlert) {
        window.pahadiNotifier.sendOrderAlert({
          role: 'merchant',
          title: '🛎️ Naya Order Aaya: ' + newOrder.id,
          body: newOrder.customer.name + ' • Total: ₹' + newOrder.pricing.totalAmount,
          orderId: newOrder.id,
          amount: newOrder.pricing.totalAmount,
          soundType: 'merchant'
        });
      }

      return newOrder;
    }

    updateOrderStatus(orderId, newStatus, meta = {}) {
      const all = this.getOrders();
      const order = all.find(o => o.id === orderId);
      if (!order) return null;

      order.status = newStatus;
      if (meta.stairsCompleted !== undefined) {
        order.customer.stairsCompleted = meta.stairsCompleted;
      }
      if (meta.rider) {
        order.rider = { ...order.rider, ...meta.rider };
      }

      localStorage.setItem(DB_KEY, JSON.stringify(all));

      // Broadcast update
      this.broadcast('ORDER_STATUS_CHANGED', { orderId, newStatus, order });

      // Bridge with window.pahadiBus if present
      if (window.pahadiBus && typeof window.pahadiBus.emit === 'function') {
        window.pahadiBus.emit('ORDER_STATUS_CHANGED', { orderId, newStatus, order });
      }


      // Trigger chimes on transition
      if (newStatus === 'ready' && window.pahadiAudio) {
        window.pahadiAudio.playRiderPing();
      } else if (newStatus === 'delivered' && window.pahadiAudio) {
        window.pahadiAudio.playSuccessTune();
      }

      return order;
    }

    // 2. TELEMETRY & STATS
    getStats(town = 'solan') {
      const orders = this.getOrders({ town });
      const delivered = orders.filter(o => o.status === 'delivered');
      const active = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

      let gmv = 0;
      orders.forEach(o => {
        gmv += (o.pricing && o.pricing.totalAmount) || 0;
      });

      return {
        totalOrders: orders.length,
        activeOrders: active.length,
        deliveredOrders: delivered.length,
        todayGMV: gmv,
        commission: Math.round(gmv * 0.12),
        activeRiders: 14,
        weatherStatus: 'Clear • Standard 45m SLA'
      };
    }

    // 3. WEATHER CONTROLLER
    setWeatherMode(mode = 'clear', town = 'solan') {
      const settings = {
        mode,
        town,
        bufferMinutes: mode === 'rain' ? 15 : (mode === 'snow' ? 45 : 0),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      this.broadcast('WEATHER_SURGE_CHANGED', settings);
      return settings;
    }

    getWeatherMode() {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? JSON.parse(raw) : { mode: 'clear', bufferMinutes: 0, town: 'solan' };
      } catch (e) {
        return { mode: 'clear', bufferMinutes: 0, town: 'solan' };
      }
    }
  }

  // Attach globally
  window.PahadiMockApi = new PahadiMockApi();
  console.log('[PahadiMockApi] Full-fledged offline mock engine ready.');
})();
