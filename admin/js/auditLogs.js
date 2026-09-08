// PahadiCart Immutable Operational & Financial Audit Log Viewer
(function() {
  function renderAuditLogsTable() {
    const container = document.getElementById('auditLogsTableBody');
    if (!container || !window.PahadiAdminApi) return;

    const logs = window.PahadiAdminApi.getAuditLogs();
    container.innerHTML = logs.map(l => `
      <tr>
        <td>
          <div style="font-weight:700; color:#38bdf8;">${l.id}</div>
          <div style="font-size:11px; color:var(--slate-400);">${l.timeFormatted}</div>
        </td>
        <td>
          <strong>${l.actor}</strong>
          <div style="font-size:10.5px; color:var(--primary-400);">${l.role}</div>
        </td>
        <td><code style="background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px; font-size:11px; color:#fbbf24;">${l.action}</code></td>
        <td>${l.entity} (#${l.entityId})</td>
        <td>
          <div style="font-size:11px; color:var(--slate-400); text-decoration:line-through;">${l.oldValue || '—'}</div>
          <div style="font-size:11.5px; color:#34d399; font-weight:700;">${l.newValue || '—'}</div>
        </td>
        <td style="font-size:11.5px; color:var(--slate-300); max-width:220px;">${l.reason}</td>
        <td style="font-size:10px; color:var(--slate-400);">${l.ip}</td>
      </tr>
    `).join('');
  }

  window.renderAuditLogsTable = renderAuditLogsTable;
})();
