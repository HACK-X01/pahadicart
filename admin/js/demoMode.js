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
      this.updateButtonUI();

      if (this.isActive) {
        if (typeof showToast === 'function') {
          showToast('🎮 DEMO MODE: ON — Simulating live GPS rider climbs & incoming hill orders!', 'success');
        }
        this.startSimulation();
      } else {
        if (typeof showToast === 'function') {
          showToast('⏹️ DEMO MODE: OFF — Live simulation stopped.', 'info');
        }
        this.stopSimulation();
      }
      return this.isActive;
    }

    toggleDemoMode() {
      return this.toggle();
    }

    updateButtonUI() {
      const badge = document.getElementById('demoModeToggleBtn');
      if (!badge) return;

      if (this.isActive) {
        badge.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        badge.style.color = '#ffffff';
        badge.style.borderColor = '#10b981';
        badge.style.boxShadow = '0 0 14px rgba(16, 185, 129, 0.4)';
        badge.innerHTML = '🟢 DEMO MODE: ON';
      } else {
        badge.style.background = 'rgba(255, 255, 255, 0.06)';
        badge.style.color = '#c084fc';
        badge.style.borderColor = 'rgba(168, 85, 247, 0.4)';
        badge.style.boxShadow = 'none';
        badge.innerHTML = '🎮 DEMO MODE: OFF';
      }
    }

    startSimulation() {
      if (this.interval) clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.step++;

        // 1. Shift coordinates slightly for riders on map to simulate GPS movement
        if (window.PahadiMockDB && window.PahadiMockDB.riders) {
          window.PahadiMockDB.riders.forEach((rider, idx) => {
            if (rider.coords && rider.coords.length === 2) {
              const deltaLat = (Math.sin(this.step + idx) * 0.00035);
              const deltaLng = (Math.cos(this.step + idx) * 0.00035);
              rider.coords[0] += deltaLat;
              rider.coords[1] += deltaLng;
              rider.speed = Math.max(12, Math.round(22 + Math.sin(this.step + idx) * 9));
              rider.elevation = Math.round((rider.elevation || 1500) + Math.sin(this.step) * 5);
            }
          });
        }

        // 2. Re-render map layers smoothly if on overview tab
        if (typeof initGodViewMap === 'function' && window.leafletMap) {
          const currentTown = document.getElementById('townSelect')?.value || 'solan';
          initGodViewMap(currentTown);
        }

        // 3. Occasionally simulate new incoming order
        if (this.step % 4 === 0 && typeof simulateIncomingOrder === 'function') {
          simulateIncomingOrder();
        }
      }, 3000);
    }

    stopSimulation() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
  }

  const demoInstance = new PahadiDemoMode();
  window.PahadiDemoMode = demoInstance;
  window.DemoModeService = demoInstance;
  window.toggleDemoMode = function() {
    return demoInstance.toggle();
  };
})();
