/**
 * Himora / Jeevanix Local — Universal Client API Layer (HimoraApi)
 * Connects Customer App, Merchant Panel, Rider Cockpit, and Founder Admin
 * to the SQLite Single Source of Truth backend (/api/*).
 */

(function() {
  'use strict';

  class HimoraApiClient {
    constructor() {
      this.apiBase = window.location.origin;
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
      this.initSse();
    }

    // Server-Sent Events for real-time multi-device revalidation
    initSse() {
      if (typeof EventSource === 'undefined') return;
      try {
        const es = new EventSource(this.apiBase + '/api/sync/stream');

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

        es.onerror = () => {
          setTimeout(() => this.initSse(), 5000);
        };
      } catch (err) {
        console.warn('[HimoraApi] SSE error:', err);
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
      // Re-fetch products from server
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

    // Helper for HTTP requests
    async request(path, options = {}) {
      const url = this.apiBase + path;
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      // Add Admin credentials if in Admin portal
      if (window.location.pathname.includes('/admin') || window.location.hash.includes('admin')) {
        headers['X-Admin-Role'] = sessionStorage.getItem('pahadi_active_role') || 'SUPER_ADMIN';
      }

      try {
        const res = await fetch(url, { ...options, headers });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || json.error || 'Server returned HTTP ' + res.status);
        }
        return json;
      } catch (err) {
        console.error('[HimoraApi Request Error]:', path, err.message);
        throw err;
      }
    }

    // ==========================================
    // PRODUCTS API
    // ==========================================
    async getProducts(includeAll = false, forceRefresh = false) {
      if (!forceRefresh && this.cache.products.length > 0 && !includeAll) {
        return this.cache.products;
      }
      const data = await this.request('/api/products' + (includeAll ? '?all=true' : ''));
      if (data.success && Array.isArray(data.products)) {
        if (!includeAll) this.cache.products = data.products;
        // Keep window.PAHADICART_DATA synchronized
        if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
        window.PAHADICART_DATA.products = data.products;
        return data.products;
      }
      return [];
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
      const data = await this.request('/api/categories');
      if (data.success && Array.isArray(data.categories)) {
        this.cache.categories = data.categories;
        if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
        window.PAHADICART_DATA.categories = data.categories;
        return data.categories;
      }
      return [];
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
      const data = await this.request('/api/merchants');
      if (data.success && Array.isArray(data.merchants)) {
        this.cache.merchants = data.merchants;
        if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
        window.PAHADICART_DATA.merchants = data.merchants;
        return data.merchants;
      }
      return [];
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
      const data = await this.request('/api/riders');
      if (data.success && Array.isArray(data.riders)) {
        this.cache.riders = data.riders;
        if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
        window.PAHADICART_DATA.riders = data.riders;
        return data.riders;
      }
      return [];
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
      const data = await this.request('/api/orders');
      if (data.success && Array.isArray(data.orders)) {
        this.cache.orders = data.orders;
        return data.orders;
      }
      return [];
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
      const data = await this.request('/api/cms');
      if (data.success && data.cms) {
        this.cache.cms = data.cms;
        if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
        window.PAHADICART_DATA.homepageCms = data.cms;
        return data.cms;
      }
      return {};
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
      const data = await this.request('/api/business-rules');
      if (data.success && data.rules) {
        this.cache.businessRules = data.rules;
        if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
        window.PAHADICART_DATA.businessRules = data.rules;
        return data.rules;
      }
      return {};
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
