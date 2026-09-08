// PahadiCart Live DEMO_MODE Operational Simulator
(function() {
  class PahadiDemoMode {
    constructor() {
      this.isActive = false;
      this.interval = null;
      this.step = 0;
    }

    toggle() {
      this.isActive = !this.isActive;
      const badge = document.getElementById('demoModeToggleBtn');
      if (this.isActive) {
        if (badge) {
          badge.style.background = '#f59e0b';
          badge.style.color = '#000';
          badge.innerHTML = '⚡ DEMO MODE: ACTIVE';
        }
        showToast('⚡ DEMO MODE Activated: Simulating real-time moving riders & hill dispatch!');
        this.startSimulation();
      } else {
        if (badge) {
          badge.style.background = 'rgba(255,255,255,0.08)';
          badge.style.color = '#94a3b8';
          badge.innerHTML = '⚡ Demo Simulator: OFF';
        }
        showToast('Demo simulation stopped.');
        this.stopSimulation();
      }
    }

    startSimulation() {
      if (this.interval) clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.step++;

        // Shift coordinates slightly for riders on map to simulate GPS movement
        if (window.PahadiMockDB && window.PahadiMockDB.riders) {
          const rider = window.PahadiMockDB.riders[0];
          if (rider && rider.coords) {
            rider.coords[0] += (Math.sin(this.step) * 0.0004);
            rider.coords[1] += (Math.cos(this.step) * 0.0004);
            rider.speed = Math.round(18 + Math.sin(this.step) * 8);
          }
        }

        // Re-render map layers smoothly
        if (typeof initGodViewMap === 'function') {
          const currentTown = document.getElementById('townSelect')?.value || 'solan';
          initGodViewMap(currentTown);
        }
      }, 3500);
    }

    stopSimulation() {
      if (this.interval) clearInterval(this.interval);
      this.interval = null;
    }
  }

  window.PahadiDemoMode = new PahadiDemoMode();
})();
