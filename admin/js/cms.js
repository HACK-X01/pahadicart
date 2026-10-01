/**
 * PahadiCart Super Admin — Homepage CMS, Banners, Offers & Announcements Manager
 * Customizes customer-facing banners, live weather tickers, featured products & shops.
 */

window.CmsService = (function() {
  let pendingBannerImage = null;

  function getCmsData() {
    const defaults = {
      heroBanner: {
        title: 'Fresh From Himachal Hills to Your Doorstep in 2 Hours',
        subtitle: 'Pure Himalayan produce, local Vyapar Mandal stores & Jeevanix wellness remedies.',
        badge: '🌲 100% Authentic Hill Sourced',
        imageUrl: '',
        active: true
      },
      announcement: {
        text: '🏔️ Weather Advisory: Hill runners active across stone staircases. 2-Hour Express Delivery live!',
        type: 'info',
        active: true
      },
      featuredProductIds: [],
      featuredShopIds: [],
      offers: [
        { id: 'off-1', title: 'Solan Fresh Produce Deal', discount: 'Flat 15% OFF', code: 'HILLFRESH', active: true },
        { id: 'off-2', title: 'Jeevanix Health Boost', discount: 'Pure Himalayan Shilajit & Chyawanprash', code: 'JEEVANIX', active: true }
      ]
    };
    try {
      const stored = localStorage.getItem('pahadicart_homepage_cms');
      if (stored) {
        return Object.assign({}, defaults, JSON.parse(stored));
      }
    } catch (e) {}
    return defaults;
  }

  function saveCmsData(cms) {
    if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
    window.PAHADICART_DATA.homepageCms = cms;
    try {
      localStorage.setItem('pahadicart_homepage_cms', JSON.stringify(cms));
    } catch (e) {
      console.error('Failed to save CMS data:', e);
    }
    if (window.pahadiBus) {
      window.pahadiBus.emit('CMS_UPDATED', cms);
    }
  }

  function handleImageFile(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const maxW = 1000;
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        setImageUrl(compressed);
        const urlInput = document.getElementById('cmsBannerImageUrl');
        if (urlInput) urlInput.value = '(Custom Uploaded Image: ' + Math.round(compressed.length / 1024) + ' KB)';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function setBannerPreset(url) {
    setImageUrl(url);
    const urlInput = document.getElementById('cmsBannerImageUrl');
    if (urlInput) urlInput.value = url;
  }

  function setImageUrl(url) {
    pendingBannerImage = url;
    const preview = document.getElementById('cmsBannerPreviewContainer');
    const badge = document.getElementById('cmsBannerImageBadge');
    const removeBtn = document.getElementById('btnRemoveBannerImg');

    if (preview) {
      if (url) {
        preview.style.background = "linear-gradient(135deg, rgba(9, 55, 46, 0.75) 0%, rgba(13, 124, 102, 0.65) 100%), url('" + url + "') center / cover no-repeat";
      } else {
        preview.style.background = 'linear-gradient(135deg, #09372E 0%, #0D7C66 60%, #159E83 100%)';
      }
    }
    if (badge) {
      badge.innerText = url ? 'Photo Active ✅' : 'Default Emerald';
      badge.style.color = url ? '#34d399' : '#94a3b8';
    }
    if (removeBtn) {
      removeBtn.style.display = url ? 'inline-block' : 'none';
    }
  }

  function removeBannerImage() {
    setImageUrl('');
    const urlInput = document.getElementById('cmsBannerImageUrl');
    if (urlInput) urlInput.value = '';
    const fileInput = document.getElementById('cmsBannerFileInput');
    if (fileInput) fileInput.value = '';
  }

  function renderCmsView() {
    const container = document.getElementById('cmsContainer');
    if (!container) return;

    const cms = getCmsData();
    pendingBannerImage = (cms.heroBanner && cms.heroBanner.imageUrl) || '';
    const products = (window.PAHADICART_DATA && window.PAHADICART_DATA.products) || [];
    const merchants = (window.PAHADICART_DATA && window.PAHADICART_DATA.merchants) || [];

    container.innerHTML = `
      <form onsubmit="window.CmsService.handleSaveCms(event)">
        <!-- Responsive Grid for CMS Cards -->
        <div class="settings-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap:18px; margin-bottom:20px;">

          <!-- 1. Hero Banner Settings with Image Uploader -->
          <div style="background:rgba(15,23,42,0.7); border:1px solid rgba(56,189,248,0.3); border-radius:14px; padding:20px; box-sizing:border-box;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:20px;">🖼️</span>
                <h4 style="margin:0; color:#fff; font-size:15px; font-weight:800;">Customer Hero Banner</h4>
              </div>
              <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;">
                <input type="checkbox" id="cmsBannerActive" ${cms.heroBanner && cms.heroBanner.active !== false ? 'checked' : ''} style="accent-color:#10b981; transform:scale(1.2);">
                <span style="color:#e2e8f0; font-weight:700;">Banner Visible</span>
              </label>
            </div>

            <!-- Banner Picture Uploader Section -->
            <div style="margin-bottom:14px; background:rgba(0,0,0,0.25); border:1px dashed rgba(56,189,248,0.35); border-radius:12px; padding:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <label style="font-size:12px; font-weight:800; color:#38bdf8;">
                  📷 Banner Picture / Photo
                </label>
                <span id="cmsBannerImageBadge" style="font-size:10px; font-weight:800; padding:2px 8px; border-radius:20px; background:rgba(0,0,0,0.5); color:${pendingBannerImage ? '#34d399' : '#94a3b8'}; border:1px solid rgba(255,255,255,0.1);">
                  ${pendingBannerImage ? 'Photo Active ✅' : 'Default Emerald'}
                </span>
              </div>

              <!-- Live Banner Visual Preview -->
              <div id="cmsBannerPreviewContainer" style="position:relative; width:100%; height:120px; border-radius:10px; overflow:hidden; margin-bottom:10px; border:1px solid rgba(255,255,255,0.15); display:flex; flex-direction:column; justify-content:flex-end; padding:10px; box-sizing:border-box; ${pendingBannerImage ? "background: linear-gradient(135deg, rgba(9, 55, 46, 0.75) 0%, rgba(13, 124, 102, 0.65) 100%), url('" + pendingBannerImage + "') center / cover no-repeat;" : "background: linear-gradient(135deg, #09372E 0%, #0D7C66 60%, #159E83 100%);"}">
                <button type="button" onclick="window.CmsService.removeBannerImage()" style="position:absolute; top:6px; right:6px; font-size:10px; font-weight:800; padding:3px 8px; border-radius:14px; background:rgba(239,68,68,0.7); color:#fff; border:none; cursor:pointer; display:${pendingBannerImage ? 'inline-block' : 'none'};" id="btnRemoveBannerImg">
                  ✕ Remove
                </button>
                <div style="color:#fff; font-size:13px; font-weight:900; line-height:1.2; text-shadow:0 2px 4px rgba(0,0,0,0.7);" id="cmsPreviewTitle">
                  ${(cms.heroBanner && cms.heroBanner.title) || 'Fresh From Himachal Hills'}
                </div>
                <div style="display:flex; gap:4px; margin-top:4px;">
                  <span style="font-size:9px; background:rgba(255,255,255,0.25); padding:1px 5px; border-radius:4px; color:#fff;" id="cmsPreviewBadge">
                    ${(cms.heroBanner && cms.heroBanner.badge) || '🌲 Authentic'}
                  </span>
                </div>
              </div>

              <!-- Upload Button -->
              <input type="file" id="cmsBannerFileInput" accept="image/*" style="display:none;" onchange="window.CmsService.handleImageFile(this)">
              <div style="display:flex; gap:6px; margin-bottom:8px;">
                <button type="button" onclick="document.getElementById('cmsBannerFileInput').click()" style="flex:1; background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; border:none; padding:8px 12px; border-radius:8px; font-size:12px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px;">
                  <span>📷 Upload Photo from Phone / PC</span>
                </button>
              </div>

              <!-- 1-Tap Mountain Presets -->
              <div style="font-size:10.5px; color:var(--slate-400); margin-bottom:4px; font-weight:700;">
                🏔️ Quick 1-Tap Himachal Presets:
              </div>
              <div style="display:flex; gap:5px; overflow-x:auto; padding-bottom:4px;">
                <button type="button" onclick="window.CmsService.setBannerPreset('https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=1200&q=80')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; padding:4px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer; white-space:nowrap;">
                  🍎 Apples
                </button>
                <button type="button" onclick="window.CmsService.setBannerPreset('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; padding:4px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer; white-space:nowrap;">
                  🏔️ Pines
                </button>
                <button type="button" onclick="window.CmsService.setBannerPreset('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; padding:4px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer; white-space:nowrap;">
                  🏪 Mandi
                </button>
                <button type="button" onclick="window.CmsService.setBannerPreset('https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=1200&q=80')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; padding:4px 8px; border-radius:6px; font-size:10.5px; font-weight:700; cursor:pointer; white-space:nowrap;">
                  🌿 Herbs
                </button>
              </div>

              <!-- Direct URL input -->
              <input type="text" id="cmsBannerImageUrl" value="${pendingBannerImage || ''}" placeholder="Or paste image URL (https://...)" oninput="window.CmsService.setImageUrl(this.value)" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.12); color:#38bdf8; padding:5px 8px; border-radius:6px; font-size:10.5px; margin-top:6px; box-sizing:border-box;">
            </div>

            <!-- Headline & Tagline Inputs -->
            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:3px;">Banner Headline *</label>
              <input type="text" id="cmsBannerTitle" value="${(cms.heroBanner && cms.heroBanner.title) || ''}" oninput="document.getElementById('cmsPreviewTitle').innerText = this.value || 'Banner Title'" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:13px; font-weight:700; box-sizing:border-box;">
            </div>

            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:3px;">Subtitle / Tagline</label>
              <textarea id="cmsBannerSubtitle" rows="2" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px; box-sizing:border-box;">${(cms.heroBanner && cms.heroBanner.subtitle) || ''}</textarea>
            </div>

            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:3px;">Highlight Badge Tag</label>
              <input type="text" id="cmsBannerBadge" value="${(cms.heroBanner && cms.heroBanner.badge) || ''}" oninput="document.getElementById('cmsPreviewBadge').innerText = this.value || 'Badge'" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fbbf24; padding:8px 10px; border-radius:6px; font-size:12px; box-sizing:border-box;">
            </div>
          </div>

          <!-- 2. Live Weather / Announcement Ticker -->
          <div style="background:rgba(15,23,42,0.7); border:1px solid rgba(245,158,11,0.3); border-radius:14px; padding:20px; box-sizing:border-box;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:20px;">📢</span>
                <h4 style="margin:0; color:#fff; font-size:15px; font-weight:800;">Live Top Announcement Bar</h4>
              </div>
              <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;">
                <input type="checkbox" id="cmsAnnounceActive" ${cms.announcement && cms.announcement.active !== false ? 'checked' : ''} style="accent-color:#f59e0b; transform:scale(1.2);">
                <span style="color:#e2e8f0; font-weight:700;">Ticker Active</span>
              </label>
            </div>

            <div style="margin-bottom:12px;">
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Ticker Message (Live Broadcast to Customers) *</label>
              <textarea id="cmsAnnounceText" rows="3" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fde68a; padding:8px 10px; border-radius:6px; font-size:12.5px; font-weight:600; box-sizing:border-box;">${(cms.announcement && cms.announcement.text) || ''}</textarea>
            </div>

            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Ticker Type / Theme</label>
              <select id="cmsAnnounceType" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px; box-sizing:border-box;">
                <option value="info" ${cms.announcement && cms.announcement.type === 'info' ? 'selected' : ''}>🔵 General Info / Advisory</option>
                <option value="alert" ${cms.announcement && cms.announcement.type === 'alert' ? 'selected' : ''}>⚠️ Snowfall / Weather Warning (Urgent)</option>
                <option value="deal" ${cms.announcement && cms.announcement.type === 'deal' ? 'selected' : ''}>🎉 Festive Offer / Promo Announcement</option>
              </select>
            </div>
          </div>

        </div>

        <!-- 3. Featured Items & Special Promos -->
        <div style="background:rgba(15,23,42,0.7); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:20px; margin-bottom:20px; box-sizing:border-box;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">⭐</span>
              <div>
                <h4 style="margin:0; color:#fff; font-size:15px; font-weight:800;">Featured Items & Verified Store Spotlights</h4>
                <p style="margin:2px 0 0 0; font-size:11px; color:var(--slate-400);">Choose products and shops to highlight on Customer App Home</p>
              </div>
            </div>
          </div>

          <div class="settings-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap:18px;">
            <div>
              <label style="display:block; font-size:12px; font-weight:700; color:#38bdf8; margin-bottom:6px;">Featured Products (${products.length} in Catalog):</label>
              <div style="max-height:160px; overflow-y:auto; background:#091220; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px;">
                ${products.length === 0 ? '<div style="font-size:11px; color:var(--slate-500); padding:8px;">Catalog me abhi koi product nahi hai.</div>' : products.map(p => `
                  <label style="display:flex; align-items:center; justify-content:space-between; padding:6px 8px; border-bottom:1px solid rgba(255,255,255,0.04); font-size:12px; cursor:pointer;">
                    <span style="color:#fff;">${p.image || '🍎'} ${p.name} (₹${p.price})</span>
                    <input type="checkbox" name="featuredProduct" value="${p.id}" ${(cms.featuredProductIds || []).includes(p.id) ? 'checked' : ''} style="accent-color:#10b981;">
                  </label>
                `).join('')}
              </div>
            </div>

            <div>
              <label style="display:block; font-size:12px; font-weight:700; color:#10b981; margin-bottom:6px;">Featured Vyapar Mandal Stores (${merchants.length} registered):</label>
              <div style="max-height:160px; overflow-y:auto; background:#091220; border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:8px;">
                ${merchants.map(m => `
                  <label style="display:flex; align-items:center; justify-content:space-between; padding:6px 8px; border-bottom:1px solid rgba(255,255,255,0.04); font-size:12px; cursor:pointer;">
                    <span style="color:#fff;">${m.image || '🏪'} ${m.name} (${m.town || 'Solan'})</span>
                    <input type="checkbox" name="featuredShop" value="${m.id}" ${(cms.featuredShopIds || []).includes(m.id) ? 'checked' : ''} style="accent-color:#10b981;">
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button type="submit" class="btn btn-primary" style="background:#10b981; font-weight:800; font-size:14px; padding:10px 24px; width:100%; max-width:280px; justify-content:center;">
            💾 Save Homepage CMS & Banners
          </button>
        </div>
      </form>
    `;
  }

  function handleSaveCms(e) {
    if (e) e.preventDefault();
    const bannerActive = document.getElementById('cmsBannerActive').checked;
    const bannerTitle = document.getElementById('cmsBannerTitle').value.trim();
    const bannerSub = document.getElementById('cmsBannerSubtitle').value.trim();
    const bannerBadge = document.getElementById('cmsBannerBadge').value.trim();

    const annActive = document.getElementById('cmsAnnounceActive').checked;
    const annText = document.getElementById('cmsAnnounceText').value.trim();
    const annType = document.getElementById('cmsAnnounceType').value;

    const featuredProds = [];
    document.querySelectorAll('input[name="featuredProduct"]:checked').forEach(cb => {
      featuredProds.push(cb.value);
    });

    const featuredShops = [];
    document.querySelectorAll('input[name="featuredShop"]:checked').forEach(cb => {
      featuredShops.push(cb.value);
    });

    const current = getCmsData();
    const updated = {
      ...current,
      heroBanner: {
        title: bannerTitle,
        subtitle: bannerSub,
        badge: bannerBadge,
        imageUrl: pendingBannerImage || '',
        active: bannerActive
      },
      announcement: {
        text: annText,
        type: annType,
        active: annActive
      },
      featuredProductIds: featuredProds,
      featuredShopIds: featuredShops
    };

    saveCmsData(updated);
    renderCmsView();
    if (window.showToast) window.showToast('✅ Homepage CMS, Banner Picture & Announcements Updated Live!');
  }

  function init() {
    renderCmsView();
  }

  return {
    init,
    renderCmsView,
    handleSaveCms,
    handleImageFile,
    setBannerPreset,
    setImageUrl,
    removeBannerImage,
    getCmsData
  };
})();
