// PahadiCart Platform Telemetry & System Health Inspector
(function() {
  function renderSystemHealthDeck() {
    const container = document.getElementById('systemHealthContainer');
    if (!container || !window.PahadiAdminApi) return;

    const h = window.PahadiAdminApi.getSystemHealth();
    const isWssActive = h.websocket.activeConnections > 0;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
        <div class="panel-card" style="border-left: 4px solid #10b981;">
          <div style="font-size: 11px; color: var(--slate-400); font-weight: 700; text-transform: uppercase;">API GATEWAY STATUS</div>
          <div style="font-size: 22px; font-weight: 800; color: #10b981; margin-top: 4px;">${h.status}</div>
          <div style="font-size: 11.5px; color: var(--slate-300); margin-top: 2px;">Latency: <b>${h.latencyMs} ms</b> (Himachal Edge)</div>
        </div>
        <div class="panel-card" style="border-left: 4px solid #38bdf8;">
          <div style="font-size: 11px; color: var(--slate-400); font-weight: 700; text-transform: uppercase;">POSTGRESQL 16 + POSTGIS</div>
          <div style="font-size: 22px; font-weight: 800; color: #38bdf8; margin-top: 4px;">${h.postgres.status}</div>
          <div style="font-size: 11.5px; color: var(--slate-300); margin-top: 2px;">Pool: <b>${h.postgres.poolActive} / ${h.postgres.maxPool} Active</b> (Idle)</div>
        </div>
        <div class="panel-card" style="border-left: 4px solid #f59e0b;">
          <div style="font-size: 11px; color: var(--slate-400); font-weight: 700; text-transform: uppercase;">REDIS 7 GEOSPATIAL</div>
          <div style="font-size: 22px; font-weight: 800; color: #f59e0b; margin-top: 4px;">${h.redis.status}</div>
          <div style="font-size: 11.5px; color: var(--slate-300); margin-top: 2px;">Throughput: <b>${h.redis.opsPerSec} ops/sec</b></div>
        </div>
        <div class="panel-card" style="border-left: 4px solid ${isWssActive ? '#10b981' : '#64748b'};">
          <div style="font-size: 11px; color: var(--slate-400); font-weight: 700; text-transform: uppercase;">WSS TELEMETRY CLIENTS</div>
          <div style="font-size: 22px; font-weight: 800; color: ${isWssActive ? '#10b981' : '#94a3b8'}; margin-top: 4px;">${h.websocket.status}</div>
          <div style="font-size: 11.5px; color: var(--slate-300); margin-top: 2px;">Connected: <b>${h.websocket.activeConnections} Riders</b></div>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">Connected Cloud Infrastructure & Third-Party Gateways</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 14px;">
          <div style="background: var(--slate-900); padding: 14px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-weight: 700; color: #fff; font-size: 13.5px;">Open-Meteo Meteorological API</div>
            <div style="font-size: 12px; color: #10b981; margin-top: 4px;">● Live Operational (120ms)</div>
            <div style="font-size: 11px; color: var(--slate-400); margin-top: 4px;">Himachal ridge weather auto-sync & snowfall radar</div>
          </div>
          <div style="background: var(--slate-900); padding: 14px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-weight: 700; color: #fff; font-size: 13.5px;">Razorpay Payment Gateway</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">○ Standby (Awaiting Production Keys)</div>
            <div style="font-size: 11px; color: var(--slate-400); margin-top: 4px;">Configure in Settings for live customer UPI checkout</div>
          </div>
          <div style="background: var(--slate-900); padding: 14px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-weight: 700; color: #fff; font-size: 13.5px;">Meta WhatsApp Cloud API</div>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">○ Standby (Webhook Ready)</div>
            <div style="font-size: 11px; color: var(--slate-400); margin-top: 4px;">Automated customer order alerts & hill dispatch updates</div>
          </div>
        </div>
      </div>
    `;
  }

  window.renderSystemHealthDeck = renderSystemHealthDeck;
})();
