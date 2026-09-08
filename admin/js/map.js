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

  if (!leafletMap) {
    leafletMap = L.map('godViewMap', {
      zoomControl: true,
      attributionControl: false
    }).setView(town.center, town.zoom);

    // Standard OpenStreetMap Tiles (100% Free, Zero Key, Full Topography)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(leafletMap);
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

  setTimeout(() => {
    if (leafletMap) leafletMap.invalidateSize();
  }, 200);
}


// HTML5 Live GPS Auto-Detection for Admin Tower
window.detectAdminLiveLocation = async function() {
  const btnText = document.getElementById("detectGpsBtnText");
  if (btnText) btnText.textContent = "Detecting GPS...";

  if (!window.PahadiLiveServices) {
    alert("Live Services module initializing, please try again in a moment.");
    if (btnText) btnText.textContent = "Detect My Live GPS";
    return;
  }

  try {
    const loc = await window.PahadiLiveServices.detectUserLocation();
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
