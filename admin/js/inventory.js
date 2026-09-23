/**
 * PahadiCart Super Admin — Comprehensive Product & Inventory Control Center
 * Manages Local Shop items, Jeevanix Health & Wellness supplements, pricing, stock, approvals & launches.
 */

window.InventoryService = (function() {
  let filterCategory = 'all';
  let filterTown = 'all';
  let filterStock = 'all';
  let filterProductType = 'all'; // 'all' | 'local' | 'jeevanix' | 'pending_approval'
  let searchQuery = '';

  function getProducts() {
    if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
    if (!window.PAHADICART_DATA.products) {
      try {
        const stored = localStorage.getItem('pahadicart_products');
        window.PAHADICART_DATA.products = stored ? JSON.parse(stored) : [];
      } catch (e) {
        window.PAHADICART_DATA.products = [];
      }
    }
    return window.PAHADICART_DATA.products;
  }

  function saveProducts(products) {
    window.PAHADICART_DATA.products = products;
    try {
      localStorage.setItem('pahadicart_products', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
    if (window.pahadiBus) {
      window.pahadiBus.emit('PRODUCT_ADDED', products);
      window.pahadiBus.emit('PRODUCT_STOCK_CHANGED', products);
    }
  }

  function renderInventoryTable() {
    const container = document.getElementById('inventoryTableBody');
    if (!container) return;

    const products = getProducts();
    const badge = document.getElementById('inventoryCountBadge');
    if (badge) badge.innerText = `${products.length} Products in Catalog`;

    let filtered = products.filter(item => {
      // Category filter
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      
      // Town filter
      if (filterTown !== 'all') {
        const merchant = (window.PAHADICART_DATA.merchants || []).find(m => m.id === item.merchantId);
        if (item.town && item.town !== filterTown) return false;
        if (merchant && merchant.town !== filterTown) return false;
      }

      // Stock filter
      const stock = Number(item.stock || 0);
      if (filterStock === 'IN_STOCK' && stock <= 4) return false;
      if (filterStock === 'LOW_STOCK' && (stock === 0 || stock > 4)) return false;
      if (filterStock === 'OUT_OF_STOCK' && stock > 0) return false;

      // Product Type filter
      const isJeevanix = item.productType === 'jeevanix' || item.category === 'wellness';
      if (filterProductType === 'local' && isJeevanix) return false;
      if (filterProductType === 'jeevanix' && !isJeevanix) return false;
      if (filterProductType === 'pending_approval' && item.approvalStatus !== 'pending') return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const m = (window.PAHADICART_DATA.merchants || []).find(mer => mer.id === item.merchantId);
        const mName = m ? m.name.toLowerCase() : '';
        const name = (item.name || '').toLowerCase();
        const brand = (item.brand || '').toLowerCase();
        const id = (item.id || '').toLowerCase();
        return name.includes(q) || brand.includes(q) || id.includes(q) || mName.includes(q);
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:40px 20px; color:var(--slate-400);">
            <div style="font-size:36px; margin-bottom:10px;">📦</div>
            <div style="font-size:14px; font-weight:700; color:#fff; margin-bottom:6px;">Koi product nahi mila</div>
            <p style="font-size:12px; margin-bottom:14px;">Aap "+ Naya Product Jodein" button se direct catalog me product add kar sakte hain.</p>
            <button class="btn btn-primary" onclick="window.InventoryService.openProductModal()" style="font-size:12px; padding:6px 14px;">+ Naya Product Add Karein</button>
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const isJeevanix = item.productType === 'jeevanix' || item.category === 'wellness';
      const merchant = (window.PAHADICART_DATA.merchants || []).find(m => m.id === item.merchantId);
      const merchantName = isJeevanix ? (item.brand || 'Jeevanix Himalayan Wellness') : (merchant ? merchant.name : 'Vyapar Mandal Store');
      const stock = Number(item.stock || 0);
      const isLaunched = item.isLaunched !== false;
      const isActive = item.active !== false && item.inStock !== false;
      const approval = item.approvalStatus || 'approved';

      return `
        <tr id="row-prod-${item.id}">
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:24px; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:8px;">${item.image || (isJeevanix ? '🌿' : '🍎')}</span>
              <div>
                <div style="font-weight:700; color:#fff; display:flex; align-items:center; gap:6px;">
                  <span>${item.name}</span>
                  ${isJeevanix ? '<span style="background:rgba(16,185,129,0.2); color:#34d399; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; border:1px solid rgba(16,185,129,0.4);">JEEVANIX</span>' : ''}
                  ${item.badge ? `<span style="background:rgba(245,158,11,0.2); color:#fbbf24; font-size:10px; font-weight:700; padding:1px 5px; border-radius:4px;">${item.badge}</span>` : ''}
                </div>
                <div style="font-size:11px; color:var(--slate-400); font-family:var(--font-mono); margin-top:2px;">
                  SKU: ${item.id} • ${item.brand || 'Himachal Local'}
                </div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size:12px; color:#e2e8f0; font-weight:600;">${merchantName}</div>
            <div style="font-size:11px; color:var(--slate-400);">${item.town || (merchant ? merchant.town : 'Himachal')}</div>
          </td>
          <td>
            <span style="font-size:11px; background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:4px; font-weight:600;">${item.category || 'General'}</span>
            ${isJeevanix ? `<div style="font-size:10.5px; color:#38bdf8; margin-top:3px;">${item.dosage || 'Ayush Verified'}</div>` : ''}
          </td>
          <td>
            <div style="font-weight:800; color:#fff; font-family:var(--font-mono); font-size:13px;">₹${item.price}</div>
            ${item.mrp ? `<div style="font-size:11px; color:var(--slate-400); text-decoration:line-through;">₹${item.mrp}</div>` : ''}
            <button onclick="window.InventoryService.quickPriceEdit('${item.id}', ${item.price})" style="background:none; border:none; color:#38bdf8; font-size:10.5px; cursor:pointer; padding:0; text-decoration:underline;">Change</button>
          </td>
          <td>
            <div style="font-weight:800; font-family:var(--font-mono); font-size:13.5px; color:${stock === 0 ? 'var(--rose-400)' : stock <= 4 ? '#f59e0b' : 'var(--emerald-400)'};">
              ${stock} ${item.unit || 'unit'}
            </div>
            <button onclick="window.InventoryService.quickStockEdit('${item.id}', ${stock})" style="background:none; border:none; color:#38bdf8; font-size:10.5px; cursor:pointer; padding:0; text-decoration:underline;">Override</button>
          </td>
          <td>
            <span class="badge ${stock === 0 ? 'badge-danger' : stock <= 4 ? 'badge-warning' : 'badge-success'}" style="font-size:10px;">
              ${stock === 0 ? 'OUT OF STOCK' : stock <= 4 ? 'LOW STOCK' : 'IN STOCK'}
            </span>
            <div style="margin-top:4px;">
              <span class="badge ${isLaunched ? 'badge-success' : 'badge-warning'}" style="font-size:9.5px;">
                ${isLaunched ? '🚀 LAUNCHED' : '⏸️ UNLAUNCHED'}
              </span>
            </div>
          </td>
          <td>
            <label style="display:inline-flex; align-items:center; cursor:pointer; gap:4px;">
              <input type="checkbox" ${isActive ? 'checked' : ''} onchange="window.InventoryService.toggleItemActive('${item.id}', this.checked)" style="accent-color:#10b981; transform:scale(1.15);">
              <span style="font-size:11px; color:${isActive ? '#34d399' : '#f87171'}; font-weight:700;">${isActive ? 'Active' : 'Off'}</span>
            </label>
            ${isJeevanix ? `
              <div style="margin-top:4px;">
                <span style="font-size:10px; font-weight:700; color:${approval === 'approved' ? '#34d399' : approval === 'rejected' ? '#f87171' : '#fbbf24'};">
                  ● ${approval.toUpperCase()}
                </span>
              </div>
            ` : ''}
          </td>
          <td>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <div style="display:flex; gap:4px;">
                <button class="btn btn-secondary btn-sm" onclick="window.InventoryService.openProductModal('${item.id}')" style="padding:3px 8px; font-size:11px; background:rgba(56,189,248,0.15); color:#38bdf8; border-color:rgba(56,189,248,0.3);">✏️ Edit</button>
                <button class="btn btn-secondary btn-sm" onclick="window.InventoryService.toggleLaunchStatus('${item.id}')" style="padding:3px 8px; font-size:11px;" title="${isLaunched ? 'Unlaunch product from store' : 'Launch product live'}">
                  ${isLaunched ? '⏸️' : '🚀'}
                </button>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.InventoryService.deleteProduct('${item.id}')" style="padding:2px 8px; font-size:10px; color:#f87171; border-color:rgba(239,68,68,0.25);">🗑️ Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- Quick Actions ---
  function quickStockEdit(id, currentStock) {
    const val = prompt('Naya Stock Level daalein:', currentStock);
    if (val === null) return;
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) {
      alert('Kripya valid stock number daalein.');
      return;
    }
    const products = getProducts();
    const p = products.find(i => i.id === id);
    if (p) {
      p.stock = num;
      p.inStock = num > 0;
      saveProducts(products);
      renderInventoryTable();
      if (window.showToast) window.showToast(`Stock updated to ${num} for ${p.name}`);
    }
  }

  function quickPriceEdit(id, currentPrice) {
    const val = prompt('Naya Selling Price (₹) daalein:', currentPrice);
    if (val === null) return;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) {
      alert('Kripya valid price dalein.');
      return;
    }
    const products = getProducts();
    const p = products.find(i => i.id === id);
    if (p) {
      p.price = num;
      saveProducts(products);
      renderInventoryTable();
      if (window.showToast) window.showToast(`Price updated to ₹${num} for ${p.name}`);
    }
  }

  function toggleItemActive(id, isChecked) {
    const products = getProducts();
    const p = products.find(i => i.id === id);
    if (p) {
      p.active = isChecked;
      p.inStock = isChecked;
      saveProducts(products);
      renderInventoryTable();
      if (window.showToast) window.showToast(`${p.name} ${isChecked ? 'Enabled' : 'Disabled'}`);
    }
  }

  function toggleLaunchStatus(id) {
    const products = getProducts();
    const p = products.find(i => i.id === id);
    if (p) {
      p.isLaunched = !(p.isLaunched !== false);
      saveProducts(products);
      renderInventoryTable();
      if (window.showToast) window.showToast(`${p.name} ${p.isLaunched ? 'Launched' : 'Unlaunched'}`);
    }
  }

  function deleteProduct(id) {
    const products = getProducts();
    const p = products.find(i => i.id === id);
    if (!p) return;
    if (confirm(`Kya aap "${p.name}" ko catalog se DELETE karna chahte hain?`)) {
      const updated = products.filter(i => i.id !== id);
      saveProducts(updated);
      renderInventoryTable();
      if (window.showToast) window.showToast(`"${p.name}" deleted from catalog.`, 'info');
    }
  }

  // --- Add / Edit Product Modal ---
  function openProductModal(productId = null) {
    let modal = document.getElementById('adminProductModal');
    if (!modal) {
      createProductModalDOM();
      modal = document.getElementById('adminProductModal');
    }

    const titleEl = document.getElementById('adminProdModalTitle');
    const idEl = document.getElementById('adminProdId');
    const typeEl = document.getElementById('adminProdType');
    const nameEl = document.getElementById('adminProdName');
    const brandEl = document.getElementById('adminProdBrand');
    const merchantEl = document.getElementById('adminProdMerchant');
    const catEl = document.getElementById('adminProdCat');
    const priceEl = document.getElementById('adminProdPrice');
    const mrpEl = document.getElementById('adminProdMrp');
    const stockEl = document.getElementById('adminProdStock');
    const unitEl = document.getElementById('adminProdUnit');
    const imageEl = document.getElementById('adminProdImage');
    const badgeEl = document.getElementById('adminProdBadge');
    const descEl = document.getElementById('adminProdDesc');
    const activeEl = document.getElementById('adminProdActive');
    const launchedEl = document.getElementById('adminProdLaunched');

    // Jeevanix specific fields
    const dosageEl = document.getElementById('adminProdDosage');
    const ingredientsEl = document.getElementById('adminProdIngredients');
    const approvalEl = document.getElementById('adminProdApproval');

    // Populate Merchants dropdown
    if (merchantEl) {
      const merchants = window.PAHADICART_DATA.merchants || [];
      merchantEl.innerHTML = merchants.map(m => `
        <option value="${m.id}">${m.name} (${m.town || 'Solan'})</option>
      `).join('');
    }

    // Populate Categories dropdown
    if (catEl) {
      const cats = window.PAHADICART_DATA.categories || [];
      catEl.innerHTML = cats.filter(c => c.id !== 'all').map(c => `
        <option value="${c.id}">${c.icon || ''} ${c.name}</option>
      `).join('');
    }

    if (productId) {
      const p = getProducts().find(i => i.id === productId);
      if (!p) return;
      titleEl.innerText = '✏️ Edit Product Details';
      idEl.value = p.id;
      typeEl.value = p.productType || (p.category === 'wellness' ? 'jeevanix' : 'local');
      nameEl.value = p.name || '';
      brandEl.value = p.brand || '';
      if (merchantEl) merchantEl.value = p.merchantId || (merchants[0] ? merchants[0].id : '');
      if (catEl) catEl.value = p.category || 'kirana';
      priceEl.value = p.price || 0;
      mrpEl.value = p.mrp || p.price || 0;
      stockEl.value = p.stock !== undefined ? p.stock : 20;
      unitEl.value = p.unit || 'unit';
      imageEl.value = p.image || '';
      badgeEl.value = p.badge || '';
      descEl.value = p.desc || '';
      activeEl.checked = p.active !== false;
      launchedEl.checked = p.isLaunched !== false;
      if (dosageEl) dosageEl.value = p.dosage || '';
      if (ingredientsEl) ingredientsEl.value = p.ingredients || '';
      if (approvalEl) approvalEl.value = p.approvalStatus || 'approved';
    } else {
      titleEl.innerText = '➕ Add New Product';
      idEl.value = '';
      typeEl.value = filterProductType === 'jeevanix' ? 'jeevanix' : 'local';
      nameEl.value = '';
      brandEl.value = typeEl.value === 'jeevanix' ? 'Jeevanix Ayurvedic' : '';
      if (catEl) catEl.value = typeEl.value === 'jeevanix' ? 'wellness' : 'kirana';
      priceEl.value = '';
      mrpEl.value = '';
      stockEl.value = '25';
      unitEl.value = 'unit';
      imageEl.value = typeEl.value === 'jeevanix' ? '🌿' : '🍎';
      badgeEl.value = '';
      descEl.value = '';
      activeEl.checked = true;
      launchedEl.checked = true;
      if (dosageEl) dosageEl.value = '';
      if (ingredientsEl) ingredientsEl.value = '';
      if (approvalEl) approvalEl.value = 'approved';
    }

    onProductTypeChanged();
    modal.style.display = 'flex';
  }

  function onProductTypeChanged() {
    const typeEl = document.getElementById('adminProdType');
    const jeevanixBlock = document.getElementById('adminJeevanixFieldsBlock');
    const merchantBlock = document.getElementById('adminMerchantFieldBlock');
    const catEl = document.getElementById('adminProdCat');
    if (!typeEl || !jeevanixBlock) return;

    if (typeEl.value === 'jeevanix') {
      jeevanixBlock.style.display = 'block';
      if (merchantBlock) merchantBlock.style.display = 'none';
      if (catEl) catEl.value = 'wellness';
    } else {
      jeevanixBlock.style.display = 'none';
      if (merchantBlock) merchantBlock.style.display = 'block';
      if (catEl && catEl.value === 'wellness') catEl.value = 'kirana';
    }
  }

  function saveProductForm() {
    const id = document.getElementById('adminProdId').value;
    const type = document.getElementById('adminProdType').value;
    const name = document.getElementById('adminProdName').value.trim();
    const brand = document.getElementById('adminProdBrand').value.trim();
    const merchantId = document.getElementById('adminProdMerchant') ? document.getElementById('adminProdMerchant').value : 'm-101';
    const category = document.getElementById('adminProdCat').value;
    const price = parseFloat(document.getElementById('adminProdPrice').value);
    const mrp = parseFloat(document.getElementById('adminProdMrp').value) || price;
    const stock = parseInt(document.getElementById('adminProdStock').value, 10) || 0;
    const unit = document.getElementById('adminProdUnit').value.trim() || 'unit';
    const image = document.getElementById('adminProdImage').value.trim() || (type === 'jeevanix' ? '🌿' : '🍎');
    const badge = document.getElementById('adminProdBadge').value.trim();
    const desc = document.getElementById('adminProdDesc').value.trim();
    const active = document.getElementById('adminProdActive').checked;
    const isLaunched = document.getElementById('adminProdLaunched').checked;
    const dosage = document.getElementById('adminProdDosage') ? document.getElementById('adminProdDosage').value.trim() : '';
    const ingredients = document.getElementById('adminProdIngredients') ? document.getElementById('adminProdIngredients').value.trim() : '';
    const approvalStatus = document.getElementById('adminProdApproval') ? document.getElementById('adminProdApproval').value : 'approved';

    if (!name || isNaN(price) || price <= 0) {
      alert('Kripya product ka naam aur valid selling price bharein.');
      return;
    }

    const products = getProducts();

    if (id) {
      // Edit
      const p = products.find(i => i.id === id);
      if (p) {
        p.productType = type;
        p.name = name;
        p.brand = brand || (type === 'jeevanix' ? 'Jeevanix' : 'Local');
        p.merchantId = type === 'jeevanix' ? 'm-jeevanix' : merchantId;
        p.category = category;
        p.price = price;
        p.mrp = mrp;
        p.stock = stock;
        p.inStock = stock > 0 && active;
        p.unit = unit;
        p.image = image;
        p.badge = badge;
        p.desc = desc;
        p.active = active;
        p.isLaunched = isLaunched;
        p.dosage = dosage;
        p.ingredients = ingredients;
        p.approvalStatus = approvalStatus;
        if (window.showToast) window.showToast(`Product "${name}" updated successfully!`);
      }
    } else {
      // Add
      const newProd = {
        id: (type === 'jeevanix' ? 'jvn-' : 'p-') + Date.now(),
        productType: type,
        name: name,
        brand: brand || (type === 'jeevanix' ? 'Jeevanix' : 'Himachal Local'),
        merchantId: type === 'jeevanix' ? 'm-jeevanix' : merchantId,
        category: category,
        price: price,
        mrp: mrp,
        stock: stock,
        inStock: stock > 0 && active,
        unit: unit,
        image: image,
        badge: badge,
        desc: desc || `${name} - Authentic Himachal listing.`,
        active: active,
        isLaunched: isLaunched,
        dosage: dosage,
        ingredients: ingredients,
        approvalStatus: approvalStatus,
        createdAt: new Date().toISOString()
      };
      products.unshift(newProd);
      if (window.showToast) window.showToast(`New Product "${name}" added to catalog!`);
    }

    saveProducts(products);
    renderInventoryTable();
    closeProductModal();
  }

  function closeProductModal() {
    const modal = document.getElementById('adminProductModal');
    if (modal) modal.style.display = 'none';
  }

  function createProductModalDOM() {
    const modalHTML = `
      <div id="adminProductModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center; padding:16px;">
        <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:16px; width:100%; max-width:620px; max-height:90vh; overflow-y:auto; padding:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">
            <h3 id="adminProdModalTitle" style="color:#fff; font-size:18px; margin:0; font-weight:800;">➕ Add / Edit Product</h3>
            <button onclick="window.InventoryService.closeProductModal()" style="background:none; border:none; color:#cbd5e1; font-size:22px; cursor:pointer;">&times;</button>
          </div>

          <input type="hidden" id="adminProdId">

          <!-- Type Selector: Local vs Jeevanix -->
          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:700; color:#38bdf8; margin-bottom:6px;">PRODUCT LINE / TYPE:</label>
            <select id="adminProdType" onchange="window.InventoryService.onProductTypeChanged()" style="width:100%; background:#1e293b; border:1.5px solid #38bdf8; color:#fff; padding:10px; border-radius:8px; font-size:13px; font-weight:700;">
              <option value="local">🏪 Local Shop Product (Vyapar Mandal Merchant)</option>
              <option value="jeevanix">🌿 Jeevanix Product (Health, Wellness & Himalayan Supplements)</option>
            </select>
          </div>

          <div style="display:grid; grid-template-columns:2fr 1fr; gap:12px; margin-bottom:12px;">
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Product Name *</label>
              <input type="text" id="adminProdName" placeholder="e.g. Pure Himalayan Shilajit Gold Resin" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:13px;">
            </div>
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Brand</label>
              <input type="text" id="adminProdBrand" placeholder="e.g. Jeevanix / Local" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:13px;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
            <div id="adminMerchantFieldBlock">
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Assign Shop / Merchant</label>
              <select id="adminProdMerchant" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;"></select>
            </div>
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Category</label>
              <select id="adminProdCat" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;"></select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Price (₹) *</label>
              <input type="number" id="adminProdPrice" placeholder="Selling" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#34d399; font-weight:700; padding:8px 10px; border-radius:6px; font-size:13px;">
            </div>
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">MRP (₹)</label>
              <input type="number" id="adminProdMrp" placeholder="MRP" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:13px;">
            </div>
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Stock Level</label>
              <input type="number" id="adminProdStock" value="20" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:13px;">
            </div>
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Unit</label>
              <select id="adminProdUnit" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 6px; border-radius:6px; font-size:12px;">
                <option value="unit">unit</option>
                <option value="kg">kg</option>
                <option value="500g">500g</option>
                <option value="bottle">bottle</option>
                <option value="strip">strip</option>
                <option value="pack">pack</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Image (Emoji or URL)</label>
              <input type="text" id="adminProdImage" placeholder="e.g. 🍎 or https://..." style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">
            </div>
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Offer / Badge Tag</label>
              <input type="text" id="adminProdBadge" placeholder="e.g. 20% OFF / Hill Fresh" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fbbf24; padding:8px 10px; border-radius:6px; font-size:12px;">
            </div>
          </div>

          <!-- Jeevanix Health & Wellness Specific Fields -->
          <div id="adminJeevanixFieldsBlock" style="display:none; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:12px; margin-bottom:14px;">
            <div style="font-size:12px; font-weight:800; color:#34d399; margin-bottom:8px;">🌿 HEALTH & WELLNESS SPECIFICATIONS:</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:8px;">
              <div>
                <label style="display:block; font-size:10.5px; color:var(--slate-400); margin-bottom:3px;">Dosage / Recommended Use</label>
                <input type="text" id="adminProdDosage" placeholder="e.g. 1 spoon daily with milk" style="width:100%; background:#0f172a; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 8px; border-radius:5px; font-size:11.5px;">
              </div>
              <div>
                <label style="display:block; font-size:10.5px; color:var(--slate-400); margin-bottom:3px;">Regulatory Approval State</label>
                <select id="adminProdApproval" style="width:100%; background:#0f172a; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 8px; border-radius:5px; font-size:11.5px;">
                  <option value="approved">Approved & Live</option>
                  <option value="pending">Pending Ayush/FSSAI Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div>
              <label style="display:block; font-size:10.5px; color:var(--slate-400); margin-bottom:3px;">Key Active Ingredients / Certifications</label>
              <input type="text" id="adminProdIngredients" placeholder="e.g. Pure Fulvic Acid >70%, Gold Grade Shilajit, GMP Certified" style="width:100%; background:#0f172a; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:6px 8px; border-radius:5px; font-size:11.5px;">
            </div>
          </div>

          <div style="margin-bottom:14px;">
            <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Description</label>
            <textarea id="adminProdDesc" rows="2" placeholder="Brief hill product description..." style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;"></textarea>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:10px 14px; border-radius:8px; margin-bottom:18px;">
            <label style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; cursor:pointer;">
              <input type="checkbox" id="adminProdActive" checked style="accent-color:#10b981; transform:scale(1.2);">
              <span>Active in Store</span>
            </label>
            <label style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; cursor:pointer;">
              <input type="checkbox" id="adminProdLaunched" checked style="accent-color:#0ea5e9; transform:scale(1.2);">
              <span>Launched (Customer Visibility ON)</span>
            </label>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" onclick="window.InventoryService.closeProductModal()" class="btn btn-secondary">Cancel</button>
            <button type="button" onclick="window.InventoryService.saveProductForm()" class="btn btn-primary" style="background:#10b981; font-weight:700;">Save Product</button>
          </div>
        </div>
      </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
  }

  // --- Initializer & Filter Binders ---
  function init() {
    renderInventoryTable();

    // Search input
    const searchInput = document.getElementById('inventorySearchInput');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchQuery = e.target.value.trim();
        renderInventoryTable();
      };
    }

    // Category filter
    const catFilter = document.getElementById('inventoryCatFilter');
    if (catFilter) {
      catFilter.onchange = (e) => {
        filterCategory = e.target.value;
        renderInventoryTable();
      };
    }

    // Town filter
    const townFilter = document.getElementById('inventoryTownFilter');
    if (townFilter) {
      townFilter.onchange = (e) => {
        filterTown = e.target.value;
        renderInventoryTable();
      };
    }

    // Stock filter
    const stockFilter = document.getElementById('inventoryStockFilter');
    if (stockFilter) {
      stockFilter.onchange = (e) => {
        filterStock = e.target.value;
        renderInventoryTable();
      };
    }
  }

  function setProductTypeFilter(type) {
    filterProductType = type;
    document.querySelectorAll('.prod-type-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.type === type);
    });
    renderInventoryTable();
  }

  return {
    init,
    renderInventoryTable,
    openProductModal,
    closeProductModal,
    onProductTypeChanged,
    saveProductForm,
    quickStockEdit,
    quickPriceEdit,
    toggleItemActive,
    toggleLaunchStatus,
    deleteProduct,
    setProductTypeFilter,
    getProducts
  };
})();

// Auto-run if tab active
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.InventoryService) window.InventoryService.init();
  });
} else {
  if (window.InventoryService) window.InventoryService.init();
}
