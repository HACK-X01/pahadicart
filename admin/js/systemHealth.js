// PahadiCart Platform Telemetry & System Health Inspector
(function() {
  function renderSystemHealthDeck() {
    const container = document.getElementById('systemHealthContainer');
    if (!container || !window.PahadiAdminApi) return;

    const h = window.PahadiAdminApi.getSystemHealth();
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px;">
        <div class="panel-card" style="border-left: 4px solid #10b981;">
          <div style="font-size: 11px; color: var(--slate-400); font-weight: 700;">API GATEWAY STATUS</div>
          <div style="font-size: 22px; font-weight: 800; color: #10b981; margin-top: 4px;">${h.status}</div>
          <div style="font-size: 11.5px; color: var(--slate-300); margin-top: 2px;">Latency: <b>${h.latencyMs} ms</b> (Himachal Edge)</div>
        </div>
        <div class="panel-card" style="border-left: 4px solid #38bdf8;">
          <div style="font-size: 11px; color: var(--slate-400); font-weight: 700;">POSTGRESQL 16 + POSTGIS</div>
          <div style="font-size: 22px; font-weight: 800; color: #38bdf8; margin-top: 4px;">${h.postgres.status}</div>
          <div style="font-size: 11.5px; color: var(--slate-300); margin-top: 2px;">Pool: <b>${h.postgres.poolActive} / ${h.postgres.maxPool} Active</b></div>
        </div>
        <div class="panel-card" style="border-left: 4px solid #f59e0b;">
          <div style="font-size: 11px; color: var(--slate-400); font-weight: 700;">REDIS 7 GEOSPATIAL</div>
          <div style="font-size: 22px; font-weight: 800; color: #f59e0b; margin-top: 4px;">${h.redis.status}</div>
          <div style="font-size: 11.5px; color: var(--slate-300); margin-top: 2px;">Throughput: <b>${h.redis.opsPerSec} ops/sec</b></div>
        </div>
        <div class="panel-card" style="border-left: 4px solid #a855f7;">
          <div style="font-size: 11px; color: var(--slate-400); font-weight: 700;">WSS TELEMETRY CLIENTS</div>
          <div style="font-size: 22px; font-weight: 800; color: #a855f7; margin-top: 4px;">${h.websocket.status}</div>
          <div style="font-size: 11.5px; color: var(--slate-300); margin-top: 2px;">Connected: <b>${h.websocket.activeConnections} Riders</b></div>
        </div>
      </div>

      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">Connected Cloud Infrastructure & Third-Party Gateways</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 14px;">
          <div style="background: var(--slate-900); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-weight: 700; color: #fff;">Open-Meteo Meteorological API</div>
            <div style="font-size: 12px; color: #10b981; margin-top: 2px;">● Live Operational (130ms)</div>
            <div style="font-size: 11px; color: var(--slate-400); margin-top: 2px;">Himachal ridge weather auto-sync</div>
          </div>
          <div style="background: var(--slate-900); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-weight: 700; color: #fff;">Razorpay Payment Gateway</div>
            <div style="font-size: 12px; color: #10b981; margin-top: 2px;">● Test Sandbox Active (110ms)</div>
            <div style="font-size: 11px; color: var(--slate-400); margin-top: 2px;">UPI, Netbanking & Webhook verifies</div>
          </div>
          <div style="background: var(--slate-900); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="font-weight: 700; color: #fff;">Meta WhatsApp Cloud API</div>
            <div style="font-size: 12px; color: #10b981; margin-top: 2px;">● Webhook Dispatcher Ready (95ms)</div>
            <div style="font-size: 11px; color: var(--slate-400); margin-top: 2px;">Hinglish customer chatbot engine</div>
          </div>
        </div>
      </div>
    `;
  }

  window.renderSystemHealthDeck = renderSystemHealthDeck;
})();
