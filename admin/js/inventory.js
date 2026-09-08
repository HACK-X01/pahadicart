/**
 * PahadiCart Super Admin - Product & Inventory Catalog Inspector
 * Controlled inventory overrides, category commission alignment, and stock monitoring.
 */

window.InventoryService = (function() {
  const mockInventory = [
    { id: 'SKU-SOL-101', name: 'Himachal Button Mushrooms (A-Grade)', merchant: 'Solan Mushroom Farm', town: 'solan', townName: 'Solan', category: 'Fresh Produce', commissionRate: '8%', mrp: 140, sellingPrice: 120, stock: 45, unit: 'kg', active: true },
    { id: 'SKU-SOL-102', name: 'Organic Wild Honey (Dharampur Forest)', merchant: 'Solan Mushroom Farm', town: 'solan', townName: 'Solan', category: 'Kirana', commissionRate: '6%', mrp: 450, sellingPrice: 399, stock: 3, unit: 'bottle', active: true },
    { id: 'SKU-SHM-201', name: 'Traditional Steamed Siddu with Ghee', merchant: 'Mall Road Flavours', town: 'shimla', townName: 'Shimla', category: 'Restaurants', commissionRate: '18%', mrp: 150, sellingPrice: 130, stock: 28, unit: 'plate', active: true },
    { id: 'SKU-SHM-202', name: 'Freshly Baked Walnut Fudge Cake', merchant: 'The Ridge Bakehouse', town: 'shimla', townName: 'Shimla', category: 'Bakery', commissionRate: '14%', mrp: 350, sellingPrice: 320, stock: 0, unit: 'box', active: false },
    { id: 'SKU-DHM-301', name: 'Tibetan Herbal Butter Tea Packets', merchant: 'Tibetan Herbal & Spice Store', town: 'dharamshala', townName: 'Dharamshala', category: 'Kirana', commissionRate: '6%', mrp: 220, sellingPrice: 195, stock: 62, unit: 'pack', active: true },
    { id: 'SKU-DHM-302', name: 'Kangra Valley Orthodox Green Tea (FTGFOP)', merchant: 'Kangra Tea Emporium', town: 'dharamshala', townName: 'Dharamshala', category: 'Specialty Tea', commissionRate: '12%', mrp: 580, sellingPrice: 520, stock: 4, unit: 'tin', active: true }
  ];

  let currentInventory = [...mockInventory];
  let filterCategory = 'all';
  let filterTown = 'all';
  let filterStock = 'all';
  let searchQuery = '';

  function renderInventoryTable() {
    const container = document.getElementById('inventoryTableBody');
    if (!container) return;

    let filtered = currentInventory.filter(item => {
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      if (filterTown !== 'all' && item.town !== filterTown) return false;
      if (filterStock === 'IN_STOCK' && item.stock <= 4) return false;
      if (filterStock === 'LOW_STOCK' && (item.stock === 0 || item.stock > 4)) return false;
      if (filterStock === 'OUT_OF_STOCK' && item.stock > 0) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q) || item.merchant.toLowerCase().includes(q);
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--slate-400);">No inventory items match criteria.</td></tr>';
      return;
    }

    container.innerHTML = filtered.map(item => (
      '<tr>' +
        '<td><div style="font-weight:700; color:#fff;">' + item.name + '</div><div style="font-size:11px; color:var(--slate-400); font-family:var(--font-mono);">' + item.id + '</div></td>' +
        '<td><div style="font-size:12px; color:#e2e8f0;">' + item.merchant + '</div><div style="font-size:11px; color:var(--slate-400);">' + item.townName + '</div></td>' +
        '<td><span style="font-size:12px; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:4px;">' + item.category + '</span><div style="font-size:11px; color:var(--emerald-400); margin-top:2px;">Take: ' + item.commissionRate + '</div></td>' +
        '<td><div style="font-weight:700; color:#fff; font-family:var(--font-mono);">₹' + item.sellingPrice + '</div><div style="font-size:11px; color:var(--slate-400); text-decoration:line-through;">₹' + item.mrp + '</div></td>' +
        '<td><div style="font-weight:800; font-family:var(--font-mono); font-size:14px; color:' + (item.stock === 0 ? 'var(--rose-400)' : item.stock <= 4 ? '#f59e0b' : 'var(--emerald-400)') + ';">' + item.stock + ' ' + item.unit + '</div></td>' +
        '<td><span class="badge ' + (item.stock === 0 ? 'badge-danger' : item.stock <= 4 ? 'badge-warning' : 'badge-success') + '">' + (item.stock === 0 ? 'OUT OF STOCK' : item.stock <= 4 ? 'LOW STOCK' : 'IN STOCK') + '</span></td>' +
        '<td><span class="badge ' + (item.active ? 'badge-success' : 'badge-danger') + '">' + (item.active ? 'ACTIVE' : 'DISABLED') + '</span></td>' +
        '<td><div style="display:flex; gap:6px;">' +
          '<button class="btn btn-secondary btn-sm" onclick="window.InventoryService.openStockOverrideModal(\'' + item.id + '\')" style="padding:4px 8px; font-size:11px;">Override Stock</button>' +
          '<button class="btn btn-secondary btn-sm" onclick="window.InventoryService.toggleItemActive(\'' + item.id + '\')" style="padding:4px 8px; font-size:11px; color:' + (item.active ? 'var(--rose-400)' : 'var(--emerald-400)') + ';">' + (item.active ? 'Disable' : 'Enable') + '</button>' +
        '</div></td>' +
      '</tr>'
    )).join('');

    const countBadge = document.getElementById('inventoryCountBadge');
    if (countBadge) countBadge.innerText = filtered.length + ' Items Listed';
  }

  function openStockOverrideModal(skuId) {
    if (window.RbacService && !window.RbacService.canPerform('INVENTORY', 'OVERRIDE')) {
      alert('Permission Denied: Stock overrides require SUPER_ADMIN or OPERATIONS_ADMIN.');
      return;
    }
    const item = currentInventory.find(x => x.id === skuId);
    if (!item) return;
    const newStockStr = prompt('Controlled Stock Override for ' + item.name + ' (' + item.id + '):\nCurrent Stock: ' + item.stock + ' ' + item.unit + '\nEnter new verified stock quantity:', item.stock);
    if (newStockStr === null) return;
    const newStock = parseInt(newStockStr, 10);
    if (isNaN(newStock) || newStock < 0) { alert('Invalid quantity'); return; }
    const reason = prompt('Audit Note: Why is admin overriding merchant inventory stock?', 'Stock discrepancy verified on-ground');
    if (!reason) return;
    const oldStock = item.stock;
    item.stock = newStock;
    if (window.AdminApiService) {
      window.AdminApiService.createAuditLog('INVENTORY_STOCK_OVERRIDDEN', 'PRODUCT', item.id, { stock: oldStock }, { stock: newStock, reason: reason });
    }
    renderInventoryTable();
    if (window.showToast) window.showToast('Stock for ' + item.id + ' set to ' + newStock + ' (Audited).', 'success');
  }

  function toggleItemActive(skuId) {
    if (window.RbacService && !window.RbacService.canPerform('INVENTORY', 'OVERRIDE')) {
      alert('Permission Denied: Requires OPERATIONS_ADMIN or SUPER_ADMIN.');
      return;
    }
    const item = currentInventory.find(x => x.id === skuId);
    if (!item) return;
    const oldActive = item.active;
    item.active = !item.active;
    if (window.AdminApiService) {
      window.AdminApiService.createAuditLog(item.active ? 'PRODUCT_ENABLED' : 'PRODUCT_DISABLED', 'PRODUCT', item.id, { active: oldActive }, { active: item.active });
    }
    renderInventoryTable();
    if (window.showToast) window.showToast('Item ' + item.name + ' ' + (item.active ? 'enabled' : 'disabled') + '.', 'info');
  }

  function init() {
    renderInventoryTable();
    const searchInput = document.getElementById('inventorySearchInput');
    if (searchInput) searchInput.addEventListener('input', e => { searchQuery = e.target.value; renderInventoryTable(); });
    const catSelect = document.getElementById('inventoryCatFilter');
    if (catSelect) catSelect.addEventListener('change', e => { filterCategory = e.target.value; renderInventoryTable(); });
    const townSelect = document.getElementById('inventoryTownFilter');
    if (townSelect) townSelect.addEventListener('change', e => { filterTown = e.target.value; renderInventoryTable(); });
    const stockSelect = document.getElementById('inventoryStockFilter');
    if (stockSelect) stockSelect.addEventListener('change', e => { filterStock = e.target.value; renderInventoryTable(); });
  }

  return { init, renderInventoryTable, openStockOverrideModal, toggleItemActive };
})();
