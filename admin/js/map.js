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
