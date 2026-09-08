// PahadiCart Real-Time Animated Mountain GPS Tracking Engine
(function() {
  class PahadiGPSTrackingEngine {
    constructor() {
      this.activeAnimation = null;
      this.trails = {
        solan: {
          name: 'Solan Mall Road to Shamti Pine Lane',
          baseAlt: 1502,
          targetAlt: 1640,
          coords: [
            [30.9080, 77.0980],
            [30.9088, 77.0995],
            [30.9095, 77.1012],
            [30.9102, 77.1025],
            [30.9110, 77.1035],
            [30.9118, 77.1050],
            [30.9125, 77.1065],
            [30.9135, 77.1080],
            [30.9142, 77.1095],
            [30.9150, 77.1110]
          ]
        },
        shimla: {
          name: 'Lakkar Bazaar to Sanjauli Switchback',
          baseAlt: 2150,
          targetAlt: 2280,
          coords: [
            [31.1048, 77.1734],
            [31.1055, 77.1750],
            [31.1062, 77.1772],
            [31.1070, 77.1800],
            [31.1082, 77.1835],
            [31.1090, 77.1865],
            [31.1100, 77.1900]
          ]
        },
        dharamshala: {
          name: 'Kotwali Bazaar to Bhagsunag Waterfall Trail',
          baseAlt: 1380,
          targetAlt: 1770,
          coords: [
            [32.2190, 76.3234],
            [32.2210, 76.3245],
            [32.2235, 76.3260],
            [32.2270, 76.3280],
            [32.2310, 76.3295],
            [32.2350, 76.3315],
            [32.2390, 76.3330]
          ]
        }
      };
    }

    getTrailForTown(town) {
      const key = (town || 'solan').toLowerCase();
      return this.trails[key] || this.trails.solan;
    }

    showTrackingModal(order) {
      order = order || {};
      const existing = document.getElementById('gpsTrackingModal');
      if (existing) existing.remove();

      const town = order.town || (window.customerApp ? window.customerApp.currentTown : 'solan') || 'solan';
      const trail = this.getTrailForTown(town);
      const rider = (window.PAHADICART_DATA && window.PAHADICART_DATA.riders || []).find(r => r.town === town) || { name: 'Vikas Thakur', vehicle: 'Hero Splendor (HP-14-B-8821)' };

      const modal = document.createElement('div');
      modal.id = 'gpsTrackingModal';
      modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(2,6,23,0.85); backdrop-filter:blur(8px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:16px; font-family:var(--font-sans, sans-serif);';

      modal.innerHTML = [
        '<div style="background:#0f172a; border:1px solid rgba(16,185,129,0.3); border-radius:20px; max-width:680px; width:100%; max-height:92vh; overflow-y:auto; color:#f8fafc; box-shadow:0 25px 50px rgba(0,0,0,0.8); display:flex; flex-direction:column;">',
          '<!-- Header -->',
          '<div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">',
            '<div>',
              '<div style="display:flex; align-items:center; gap:8px;">',
                '<span style="font-size:20px;">🛵</span>',
                '<strong style="font-size:16px; color:#10b981;">Live Mountain GPS Radar</strong>',
                '<span style="background:rgba(16,185,129,0.15); color:#10b981; font-size:10.5px; font-weight:800; padding:2px 8px; border-radius:10px;">EN ROUTE</span>',
              '</div>',
              '<div style="font-size:11.5px; color:#94a3b8; margin-top:2px;">' + trail.name + ' &bull; Order #' + (order.id || 'ORD-LIVE') + '</div>',
            '</div>',
            '<button onclick="window.pahadiGPS.closeModal()" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer;">✕</button>',
          '</div>',

          '<!-- Telemetry HUD Strip -->',
          '<div style="background:#1e293b; padding:10px 20px; display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; border-bottom:1px solid rgba(255,255,255,0.06); text-align:center;">',
            '<div>',
              '<div style="font-size:10px; color:#94a3b8; font-weight:700;">ALTITUDE</div>',
              '<div id="hudAltitude" style="font-size:16px; font-weight:800; color:#38bdf8;">' + trail.baseAlt + ' m</div>',
              '<div id="hudClimb" style="font-size:9.5px; color:#34d399;">+0m climb</div>',
            '</div>',
            '<div>',
              '<div style="font-size:10px; color:#94a3b8; font-weight:700;">SPEED</div>',
              '<div id="hudSpeed" style="font-size:16px; font-weight:800; color:#fbbf24;">24 km/h</div>',
              '<div style="font-size:9.5px; color:#94a3b8;">Hill Curve Avg</div>',
            '</div>',
            '<div>',
              '<div style="font-size:10px; color:#94a3b8; font-weight:700;">DISTANCE REMAINING</div>',
              '<div id="hudDist" style="font-size:16px; font-weight:800; color:#ffffff;">1.8 km</div>',
              '<div style="font-size:9.5px; color:#94a3b8;">Mountain Road</div>',
            '</div>',
            '<div>',
              '<div style="font-size:10px; color:#94a3b8; font-weight:700;">ETA</div>',
              '<div id="hudEta" style="font-size:16px; font-weight:800; color:#10b981;">14 mins</div>',
              '<div style="font-size:9.5px; color:#34d399;">On-Time SLA</div>',
            '</div>',
          '</div>',

          '<!-- Map Viewport -->',
          '<div style="position:relative; height:360px; width:100%; background:#070d18;">',
            '<div id="liveGpsMap" style="width:100%; height:100%;"></div>',
            
            '<!-- Floating Rider Card Badge -->',
            '<div style="position:absolute; bottom:14px; left:14px; right:14px; background:rgba(15,23,42,0.9); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.12); padding:10px 14px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; z-index:1000;">',
              '<div style="display:flex; align-items:center; gap:10px;">',
                '<div style="width:36px; height:36px; border-radius:50%; background:#10b981; display:flex; align-items:center; justify-content:center; font-size:18px;">🛵</div>',
                '<div>',
                  '<div style="font-size:12.5px; font-weight:800; color:#ffffff;">' + rider.name + '</div>',
                  '<div style="font-size:11px; color:#94a3b8;">' + (rider.vehicle || 'Hero Splendor') + '</div>',
                '</div>',
              '</div>',
              '<button onclick="alert(\'📞 Calling Rider: 98160-88219 (Masked Secure Call)\');" style="background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#38bdf8; padding:6px 14px; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer;">',
                '📞 Call Rider',
              '</button>',
            '</div>',
          '</div>',

          '<!-- Footer Actions -->',
          '<div style="padding:8px 20px; background:#070d18; border-top:1px solid rgba(255,255,255,0.06); display:flex; justify-content:center;">' +
            '<a href="https://www.google.com/maps/dir/?api=1&destination=' + trail.coords[trail.coords.length-1][0] + ',' + trail.coords[trail.coords.length-1][1] + '" target="_blank" rel="noopener" style="background:rgba(56,189,248,0.18); border:1px solid #38bdf8; color:#38bdf8; padding:8px 16px; border-radius:8px; font-size:12px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">' +
              '<span>🗺️</span> Open Destination in Google Maps (Turn-by-Turn)' +
            '</a>' +
          '</div>',
          '<div style="padding:14px 20px; display:flex; justify-content:space-between; align-items:center; background:#0b1322;">',
            '<div style="font-size:11.5px; color:#cbd5e1;">',
              '🪜 <strong>Drop Guidance:</strong> ' + (order.customer && order.customer.staircaseDetails || 'Descend 25 stairs from roadside'),
            '</div>',
            '<button onclick="window.pahadiGPS.closeModal()" style="background:#334155; color:#f1f5f9; border:none; padding:8px 18px; border-radius:8px; font-weight:700; font-size:12px; cursor:pointer;">',
              'Close Radar',
            '</button>',
          '</div>',
        '</div>'
      ].join('');

      document.body.appendChild(modal);

      setTimeout(() => {
        this.initMapAndAnimate(trail);
      }, 150);
    }

    initMapAndAnimate(trail) {
      const mapContainer = document.getElementById('liveGpsMap');
      if (!mapContainer || !window.L) return;

      const map = L.map('liveGpsMap', { zoomControl: false }).setView(trail.coords[0], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      // Polyline trail
      const polyline = L.polyline(trail.coords, {
        color: '#10b981',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8'
      }).addTo(map);

      L.marker(trail.coords[0]).addTo(map).bindPopup('🏪 Store (Start)');
      L.marker(trail.coords[trail.coords.length - 1]).addTo(map).bindPopup('🏡 Customer Doorstep');

      const scooterIcon = L.divIcon({
        className: 'scooter-marker-icon',
        html: '<div style="font-size:24px; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.6));">🛵</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const animatedMarker = L.marker(trail.coords[0], { icon: scooterIcon }).addTo(map);
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });

      let currentIndex = 0;
      let progress = 0;
      const totalPoints = trail.coords.length;

      const stepAnimation = () => {
        if (!document.getElementById('liveGpsMap')) return;

        if (currentIndex < totalPoints - 1) {
          const p1 = trail.coords[currentIndex];
          const p2 = trail.coords[currentIndex + 1];

          progress += 0.04;
          if (progress >= 1) {
            progress = 0;
            currentIndex++;
          }

          const currentLat = p1[0] + (p2[0] - p1[0]) * progress;
          const currentLng = p1[1] + (p2[1] - p1[1]) * progress;

          animatedMarker.setLatLng([currentLat, currentLng]);

          const overallProgress = (currentIndex + progress) / (totalPoints - 1);
          const currentAlt = Math.round(trail.baseAlt + (trail.targetAlt - trail.baseAlt) * overallProgress);
          const climbGain = currentAlt - trail.baseAlt;
          const distRemaining = ((1.8) * (1 - overallProgress)).toFixed(1);
          const etaMins = Math.max(1, Math.round(14 * (1 - overallProgress)));

          const hudAlt = document.getElementById('hudAltitude');
          const hudClimb = document.getElementById('hudClimb');
          const hudDist = document.getElementById('hudDist');
          const hudEta = document.getElementById('hudEta');

          if (hudAlt) hudAlt.innerText = currentAlt + ' m';
          if (hudClimb) hudClimb.innerText = '+' + climbGain + 'm climb';
          if (hudDist) hudDist.innerText = distRemaining + ' km';
          if (hudEta) hudEta.innerText = etaMins + ' mins';

          this.activeAnimation = requestAnimationFrame(stepAnimation);
        } else {
          const hudEta = document.getElementById('hudEta');
          if (hudEta) {
            hudEta.innerText = 'Arrived!';
            hudEta.style.color = '#34d399';
          }
        }
      };

      this.activeAnimation = requestAnimationFrame(stepAnimation);
    }

    closeModal() {
      if (this.activeAnimation) cancelAnimationFrame(this.activeAnimation);
      const modal = document.getElementById('gpsTrackingModal');
      if (modal) modal.remove();
    }
  }

  window.pahadiGPS = new PahadiGPSTrackingEngine();
})();
