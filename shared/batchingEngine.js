// PahadiCart Mountain Multi-Order Batching & Staircase Energy Optimizer
(function() {
  class PahadiBatchingEngine {
    constructor() {}

    // Cluster and sequence orders by staircase elevation
    createBatchedTrip(orders, rider) {
      if (!orders || orders.length === 0) return null;

      // Group proximate orders (same town)
      const sameTownOrders = orders.filter(o => o.town === (rider.town || 'solan') && (o.status === 'placed' || o.status === 'preparing'));
      const batchCandidates = sameTownOrders.slice(0, 3);

      if (batchCandidates.length === 0) return null;

      // Sequence by staircase elevation (ascending stairs to optimize climber fatigue)
      const sequencedStops = [...batchCandidates].sort((a, b) => {
        const stairsA = a.customer?.stairCount || (a.customer?.hasStairs ? 20 : 0);
        const stairsB = b.customer?.stairCount || (b.customer?.hasStairs ? 20 : 0);
        return stairsA - stairsB;
      });

      const totalStairCount = sequencedStops.reduce((sum, o) => sum + (o.customer?.stairCount || (o.customer?.hasStairs ? 20 : 0)), 0);
      const totalRiderPay = sequencedStops.reduce((sum, o) => sum + (o.pricing?.riderPayout || 60), 0);
      const individualTripMins = sequencedStops.length * 25;
      const batchedTripMins = 20 + (sequencedStops.length * 7);
      const timeSavedMins = individualTripMins - batchedTripMins;
      const energySavedPct = Math.min(45, 20 + (sequencedStops.length * 9));

      return {
        batchId: 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
        riderId: rider.id,
        riderName: rider.name,
        town: rider.town || 'solan',
        stopsCount: sequencedStops.length,
        stops: sequencedStops.map((order, idx) => ({
          stopNumber: idx + 1,
          orderId: order.id,
          customerName: order.customer?.name || 'Hill Customer',
          colony: order.customer?.colony || 'Mountain Colony',
          staircaseDetails: order.customer?.staircaseDetails || 'Doorstep delivery',
          stairs: order.customer?.stairCount || 0,
          items: order.items?.map(i => i.name).join(', ') || 'Items',
          amount: order.pricing?.totalAmount || 350,
          otp: order.otp || '5521',
          delivered: order.status === 'delivered'
        })),
        metrics: {
          totalStairs: totalStairCount,
          totalEarnings: totalRiderPay,
          batchedTimeMins: batchedTripMins,
          timeSavedMins: timeSavedMins,
          energySavedPct: energySavedPct + '%'
        }
      };
    }
  }

  window.pahadiBatching = new PahadiBatchingEngine();
})();
