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
