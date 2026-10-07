/**
 * Himora / Jeevanix Local — Universal Client API Layer (HimoraApi)
 * Connects Customer App, Merchant Panel, Rider Cockpit, and Founder Admin
 * to the SQLite Single Source of Truth backend (/api/*).
 */

(function() {
  'use strict';

  function resolveApiBase() {
    try {
      const origin = window.location.origin;
      if (!origin || origin === 'null' || window.location.protocol === 'file:') {
        return 'http://localhost:3333';
      }
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (window.location.port !== '3333' && window.location.port !== '') {
          return 'http://localhost:3333';
        }
      }
      return origin;
    } catch(e) {
      return 'http://localhost:3333';
    }
  }

  class HimoraApiClient {
    constructor() {
      this.apiBase = resolveApiBase();
      this.cache = {
        products: [],
        categories: [],
        merchants: [],
        riders: [],
        orders: [],
        cms: {},
        businessRules: {}
      };
      this.listeners = new Map();
      this.activeEs = null;
      this.isHydrated = false;

      this.initSse();
      this.hydrateAllData();
    }

    // Server-Sent Events with connection-leak protection
    initSse() {
      if (typeof EventSource === 'undefined') return;
      if (this.activeEs) {
        try { this.activeEs.close(); } catch(e) {}
        this.activeEs = null;
      }

      try {
        const es = new EventSource(this.apiBase + '/api/sync/stream');
        this.activeEs = es;

        es.addEventListener('open', () => {
          this.sseConnected = true;
        });

        es.addEventListener('PRODUCT_CHANGED', (e) => {
          try {
            const data = JSON.parse(e.data);
            this.handleProductChange(data);
          } catch(err) {}
        });

        es.addEventListener('CATEGORY_CHANGED', () => {
          this.getCategories(true);
        });

        es.addEventListener('MERCHANT_CHANGED', () => {
          this.getMerchants(true);
        });

        es.addEventListener('RIDER_CHANGED', () => {
          this.getRiders(true);
        });

        es.addEventListener('ORDER_CREATED', (e) => {
          try {
            const order = JSON.parse(e.data);
            this.handleOrderCreated(order);
          } catch(err) {}
        });

        es.addEventListener('ORDER_UPDATED', (e) => {
          try {
            const order = JSON.parse(e.data);
            this.handleOrderUpdated(order);
          } catch(err) {}
        });

        es.addEventListener('CMS_UPDATED', (e) => {
          try {
            const cms = JSON.parse(e.data);
            this.cache.cms = cms;
            this.emit('cms_changed', cms);
          } catch(err) {}
        });

        es.addEventListener('RULES_UPDATED', (e) => {
          try {
            const rules = JSON.parse(e.data);
            this.cache.businessRules = rules;
            this.emit('rules_changed', rules);
          } catch(err) {}
        });

        // Native EventSource auto-reconnects on its own; do not spawn duplicate instances
        es.onerror = () => {
          this.sseConnected = false;
        };
      } catch (err) {
        console.warn('[HimoraApi] SSE setup error:', err);
      }
    }

    on(event, callback) {
      if (!this.listeners.has(event)) this.listeners.set(event, new Set());
      this.listeners.get(event).add(callback);
    }

    emit(event, data) {
      if (this.listeners.has(event)) {
        for (const cb of this.listeners.get(event)) {
          try { cb(data); } catch(e) {}
        }
      }
      if (window.pahadiBus) {
        window.pahadiBus.emit(event.toUpperCase(), data);
      }
    }

    handleProductChange(data) {
      this.getProducts(true, true).then(prods => {
        this.emit('products_changed', prods);
      });
    }

    handleOrderCreated(order) {
      this.cache.orders.unshift(order);
      this.emit('order_created', order);
      this.emit('orders_changed', this.cache.orders);
    }

    handleOrderUpdated(order) {
      const idx = this.cache.orders.findIndex(o => o.id === order.id);
      if (idx !== -1) {
        this.cache.orders[idx] = Object.assign(this.cache.orders[idx], order);
      } else {
        this.cache.orders.unshift(order);
      }
      this.emit('order_updated', order);
      this.emit('orders_changed', this.cache.orders);
    }

    // Helper for HTTP requests with 6s timeout to prevent UI freezes
    async request(path, options = {}) {
      const url = this.apiBase + path;
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      // Add Admin credentials if in Admin portal
      const currentRole = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('pahadi_active_role')) || 'SUPER_ADMIN';
      headers['X-Admin-Role'] = currentRole;
      headers['X-Founder-PIN'] = '7890';

      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;

      try {
        const fetchOpts = { ...options, headers };
        if (controller) fetchOpts.signal = controller.signal;

        const res = await fetch(url, fetchOpts);
        if (timeoutId) clearTimeout(timeoutId);

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || json.error || 'Server returned HTTP ' + res.status);
        }
        return json;
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          console.warn('[HimoraApi Request Timeout]:', path);
          throw new Error('Server request timed out (6s). Check if server.js is running.');
        }
        console.warn('[HimoraApi Request Error]:', path, err.message);
        throw err;
      }
    }

    // ==========================================
    // INITIAL BOOT HYDRATION
    // ==========================================
    async hydrateAllData() {
      try {
        const [pRes, cRes, mRes, rRes, oRes, cmsRes, brRes] = await Promise.allSettled([
          this.getProducts(true, true),
          this.getCategories(true),
          this.getMerchants(true),
          this.getRiders(true),
          this.getOrders(true),
          this.getCms(true),
          this.getBusinessRules(true)
        ]);

        const products = pRes.status === 'fulfilled' && Array.isArray(pRes.value) ? pRes.value : [];
        const categories = cRes.status === 'fulfilled' && Array.isArray(cRes.value) ? cRes.value : [];
        const merchants = mRes.status === 'fulfilled' && Array.isArray(mRes.value) ? mRes.value : [];
        const riders = rRes.status === 'fulfilled' && Array.isArray(rRes.value) ? rRes.value : [];
        const orders = oRes.status === 'fulfilled' && Array.isArray(oRes.value) ? oRes.value : [];

        // Synchronize in-memory globals
        if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
        if (products.length > 0) window.PAHADICART_DATA.products = products;
        if (categories.length > 0) window.PAHADICART_DATA.categories = categories;
        if (merchants.length > 0) window.PAHADICART_DATA.merchants = merchants;
        if (riders.length > 0) window.PAHADICART_DATA.riders = riders;

        if (!window.PahadiMockDB) window.PahadiMockDB = {};
        if (merchants.length > 0) window.PahadiMockDB.merchants = merchants;
        if (riders.length > 0) window.PahadiMockDB.riders = riders;
        if (orders.length > 0) window.PahadiMockDB.orders = orders;

        // Keep localStorage synced for legacy modules
        try {
          if (products.length > 0) localStorage.setItem('pahadicart_products', JSON.stringify(products));
          if (merchants.length > 0) localStorage.setItem('pahadicart_merchants', JSON.stringify(merchants));
          if (riders.length > 0) localStorage.setItem('pahadicart_riders', JSON.stringify(riders));
          if (orders.length > 0) localStorage.setItem('pahadicart_orders_db', JSON.stringify(orders));
        } catch(e) {}

        this.isHydrated = true;

        // Trigger immediate UI rendering across all open admin views
        setTimeout(() => {
          if (window.InventoryService && typeof window.InventoryService.renderInventoryTable === 'function') {
            window.InventoryService.renderInventoryTable();
          }
          if (window.CategoriesService && typeof window.CategoriesService.renderCategories === 'function') {
            window.CategoriesService.renderCategories();
          }
          if (typeof window.renderMerchantsTable === 'function') {
            window.renderMerchantsTable();
          }
          if (typeof window.renderRidersView === 'function') {
            window.renderRidersView();
          }
          if (typeof window.renderOrdersFeed === 'function') {
            window.renderOrdersFeed();
          }
          if (typeof window.updateMetricsDashboard === 'function') {
            window.updateMetricsDashboard();
          }
        }, 50);

      } catch (err) {
        console.warn('[HimoraApi] Hydration notice:', err);
      }
    }

    // ==========================================
    // PRODUCTS API
    // ==========================================
    async getProducts(includeAll = false, forceRefresh = false) {
      if (!forceRefresh && this.cache.products.length > 0 && !includeAll) {
        return this.cache.products;
      }
      try {
        const data = await this.request('/api/products' + (includeAll ? '?all=true' : ''));
        if (data.success && Array.isArray(data.products)) {
          if (!includeAll) this.cache.products = data.products;
          if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
          window.PAHADICART_DATA.products = data.products;
          return data.products;
        }
      } catch (err) {
        // Fallback to in-memory or storage if offline
        if (window.PAHADICART_DATA && Array.isArray(window.PAHADICART_DATA.products) && window.PAHADICART_DATA.products.length > 0) {
          return window.PAHADICART_DATA.products;
        }
      }
      return this.cache.products || [];
    }

    async getProduct(id) {
      const data = await this.request('/api/products/' + encodeURIComponent(id));
      return data.product;
    }

    async createProduct(productData) {
      const data = await this.request('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      await this.getProducts(true, true);
      return data.product;
    }

    async updateProduct(id, updates, reason = 'Admin modification') {
      const data = await this.request('/api/products/' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: { 'X-Audit-Reason': reason },
        body: JSON.stringify(updates)
      });
      await this.getProducts(true, true);
      return data.product;
    }

    async deleteProduct(id, reason = 'Admin deletion') {
      const data = await this.request('/api/products/' + encodeURIComponent(id), {
        method: 'DELETE',
        headers: { 'X-Audit-Reason': reason }
      });
      await this.getProducts(true, true);
      return data;
    }

    // ==========================================
    // CATEGORIES API
    // ==========================================
    async getCategories(forceRefresh = false) {
      if (!forceRefresh && this.cache.categories.length > 0) return this.cache.categories;
      try {
        const data = await this.request('/api/categories');
        if (data.success && Array.isArray(data.categories)) {
          this.cache.categories = data.categories;
          if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
          window.PAHADICART_DATA.categories = data.categories;
          return data.categories;
        }
      } catch(err) {
        if (window.PAHADICART_DATA && Array.isArray(window.PAHADICART_DATA.categories) && window.PAHADICART_DATA.categories.length > 0) {
          return window.PAHADICART_DATA.categories;
        }
      }
      return this.cache.categories || [];
    }

    async createCategory(catData) {
      const data = await this.request('/api/categories', {
        method: 'POST',
        body: JSON.stringify(catData)
      });
      await this.getCategories(true);
      return data.category;
    }

    async updateCategory(id, updates) {
      const data = await this.request('/api/categories/' + encodeURIComponent(id), {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      await this.getCategories(true);
      return data.category;
    }

    async deleteCategory(id) {
      const data = await this.request('/api/categories/' + encodeURIComponent(id), {
        method: 'DELETE'
      });
      await this.getCategories(true);
      return data;
    }

    // ==========================================
    // MERCHANTS API
    // ==========================================
    async getMerchants(forceRefresh = false) {
      if (!forceRefresh && this.cache.merchants.length > 0) return this.cache.merchants;
      try {
        const data = await this.request('/api/merchants');
        if (data.success && Array.isArray(data.merchants)) {
          this.cache.merchants = data.merchants;
          if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
          window.PAHADICART_DATA.merchants = data.merchants;
          if (window.PahadiMockDB) window.PahadiMockDB.merchants = data.merchants;
          return data.merchants;
        }
      } catch(err) {
        if (window.PahadiMockDB && Array.isArray(window.PahadiMockDB.merchants) && window.PahadiMockDB.merchants.length > 0) {
          return window.PahadiMockDB.merchants;
        }
      }
      return this.cache.merchants || [];
    }

    async updateMerchant(id, updates, reason = 'Admin update') {
      const data = await this.request('/api/merchants/' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: { 'X-Audit-Reason': reason },
        body: JSON.stringify(updates)
      });
      await this.getMerchants(true);
      return data.merchant;
    }

    // ==========================================
    // RIDERS API
    // ==========================================
    async getRiders(forceRefresh = false) {
      if (!forceRefresh && this.cache.riders.length > 0) return this.cache.riders;
      try {
        const data = await this.request('/api/riders');
        if (data.success && Array.isArray(data.riders)) {
          this.cache.riders = data.riders;
          if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
          window.PAHADICART_DATA.riders = data.riders;
          if (window.PahadiMockDB) window.PahadiMockDB.riders = data.riders;
          return data.riders;
        }
      } catch(err) {
        if (window.PahadiMockDB && Array.isArray(window.PahadiMockDB.riders) && window.PahadiMockDB.riders.length > 0) {
          return window.PahadiMockDB.riders;
        }
      }
      return this.cache.riders || [];
    }

    async updateRider(id, updates, reason = 'Admin update') {
      const data = await this.request('/api/riders/' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: { 'X-Audit-Reason': reason },
        body: JSON.stringify(updates)
      });
      await this.getRiders(true);
      return data.rider;
    }

    // ==========================================
    // ORDERS API
    // ==========================================
    async getOrders(forceRefresh = false) {
      if (!forceRefresh && this.cache.orders.length > 0) return this.cache.orders;
      try {
        const data = await this.request('/api/orders');
        if (data.success && Array.isArray(data.orders)) {
          this.cache.orders = data.orders;
          if (window.PahadiMockDB) window.PahadiMockDB.orders = data.orders;
          return data.orders;
        }
      } catch(err) {
        if (window.PahadiMockDB && Array.isArray(window.PahadiMockDB.orders) && window.PahadiMockDB.orders.length > 0) {
          return window.PahadiMockDB.orders;
        }
      }
      return this.cache.orders || [];
    }

    async createOrder(orderData) {
      const data = await this.request('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      await this.getOrders(true);
      return data.order;
    }

    async updateOrder(id, updates) {
      const data = await this.request('/api/orders/' + encodeURIComponent(id), {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      await this.getOrders(true);
      return data.order;
    }

    // ==========================================
    // CMS & HOMEPAGE BANNERS
    // ==========================================
    async getCms(forceRefresh = false) {
      if (!forceRefresh && Object.keys(this.cache.cms).length > 0) return this.cache.cms;
      try {
        const data = await this.request('/api/cms');
        if (data.success && data.cms) {
          this.cache.cms = data.cms;
          if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
          window.PAHADICART_DATA.homepageCms = data.cms;
          return data.cms;
        }
      } catch(err) {}
      return this.cache.cms || {};
    }

    async saveCms(cmsPayload) {
      const data = await this.request('/api/cms', {
        method: 'POST',
        body: JSON.stringify(cmsPayload)
      });
      this.cache.cms = data.cms;
      return data.cms;
    }

    // ==========================================
    // BUSINESS RULES & SETTINGS
    // ==========================================
    async getBusinessRules(forceRefresh = false) {
      if (!forceRefresh && Object.keys(this.cache.businessRules).length > 0) return this.cache.businessRules;
      try {
        const data = await this.request('/api/business-rules');
        if (data.success && data.rules) {
          this.cache.businessRules = data.rules;
          if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
          window.PAHADICART_DATA.businessRules = data.rules;
          return data.rules;
        }
      } catch(err) {}
      return this.cache.businessRules || {};
    }

    async saveBusinessRules(rulesPayload) {
      const data = await this.request('/api/business-rules', {
        method: 'POST',
        body: JSON.stringify(rulesPayload)
      });
      this.cache.businessRules = data.rules;
      return data.rules;
    }

    // ==========================================
    // AUDIT LOGS
    // ==========================================
    async getAuditLogs() {
      const data = await this.request('/api/audit-logs');
      return data.logs || [];
    }

    // ==========================================
    // DATABASE EXPORT
    // ==========================================
    async exportDatabase() {
      const data = await this.request('/api/db/export');
      return data.snapshot;
    }
  }

  window.HimoraApi = new HimoraApiClient();
})();
