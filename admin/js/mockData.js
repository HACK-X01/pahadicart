// Enriched Master Database with COD Cash Limits, SOS, Support Tickets & Growth Analytics
const PahadiMockDB = {
  towns: [
    {
      id: "solan",
      name: "Solan (Mushroom City)",
      center: [30.9084, 77.0999],
      zoom: 14,
      elevation: "1,502 m",
      activeRiders: 8,
      activeOrders: 0,
      weather: "clear",
      weatherSurgeFee: 0,
      weatherBufferMins: 0,
      todayGMV: 0,
      todayOrders: 0,
      todayProfit: 0,
      peakHourSurgeActive: false,
      zones: [
        {
          id: "solan-mall",
          name: "Mall Road & Kotwali",
          type: "commercial",
          coords: [[30.904, 77.095], [30.912, 77.097], [30.914, 77.104], [30.906, 77.103]],
          color: "#10b981",
          sla: "45-60 min"
        },
        {
          id: "solan-shamti",
          name: "Shamti Residential Corridor",
          type: "hill-slopes",
          coords: [[30.898, 77.101], [30.906, 77.104], [30.908, 77.112], [30.901, 77.110]],
          color: "#0ea5e9",
          sla: "60-75 min"
        }
      ]
    },
    {
      id: "dharamshala",
      name: "Dharamshala & McLeodGanj",
      center: [32.2190, 76.3234],
      zoom: 13,
      elevation: "1,457 m",
      activeRiders: 6,
      activeOrders: 0,
      weather: "rain",
      weatherSurgeFee: 15,
      weatherBufferMins: 20,
      todayGMV: 0,
      todayOrders: 0,
      todayProfit: 0,
      peakHourSurgeActive: true,
      zones: [
        {
          id: "dha-kotwali",
          name: "Lower Dharamshala (Kotwali)",
          type: "commercial",
          coords: [[32.212, 76.318], [32.222, 76.320], [32.225, 76.328], [32.215, 76.327]],
          color: "#10b981",
          sla: "45-60 min"
        },
        {
          id: "dha-mcleod",
          name: "McLeodGanj (Pedestrian Walking Zone)",
          type: "walking-runner",
          coords: [[32.235, 76.320], [32.246, 76.321], [32.248, 76.330], [32.237, 76.329]],
          color: "#a855f7",
          sla: "50-70 min"
        }
      ]
    },
    {
      id: "shimla",
      name: "Shimla (The Ridge)",
      center: [31.1048, 77.1734],
      zoom: 14,
      elevation: "2,276 m",
      activeRiders: 10,
      activeOrders: 0,
      weather: "clear",
      weatherSurgeFee: 0,
      weatherBufferMins: 0,
      todayGMV: 0,
      todayOrders: 0,
      todayProfit: 0,
      peakHourSurgeActive: false,
      zones: [
        {
          id: "shimla-ridge",
          name: "The Ridge / Mall Road (Zero Motor Vehicle Zone)",
          type: "walking-runner",
          coords: [[31.101, 77.168], [31.108, 77.170], [31.109, 77.179], [31.102, 77.177]],
          color: "#a855f7",
          sla: "45-65 min"
        },
        {
          id: "shimla-sanjauli",
          name: "Sanjauli Hill Belt",
          type: "steep-slopes",
          coords: [[31.102, 77.185], [31.112, 77.187], [31.115, 77.198], [31.104, 77.196]],
          color: "#f59e0b",
          sla: "65-90 min"
        }
      ]
    }
  ],

  merchants: [],

  riders: [],

  orders: [],

  // Customer Support & Tickets
  supportTickets: [],

  // Growth & Colony Heatmap Intelligence
  colonyHeatmap: [],

  // Marketing Coupons Burn vs ROI
  coupons: [],

  // Inactive Customers for WhatsApp Re-engagement
  inactiveCustomers: [],

  financialSummary: {
    monthToDateGMV: 0,
    merchantPayoutsProcessed: 0,
    merchantDuesPending: 0,
    riderPayoutsProcessed: 0,
    gatewayAndSmsFees: 0,
    netFounderProfitMtd: 0,
    netProfitMarginPct: 0,
    averageOrderValue: 0,
    totalCompletedOrdersMonth: 0
  },

  categoryShare: []
};
