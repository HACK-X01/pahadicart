// Main Application Controller & Toast System
let activeTab = "overview";

document.addEventListener("DOMContentLoaded", () => {
  const townSelect = document.getElementById("townSelect");
  if (townSelect) {
    townSelect.addEventListener("change", (e) => {
      onTownChange(e.target.value);
    });
  }

  initGodViewMap("solan");
  renderOrdersFeed();
  renderMerchantsTable();
  renderRidersView();
  renderFinancialLedger();
  renderSafetyAndCashDesk();
  renderSupportDesk();
  renderGrowthAnalytics();
  updateMetricsDashboard();

  // Support direct hash routing
  if (window.location.hash) {
    const hashTab = window.location.hash.replace('#', '');
    if (window.location.hash.includes('triad')) {
      switchTab('orders');
      setTimeout(() => {
        if (window.showTriadAudit) window.showTriadAudit('ORD-7821');
      }, 400);
    } else if (["overview", "orders", "merchants", "riders", "finance", "safety", "support", "growth", "zones"].includes(hashTab)) {
      switchTab(hashTab);
    }
  }

  document.querySelectorAll(".weather-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setWeatherMode(btn.dataset.mode);
    });
  });

  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");

  if (mobileMenuBtn && sidebar && backdrop) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.add("mobile-open");
      backdrop.classList.add("active");
    });

    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      backdrop.classList.remove("active");
    });
  }

  setInterval(() => {
    if (Math.random() > 0.6) {
      simulateIncomingOrder();
    }
  }, 45000);
});

function onTownChange(townId) {
  const town = PahadiMockDB.towns.find(t => t.id === townId);
  if (!town) return;

  showToast("Switched control center to " + town.name);
  initGodViewMap(townId);
  setWeatherMode(town.weather || "clear");
  renderOrdersFeed();
  renderMerchantsTable();
  renderRidersView();
  renderFinancialLedger();
  renderSafetyAndCashDesk();
  renderSupportDesk();
  renderGrowthAnalytics();
  updateMetricsDashboard();
}

function switchTab(tabId) {
  activeTab = tabId;
  window.location.hash = tabId;

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.tab === tabId);
  });
  document.querySelectorAll(".mobile-nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.tab === tabId);
  });

  document.querySelectorAll(".tab-content").forEach(section => {
    section.style.display = section.id === "tab-" + tabId ? "block" : "none";
  });

  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (sidebar) sidebar.classList.remove("mobile-open");
  if (backdrop) backdrop.classList.remove("active");

  if (tabId === "overview") {
    setTimeout(() => {
      if (leafletMap) leafletMap.invalidateSize();
    }, 150);
  } else if (tabId === "riders") {
    renderRidersView();
  } else if (tabId === "finance") {
    renderFinancialLedger();
  } else if (tabId === "merchants") {
    renderMerchantsTable();
  } else if (tabId === "safety") {
    renderSafetyAndCashDesk();
  } else if (tabId === "support") {
    renderSupportDesk();
  } else if (tabId === "growth") {
    renderGrowthAnalytics();
  } else if (tabId === "orders") {
    renderOrdersFeed('all');
  }
}

function updateMetricsDashboard() {
  const currentTown = document.getElementById("townSelect")?.value || "solan";
  const townOrders = PahadiMockDB.orders.filter(o => o.town === currentTown);
  const townMerchants = PahadiMockDB.merchants.filter(m => m.town === currentTown);
  const townRiders = PahadiMockDB.riders.filter(r => r.town === currentTown);

  const totalGMV = townOrders.reduce((sum, o) => sum + o.amount, 0) + 18450;
  const platformEarnings = Math.round(totalGMV * 0.11) + (townOrders.length * 5);
  const activeOrdersCount = townOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const activeRidersCount = townRiders.filter(r => r.status !== 'offline').length;

  const gmvEl = document.getElementById("metricGMV");
  const commEl = document.getElementById("metricCommission");
  const ordersEl = document.getElementById("metricActiveOrders");
  const ridersEl = document.getElementById("metricRidersOnline");

  if (gmvEl) gmvEl.textContent = "₹" + totalGMV.toLocaleString('en-IN');
  if (commEl) commEl.textContent = "₹" + platformEarnings.toLocaleString('en-IN');
  if (ordersEl) ordersEl.textContent = activeOrdersCount;
  if (ridersEl) ridersEl.textContent = activeRidersCount + " / " + townRiders.length;
}

function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = '<span style="color:var(--primary-400);">🏔️</span> <span>' + message + '</span>';

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
