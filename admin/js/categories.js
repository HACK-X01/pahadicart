/**
 * PahadiCart Super Admin — Category & Taxonomy Management Module
 * Create, rename, re-order, change icon, and hide/show categories across the ecosystem.
 */

window.CategoriesService = (function() {
  function getCategories() {
    if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
    if (!window.PAHADICART_DATA.categories) {
      try {
        const stored = localStorage.getItem('pahadicart_categories');
        window.PAHADICART_DATA.categories = stored ? JSON.parse(stored) : [];
      } catch (e) {
        window.PAHADICART_DATA.categories = [];
      }
    }
    return window.PAHADICART_DATA.categories;
  }

  function saveCategories(cats) {
    window.PAHADICART_DATA.categories = cats;
    try {
      localStorage.setItem('pahadicart_categories', JSON.stringify(cats));
    } catch (e) {
      console.error('Failed to save categories:', e);
    }
    if (window.pahadiBus) {
      window.pahadiBus.emit('CATEGORIES_UPDATED', cats);
    }
  }

  function renderCategoriesTable() {
    const container = document.getElementById('categoriesTableBody');
    if (!container) return;

    const cats = getCategories();
    // Sort by order rank
    const sorted = [...cats].sort((a, b) => (a.order || 99) - (b.order || 99));

    const badge = document.getElementById('categoriesCountBadge');
    if (badge) badge.innerText = `${sorted.length} Categories Active`;

    const products = (window.PAHADICART_DATA && window.PAHADICART_DATA.products) || [];

    container.innerHTML = sorted.map((c, index) => {
      const isAll = c.id === 'all';
      const prodCount = isAll ? products.length : products.filter(p => p.category === c.id).length;
      const isHidden = c.hidden === true;

      return `
        <tr id="row-cat-${c.id}">
          <td style="font-family:var(--font-mono); font-weight:700; color:var(--slate-400); width:60px;">
            #${c.order || index + 1}
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:24px; background:rgba(255,255,255,0.06); padding:4px 8px; border-radius:8px;">${c.icon || '🏷️'}</span>
              <div>
                <div style="font-weight:700; color:#fff; font-size:13.5px;">${c.name}</div>
                <div style="font-size:11px; color:var(--slate-400); font-family:var(--font-mono);">Slug ID: ${c.id}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="background:rgba(56,189,248,0.15); color:#38bdf8; font-size:11.5px; font-weight:700; padding:2px 8px; border-radius:12px;">
              ${prodCount} Items
            </span>
          </td>
          <td>
            <span class="badge ${isHidden ? 'badge-danger' : 'badge-success'}" style="font-size:10.5px;">
              ${isHidden ? '👁️‍🗨️ HIDDEN' : '🟢 VISIBLE'}
            </span>
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="window.CategoriesService.moveCategory('${c.id}', -1)" style="padding:2px 8px; font-size:11px;" ${index === 0 ? 'disabled' : ''} title="Move Up">▲</button>
              <button class="btn btn-secondary btn-sm" onclick="window.CategoriesService.moveCategory('${c.id}', 1)" style="padding:2px 8px; font-size:11px;" ${index === sorted.length - 1 ? 'disabled' : ''} title="Move Down">▼</button>
              <button class="btn btn-secondary btn-sm" onclick="window.CategoriesService.openCategoryModal('${c.id}')" style="padding:2px 8px; font-size:11px; background:rgba(56,189,248,0.15); color:#38bdf8; border-color:rgba(56,189,248,0.3);">✏️ Edit</button>
              <button class="btn btn-secondary btn-sm" onclick="window.CategoriesService.toggleCategoryHide('${c.id}')" style="padding:2px 8px; font-size:11px;">
                ${isHidden ? 'Show' : 'Hide'}
              </button>
              ${!isAll ? `
                <button class="btn btn-secondary btn-sm" onclick="window.CategoriesService.deleteCategory('${c.id}')" style="padding:2px 8px; font-size:11px; color:#f87171; border-color:rgba(239,68,68,0.25);" title="Delete Category">🗑️</button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function moveCategory(id, direction) {
    const cats = getCategories();
    const sorted = [...cats].sort((a, b) => (a.order || 99) - (b.order || 99));
    const idx = sorted.findIndex(c => c.id === id);
    if (idx === -1) return;

    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    // Swap order
    const temp = sorted[idx];
    sorted[idx] = sorted[targetIdx];
    sorted[targetIdx] = temp;

    // Renumber
    sorted.forEach((c, i) => { c.order = i + 1; });
    saveCategories(sorted);
    renderCategoriesTable();
    if (window.showToast) window.showToast('Category sequence updated.');
  }

  function toggleCategoryHide(id) {
    const cats = getCategories();
    const c = cats.find(item => item.id === id);
    if (c) {
      c.hidden = !c.hidden;
      saveCategories(cats);
      renderCategoriesTable();
      if (window.showToast) window.showToast(`Category "${c.name}" ${c.hidden ? 'Hidden' : 'Shown'}`);
    }
  }

  function deleteCategory(id) {
    if (id === 'all') {
      alert('Sabhi Products category ko delete nahi kiya ja sakta.');
      return;
    }
    const cats = getCategories();
    const c = cats.find(item => item.id === id);
    if (!c) return;

    if (confirm(`Kya aap category "${c.name}" ko DELETE karna chahte hain?`)) {
      const updated = cats.filter(item => item.id !== id);
      saveCategories(updated);
      renderCategoriesTable();
      if (window.showToast) window.showToast(`Category "${c.name}" deleted.`, 'info');
    }
  }

  // --- Add / Edit Category Modal ---
  function openCategoryModal(catId = null) {
    let modal = document.getElementById('adminCategoryModal');
    if (!modal) {
      createCategoryModalDOM();
      modal = document.getElementById('adminCategoryModal');
    }

    const titleEl = document.getElementById('adminCatModalTitle');
    const idEl = document.getElementById('adminCatId');
    const slugEl = document.getElementById('adminCatSlug');
    const nameEl = document.getElementById('adminCatName');
    const iconEl = document.getElementById('adminCatIcon');
    const orderEl = document.getElementById('adminCatOrder');
    const hiddenEl = document.getElementById('adminCatHidden');

    if (catId) {
      const c = getCategories().find(item => item.id === catId);
      if (!c) return;
      titleEl.innerText = '✏️ Edit Category';
      idEl.value = c.id;
      slugEl.value = c.id;
      slugEl.disabled = c.id === 'all';
      nameEl.value = c.name || '';
      iconEl.value = c.icon || '🏷️';
      orderEl.value = c.order || 1;
      hiddenEl.checked = c.hidden === true;
    } else {
      titleEl.innerText = '➕ Create New Category';
      idEl.value = '';
      slugEl.value = '';
      slugEl.disabled = false;
      nameEl.value = '';
      iconEl.value = '🍎';
      orderEl.value = (getCategories().length + 1).toString();
      hiddenEl.checked = false;
    }

    modal.style.display = 'flex';
  }

  function saveCategoryForm() {
    const id = document.getElementById('adminCatId').value;
    const name = document.getElementById('adminCatName').value.trim();
    let slug = document.getElementById('adminCatSlug').value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const icon = document.getElementById('adminCatIcon').value.trim() || '🏷️';
    const order = parseInt(document.getElementById('adminCatOrder').value, 10) || 10;
    const hidden = document.getElementById('adminCatHidden').checked;

    if (!name) {
      alert('Kripya category ka naam dalein.');
      return;
    }
    if (!slug) {
      slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    const cats = getCategories();

    if (id) {
      // Edit
      const c = cats.find(item => item.id === id);
      if (c) {
        c.name = name;
        c.icon = icon;
        c.order = order;
        c.hidden = hidden;
        if (window.showToast) window.showToast(`Category "${name}" updated!`);
      }
    } else {
      // Create New
      if (cats.some(c => c.id === slug)) {
        alert('Ye Category Slug ID pehle se maujood hai. Kripya alag slug chunein.');
        return;
      }
      cats.push({
        id: slug,
        name: name,
        icon: icon,
        order: order,
        hidden: hidden
      });
      if (window.showToast) window.showToast(`Category "${name}" created successfully!`);
    }

    saveCategories(cats);
    renderCategoriesTable();
    closeCategoryModal();
  }

  function closeCategoryModal() {
    const modal = document.getElementById('adminCategoryModal');
    if (modal) modal.style.display = 'none';
  }

  function createCategoryModalDOM() {
    const modalHTML = `
      <div id="adminCategoryModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; align-items:center; justify-content:center; padding:16px;">
        <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:16px; width:100%; max-width:480px; padding:24px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px;">
            <h3 id="adminCatModalTitle" style="color:#fff; font-size:18px; margin:0; font-weight:800;">➕ Add / Edit Category</h3>
            <button onclick="window.CategoriesService.closeCategoryModal()" style="background:none; border:none; color:#cbd5e1; font-size:22px; cursor:pointer;">&times;</button>
          </div>

          <input type="hidden" id="adminCatId">

          <div style="margin-bottom:14px;">
            <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Category Name *</label>
            <input type="text" id="adminCatName" placeholder="e.g. Himalayan Honey & Shilajit" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:13px;">
          </div>

          <div style="display:grid; grid-template-columns:2fr 1fr; gap:12px; margin-bottom:14px;">
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Slug ID (URL Friendly)</label>
              <input type="text" id="adminCatSlug" placeholder="e.g. honey_shilajit" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#38bdf8; font-family:var(--font-mono); padding:8px 10px; border-radius:6px; font-size:12px;">
            </div>
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Icon (Emoji)</label>
              <input type="text" id="adminCatIcon" placeholder="🍯" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; text-align:center; padding:8px 10px; border-radius:6px; font-size:14px;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px;">
            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Display Order Rank</label>
              <input type="number" id="adminCatOrder" value="1" min="1" max="99" style="width:100%; background:#1e293b; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:13px;">
            </div>
            <div style="display:flex; align-items:center; margin-top:20px;">
              <label style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:600; cursor:pointer;">
                <input type="checkbox" id="adminCatHidden" style="accent-color:#ef4444; transform:scale(1.2);">
                <span style="color:#cbd5e1;">Hide from Customer App</span>
              </label>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" onclick="window.CategoriesService.closeCategoryModal()" class="btn btn-secondary">Cancel</button>
            <button type="button" onclick="window.CategoriesService.saveCategoryForm()" class="btn btn-primary" style="background:#10b981; font-weight:700;">Save Category</button>
          </div>
        </div>
      </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
  }

  function init() {
    renderCategoriesTable();
  }

  return {
    init,
    renderCategoriesTable,
    openCategoryModal,
    closeCategoryModal,
    saveCategoryForm,
    moveCategory,
    toggleCategoryHide,
    deleteCategory,
    getCategories
  };
})();
