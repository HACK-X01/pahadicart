// Hill Dynamic Pricing & Weather Emergency Protocol Engine

function setWeatherMode(mode) {
  const currentTownId = document.getElementById("townSelect")?.value || "solan";
  const town = PahadiMockDB.towns.find(t => t.id === currentTownId);
  if (!town) return;

  town.weather = mode;

  // Buttons update
  document.querySelectorAll(".weather-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  const weatherHeaderPill = document.getElementById("weatherHeaderPill");
  const weatherStatusDesc = document.getElementById("weatherStatusDesc");

  if (mode === 'clear') {
    town.weatherSurgeFee = 0;
    town.weatherBufferMins = 0;
    if (weatherHeaderPill) {
      weatherHeaderPill.innerHTML = "☀️ Weather: Clear &bull; Standard SLA";
      weatherHeaderPill.style.color = "var(--primary-400)";
      weatherHeaderPill.style.borderColor = "rgba(16,185,129,0.3)";
      weatherHeaderPill.style.background = "rgba(16,185,129,0.12)";
    }
    if (weatherStatusDesc) {
      weatherStatusDesc.textContent = "Roads clear. Standard 45–60 min delivery active across all hill corridors.";
    }
    showToast("☀️ Weather Mode: Clear. Standard hill SLA active.");
  } else if (mode === 'rain') {
    town.weatherSurgeFee = 15;
    town.weatherBufferMins = 20;
    if (weatherHeaderPill) {
      weatherHeaderPill.innerHTML = "🌧️ Monsoon Rain &bull; +20m Buffer (+₹15 Surge)";
      weatherHeaderPill.style.color = "var(--amber-400)";
      weatherHeaderPill.style.borderColor = "rgba(245,158,11,0.3)";
      weatherHeaderPill.style.background = "rgba(245,158,11,0.12)";
    }
    if (weatherStatusDesc) {
      weatherStatusDesc.textContent = "Monsoon buffer active: +20 mins added to customer ETA, +₹15 dynamic rain surge to rider payout.";
    }
    showToast("🌧️ Rain Mode: +20 min buffer & ₹15 rider incentive applied!");
  } else if (mode === 'snow') {
    town.weatherSurgeFee = 35;
    town.weatherBufferMins = 40;
    if (weatherHeaderPill) {
      weatherHeaderPill.innerHTML = "❄️ Snow / Landslide &bull; Steep Slopes Locked";
      weatherHeaderPill.style.color = "var(--rose-400)";
      weatherHeaderPill.style.borderColor = "rgba(244,63,94,0.3)";
      weatherHeaderPill.style.background = "rgba(244,63,94,0.12)";
    }
    if (weatherStatusDesc) {
      weatherStatusDesc.textContent = "SAFETY LOCK: Steep unpaved slopes locked. Only main road and pedestrian runner deliveries permitted.";
    }
    showToast("❄️ Extreme Weather Alert: Hill ridge safety lock activated!");
  }

  updateMetricsDashboard();
  renderOrdersFeed();
}


// Real-Time Himachal Weather Sync via Open-Meteo REST API
window.syncLiveWeatherForCurrentTown = async function(isManual = false) {
  const syncBtnText = document.getElementById("autoSyncWeatherText");
  if (syncBtnText) syncBtnText.textContent = "Syncing Open-Meteo...";

  const townSelect = document.getElementById("townSelect");
  const townId = townSelect ? townSelect.value : "solan";
  const town = (PahadiMockDB.towns || []).find(t => t.id === townId) || { center: [30.9084, 77.0999], name: "Solan" };
  const [lat, lng] = town.center;

  try {
    if (!window.PahadiLiveServices) {
      throw new Error("Live Services module loading...");
    }
    const weather = await window.PahadiLiveServices.fetchRealtimeWeather(lat, lng);

    const badgeText = document.getElementById("liveWeatherTelemetryText");
    if (badgeText) {
      badgeText.innerText = weather.temp + "°C • " + weather.label + " (Live)";
    }

    // Auto-set the weather mode protocol
    setWeatherMode(weather.mode);

    if (syncBtnText) syncBtnText.textContent = "Synced (" + weather.temp + "°C)";
    setTimeout(() => {
      if (syncBtnText) syncBtnText.textContent = "Sync Live Weather";
    }, 3000);

    if (isManual) {
      showToast("⚡ Open-Meteo Synced for " + town.name + ": " + weather.temp + "°C (" + weather.label + ")");
    }
  } catch (err) {
    console.error("Live weather error:", err);
    if (syncBtnText) syncBtnText.textContent = "Sync Live Weather";
    if (isManual) {
      showToast("⚠️ Weather sync fallback: Standard clear mode active.");
    }
  }
};

// Initial auto-sync on load
setTimeout(() => {
  if (window.syncLiveWeatherForCurrentTown) {
    window.syncLiveWeatherForCurrentTown(false);
  }
}, 800);
