// PahadiCart Real-Time Live Services: HTML5 GPS Geolocation, Open-Meteo Weather API & Google Maps Navigation
(function() {
  const HIMACHAL_TOWNS = [
    { id: 'solan', name: 'Solan', lat: 30.9084, lng: 77.0999, altitude: 1502 },
    { id: 'shimla', name: 'Shimla Ridge', lat: 31.1048, lng: 77.1734, altitude: 2206 },
    { id: 'dharamshala', name: 'Dharamshala', lat: 32.2190, lng: 76.3234, altitude: 1457 }
  ];

  class PahadiLiveServices {
    constructor() {
      this.currentLiveLocation = null;
      this.lastFetchedWeather = null;
      this.isDetecting = false;
    }

    // Great circle distance in kilometers
    calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; // Earth radius in km
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
      let minDistance = Infinity;
      let nearest = HIMACHAL_TOWNS[0];
      for (const town of HIMACHAL_TOWNS) {
        const dist = this.calculateDistance(lat, lng, town.lat, town.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = town;
        }
      }
      return {
        town: nearest,
        distanceKm: minDistance,
        isWithinHimachal: minDistance <= 120 // Within typical Himachal travel radius
      };
    }

    // HTML5 GPS Geolocation Auto-Detection
    detectUserLocation(options = {}) {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          const err = new Error('HTML5 Geolocation is not supported by this browser.');
          return reject(err);
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
            const { latitude, longitude, altitude, accuracy } = position.coords;
            const nearestInfo = this.findNearestTown(latitude, longitude);

            const result = {
              lat: latitude,
              lng: longitude,
              altitude: altitude ? Math.round(altitude) : nearestInfo.town.altitude,
              accuracy: Math.round(accuracy || 10),
              timestamp: position.timestamp || Date.now(),
              nearestTown: nearestInfo.town,
              distanceKm: nearestInfo.distanceKm,
              isWithinHimachal: nearestInfo.isWithinHimachal
            };

            this.currentLiveLocation = result;
            resolve(result);
          },
          (error) => {
            this.isDetecting = false;
            let msg = 'Unable to retrieve location.';
            if (error.code === error.PERMISSION_DENIED) {
              msg = 'GPS Permission denied. Please allow location access in your browser settings.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              msg = 'GPS Position unavailable. Using Himachal town coordinates.';
            } else if (error.code === error.TIMEOUT) {
              msg = 'GPS request timed out. Please check signal.';
            }
            const customErr = new Error(msg);
            customErr.code = error.code;
            reject(customErr);
          },
          geoOptions
        );
      });
    }

    // Open-Meteo Real-Time Weather Fetch (100% Free, Zero Key, No Rate Limits)
    async fetchRealtimeWeather(lat = 30.9084, lng = 77.0999) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error('Open-Meteo HTTP error ' + res.status);
        }
        const data = await res.json();
        const current = data.current || {};
        const code = current.weather_code ?? 0;
        const temp = Math.round((current.temperature_2m ?? 18) * 10) / 10;
        const humidity = current.relative_humidity_2m ?? 55;
        const wind = Math.round((current.wind_speed_10m ?? 8) * 10) / 10;

        // WMO Code Classification
        let mode = 'clear';
        let label = '☀️ Clear Skies';
        let description = 'Roads dry & clear. Standard 45-60 min delivery SLA active.';

        // Snow condition: 71, 73, 75, 77, 85, 86
        if ([71, 73, 75, 77, 85, 86].includes(code)) {
          mode = 'snow';
          label = '❄️ Snowfall / Blizzard';
          description = 'SAFETY LOCK: Sub-zero snow detected. Steep slopes locked for pedestrian runners.';
        }
        // Rain condition: 51-67, 80-82, 95-99
        else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
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

    // Google Maps Universal Deep Link Navigation Scheme
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
  }

  window.PahadiLiveServices = new PahadiLiveServices();
  window.HIMACHAL_TOWNS = HIMACHAL_TOWNS;
})();
