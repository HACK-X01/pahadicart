/**
 * Jeevanix Local — Sovereign Protected Database Explorer
 * Complete collection view, record inspection, search/filter,
 * safe edits, soft-delete, and 1-click JSON/CSV export.
 */

window.DbExplorer = (function() {
  let currentCollection = 'orders';
  let searchTerm = '';

  const SCHEMAS = {
    orders: {
      name: 'Orders Collection',
      primaryKey: 'id',
      fields: ['id', 'customerName', 'customerPhone', 'town', 'total', 'paymentMode', 'paymentStatus', 'status', 'createdAt']
    },
    payments: {
      name: 'Payments & UTR Register',
      primaryKey: 'orderId',
      fields: ['orderId', 'customerName', 'amount', 'paymentMode', 'utrRef', 'paymentStatus', 'createdAt']
    },
    users: {
      name: 'Registered Customers',
      primaryKey: 'id',
      fields: ['id', 'name', 'phone', 'address', 'town', 'createdAt']
    },
    merchants: {
      name: 'Vyapar Mandal Merchant Partners',
      primaryKey: 'id',
      fields: ['id', 'name', 'phone', 'town', 'category', 'commission', 'status']
    },
    riders: {
      name: 'Pahadi Delivery Fleet',
      primaryKey: 'id',
      fields: ['id', 'name', 'phone', 'town', 'bike', 'status', 'cashInHand']
    },
    products: {
      name: 'Catalog Master Products',
      primaryKey: 'id',
      fields: ['id', 'name', 'price', 'category', 'stock', 'unit']
    },
    categories: {
      name: 'Store Categories & Navigation',
      primaryKey: 'id',
      fields: ['id', 'name', 'icon', 'order', 'hidden']
    },
    audit_logs: {
      name: 'Immutable Security & Audit Ledger',
      primaryKey: 'id',
      fields: ['id', 'timeFormatted', 'actor', 'role', 'action', 'entity', 'status']
    },
    settings: {
      name: 'Dynamic Business Rules Engine',
      primaryKey: 'key',
      fields: ['key', 'value', 'description']
    }
  };

  function getCollectionData(colName) {
    try {
      if (colName === 'orders') {
        return window.pahadiBus ? window.pahadiBus.getOrders('all') : [];
      } else if (colName === 'payments') {
        return (window.PaymentsDesk && window.PaymentsDesk.getPaymentList) ? window.PaymentsDesk.getPaymentList() : [];
      } else if (colName === 'users') {
        return JSON.parse(localStorage.getItem('jeevanix_users_db')) || [];
      } else if (colName === 'merchants') {
        return (window.PAHADICART_DATA && window.PAHADICART_DATA.merchants) || [];
      } else if (colName === 'riders') {
        return window.pahadiBus ? window.pahadiBus.getRiders() : [];
      } else if (colName === 'products') {
        return (window.PAHADICART_DATA && window.PAHADICART_DATA.products) || [];
      } else if (colName === 'categories') {
        return (window.PAHADICART_DATA && window.PAHADICART_DATA.categories) || [];
      } else if (colName === 'audit_logs') {
        return (window.PahadiAdminApi && window.PahadiAdminApi.getAuditLogs()) || [];
      } else if (colName === 'settings') {
        const rules = (window.SettingsService && window.SettingsService.getBusinessRules) ? window.SettingsService.getBusinessRules() : {};
        return Object.keys(rules).map(k => ({ key: k, value: JSON.stringify(rules[k]), description: 'System business parameter' }));
      }
    } catch(e) {
      console.warn('DB read error for ' + colName, e);
    }
    return [];
  }

  function renderDbExplorer() {
    const tableContainer = document.getElementById('dbExplorerTableBody');
    const headerContainer = document.getElementById('dbExplorerTableHead');
    const countBadge = document.getElementById('dbRecordCountBadge');
    const titleEl = document.getElementById('dbCollectionTitle');

    if (!tableContainer || !headerContainer) return;

    const schema = SCHEMAS[currentCollection] || SCHEMAS.orders;
    if (titleEl) titleEl.innerText = schema.name;

    let records = getCollectionData(currentCollection);

    if (searchTerm) {
      records = records.filter(r => JSON.stringify(r).toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (countBadge) countBadge.innerText = records.length + ' Records';

    headerContainer.innerHTML = '<tr>' +
      schema.fields.map(f => '<th style="padding:10px 12px; font-size:11px; text-transform:uppercase; color:#94a3b8; text-align:left;">' + f + '</th>').join('') +
      '<th style="padding:10px 12px; font-size:11px; text-transform:uppercase; color:#94a3b8; text-align:right;">Actions</th>' +
    '</tr>';

    if (records.length === 0) {
      tableContainer.innerHTML = '<tr><td colspan="' + (schema.fields.length + 1) + '" style="text-align:center; padding:32px; color:var(--slate-400);">No records match current query.</td></tr>';
      return;
    }

    tableContainer.innerHTML = records.map((rec, idx) => {
      const isSoftDeleted = rec._deleted === true;
      const primaryVal = rec[schema.primaryKey] || ('rec-' + idx);

      return '<tr style="border-bottom:1px solid rgba(255,255,255,0.06); ' + (isSoftDeleted ? 'opacity:0.45; text-decoration:line-through;' : '') + '">' +
        schema.fields.map(f => {
          let val = rec[f];
          if (typeof val === 'object' && val !== null) val = JSON.stringify(val).substring(0, 30) + '...';
          return '<td style="padding:10px 12px; font-size:12px; color:#f1f5f9; font-family:' + (f.toLowerCase().includes('id') || f.toLowerCase().includes('phone') ? 'var(--font-mono)' : 'inherit') + ';">' + (val != null ? val : '—') + '</td>';
        }).join('') +
        '<td style="padding:10px 12px; text-align:right; white-space:nowrap;">' +
          '<button class="btn btn-sm btn-secondary" onclick="window.DbExplorer.inspectRecord(\'' + currentCollection + '\', \'' + primaryVal + '\')" style="padding:4px 8px; font-size:11px; margin-right:4px;">👁️ View</button>' +
          '<button class="btn btn-sm btn-secondary" onclick="window.DbExplorer.toggleSoftDelete(\'' + currentCollection + '\', \'' + primaryVal + '\')" style="padding:4px 8px; font-size:11px;">' + (isSoftDeleted ? '♻️ Restore' : '🗑️ Soft Delete') + '</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  function setCollection(colName) {
    currentCollection = colName;
    renderDbExplorer();
  }

  function setSearch(term) {
    searchTerm = term;
    renderDbExplorer();
  }

  function inspectRecord(colName, primaryVal) {
    const data = getCollectionData(colName);
    const schema = SCHEMAS[colName] || SCHEMAS.orders;
    const rec = data.find(r => String(r[schema.primaryKey]) === String(primaryVal));

    if (!rec) return alert('Record not found');

    const modal = document.getElementById('dbRecordModal');
    const content = document.getElementById('dbRecordModalContent');
    const title = document.getElementById('dbRecordModalTitle');

    if (modal && content) {
      if (title) title.innerText = colName.toUpperCase() + ' #' + primaryVal;
      content.innerHTML = '<pre style="background:#090d16; padding:16px; border-radius:10px; color:#38bdf8; font-size:12px; max-height:60vh; overflow:auto;">' +
        JSON.stringify(rec, null, 2) +
      '</pre>';
      modal.style.display = 'flex';
    }
  }

  function toggleSoftDelete(colName, primaryVal) {
    window.JeevanixFounderAuth.promptVerification('SOFT_DELETE_RECORD', (reason) => {
      const data = getCollectionData(colName);
      const schema = SCHEMAS[colName] || SCHEMAS.orders;
      const rec = data.find(r => String(r[schema.primaryKey]) === String(primaryVal));
      if (rec) {
        rec._deleted = !rec._deleted;
        showToast('Record #' + primaryVal + (rec._deleted ? ' soft deleted.' : ' restored.'));
        renderDbExplorer();
      }
    }, true);
  }

  function exportTableJson() {
    const data = getCollectionData(currentCollection);
    downloadFile(JSON.stringify(data, null, 2), currentCollection + '_export.json', 'application/json');
    showToast('Downloaded ' + currentCollection + ' as JSON!');
  }

  function exportTableCsv() {
    const data = getCollectionData(currentCollection);
    if (data.length === 0) return alert('No records to export');
    const schema = SCHEMAS[currentCollection] || SCHEMAS.orders;
    const headers = schema.fields;
    const rows = data.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    downloadFile(csv, currentCollection + '_export.csv', 'text/csv');
    showToast('Downloaded ' + currentCollection + ' as CSV!');
  }

  function exportFullSnapshot() {
    window.JeevanixFounderAuth.promptVerification('EXPORT_FULL_DATABASE', () => {
      const snapshot = {
        platform: 'Jeevanix Local',
        exportedAt: new Date().toISOString(),
        version: '1.0.0-mvp',
        collections: {}
      };
      Object.keys(SCHEMAS).forEach(k => {
        snapshot.collections[k] = getCollectionData(k);
      });
      downloadFile(JSON.stringify(snapshot, null, 2), 'jeevanix_full_db_snapshot_' + Date.now() + '.json', 'application/json');
      showToast('👑 Master Database Snapshot Downloaded!');
    });
  }

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return {
    render: renderDbExplorer,
    setCollection,
    setSearch,
    inspectRecord,
    toggleSoftDelete,
    exportTableJson,
    exportTableCsv,
    exportFullSnapshot
  };
})();
