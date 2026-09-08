// PahadiCart Interactive Live Mountain Order Lifecycle Simulation Engine
(function() {
  class PahadiSimulationEngine {
    constructor() {
      this.isRunning = false;
      this.currentStep = 0;
      this.stepListeners = [];
      this.timer = null;
      this.activeOrder = null;
    }

    onStep(cb) {
      this.stepListeners.push(cb);
    }

    notifyStep(step, data) {
      this.stepListeners.forEach(cb => {
        try { cb(step, data); } catch (e) { console.error('Sim error:', e); }
      });
    }

    async startSimulation(townId = 'solan') {
      if (this.isRunning) return;
      this.isRunning = true;
      this.currentStep = 0;

      const data = window.PAHADICART_DATA || {};
      const towns = data.towns || [];
      const townObj = towns.find(t => t.id === townId) || towns[0] || { id: 'solan', name: 'Solan' };

      // Step 1: Customer Places Hill Order
      this.currentStep = 1;
      const orderId = 'ORD-' + Math.floor(2000 + Math.random() * 7000);
      const secretOtp = String(Math.floor(1000 + Math.random() * 9000));
      
      const townMerchants = (data.merchants || []).filter(m => m.town === townId);
      const merchant = townMerchants[0] || (data.merchants || [])[0] || { id: 'm-101', name: 'Sharma Kirana' };
      const townRiders = (data.riders || []).filter(r => r.town === townId);
      const rider = townRiders[0] || (data.riders || [])[0] || { id: 'r-1', name: 'Vikas Thakur' };
      const townProducts = (data.products || []).filter(p => p.merchantId === merchant.id);
      const items = (townProducts.length > 0 ? townProducts.slice(0, 2) : (data.products || []).slice(0, 2)).map(p => ({
        id: p.id,
        name: p.name,
        qty: 1,
        price: p.price
      }));

      const itemTotal = items.reduce((sum, it) => sum + (it.price * it.qty), 0) || 320;
      const deliveryFee = 25;
      const staircaseFee = 25;
      const elevationSurge = 15;
      const weatherSurge = townObj.weatherSurgeFee || (townObj.weather === 'rain' ? 15 : 0);
      const totalAmount = itemTotal + deliveryFee + staircaseFee + elevationSurge + weatherSurge;

      const orderData = {
        id: orderId,
        town: townId,
        townName: townObj.name,
        customer: {
          name: 'Aarav Sharma',
          phone: '98160-12890',
          colony: townId === 'shimla' ? 'The Ridge, Lakkar Bazaar Lane' : (townId === 'dharamshala' ? 'Bhagsunag Waterfall Trail' : 'Shamti Upper Pine Lane'),
          address: 'House #4, Near Pine View Guest House',
          staircaseDetails: 'Descend 35 stone steps from road level, 2nd green gate on left',
          hasStairs: true,
          stairCount: 35,
          coordinates: townObj.center ? [townObj.center[0] - 0.002, townObj.center[1] + 0.001] : [30.9082, 77.0998]
        },
        merchant: {
          id: merchant.id,
          name: merchant.name,
          area: merchant.area,
          phone: merchant.phone,
          vyaparMandalId: merchant.vyaparMandalId,
          distanceMeters: 750,
          coordinates: merchant.coordinates || [30.9080, 77.0990]
        },
        rider: {
          id: rider.id,
          name: rider.name,
          phone: rider.phone,
          bike: rider.bike,
          cashInHand: rider.cashInHand || 850,
          distanceMeters: 580,
          elevationMeters: 140,
          isWalkingRunner: rider.isWalkingRunner || false,
          coordinates: rider.coordinates || [30.9095, 77.1010]
        },
        items: items,
        pricing: {
          itemTotal,
          deliveryFee,
          staircaseFee,
          elevationSurge,
          weatherSurge,
          totalAmount,
          merchantPayout: Math.round(itemTotal * 0.88),
          riderPayout: deliveryFee + staircaseFee + elevationSurge,
          platformCommission: Math.round(itemTotal * 0.12),
          tcsTax: Math.round(itemTotal * 0.01)
        },
        status: 'placed',
        otp: secretOtp,
        placedAt: new Date().toLocaleTimeString(),
        acceptedAt: null,
        pickedAt: null,
        deliveredAt: null,
        simulation: true
      };

      this.activeOrder = orderData;

      // Broadcast to all portals via event bus
      if (window.pahadiBus) {
        window.pahadiBus.placeOrder(orderData);
      }

      this.notifyStep(1, {
        step: 1,
        title: 'Customer Placed Mountain Order',
        desc: 'Order ' + orderId + ' placed for ' + items.map(i => i.name).join(', ') + ' in ' + townObj.name + '. Address has 35 steep stone stairs.',
        order: orderData
      });

      // Step 2: Proximity Dispatch & Merchant Chime (after 2s)
      await this.sleep(2200);
      this.currentStep = 2;
      orderData.status = 'preparing';
      orderData.acceptedAt = new Date().toLocaleTimeString();

      // Play Web Audio Chime
      if (window.hillAudio && window.hillAudio.playMerchantChime) {
        window.hillAudio.playMerchantChime();
      }

      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(orderId, 'preparing', { acceptedAt: orderData.acceptedAt });
      }

      this.notifyStep(2, {
        step: 2,
        title: '🔔 "Ghar Ki Ghanti" Chime & Merchant Accepted',
        desc: 'Auto-routed to closest store: ' + merchant.name + ' (750m away). Authentic brass temple bell chime sounded on shop tablet!',
        order: orderData
      });

      // Step 3: Rider Assigned & GPS Elevation Trail Climb (after 2.5s)
      await this.sleep(2500);
      this.currentStep = 3;
      orderData.status = 'picked';
      orderData.pickedAt = new Date().toLocaleTimeString();

      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(orderId, 'picked', { pickedAt: orderData.pickedAt });
      }

      this.notifyStep(3, {
        step: 3,
        title: '🛵 Nearest Rider Assigned & Elevation Climb',
        desc: rider.name + ' (' + rider.bike + ') picked up cargo. Climbing mountain trail: Altitude 1,480m ➔ 1,620m (+140m incline, slope grade 14.2%).',
        order: orderData,
        telemetry: {
          altitudeStart: 1480,
          altitudeEnd: 1620,
          elevationGain: 140,
          inclineGrade: '14.2%'
        }
      });

      // Step 4: OTP Verification & Staircase Handover (after 3s)
      await this.sleep(3000);
      this.currentStep = 4;
      orderData.status = 'delivered';
      orderData.deliveredAt = new Date().toLocaleTimeString();

      if (window.pahadiBus) {
        window.pahadiBus.updateOrderStatus(orderId, 'delivered', {
          deliveredAt: orderData.deliveredAt,
          verifiedOtp: secretOtp,
          podVerified: true
        });
      }

      this.notifyStep(4, {
        step: 4,
        title: '🔐 Doorstep OTP Verified & Delivered',
        desc: 'Rider reached 35-stair doorstep. Verified Customer OTP [' + secretOtp + ']. Handover complete with timestamped POD photo.',
        order: orderData
      });

      // Step 5: Admin P&L Settlement & Rupee Waterfall (after 2s)
      await this.sleep(2000);
      this.currentStep = 5;

      // Update mock DB finance metrics if on Admin portal
      if (window.PahadiMockDB && window.PahadiMockDB.metrics) {
        window.PahadiMockDB.metrics.todayGMV += orderData.pricing.totalAmount;
        window.PahadiMockDB.metrics.platformNetMargin += orderData.pricing.platformCommission;
        if (typeof updateMetricsDashboard === 'function') updateMetricsDashboard();
        if (typeof renderFinancialLedger === 'function') renderFinancialLedger();
        if (typeof renderOrdersFeed === 'function') renderOrdersFeed();
      }

      this.notifyStep(5, {
        step: 5,
        title: '💰 Admin P&L Profit Waterfall Updated',
        desc: 'Order GMV of ₹' + orderData.pricing.totalAmount + ' booked! Net Platform Margin: +₹' + orderData.pricing.platformCommission + ', Rider Payout: ₹' + orderData.pricing.riderPayout + ', Merchant Settled: ₹' + orderData.pricing.merchantPayout + '.',
        order: orderData,
        waterfall: orderData.pricing
      });

      this.isRunning = false;
    }

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  window.pahadiSimulator = new PahadiSimulationEngine();
})();
