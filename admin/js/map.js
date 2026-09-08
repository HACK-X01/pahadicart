// Leaflet Map Integration for PahadiCart Admin (OpenStreetMap - 100% Free & No Watermark)
let leafletMap = null;
let currentTownId = "solan";
let zoneLayers = [];
let markerLayers = [];

function initGodViewMap(townId = "solan") {
  const mapElement = document.getElementById("godViewMap");
  if (!mapElement) return;

  const town = PahadiMockDB.towns.find(t => t.id === townId) || PahadiMockDB.towns[0];
  currentTownId = town.id;
  window.leafletMap = leafletMap;

  if (!leafletMap) {
    leafletMap = L.map('godViewMap', {
      zoomControl: true,
      attributionControl: false
    }).setView(town.center, town.zoom);

    // Standard OpenStreetMap Tiles (100% Free, Zero Key, Full Topography)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(leafletMap);
    window.leafletMap = leafletMap;
  } else {
    leafletMap.flyTo(town.center, town.zoom, { duration: 1 });
  }

  // Clear previous layers
  zoneLayers.forEach(l => leafletMap.removeLayer(l));
  markerLayers.forEach(l => leafletMap.removeLayer(l));
  zoneLayers = [];
  markerLayers = [];

  // Draw Service Zones
  town.zones.forEach(zone => {
    const polygon = L.polygon(zone.coords, {
      color: zone.color,
      fillColor: zone.color,
      fillOpacity: 0.22,
      weight: 3,
      dashArray: zone.type === "walking-runner" ? "4, 6" : null
    }).addTo(leafletMap);

    polygon.bindTooltip("<b>" + zone.name + "</b><br>Type: " + zone.type + "<br>SLA: " + zone.sla, {
      className: 'custom-map-tooltip',
      sticky: true
    });

    zoneLayers.push(polygon);
  });

  // Plot Merchants
  const townMerchants = PahadiMockDB.merchants.filter(m => m.town === town.id);
  townMerchants.forEach(merchant => {
    const merchantIcon = L.divIcon({
      className: 'map-marker-merchant',
      html: '<div style="background:#059669; border:2px solid #ffffff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(5,150,105,0.7); color:#fff; font-size:12px;">🏪</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker(merchant.coords, { icon: merchantIcon }).addTo(leafletMap);
    marker.bindPopup(
      "<div style=\"font-family:'Plus Jakarta Sans',sans-serif; color:#0f172a; padding:4px;\">" +
      "<h4 style=\"margin:0 0 4px 0; font-size:13px; font-weight:700;\">" + merchant.name + "</h4>" +
      "<div style=\"font-size:11px; color:#475569;\">" + merchant.category + " &bull; Comm: <b>" + merchant.commissionRate + "%</b></div>" +
      "<div style=\"font-size:11px; color:#059669; margin-top:3px;\">" + merchant.address + "</div>" +
      "</div>"
    );
    marker.on("click", () => window.openRiderDrawer(rider));
    markerLayers.push(marker);
  });

  // Plot Active Riders
  const townRiders = PahadiMockDB.riders.filter(r => r.town === town.id);
  townRiders.forEach(rider => {
    const isBusy = rider.status === "in_transit";
    const riderIcon = L.divIcon({
      className: 'map-marker-rider',
      html: '<div style="background:' + (isBusy ? '#a855f7' : '#0ea5e9') + '; border:2px solid #ffffff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px ' + (isBusy ? 'rgba(168,85,247,0.7)' : 'rgba(14,165,233,0.7)') + '; color:#fff; font-size:13px;">' + (rider.vehicle.includes('Walking') ? '🏃' : '🛵') + '</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker(rider.coords, { icon: riderIcon }).addTo(leafletMap);
    marker.bindPopup(
      "<div style=\"font-family:'Plus Jakarta Sans',sans-serif; color:#0f172a; padding:4px;\">" +
      "<h4 style=\"margin:0 0 4px 0; font-size:13px; font-weight:700;\">" + rider.name + "</h4>" +
      "<div style=\"font-size:11px; color:#475569;\">Vehicle: " + rider.vehicle + "</div>" +
      "<div style=\"font-size:11px; font-weight:600; color:" + (isBusy ? '#7e22ce' : '#0284c7') + "; margin-top:3px;\">Status: " + rider.status.toUpperCase() + (isBusy ? ' (' + rider.activeOrder + ')' : '') + "</div>" +
      "</div>"
    );
    markerLayers.push(marker);
  });

  window.leafletMap = leafletMap;
  setTimeout(() => {
    if (leafletMap) leafletMap.invalidateSize();
  }, 200);
}


// HTML5 Live GPS Auto-Detection for Admin Tower
window.detectAdminLiveLocation = async function(preResolvedLoc) {
  const btnText = document.getElementById("detectGpsBtnText");
  if (btnText) btnText.textContent = "Detecting GPS...";

  if (!window.PahadiLiveServices) {
    alert("Live Services module initializing, please try again in a moment.");
    if (btnText) btnText.textContent = "Detect My Live GPS";
    return;
  }

  try {
    const loc = preResolvedLoc || await window.PahadiLiveServices.detectUserLocation();
    if (btnText) btnText.textContent = "📍 GPS Synced (" + loc.lat.toFixed(2) + ", " + loc.lng.toFixed(2) + ")";

    if (leafletMap) {
      leafletMap.flyTo([loc.lat, loc.lng], 15, { duration: 1.5 });

      if (window.adminUserMarker) {
        leafletMap.removeLayer(window.adminUserMarker);
      }

      const gmapsUrl = window.PahadiLiveServices.getGoogleMapsUrl(loc.lat, loc.lng, 'My Live Admin Post');

      const liveIcon = L.divIcon({
        className: 'map-marker-live-user',
        html: '<div style="background:#0284c7; border:3px solid #ffffff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(2,132,199,0.9); color:#fff; font-size:15px; font-weight:bold; animation:livePulse 2s infinite;">📍</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      window.adminUserMarker = L.marker([loc.lat, loc.lng], { icon: liveIcon }).addTo(leafletMap);
      window.adminUserMarker.bindPopup(
        "<div style=\"font-family:'Plus Jakarta Sans',sans-serif; color:#0f172a; padding:6px; min-width:200px;\">" +
        "<h4 style=\"margin:0 0 4px 0; font-size:13px; font-weight:800; color:#0284c7;\">📍 You Are Here (Live GPS)</h4>" +
        "<div style=\"font-size:11px; color:#475569;\">Coords: <b>" + loc.lat.toFixed(4) + ", " + loc.lng.toFixed(4) + "</b></div>" +
        "<div style=\"font-size:11px; color:#475569;\">Accuracy: &plusmn;" + loc.accuracy + "m &bull; Alt: " + loc.altitude + "m</div>" +
        "<div style=\"font-size:11px; color:#059669; font-weight:700; margin:4px 0;\">Nearest Himachal Hub: " + loc.nearestTown.name + " (" + loc.distanceKm + " km)</div>" +
        "<a href=\"" + gmapsUrl + "\" target=\"_blank\" rel=\"noopener\" style=\"display:inline-block; margin-top:6px; background:#0284c7; color:#fff; padding:5px 12px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:700;\">🗺️ Open in Google Maps</a>" +
        "</div>"
      ).openPopup();
    }

    // Auto-fetch real-time weather for these coordinates
    const weather = await window.PahadiLiveServices.fetchRealtimeWeather(loc.lat, loc.lng);
    showToast("📍 Live GPS Synced! " + loc.lat.toFixed(3) + ", " + loc.lng.toFixed(3) + " (" + weather.temp + "°C • " + weather.label + ")");
  } catch (err) {
    console.error("GPS Detection error:", err);
    if (btnText) btnText.textContent = "Detect My Live GPS";
    showToast("⚠️ " + (err.message || "GPS detection failed. Using default town coords."));
  }
};


// =========================================================================
// SUPER ADMIN: RIDER TELEMETRY SIDE DRAWER & STALE GPS MONITOR
// =========================================================================

window.openRiderDrawer = function(rider) {
  const drawer = document.getElementById('riderDrawer');
  const backdrop = document.getElementById('sideDrawerBackdrop');
  const content = document.getElementById('riderDrawerContent');
  const title = document.getElementById('riderDrawerTitle');

  if (!drawer || !backdrop || !content) {
    alert('Rider Telemetry: ' + rider.name + '\nStatus: ' + rider.status + '\nVehicle: ' + rider.vehicle);
    return;
  }

  if (title) title.innerText = rider.name + ' • ' + rider.vehicle;

  const isStale = rider.isGpsStale || false;
  const isBusy = rider.status === 'in_transit';

  content.innerHTML = 
    '<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);">' +
      '<div>' +
        '<div style="font-size:11px; color:var(--slate-400); text-transform:uppercase;">Telemetry Status</div>' +
        '<div style="font-size:15px; font-weight:800; color:' + (isBusy ? '#c084fc' : '#38bdf8') + '; margin-top:2px;">' + (isBusy ? 'BUSY (ON ACTIVE TRIP)' : 'AVAILABLE (READY)') + '</div>' +
      '</div>' +
      '<div>' +
        (isStale 
          ? '<span class="badge-stale-gps"><span class="pulse-dot"></span> GPS Stale (3m ago)</span>'
          : '<span class="badge-live-gps"><span class="pulse-dot"></span> Live Telemetry (1s)</span>') +
      '</div>' +
    '</div>' +

    '<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">' +
      '<div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); text-align:center;">' +
        '<div style="font-size:10px; color:var(--slate-400);">ELEVATION</div>' +
        '<div style="font-size:16px; font-weight:800; color:#fff; margin-top:2px;">' + (rider.elevation || '1,640') + 'm</div>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); text-align:center;">' +
        '<div style="font-size:10px; color:var(--slate-400);">SPEED</div>' +
        '<div style="font-size:16px; font-weight:800; color:#38bdf8; margin-top:2px;">' + (rider.speed || '24') + ' km/h</div>' +
      '</div>' +
      '<div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:8px; border:1px solid rgba(255,255,255,0.08); text-align:center;">' +
        '<div style="font-size:10px; color:var(--slate-400);">BATTERY</div>' +
        '<div style="font-size:16px; font-weight:800; color:#10b981; margin-top:2px;">' + (rider.battery || '86%') + '</div>' +
      '</div>' +
    '</div>' +

    '<div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);">' +
      '<h4 style="margin:0 0 10px 0; color:#fff; font-size:13px;">Active Trip & Destination</h4>' +
      (isBusy 
        ? '<div style="font-size:12px; line-height:1.6;">' +
            '<div><span style="color:var(--slate-400);">Order ID:</span> <code style="color:var(--sky-400);">' + rider.activeOrder + '</code></div>' +
            '<div><span style="color:var(--slate-400);">Destination:</span> Near DC Office, Mall Road</div>' +
            '<div><span style="color:var(--slate-400);">Terrain ETA:</span> <b style="color:var(--emerald-400);">18 mins (Steep Climb)</b></div>' +
          '</div>'
        : '<div style="font-size:12px; color:var(--slate-400); padding:10px 0;">No active trip assigned. Rider is positioned at staging hub.</div>') +
    '</div>' +

    '<div style="background:rgba(255,255,255,0.03); padding:16px; border-radius:10px; border:1px solid rgba(255,255,255,0.08);">' +
      '<h4 style="margin:0 0 10px 0; color:#fff; font-size:13px;">Daily Shift & Wallet</h4>' +
      '<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">' +
        '<span style="color:var(--slate-400);">Completed Orders:</span> <b>' + (rider.completedOrders || 7) + '</b>' +
      '</div>' +
      '<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">' +
        '<span style="color:var(--slate-400);">Today\'s Earnings:</span> <b style="color:var(--emerald-400); font-family:var(--font-mono);">₹' + (rider.todayEarnings || 640) + '</b>' +
      '</div>' +
      '<div style="display:flex; justify-content:space-between; font-size:12px;">' +
        '<span style="color:var(--slate-400);">Cash-on-Delivery Holding:</span> <b style="color:#f59e0b; font-family:var(--font-mono);">₹' + (rider.codHolding || 1250) + '</b>' +
      '</div>' +
    '</div>' +

    '<div style="display:flex; gap:8px;">' +
      '<button class="btn btn-secondary btn-sm" onclick="alert(\'Calling rider via masked IVR...\')" style="flex:1;">📞 Call Rider</button>' +
      '<button class="btn btn-secondary btn-sm" onclick="alert(\'Dispatch notification sent to rider app\')" style="flex:1;">📲 Send Alert</button>' +
    '</div>';

  drawer.classList.add('active');
  backdrop.classList.add('active');
};

window.closeRiderDrawer = function() {
  const drawer = document.getElementById('riderDrawer');
  const backdrop = document.getElementById('sideDrawerBackdrop');
  if (drawer) drawer.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
};
