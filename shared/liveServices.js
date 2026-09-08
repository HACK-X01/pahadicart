// PahadiCart Real-Time Live Services: Compulsory HTML5 GPS, Open-Meteo Weather Sync & Google Maps Navigation
(function() {
  const HIMACHAL_TOWNS = [
    { id: 'solan', name: 'Solan (Mushroom City)', lat: 30.9084, lng: 77.0999, altitude: 1502 },
    { id: 'shimla', name: 'Shimla Ridge', lat: 31.1048, lng: 77.1734, altitude: 2206 },
    { id: 'dharamshala', name: 'Dharamshala (Kangra Valley)', lat: 32.2190, lng: 76.3234, altitude: 1457 }
  ];

  class PahadiLiveServices {
    constructor() {
      this.currentLiveLocation = null;
      this.lastFetchedWeather = null;
      this.isDetecting = false;
      this.hasPrompted = false;
      this.injectStyles();
    }

    injectStyles() {
      if (document.getElementById('pahadiLiveStyles')) return;
      const style = document.createElement('style');
      style.id = 'pahadiLiveStyles';
      style.textContent = `
        @keyframes pahadiModalFadeIn {
          from { opacity: 0; transform: scale(0.92) translateY(18px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pahadiGpsPulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 18px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes liveDotGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        .compulsory-location-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(2, 6, 23, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 9999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          transition: opacity 0.4s ease;
        }
        .compulsory-location-card {
          background: #0f172a;
          border: 1px solid rgba(16, 185, 129, 0.4);
          border-radius: 24px;
          max-width: 460px;
          width: 100%;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(16, 185, 129, 0.2);
          overflow: hidden;
          animation: pahadiModalFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          color: #f8fafc;
        }
        .compulsory-card-hero {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(56, 189, 248, 0.15) 100%);
          padding: 24px 24px 18px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
        }
        .compulsory-icon-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
          animation: pahadiGpsPulse 2.2s infinite;
          margin-bottom: 12px;
        }
        .compulsory-primary-btn {
          width: 100%;
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
          color: #ffffff;
          border: none;
          padding: 15px 24px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
          transition: all 0.2s ease;
        }
        .compulsory-primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(16, 185, 129, 0.5);
        }
        .compulsory-secondary-btn {
          width: 100%;
          background: transparent;
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 11px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s;
        }
        .compulsory-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }
      `;
      document.head.appendChild(style);
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round((R * c) * 10) / 10;
    }

    findNearestTown(lat, lng) {
      if (typeof lat !== 'number' || !Number.isFinite(lat) || typeof lng !== 'number' || !Number.isFinite(lng)) {
        lat = HIMACHAL_TOWNS[0].lat;
        lng = HIMACHAL_TOWNS[0].lng;
      }
      let minDistance = Infinity;
      let nearest = HIMACHAL_TOWNS[0];
      for (const town of HIMACHAL_TOWNS) {
        const dist = this.calculateDistance(lat, lng, town.lat, town.lng);
        if (Number.isFinite(dist) && dist < minDistance) {
          minDistance = dist;
          nearest = town;
        }
      }
      return {
        town: nearest,
        distanceKm: Number.isFinite(minDistance) ? minDistance : 0,
        isWithinHimachal: Number.isFinite(minDistance) ? minDistance <= 120 : true
      };
    }

    // HTML5 Hardware GPS Detection
    detectUserLocation(options = {}) {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          return reject(new Error('HTML5 Geolocation is not supported by your device browser.'));
        }

        this.isDetecting = true;
        const geoOptions = {
          enableHighAccuracy: true,
          timeout: options.timeout || 12000,
          maximumAge: options.maximumAge || 0
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.isDetecting = false;
            let latitude = (position && position.coords) ? position.coords.latitude : null;
            let longitude = (position && position.coords) ? position.coords.longitude : null;
            let altitude = (position && position.coords) ? position.coords.altitude : null;
            let accuracy = (position && position.coords) ? position.coords.accuracy : null;

            // Safe guard against NaN, null, or undefined coordinates from device/browser
            if (typeof latitude !== 'number' || !Number.isFinite(latitude) || typeof longitude !== 'number' || !Number.isFinite(longitude)) {
              console.warn('Device GPS returned non-finite coordinates, defaulting to Solan Hub:', latitude, longitude);
              latitude = HIMACHAL_TOWNS[0].lat;
              longitude = HIMACHAL_TOWNS[0].lng;
            }

            const nearestInfo = this.findNearestTown(latitude, longitude);

            const result = {
              lat: latitude,
              lng: longitude,
              altitude: (altitude && Number.isFinite(altitude)) ? Math.round(altitude) : nearestInfo.town.altitude,
              accuracy: (accuracy && Number.isFinite(accuracy)) ? Math.round(accuracy) : 10,
              timestamp: position.timestamp || Date.now(),
              nearestTown: nearestInfo.town,
              distanceKm: Number.isFinite(nearestInfo.distanceKm) ? nearestInfo.distanceKm : 0,
              isWithinHimachal: nearestInfo.isWithinHimachal
            };

            this.currentLiveLocation = result;
            sessionStorage.setItem('pahadi_live_location', JSON.stringify(result));
            sessionStorage.setItem('pahadi_live_location_confirmed', 'true');
            resolve(result);
          },
          (error) => {
            this.isDetecting = false;
            let msg = 'Unable to retrieve GPS coordinates.';
            if (error.code === error.PERMISSION_DENIED) {
              msg = 'GPS permission was not granted.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              msg = 'Device GPS position currently unavailable.';
            } else if (error.code === error.TIMEOUT) {
              msg = 'Device GPS request timed out.';
            }
            const customErr = new Error(msg);
            customErr.code = error.code;
            reject(customErr);
          },
          geoOptions
        );
      });
    }

    // Open-Meteo Real-Time Weather Fetch
    async fetchRealtimeWeather(lat = 30.9084, lng = 77.0999) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Open-Meteo HTTP error ' + res.status);
        const data = await res.json();
        const current = data.current || {};
        const code = current.weather_code ?? 0;
        const temp = Math.round((current.temperature_2m ?? 18) * 10) / 10;
        const humidity = current.relative_humidity_2m ?? 55;
        const wind = Math.round((current.wind_speed_10m ?? 8) * 10) / 10;

        let mode = 'clear';
        let label = '☀️ Clear Skies';
        let description = 'Roads dry & clear. Standard 45-60 min delivery SLA active.';

        if ([71, 73, 75, 77, 85, 86].includes(code)) {
          mode = 'snow';
          label = '❄️ Snowfall / Blizzard';
          description = 'SAFETY LOCK: Sub-zero snow detected. Steep slopes locked for pedestrian runners.';
        } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
          mode = 'rain';
          label = '🌧️ Monsoon Rain';
          description = 'Monsoon buffer active: +20 mins added to ETA, +₹15 dynamic rain surge to rider.';
        } else if ([1, 2, 3].includes(code)) {
          label = '⛅ Partly Cloudy';
        } else if ([45, 48].includes(code)) {
          label = '🌫️ Mountain Fog / Mist';
          description = 'Low visibility on ridge curves. Riders advised low-beam fog lamps.';
        }

        const weatherInfo = {
          mode,
          temp,
          humidity,
          wind,
          code,
          label,
          description,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          raw: data
        };

        this.lastFetchedWeather = weatherInfo;
        return weatherInfo;
      } catch (err) {
        console.warn('Live weather fetch fallback:', err.message);
        return {
          mode: 'clear',
          temp: 18.2,
          humidity: 58,
          wind: 7.5,
          code: 0,
          label: '☀️ Clear (Local Synced)',
          description: 'Roads dry & clear. Standard 45-60 min delivery SLA active.',
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fallback: true
        };
      }
    }

    // Google Maps Navigation Deep Link
    getGoogleMapsUrl(lat, lng, destinationTitle = '') {
      const base = 'https://www.google.com/maps/dir/?api=1';
      const dest = `${lat},${lng}`;
      let url = `${base}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
      return url;
    }

    openInGoogleMaps(lat, lng, destinationTitle = '') {
      const url = this.getGoogleMapsUrl(lat, lng, destinationTitle);
      window.open(url, '_blank', 'noopener,noreferrer');
      return url;
    }

    openOrderInGoogleMaps(orderId, fallbackAddress = '') {
      let lat = 30.9110;
      let lng = 77.1040;
      let label = 'Customer Delivery Drop';

      if (window.PahadiMockDB && window.PahadiMockDB.orders) {
        const order = window.PahadiMockDB.orders.find(o => o.id === orderId);
        if (order) {
          label = order.deliveryAddress || fallbackAddress || 'Order #' + orderId;
          const town = (window.PahadiMockDB.towns || []).find(t => t.id === order.town);
          if (town && town.center) {
            lat = town.center[0] + 0.002;
            lng = town.center[1] + 0.003;
          }
        }
      } else if (window.pahadiBus) {
        const orders = window.pahadiBus.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
          label = order.colony || order.deliveryAddress || fallbackAddress || 'Order #' + orderId;
        }
      }

      return this.openInGoogleMaps(lat, lng, label);
    }

    // COMPULSORY LOCATION ON APP OPEN
    async initCompulsoryLocationFlow() {
      // Check if user has already confirmed location in this browser tab session
      const alreadyConfirmed = sessionStorage.getItem('pahadi_live_location_confirmed');
      if (alreadyConfirmed) {
        try {
          const cached = sessionStorage.getItem('pahadi_live_location');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed.lat === 'number' && Number.isFinite(parsed.lat) && typeof parsed.lng === 'number' && Number.isFinite(parsed.lng)) {
              this.currentLiveLocation = parsed;
              await this.applyLocationAndSyncWeather(parsed);
              return;
            } else {
              sessionStorage.removeItem('pahadi_live_location');
              sessionStorage.removeItem('pahadi_live_location_confirmed');
            }
          }
        } catch (e) {}
      }

      // Show compulsory permission modal immediately on opening the app
      this.showCompulsoryLocationModal();
    }

    showCompulsoryLocationModal() {
      if (document.getElementById('pahadiCompulsoryLocationModal')) return;

      const modal = document.createElement('div');
      modal.id = 'pahadiCompulsoryLocationModal';
      modal.className = 'compulsory-location-backdrop';

      modal.innerHTML = `
        <div class="compulsory-location-card">
          <div class="compulsory-card-hero">
            <div class="compulsory-icon-circle">📍</div>
            <div style="font-size: 11px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1.5px;">Hyperlocal Mountain GPS</div>
            <h2 style="font-size: 20px; font-weight: 900; margin: 6px 0 4px; color: #ffffff;">Live Location Access Compulsory</h2>
            <p style="font-size: 12.5px; color: #cbd5e1; line-height: 1.5; margin: 0;">
              Himachal steep staircase elevation, exact shop delivery, aur live monsoon/snow weather auto-sync ke liye live location access anivarya hai.
            </p>
          </div>

          <div style="padding: 20px 24px;">
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.03); padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06);">
                <span style="font-size: 18px;">🏔️</span>
                <div style="font-size: 12px; color: #e2e8f0;"><strong>Map Auto-Pan:</strong> Seedha aapke coordinates par center hoga</div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.03); padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06);">
                <span style="font-size: 18px;">⚡</span>
                <div style="font-size: 12px; color: #e2e8f0;"><strong>Live Open-Meteo Weather:</strong> Asli taapmaan aur SLA auto-sync</div>
              </div>
              <div style="display: flex; align-items: center; gap: 12px; background: rgba(255, 255, 255, 0.03); padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06);">
                <span style="font-size: 18px;">🗺️</span>
                <div style="font-size: 12px; color: #e2e8f0;"><strong>Google Maps Navigation:</strong> Doorstep staircase turn-by-turn</div>
              </div>
            </div>

            <div id="compulsoryStatusFeedback" style="display: none; text-align: center; margin-bottom: 14px; font-size: 12.5px; font-weight: 700; color: #38bdf8;">
              Detecting hardware GPS coordinates...
            </div>

            <button id="btnGrantCompulsoryLocation" class="compulsory-primary-btn" onclick="window.PahadiLiveServices.handleCompulsoryGrant()">
              <span style="font-size: 18px;">📍</span>
              <span id="grantBtnText">Allow Live GPS Location Now</span>
            </button>

            <button class="compulsory-secondary-btn" onclick="window.PahadiLiveServices.handleCompulsoryFallback()">
              ⛰️ Continue with Default Himachal Hub (Solan 1,502m)
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    }

    async handleCompulsoryGrant() {
      const grantBtnText = document.getElementById('grantBtnText');
      const feedback = document.getElementById('compulsoryStatusFeedback');
      if (grantBtnText) grantBtnText.textContent = 'Contacting Hardware GPS...';
      if (feedback) {
        feedback.style.display = 'block';
        feedback.style.color = '#38bdf8';
        feedback.textContent = 'Requesting browser location permission...';
      }

      try {
        const loc = await this.detectUserLocation({ timeout: 12000 });
        if (feedback) {
          feedback.style.color = '#34d399';
          feedback.textContent = '✓ GPS Verified: ' + loc.lat.toFixed(3) + ', ' + loc.lng.toFixed(3) + ' • Syncing Weather...';
        }
        if (grantBtnText) grantBtnText.textContent = '✓ Location Granted!';

        // Update map & weather
        await this.applyLocationAndSyncWeather(loc);

        // Smooth close modal
        setTimeout(() => {
          this.dismissCompulsoryModal();
        }, 600);
      } catch (err) {
        console.warn('Compulsory location error:', err);
        if (feedback) {
          feedback.style.color = '#f87171';
          feedback.textContent = '⚠️ ' + (err.message || 'GPS permission not granted.');
        }
        if (grantBtnText) grantBtnText.textContent = 'Retry GPS Access';
        // Give fallback after 1.5s
        setTimeout(() => {
          this.handleCompulsoryFallback();
        }, 1800);
      }
    }

    async handleCompulsoryFallback() {
      const defaultTown = HIMACHAL_TOWNS[0];
      const fallbackLoc = {
        lat: defaultTown.lat,
        lng: defaultTown.lng,
        altitude: defaultTown.altitude,
        accuracy: 15,
        nearestTown: defaultTown,
        distanceKm: 0,
        isWithinHimachal: true,
        isFallback: true
      };
      this.currentLiveLocation = fallbackLoc;
      try {
        await this.applyLocationAndSyncWeather(fallbackLoc);
      } catch (e) {
        console.warn('Fallback sync weather error:', e);
      } finally {
        sessionStorage.setItem('pahadi_live_location', JSON.stringify(fallbackLoc));
        sessionStorage.setItem('pahadi_live_location_confirmed', 'true');
        this.dismissCompulsoryModal();
      }
    }

    dismissCompulsoryModal() {
      const modal = document.getElementById('pahadiCompulsoryLocationModal');
      if (modal) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.35s ease';
        setTimeout(() => modal.remove(), 350);
      }
    }

    async applyLocationAndSyncWeather(loc) {
      // Robust sanitization against NaN or corrupted coordinates
      if (!loc || typeof loc.lat !== 'number' || !Number.isFinite(loc.lat) || typeof loc.lng !== 'number' || !Number.isFinite(loc.lng)) {
        console.warn('applyLocationAndSyncWeather received non-finite loc, defaulting to Solan:', loc);
        const defaultTown = HIMACHAL_TOWNS[0];
        loc = {
          lat: defaultTown.lat,
          lng: defaultTown.lng,
          altitude: defaultTown.altitude,
          accuracy: 15,
          nearestTown: defaultTown,
          distanceKm: 0,
          isWithinHimachal: true,
          isFallback: true
        };
      }
      this.currentLiveLocation = loc;

      // 1. Fetch real-time Open-Meteo weather
      const weather = await this.fetchRealtimeWeather(loc.lat, loc.lng);

      // 2. Broadcast on event bus
      if (window.pahadiBus && typeof window.pahadiBus.broadcast === 'function') {
        window.pahadiBus.broadcast('LIVE_LOCATION_SYNCED', { location: loc, weather });
      }

      // Hook into Admin Tower
      if (typeof window.detectAdminLiveLocation === 'function') {
        try { window.detectAdminLiveLocation(loc); } catch (e) { console.error(e); }
      }

      // Hook into Customer App
      if (typeof window.detectCustomerLiveLocation === 'function') {
        try { window.detectCustomerLiveLocation(loc, true); } catch (e) { console.error(e); }
      }

      // 3. Update Admin Portal
      try {
        if (window.leafletMap && typeof L !== 'undefined' && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
          window.leafletMap.flyTo([loc.lat, loc.lng], 15, { duration: 1.5 });

          if (window.adminUserMarker) {
            window.leafletMap.removeLayer(window.adminUserMarker);
          }

          const gmapsUrl = this.getGoogleMapsUrl(loc.lat, loc.lng, 'My Live Admin Post');
          const liveIcon = L.divIcon({
            className: 'map-marker-live-user',
            html: '<div style="background:#0284c7; border:3px solid #ffffff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(2,132,199,0.9); color:#fff; font-size:15px; font-weight:bold; animation:livePulse 2s infinite;">📍</div>',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          });

          window.adminUserMarker = L.marker([loc.lat, loc.lng], { icon: liveIcon }).addTo(window.leafletMap);
          window.adminUserMarker.bindPopup(
            "<div style=\"font-family:'Plus Jakarta Sans',sans-serif; color:#0f172a; padding:6px; min-width:200px;\">" +
            "<h4 style=\"margin:0 0 4px 0; font-size:13px; font-weight:800; color:#0284c7;\">📍 You Are Here (Live GPS)</h4>" +
            "<div style=\"font-size:11px; color:#475569;\">Coords: <b>" + loc.lat.toFixed(4) + ", " + loc.lng.toFixed(4) + "</b></div>" +
            "<div style=\"font-size:11px; color:#475569;\">Altitude: <b>" + loc.altitude + "m</b> &bull; Accuracy: &plusmn;" + loc.accuracy + "m</div>" +
            "<div style=\"font-size:11px; color:#059669; font-weight:700; margin:4px 0;\">Nearest Hub: " + (loc.nearestTown ? loc.nearestTown.name : 'Solan') + " (" + loc.distanceKm + " km)</div>" +
            "<a href=\"" + gmapsUrl + "\" target=\"_blank\" rel=\"noopener\" style=\"display:inline-block; margin-top:6px; background:#0284c7; color:#fff; padding:5px 12px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:700;\">🗺️ Open in Google Maps</a>" +
            "</div>"
          ).openPopup();
        }
      } catch (mapErr) {
        console.warn('Map flyTo/marker error (non-fatal):', mapErr);
      }

      // Update Admin UI Badges
      const gpsBtnText = document.getElementById('detectGpsBtnText');
      if (gpsBtnText) gpsBtnText.textContent = '📍 GPS Synced (' + loc.lat.toFixed(2) + ', ' + loc.lng.toFixed(2) + ')';

      const weatherBadgeText = document.getElementById('liveWeatherTelemetryText');
      if (weatherBadgeText) {
        weatherBadgeText.innerText = weather.temp + '°C • ' + weather.label + ' (Live)';
      }

      if (typeof setWeatherMode === 'function') {
        setWeatherMode(weather.mode);
      }

      // 4. Update Customer Portal
      const custGpsBtnText = document.getElementById('custGpsBtnText');
      if (custGpsBtnText) {
        custGpsBtnText.textContent = '📍 ' + loc.nearestTown.name + ' (' + loc.lat.toFixed(2) + ', ' + loc.lng.toFixed(2) + ')';
      }

      const townSelect = document.getElementById('townSelect');
      if (townSelect && loc.nearestTown) {
        townSelect.value = loc.nearestTown.id;
        if (window.customerApp && typeof window.customerApp.changeTown === 'function') {
          window.customerApp.changeTown(loc.nearestTown.id);
        }
      }

      const weatherTextEl = document.getElementById('weatherStatusText');
      if (weatherTextEl) {
        weatherTextEl.innerText = loc.nearestTown.name + ' Weather: ' + weather.temp + '°C ' + weather.label + ' • Standard 45m SLA';
      }

      // Show Toast Notification
      if (typeof showToast === 'function') {
        showToast('📍 Live GPS & Weather Synced! ' + loc.lat.toFixed(3) + ', ' + loc.lng.toFixed(3) + ' (' + weather.temp + '°C • ' + weather.label + ')');
      }
    }
  }

  window.PahadiLiveServices = new PahadiLiveServices();
  window.HIMACHAL_TOWNS = HIMACHAL_TOWNS;

  // AUTO-TRIGGER COMPULSORY LOCATION ON PAGE LOAD
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => window.PahadiLiveServices.initCompulsoryLocationFlow(), 400);
    });
  } else {
    setTimeout(() => window.PahadiLiveServices.initCompulsoryLocationFlow(), 400);
  }
})();
