/**
 * PahadiCart Super Admin — Homepage CMS, Banners, Offers & Announcements Manager
 * Customizes customer-facing banners, live weather tickers, featured products & shops.
 */

window.CmsService = (function() {
  function getCmsData() {
    const defaults = {
      heroBanner: {
        title: 'Fresh From Himachal Hills to Your Doorstep in 2 Hours',
        subtitle: 'Pure Himalayan produce, local Vyapar Mandal stores & Jeevanix wellness remedies.',
        badge: '🌲 100% Authentic Hill Sourced',
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

  function renderCmsView() {
    const container = document.getElementById('cmsContainer');
    if (!container) return;

    const cms = getCmsData();
    const products = (window.PAHADICART_DATA && window.PAHADICART_DATA.products) || [];
    const merchants = (window.PAHADICART_DATA && window.PAHADICART_DATA.merchants) || [];

    container.innerHTML = `
      <form onsubmit="window.CmsService.handleSaveCms(event)">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">

          <!-- 1. Hero Banner Settings -->
          <div style="background:rgba(15,23,42,0.7); border:1px solid rgba(56,189,248,0.3); border-radius:14px; padding:20px;">
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

            <div style="margin-bottom:12px;">
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Banner Headline *</label>
              <input type="text" id="cmsBannerTitle" value="${(cms.heroBanner && cms.heroBanner.title) || ''}" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:13px; font-weight:700;">
            </div>

            <div style="margin-bottom:12px;">
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Subtitle / Tagline</label>
              <textarea id="cmsBannerSubtitle" rows="2" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">${(cms.heroBanner && cms.heroBanner.subtitle) || ''}</textarea>
            </div>

            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Highlight Badge Tag</label>
              <input type="text" id="cmsBannerBadge" value="${(cms.heroBanner && cms.heroBanner.badge) || ''}" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fbbf24; padding:8px 10px; border-radius:6px; font-size:12px;">
            </div>
          </div>

          <!-- 2. Live Weather / Announcement Ticker -->
          <div style="background:rgba(15,23,42,0.7); border:1px solid rgba(245,158,11,0.3); border-radius:14px; padding:20px;">
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
              <textarea id="cmsAnnounceText" rows="3" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fde68a; padding:8px 10px; border-radius:6px; font-size:12.5px; font-weight:600;">${(cms.announcement && cms.announcement.text) || ''}</textarea>
            </div>

            <div>
              <label style="display:block; font-size:11px; color:var(--slate-400); margin-bottom:4px;">Ticker Type / Theme</label>
              <select id="cmsAnnounceType" style="width:100%; background:#091220; border:1px solid rgba(255,255,255,0.15); color:#fff; padding:8px 10px; border-radius:6px; font-size:12px;">
                <option value="info" ${cms.announcement && cms.announcement.type === 'info' ? 'selected' : ''}>🔵 General Info / Advisory</option>
                <option value="alert" ${cms.announcement && cms.announcement.type === 'alert' ? 'selected' : ''}>⚠️ Snowfall / Weather Warning (Urgent)</option>
                <option value="deal" ${cms.announcement && cms.announcement.type === 'deal' ? 'selected' : ''}>🎉 Festive Offer / Promo Announcement</option>
              </select>
            </div>
          </div>

        </div>

        <!-- 3. Featured Items & Special Promos -->
        <div style="background:rgba(15,23,42,0.7); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px;">⭐</span>
              <div>
                <h4 style="margin:0; color:#fff; font-size:15px; font-weight:800;">Featured Items & Verified Store Spotlights</h4>
                <p style="margin:2px 0 0 0; font-size:11px; color:var(--slate-400);">Choose products and shops to highlight on Customer App Home</p>
              </div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
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
          <button type="submit" class="btn btn-primary" style="background:#10b981; font-weight:800; font-size:14px; padding:10px 24px;">
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
    if (window.showToast) window.showToast('✅ Homepage CMS, Banners & Announcement Updated Live!');
  }

  function init() {
    renderCmsView();
  }

  return {
    init,
    renderCmsView,
    handleSaveCms,
    getCmsData
  };
})();
