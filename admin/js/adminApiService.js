// PahadiCart Admin API Service Layer
// Cleanly abstracts between Mock DB, WebSocket Telemetry, and Production REST API
(function() {
  class PahadiAdminApiService {
    constructor() {
      this.mode = 'mock'; // 'mock' or 'live'
      this.baseUrl = '/api/v1/admin';
      this.cache = new Map();
      this.listeners = new Map();
      this.auditHistory = [];
    }

    setMode(mode) {
      this.mode = mode;
      console.log('Admin API Service Mode switched to:', mode);
    }

    // Generic request handler
    async request(endpoint, options = {}) {
      const cacheKey = endpoint + JSON.stringify(options);
      if (options.method === 'GET' && this.cache.has(cacheKey) && !options.forceRefresh) {
        return this.cache.get(cacheKey);
      }

      if (this.mode === 'live') {
        try {
          const res = await fetch(this.baseUrl + endpoint, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + (sessionStorage.getItem('admin_token') || 'mock_super_admin_jwt'),
              ...(options.headers || {})
            }
          });
          if (!res.ok) throw new Error('API HTTP Error ' + res.status);
          const data = await res.json();
          if (options.method === 'GET') this.cache.set(cacheKey, data);
          return data;
        } catch (err) {
          console.warn('Live API unreachable, falling back to mock layer:', err.message);
        }
      }

      // Fallback to Mock Data Layer
      return this.handleMockRequest(endpoint, options);
    }

    // Mock API Dispatcher
    async handleMockRequest(endpoint, options) {
      await new Promise(r => setTimeout(r, options.delay || 60)); // Simulate realistic network micro-latency

      if (endpoint === '/dashboard') {
        return this.getDashboardKpis();
      }
      if (endpoint === '/orders') {
        return window.PahadiMockDB?.orders || [];
      }
      if (endpoint.startsWith('/orders/')) {
        const id = endpoint.replace('/orders/', '');
        return (window.PahadiMockDB?.orders || []).find(o => o.id === id) || null;
      }
      if (endpoint === '/merchants') {
        return window.PahadiMockDB?.merchants || [];
      }
      if (endpoint === '/riders') {
        return window.PahadiMockDB?.riders || [];
      }
      if (endpoint === '/runners') {
        return window.PahadiMockDB?.runners || [];
      }
      if (endpoint === '/zones') {
        return window.PahadiMockDB?.towns || [];
      }
      if (endpoint === '/geofences') {
        return window.PahadiMockDB?.geofences || [];
      }
      if (endpoint === '/audit-logs') {
        return this.getAuditLogs();
      }
      if (endpoint === '/system-health') {
        return this.getSystemHealth();
      }

      return { status: 'ok', endpoint };
    }

    // Record immutable audit log
    recordAudit(action, entity, entityId, oldValue, newValue, reason = '') {
      const currentAdmin = window.PahadiRBAC ? window.PahadiRBAC.getCurrentUser() : { name: 'Super Admin', role: 'SUPER_ADMIN' };
      const logEntry = {
        id: 'AUDIT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        actor: currentAdmin.name,
        role: currentAdmin.role,
        action,
        entity,
        entityId,
        oldValue: oldValue != null ? String(oldValue) : null,
        newValue: newValue != null ? String(newValue) : null,
        reason: reason || 'Routine operational update',
        ip: '192.168.1.104 (Himachal Gateway)',
        status: 'COMMITTED'
      };

      this.auditHistory.unshift(logEntry);
      if (this.auditHistory.length > 300) this.auditHistory.pop();

      // Persist locally
      try {
        sessionStorage.setItem('pahadi_audit_logs', JSON.stringify(this.auditHistory.slice(0, 100)));
      } catch (e) {}

      // Emit event
      this.emit('audit.created', logEntry);
      return logEntry;
    }

    getAuditLogs() {
      if (this.auditHistory.length === 0) {
        try {
          const stored = sessionStorage.getItem('pahadi_audit_logs');
          if (stored) this.auditHistory = JSON.parse(stored);
        } catch (e) {}
      }

      if (this.auditHistory.length === 0) {
        // Seed initial audit entries
        this.auditHistory = [
          {
            id: 'AUDIT-1092',
            timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
            timeFormatted: '12 mins ago',
            actor: 'Super Admin',
            role: 'SUPER_ADMIN',
            action: 'ZONE_WEATHER_SURGE_ENABLED',
            entity: 'Zone',
            entityId: 'solan-central',
            oldValue: 'Clear (₹0)',
            newValue: 'Rain (+₹15 Surge)',
            reason: 'Open-Meteo meteorological rain alert detected on Ridge',
            ip: '192.168.1.104',
            status: 'COMMITTED'
          },
          {
            id: 'AUDIT-1091',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            timeFormatted: '45 mins ago',
            actor: 'Operations Manager',
            role: 'OPERATIONS_ADMIN',
            action: 'MERCHANT_VERIFICATION_APPROVED',
            entity: 'Merchant',
            entityId: 'm-1',
            oldValue: 'PENDING_APPROVAL',
            newValue: 'ACTIVE_VERIFIED',
            reason: 'Vyapar Mandal trade registration certificate verified',
            ip: '192.168.1.88',
            status: 'COMMITTED'
          },
          {
            id: 'AUDIT-1090',
            timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
            timeFormatted: '1.5 hrs ago',
            actor: 'Finance Controller',
            role: 'FINANCE_ADMIN',
            action: 'COMMISSION_RULE_UPDATED',
            entity: 'Commission',
            entityId: 'COMM-BAKERY-V2',
            oldValue: '12%',
            newValue: '14%',
            reason: 'Annual hill festival revision for tourist season',
            ip: '192.168.1.72',
            status: 'COMMITTED'
          }
        ];
      }
      return this.auditHistory;
    }

    getDashboardKpis() {
      return {
        ordersToday: 48,
        ordersInProgress: 7,
        ordersDelivered: 39,
        ordersCancelled: 2,
        activeRiders: 4,
        availableRiders: 3,
        busyRiders: 1,
        activeMerchants: 12,
        gmvToday: 24850,
        platformRevenue: 2840,
        riderPayoutTotal: 1720,
        settlementDue: 18450,
        avgEtaMins: 38.5,
        onTimePct: 96.2,
        failedDeliveries: 1
      };
    }

    getSystemHealth() {
      return {
        status: 'OPERATIONAL',
        latencyMs: 38,
        postgres: { status: 'HEALTHY', poolActive: 12, maxPool: 50, version: 'PostgreSQL 16.2 + PostGIS 3.4' },
        redis: { status: 'HEALTHY', memoryUsedMb: 64.2, opsPerSec: 420, cluster: 'Standalone 7.2' },
        websocket: { status: 'CONNECTED', activeConnections: 18, publishedPerMin: 280 },
        bullMq: { status: 'ACTIVE', waitingJobs: 3, activeJobs: 2, failedJobs: 0 },
        gateways: {
          razorpay: { status: 'OPERATIONAL', pingMs: 110 },
          openMeteo: { status: 'OPERATIONAL', pingMs: 130 },
          gupshupWa: { status: 'OPERATIONAL', pingMs: 95 }
        }
      };
    }

    on(event, callback) {
      if (!this.listeners.has(event)) this.listeners.set(event, []);
      this.listeners.get(event).push(callback);
    }

    emit(event, payload) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(cb => {
          try { cb(payload); } catch (e) { console.error(e); }
        });
      }
    }
  }

  window.PahadiAdminApi = new PahadiAdminApiService();
})();
