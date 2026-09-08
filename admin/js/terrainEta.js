// PahadiCart Terrain & Elevation-Aware ETA Engine + Interactive Debugger
(function() {
  const DEFAULT_CONFIG = {
    alpha: 0.18, // Gradient resistance factor
    vBase: 25, // Base mountain speed in km/h
    turnPenaltyMultiplier: 0.035, // Hairpin bend penalty coefficient
    stairMinsPerStep: 0.25, // 15 mins for 60 steps
    rainBufferMins: 15,
    fogBufferMins: 25,
    snowBufferMins: 35,
    prepTimeMins: 12
  };

  class PahadiTerrainEtaEngine {
    constructor() {
      this.config = { ...DEFAULT_CONFIG };
      this.loadConfig();
    }

    loadConfig() {
      try {
        const stored = localStorage.getItem('pahadi_terrain_eta_config');
        if (stored) this.config = { ...this.config, ...JSON.parse(stored) };
      } catch (e) {}
    }

    saveConfig(newCfg) {
      this.config = { ...this.config, ...newCfg };
      localStorage.setItem('pahadi_terrain_eta_config', JSON.stringify(this.config));
      if (window.PahadiAdminApi) {
        window.PahadiAdminApi.recordAudit('ETA_CONFIG_UPDATED', 'TerrainEngine', 'CONFIG', 'OLD_CONFIG', JSON.stringify(this.config), 'Admin modified ETA parameters');
      }
    }

    // Exact PRD Formulation (Section 6 & 19)
    calculateETA(inputs) {
      const {
        dRoadKm = 3.2,
        elevPickup = 1502,
        elevDrop = 1620,
        hairpinCount = 6,
        stairCount = 35,
        weather = 'clear'
      } = inputs;

      const elevDiff = elevDrop - elevPickup;
      const gradient = Math.max(0, elevDiff / (dRoadKm * 1000));
      const gradientFactor = 1 + (this.config.alpha * gradient * 100);
      const turnPenalty = 1 + (hairpinCount * this.config.turnPenaltyMultiplier);

      const baseTransitHours = dRoadKm / this.config.vBase;
      const transitMins = Math.round(baseTransitHours * 60 * gradientFactor * turnPenalty);

      const stairMins = Math.round(stairCount * this.config.stairMinsPerStep);

      let weatherBuffer = 0;
      if (weather === 'rain') weatherBuffer = this.config.rainBufferMins;
      else if (weather === 'fog') weatherBuffer = this.config.fogBufferMins;
      else if (weather === 'snow') weatherBuffer = this.config.snowBufferMins;

      const totalETA = this.config.prepTimeMins + transitMins + stairMins + weatherBuffer;

      return {
        totalETA,
        prepMins: this.config.prepTimeMins,
        transitMins,
        stairMins,
        weatherBuffer,
        elevDiff,
        gradient: (gradient * 100).toFixed(2) + '%',
        turnPenalty: turnPenalty.toFixed(3),
        dRoadKm
      };
    }
  }

  window.PahadiTerrainEngine = new PahadiTerrainEtaEngine();

  // Run interactive ETA Debugger Calculation
  window.runEtaDebugger = function() {
    const dRoadKm = parseFloat(document.getElementById('dbgRoadDist')?.value || 3.2);
    const elevPickup = parseFloat(document.getElementById('dbgElevPickup')?.value || 1502);
    const elevDrop = parseFloat(document.getElementById('dbgElevDrop')?.value || 1620);
    const hairpinCount = parseInt(document.getElementById('dbgHairpins')?.value || 6);
    const stairCount = parseInt(document.getElementById('dbgStairs')?.value || 35);
    const weather = document.getElementById('dbgWeather')?.value || 'clear';

    const result = window.PahadiTerrainEngine.calculateETA({
      dRoadKm, elevPickup, elevDrop, hairpinCount, stairCount, weather
    });

    const outEl = document.getElementById('dbgOutputBreakdown');
    if (outEl) {
      outEl.innerHTML = `
        <div style="background: rgba(16,185,129,0.1); border: 1px solid #10b981; border-radius: 12px; padding: 18px; margin-top: 14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-size:12px; color:#34d399; font-weight:800; text-transform:uppercase;">Predicted Hill ETA Breakdown</span>
            <strong style="font-size:24px; color:#10b981;">${result.totalETA} Mins</strong>
          </div>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; text-align:center; font-size:11px;">
            <div style="background:rgba(255,255,255,0.04); padding:8px; border-radius:8px;">
              <span style="color:#94a3b8;">Prep Time</span>
              <div style="font-size:14px; font-weight:700; color:#fff;">${result.prepMins}m</div>
            </div>
            <div style="background:rgba(255,255,255,0.04); padding:8px; border-radius:8px;">
              <span style="color:#94a3b8;">Transit (Slope + Turns)</span>
              <div style="font-size:14px; font-weight:700; color:#38bdf8;">${result.transitMins}m</div>
            </div>
            <div style="background:rgba(255,255,255,0.04); padding:8px; border-radius:8px;">
              <span style="color:#94a3b8;">Staircase Steps</span>
              <div style="font-size:14px; font-weight:700; color:#fbbf24;">${result.stairMins}m</div>
            </div>
            <div style="background:rgba(255,255,255,0.04); padding:8px; border-radius:8px;">
              <span style="color:#94a3b8;">Weather Buffer</span>
              <div style="font-size:14px; font-weight:700; color:#f87171;">+${result.weatherBuffer}m</div>
            </div>
          </div>
          <div style="margin-top:10px; font-size:11px; color:#94a3b8; border-top:1px solid rgba(255,255,255,0.08); padding-top:8px;">
            Elevation Climb: <b>+${result.elevDiff}m</b> &bull; Gradient: <b>${result.gradient}</b> &bull; Turn Penalty: <b>${result.turnPenalty}x</b>
          </div>
        </div>
      `;
    }
  };
})();
